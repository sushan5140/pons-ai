-- Screenshot Brain — core schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).

-- 1. Private storage bucket for the uploaded screenshot images.
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

-- 2. Table holding the AI-extracted record for each screenshot.
create table if not exists public.screenshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,          -- storage path within the 'screenshots' bucket, not a public URL
  title text not null,
  category text not null,
  extracted_text text not null default '',
  key_details jsonb not null default '{}'::jsonb,
  entities jsonb not null default '[]'::jsonb
);

-- 3. Lock the table down. The app talks to Supabase using the service_role
--    key from a server-only API route, which bypasses RLS — so with RLS
--    enabled and no policies, nothing else (anon/browser clients) can read
--    or write this table.
alter table public.screenshots enable row level security;

-- 4. Semantic search — embedding column + similarity search function.
--    Uses Gemini's gemini-embedding-001 model with outputDimensionality
--    pinned to 768. If GEMINI_EMBEDDING_MODEL or that dimensionality is
--    ever changed, this column (and the function below) need to match.
create extension if not exists vector;

alter table public.screenshots
  add column if not exists embedding vector(768);

create or replace function public.match_screenshots (
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  category text,
  extracted_text text,
  key_details jsonb,
  entities jsonb,
  image_url text,
  similarity float
)
language sql
stable
as $$
  select
    screenshots.id,
    screenshots.title,
    screenshots.category,
    screenshots.extracted_text,
    screenshots.key_details,
    screenshots.entities,
    screenshots.image_url,
    1 - (screenshots.embedding <=> query_embedding) as similarity
  from public.screenshots
  where screenshots.embedding is not null
  order by screenshots.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Entity graph — entities extracted from screenshots (people, products,
--    places, organizations), linked back to every screenshot that mentions
--    them, so "everything from Rahul" can return every relevant screenshot
--    instead of just the one closest by embedding distance.
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'other',
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness so "Rahul" and "rahul" from two different
-- screenshots resolve to the same entity instead of duplicating it.
create unique index if not exists entities_name_lower_idx
  on public.entities (lower(name));

create table if not exists public.screenshot_entities (
  screenshot_id uuid not null references public.screenshots (id) on delete cascade,
  entity_id uuid not null references public.entities (id) on delete cascade,
  primary key (screenshot_id, entity_id)
);

alter table public.entities enable row level security;
alter table public.screenshot_entities enable row level security;

-- Finds-or-creates each named entity (preserving its type) and links it to
-- the screenshot, in one transaction per screenshot. Safe to call with
-- duplicate/blank names. p_entities is a JSON array of {"name","type"}
-- objects, matching lib/gemini.ts's ScreenshotEntity shape.
drop function if exists public.link_screenshot_entities (uuid, text[]);

create or replace function public.link_screenshot_entities (
  p_screenshot_id uuid,
  p_entities jsonb
)
returns void
language plpgsql
as $$
declare
  entity jsonb;
  clean_name text;
  entity_type text;
  found_id uuid;
begin
  for entity in select * from jsonb_array_elements(p_entities)
  loop
    clean_name := trim(entity->>'name');
    if clean_name is null or clean_name = '' then
      continue;
    end if;
    entity_type := coalesce(nullif(entity->>'type', ''), 'other');

    select id into found_id from public.entities where lower(name) = lower(clean_name) limit 1;

    if found_id is null then
      insert into public.entities (name, type)
      values (clean_name, entity_type)
      on conflict ((lower(name))) do nothing
      returning id into found_id;

      if found_id is null then
        select id into found_id from public.entities where lower(name) = lower(clean_name) limit 1;
      end if;
    end if;

    insert into public.screenshot_entities (screenshot_id, entity_id)
    values (p_screenshot_id, found_id)
    on conflict (screenshot_id, entity_id) do nothing;
  end loop;
end;
$$;

-- Relationship query: fuzzy/case-insensitive match of the query text against
-- known entity names, then every screenshot linked to the best match, most
-- recent first. An entity matches if its full name appears in the query
-- (e.g. entity "Rahul Sharma" vs query "photos with Rahul Sharma"), or if
-- any individual word of its name appears in the query as a whole word
-- (e.g. entity "Rahul Sharma" vs query "everything from Rahul"). When more
-- than one entity matches, the longer (more specific) name wins — not
-- whichever happened to match the "full name in query" branch — since a
-- short, generic, coincidentally-exact name (e.g. a different "Rahul") is
-- usually less relevant than a longer name that only matched by shared
-- word. Returns zero rows if nothing matches, so the app can fall back to
-- semantic search.
create or replace function public.find_entity_screenshots (query_text text)
returns table (
  entity_id uuid,
  entity_name text,
  screenshot_id uuid,
  title text,
  category text,
  extracted_text text,
  key_details jsonb,
  image_url text,
  created_at timestamptz
)
language sql
stable
as $$
  with matched_entity as (
    select entities.id, entities.name
    from public.entities
    where query_text ilike '%' || entities.name || '%'
       or exists (
            select 1
            from unnest(string_to_array(entities.name, ' ')) as word
            where length(word) > 2
              and query_text ~* ('\m' || word || '\M')
          )
    order by length(entities.name) desc
    limit 1
  )
  select
    matched_entity.id as entity_id,
    matched_entity.name as entity_name,
    s.id as screenshot_id,
    s.title,
    s.category,
    s.extracted_text,
    s.key_details,
    s.image_url,
    s.created_at
  from matched_entity
  join public.screenshot_entities se on se.entity_id = matched_entity.id
  join public.screenshots s on s.id = se.screenshot_id
  order by s.created_at desc
  limit 50;
$$;

-- Entity browse: every entity with how many screenshots it's linked to,
-- most-linked first.
create or replace function public.list_entities_with_counts ()
returns table (
  id uuid,
  name text,
  type text,
  screenshot_count bigint
)
language sql
stable
as $$
  select
    e.id,
    e.name,
    e.type,
    count(se.screenshot_id) as screenshot_count
  from public.entities e
  left join public.screenshot_entities se on se.entity_id = e.id
  group by e.id, e.name, e.type
  order by screenshot_count desc, e.name asc;
$$;

-- 6. Agentic actions — Gemini flags time-sensitive screenshots (flights,
--    tickets, bills, appointments) so the app can propose adding them to
--    the user's calendar as a downloadable .ics file, on explicit confirm
--    only. action_date is stored as the raw ISO date/datetime string
--    Gemini returned (date-only for all-day events, datetime for timed
--    ones) rather than timestamptz, since we don't know the event's real
--    timezone and don't want to silently assume UTC.
alter table public.screenshots
  add column if not exists is_actionable boolean not null default false,
  add column if not exists action_date text,
  add column if not exists action_title text,
  add column if not exists action_location text,
  add column if not exists reminder_minutes_before integer,
  add column if not exists action_confirmed boolean not null default false;

-- match_screenshots and find_entity_screenshots need to return the new
-- action_* columns so search results can show calendar state too. Postgres
-- can't widen a function's return table via CREATE OR REPLACE, so both are
-- dropped and redefined here with the same matching logic as before plus
-- the extra columns.
drop function if exists public.match_screenshots (vector(768), int);

create or replace function public.match_screenshots (
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  category text,
  extracted_text text,
  key_details jsonb,
  entities jsonb,
  image_url text,
  is_actionable boolean,
  action_date text,
  action_title text,
  action_location text,
  action_confirmed boolean,
  similarity float
)
language sql
stable
as $$
  select
    screenshots.id,
    screenshots.title,
    screenshots.category,
    screenshots.extracted_text,
    screenshots.key_details,
    screenshots.entities,
    screenshots.image_url,
    screenshots.is_actionable,
    screenshots.action_date,
    screenshots.action_title,
    screenshots.action_location,
    screenshots.action_confirmed,
    1 - (screenshots.embedding <=> query_embedding) as similarity
  from public.screenshots
  where screenshots.embedding is not null
  order by screenshots.embedding <=> query_embedding
  limit match_count;
$$;

drop function if exists public.find_entity_screenshots (text);

create or replace function public.find_entity_screenshots (query_text text)
returns table (
  entity_id uuid,
  entity_name text,
  screenshot_id uuid,
  title text,
  category text,
  extracted_text text,
  key_details jsonb,
  image_url text,
  is_actionable boolean,
  action_date text,
  action_title text,
  action_location text,
  action_confirmed boolean,
  created_at timestamptz
)
language sql
stable
as $$
  with matched_entity as (
    select entities.id, entities.name
    from public.entities
    where query_text ilike '%' || entities.name || '%'
       or exists (
            select 1
            from unnest(string_to_array(entities.name, ' ')) as word
            where length(word) > 2
              and query_text ~* ('\m' || word || '\M')
          )
    order by length(entities.name) desc
    limit 1
  )
  select
    matched_entity.id as entity_id,
    matched_entity.name as entity_name,
    s.id as screenshot_id,
    s.title,
    s.category,
    s.extracted_text,
    s.key_details,
    s.image_url,
    s.is_actionable,
    s.action_date,
    s.action_title,
    s.action_location,
    s.action_confirmed,
    s.created_at
  from matched_entity
  join public.screenshot_entities se on se.entity_id = matched_entity.id
  join public.screenshots s on s.id = se.screenshot_id
  order by s.created_at desc
  limit 50;
$$;
