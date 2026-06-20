-- Lumina · initial schema (B0)
-- Two-tier model: shared content (fields/subfields/articles/branches) + per-user data.
-- See CLAUDE.md §5 and ROADMAP Track B.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector, used from B3 (embeddings)

-- ── Taxonomy (shared, read-only to clients) ─────────────────────────────────
create table fields (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  emoji       text,
  color       text,
  sort_order  int  not null default 0
);

create table subfields (
  id          uuid primary key default gen_random_uuid(),
  field_id    uuid not null references fields(id) on delete cascade,
  slug        text not null,
  label       text not null,
  description text,
  unique (field_id, slug)
);

-- ── User profile (extends auth.users) ───────────────────────────────────────
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text,
  primary_language    text not null default 'en',          -- language being learned / UI
  target_read_minutes int  not null default 5 check (target_read_minutes in (5, 15)),
  accent              text not null default '#4A7C6F',
  read_width          int  not null default 680,
  font_size           int  not null default 18,
  retention_score     int  not null default 0,
  onboarded           boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Auto-create a profile row on signup.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Dual-ladder progress (CLAUDE.md §7) ─────────────────────────────────────
create table user_interests (
  user_id    uuid not null references profiles(id) on delete cascade,
  field_id   uuid not null references fields(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, field_id)
);

-- Field-depth ladder: 1 Intro · 2 Beginner · 3 Intermediate · 4 Advanced · 5 Professional
create table user_field_levels (
  user_id  uuid not null references profiles(id) on delete cascade,
  field_id uuid not null references fields(id) on delete cascade,
  level    int  not null default 1 check (level between 1 and 5),
  primary key (user_id, field_id)
);

-- Language ladder: CEFR per language.
create table user_language_levels (
  user_id  uuid not null references profiles(id) on delete cascade,
  language text not null,
  cefr     text not null default 'A1' check (cefr in ('A1','A2','B1','B2','C1','C2')),
  primary key (user_id, language)
);

-- ── Content: baseline articles (shared) ─────────────────────────────────────
-- The server synthesizes these once; clients personalize per user (user_articles).
create table articles (
  id               uuid primary key default gen_random_uuid(),
  field_id         uuid not null references fields(id) on delete restrict,
  subfield_id      uuid references subfields(id) on delete set null,
  title            text not null,
  summary          text,
  body             jsonb not null default '[]',                      -- array of paragraph strings
  base_difficulty  int  not null default 1 check (base_difficulty between 1 and 5),
  focus            text not null default 'field' check (focus in ('language','field')),
  est_read_minutes int  not null default 5 check (est_read_minutes in (5, 15)),
  lang             text not null default 'en',                       -- baseline language
  source_story_id  uuid,                                             -- future link to stories (B2)
  is_seed          boolean not null default false,
  created_at       timestamptz not null default now()
);

-- Next-step branch options attached to an article (the "Choose" screen / graph edges).
create table branches (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  subfield_id uuid references subfields(id) on delete set null,
  title       text not null,
  description text,
  sort_order  int  not null default 0
);

-- ── Per-user reading data ───────────────────────────────────────────────────
-- A user's personalized instance of a baseline article.
create table user_articles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  article_id            uuid not null references articles(id) on delete cascade,
  language              text not null default 'en',
  language_cefr_at_read text check (language_cefr_at_read in ('A1','A2','B1','B2','C1','C2')),
  field_level_at_read   int  check (field_level_at_read between 1 and 5),
  focus                 text check (focus in ('language','field')),
  personalized_body     jsonb,                                       -- rewritten paragraphs
  read_at               timestamptz,
  created_at            timestamptz not null default now()
);

create table highlights (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  article_id uuid references articles(id) on delete set null,
  quote      text not null,
  note       text,
  created_at timestamptz not null default now()
);

create table quiz_responses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  answers    jsonb not null default '{}',
  mc_score   int,
  reflection text,
  created_at timestamptz not null default now()
);

create table trail_nodes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  parent_id  uuid references trail_nodes(id) on delete set null,
  day        int,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table spaced_rep (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  due_at     timestamptz not null,
  last_score int,
  created_at timestamptz not null default now()
);

create index on user_interests (user_id);
create index on user_articles (user_id);
create index on highlights (user_id);
create index on trail_nodes (user_id);
create index on spaced_rep (user_id, due_at);
create index on articles (field_id);
create index on branches (article_id);
