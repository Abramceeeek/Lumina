-- Lumina · Phase 3: per-article enrichment
-- Each generated article carries its own comprehension quiz, target vocabulary,
-- and next-step branch options (no longer hardcoded sample data on the client).

alter table articles add column if not exists quiz_questions jsonb not null default '[]';
alter table articles add column if not exists vocabulary     jsonb not null default '[]';
alter table articles add column if not exists branches_text  jsonb not null default '[]';
