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

-- This function's return columns grow twice more later in this file
-- (sections 6 and 7). CREATE OR REPLACE can't change a function's return
-- type, only its body — so on a database that already has a later version
-- of this 2-argument signature installed (from a previous partial run),
-- recreating the original shape here would fail with "cannot change
-- return type of existing function". Dropping first makes this safe to
-- run regardless of the database's current state.
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
--
-- Same "cannot change return type" risk as match_screenshots above (this
-- 1-argument signature also gets redefined with more columns later in
-- this file) — drop first so re-running this file is safe from any prior
-- partial state.
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

-- 7. Auth — every screenshot and entity belongs to the signed-in user who
--    created it, so search/entities/actions only ever surface that user's
--    own data. The app's API routes use the service-role key (bypasses
--    RLS) and explicitly filter every query by the authenticated user's
--    id — the RLS policies below are defense-in-depth for that same rule,
--    in case anything ever queries with a user's own session instead.
--
--    NOTE: any screenshots/entities that existed before this migration
--    have user_id = null and will not be visible to any signed-in user
--    (queries filter by an exact match on user_id, and null never
--    matches). If you have pre-auth data you want to keep, either delete
--    it or manually UPDATE it with a real user_id after your first sign-in.
alter table public.screenshots
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.entities
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Entities are now scoped per user, so uniqueness is per user too — two
-- different users can each have their own "Rahul" without colliding.
drop index if exists entities_name_lower_idx;
create unique index if not exists entities_user_name_lower_idx
  on public.entities (user_id, lower(name));

create index if not exists screenshots_user_id_idx on public.screenshots (user_id);

drop policy if exists "Users can view their own screenshots" on public.screenshots;
create policy "Users can view their own screenshots"
  on public.screenshots for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own screenshots" on public.screenshots;
create policy "Users can insert their own screenshots"
  on public.screenshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own screenshots" on public.screenshots;
create policy "Users can update their own screenshots"
  on public.screenshots for update
  using (auth.uid() = user_id);

drop policy if exists "Users can view their own entities" on public.entities;
create policy "Users can view their own entities"
  on public.entities for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own entities" on public.entities;
create policy "Users can insert their own entities"
  on public.entities for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view links for their own screenshots" on public.screenshot_entities;
create policy "Users can view links for their own screenshots"
  on public.screenshot_entities for select
  using (
    exists (
      select 1 from public.screenshots s
      where s.id = screenshot_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert links for their own screenshots" on public.screenshot_entities;
create policy "Users can insert links for their own screenshots"
  on public.screenshot_entities for insert
  with check (
    exists (
      select 1 from public.screenshots s
      where s.id = screenshot_id and s.user_id = auth.uid()
    )
  );

-- match_screenshots, find_entity_screenshots, link_screenshot_entities, and
-- list_entities_with_counts all need a p_user_id to scope to. Adding a
-- parameter changes each function's signature, so the old versions are
-- dropped before being redefined.
drop function if exists public.match_screenshots (vector(768), int);

create or replace function public.match_screenshots (
  query_embedding vector(768),
  match_count int default 5,
  p_user_id uuid default null
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
    and screenshots.user_id = p_user_id
  order by screenshots.embedding <=> query_embedding
  limit match_count;
$$;

drop function if exists public.find_entity_screenshots (text);

create or replace function public.find_entity_screenshots (query_text text, p_user_id uuid)
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
    where entities.user_id = p_user_id
      and (
        query_text ilike '%' || entities.name || '%'
        or exists (
             select 1
             from unnest(string_to_array(entities.name, ' ')) as word
             where length(word) > 2
               and query_text ~* ('\m' || word || '\M')
           )
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
  where s.user_id = p_user_id
  order by s.created_at desc
  limit 50;
$$;

drop function if exists public.link_screenshot_entities (uuid, jsonb);

create or replace function public.link_screenshot_entities (
  p_screenshot_id uuid,
  p_entities jsonb,
  p_user_id uuid
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

    select id into found_id from public.entities
      where user_id = p_user_id and lower(name) = lower(clean_name) limit 1;

    if found_id is null then
      insert into public.entities (name, type, user_id)
      values (clean_name, entity_type, p_user_id)
      on conflict (user_id, (lower(name))) do nothing
      returning id into found_id;

      if found_id is null then
        select id into found_id from public.entities
          where user_id = p_user_id and lower(name) = lower(clean_name) limit 1;
      end if;
    end if;

    insert into public.screenshot_entities (screenshot_id, entity_id)
    values (p_screenshot_id, found_id)
    on conflict (screenshot_id, entity_id) do nothing;
  end loop;
end;
$$;

drop function if exists public.list_entities_with_counts ();

create or replace function public.list_entities_with_counts (p_user_id uuid)
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
  where e.user_id = p_user_id
  group by e.id, e.name, e.type
  order by screenshot_count desc, e.name asc;
$$;

-- 8. Usage limits & plans. profiles.plan is the one field that decides a
--    user's monthly upload limit ('free' = 5, 'pro' = 25 — see
--    PLAN_LIMITS in lib/usage.ts, which is the single place that logic
--    lives). To manually grant Pro for a demo/test account, open
--    Table Editor → profiles → find that user's row (by id, which matches
--    their auth.users id — cross-reference by email in Authentication →
--    Users) → set plan to 'pro'. Nothing else needs to change; the limit
--    check reads this column directly on every upload.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-creates a profile row (defaulting to 'free') the moment someone
-- signs up, so every authenticated user always has one to look up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, plan)
  values (new.id, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill for anyone who signed in before this migration existed.
insert into public.profiles (id, plan)
select id, 'free' from auth.users
on conflict (id) do nothing;

-- 9. Feedback — a lightweight channel for bug reports/feature requests from
--    inside the app, in place of wiring up outbound email at this stage.
--    user_id is nullable since feedback can come from a signed-out visitor
--    on the landing page too, and set null (not cascade-deleted) so
--    feedback history survives a user later deleting their account.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  message text not null
);

-- Only the app's server-side route (using the service-role key) writes or
-- reads this table — RLS enabled with no policies means no client-side
-- session, however it's obtained, can read other users' feedback.
alter table public.feedback enable row level security;
