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
--    Uses Gemini's text-embedding-004 model, which returns 768-dimension
--    vectors. If GEMINI_EMBEDDING_MODEL is ever changed to a model with a
--    different output size, this column (and the function below) need to
--    be updated to match.
create extension if not exists vector;

alter table public.screenshots
  add column if not exists embedding vector(768);

-- Cosine distance (<=>) is pgvector's standard choice for text embeddings.
-- Rows without an embedding yet (e.g. uploaded before this feature existed,
-- or where embedding generation failed) are excluded rather than erroring.
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
