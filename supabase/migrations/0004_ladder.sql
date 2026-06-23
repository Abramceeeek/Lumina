-- Lumina · Phase 2: alternating focus
-- Each daily article pushes one ladder (language or field); the next alternates.
-- last_focus records the most recent article's focus so generation can flip it.
-- Starting language/field levels are seeded app-side at onboarding (from the
-- comfort choice) into user_language_levels / user_field_levels.

alter table profiles add column if not exists last_focus text not null default 'field'
  check (last_focus in ('language', 'field'));
