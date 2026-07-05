-- 0010: carry source attribution onto baseline articles. The stories /
-- story_sources tables are service-role-only (RLS with no policies), so the
-- client can't join to them — the baseline builder copies the source count and
-- publisher domains onto the article row for the "Synthesized from N real news
-- sources" disclosure (S2).

alter table articles add column if not exists source_count int;
alter table articles add column if not exists source_domains text[];
