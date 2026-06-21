-- Lumina · taxonomy seed (B0). 12 fields from the prototype + finance sub-fields.
-- Idempotent: safe to re-run.

insert into fields (slug, label, emoji, color, sort_order) values
  ('finance',    'Finance',      '📈', '#4A7C6F', 1),
  ('technology', 'Technology',   '💻', '#5B7BA8', 2),
  ('philosophy', 'Philosophy',   '🧠', '#8A6BA8', 3),
  ('science',    'Science',      '🔬', '#5B98A8', 4),
  ('history',    'History',      '📜', '#A88B5B', 5),
  ('psychology', 'Psychology',   '🧩', '#A85B6B', 6),
  ('literature', 'Literature',   '📖', '#6B8A5B', 7),
  ('economics',  'Economics',    '🏛️', '#8A7B5B', 8),
  ('art',        'Art & Design', '🎨', '#8A5B7B', 9),
  ('health',     'Health',       '🌿', '#5B8A6B', 10),
  ('politics',   'Politics',     '⚖️', '#7B5B8A', 11),
  ('astronomy',  'Astronomy',    '🌌', '#5B6B8A', 12)
on conflict (slug) do nothing;

-- Finance sub-fields (powers the branching graph for the demo field).
insert into subfields (field_id, slug, label, description)
select f.id, s.slug, s.label, s.description
from fields f
join (values
  ('accounting',        'Accounting',           'How businesses record and report money.'),
  ('audit',             'Audit',                'Verifying that the numbers tell the truth.'),
  ('data-analytics',    'Data Analytics',        'Finding the story in financial data.'),
  ('time-value',        'Time Value of Money',   'Why a dollar today beats a dollar tomorrow.'),
  ('compound-interest', 'Compound Interest',     'Returns that earn returns.'),
  ('rule-of-72',        'The Rule of 72',        'A mental shortcut for doubling time.'),
  ('inflation',         'Inflation & Real Returns','Why purchasing power matters.'),
  ('index-funds',       'Index Funds',           'Passive investing and compound returns.'),
  ('saving-psychology', 'Psychology of Saving',  'Delaying gratification, and systems that help.'),
  ('debt-compounding',  'Debt Compounding',      'When the same math traps borrowers.')
) as s(slug, label, description) on f.slug = 'finance'
on conflict (field_id, slug) do nothing;
