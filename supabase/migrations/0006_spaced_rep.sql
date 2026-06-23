-- Lumina · Phase 5: spaced repetition
-- One recall schedule per (user, article); `stage` indexes the interval ladder
-- (1d → 3d → 7d → 30d). Passing a recall advances the stage, failing resets it.

alter table spaced_rep add column if not exists stage int not null default 0;
create unique index if not exists spaced_rep_user_article_uniq on spaced_rep (user_id, article_id);
