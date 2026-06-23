-- Lumina · Phase 7: server news pipeline (Track B)
-- Ingest (raw_items) → synthesize neutral briefs (stories) → classify + enrich →
-- generate baseline articles. Legal: we SYNTHESIZE from permitted sources and
-- ATTRIBUTE (story_sources); we never republish source copy. Only sources with
-- terms_ok = true are synthesized.
--
-- These tables are server-only: RLS is enabled with NO policies, so the service
-- role (which bypasses RLS) is the only thing that can touch them. Clients read
-- the resulting baselines via the existing `articles` table.

create table if not exists sources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null,                      -- 'gdelt' | 'rss'
  url         text,                               -- feed url (rss) or null (gdelt)
  terms_ok    boolean not null default false,     -- legal: ok to synthesize + attribute
  last_run_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists raw_items (
  id           uuid primary key default gen_random_uuid(),
  source_id    uuid references sources(id) on delete set null,
  external_id  text not null unique,              -- dedupe key (article url)
  title        text not null,
  summary      text,
  url          text,
  published_at timestamptz,
  lang         text default 'en',
  raw          jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists stories (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  summary     text,
  synthesis   text not null,                      -- neutral AI-written brief
  importance  numeric not null default 0.5,
  field_id    uuid references fields(id) on delete set null,
  subfield_id uuid references subfields(id) on delete set null,
  embedding   vector(1536),                       -- dedup / retrieval (populated later)
  created_at  timestamptz not null default now()
);

create table if not exists story_sources (        -- attribution (legal)
  story_id    uuid not null references stories(id) on delete cascade,
  raw_item_id uuid not null references raw_items(id) on delete cascade,
  primary key (story_id, raw_item_id)
);

create table if not exists story_concepts (
  id       uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  concept  text not null
);

create table if not exists story_vocabulary (
  id         uuid primary key default gen_random_uuid(),
  story_id   uuid not null references stories(id) on delete cascade,
  word       text not null,
  definition text,
  lang       text not null default 'en'
);

-- Link a generated baseline article back to the story it came from.
alter table articles add column if not exists story_id uuid references stories(id) on delete set null;

create index if not exists raw_items_source_idx on raw_items (source_id, created_at desc);
create index if not exists stories_field_idx on stories (field_id, created_at desc);

-- Server-only: lock everything down (no policies → service role only).
alter table sources         enable row level security;
alter table raw_items       enable row level security;
alter table stories         enable row level security;
alter table story_sources   enable row level security;
alter table story_concepts  enable row level security;
alter table story_vocabulary enable row level security;
