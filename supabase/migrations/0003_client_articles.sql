-- Lumina · Phase 1: client-authored articles
-- Until the server pipeline (Track B) serves real baselines, the client generates
-- articles on-device. Persist them as user-owned baselines so per-user reading data
-- (user_articles, quiz_responses, trail_nodes) can FK to a real article row.
--   author_id IS NULL  → shared/server baseline (service role writes, everyone reads)
--   author_id = a user → that user's generated article

alter table articles add column if not exists author_id uuid references profiles(id) on delete cascade;
create index if not exists articles_author_id_idx on articles (author_id);

-- A user may write/own only their own generated articles. Reads stay open (the
-- existing "read articles" policy), so the trail/graph can resolve any node.
drop policy if exists "insert own articles" on articles;
create policy "insert own articles" on articles
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "update own articles" on articles;
create policy "update own articles" on articles
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "delete own articles" on articles;
create policy "delete own articles" on articles
  for delete to authenticated using (author_id = auth.uid());
