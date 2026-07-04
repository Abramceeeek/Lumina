-- 0009: promotion requires accumulated passes, not one lucky quiz.
-- A single perfect 2-question quiz used to jump a whole CEFR rung (noisy both
-- ways: ~25% by guessing, and one good day = A1 -> A2). Each rung now takes
-- PASSES_PER_RUNG (3, enforced in app code) passing quizzes; `passes` counts
-- progress toward the next promotion and resets to 0 on promote.

alter table user_language_levels add column if not exists passes int not null default 0;
alter table user_field_levels add column if not exists passes int not null default 0;
