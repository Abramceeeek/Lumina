-- Lumina · Row Level Security (B0)
-- Taxonomy + baseline content: readable by any authenticated user, writable only by
-- the service role (server pipeline), which bypasses RLS. User data: owner-only.

alter table fields        enable row level security;
alter table subfields     enable row level security;
alter table articles      enable row level security;
alter table branches      enable row level security;
alter table profiles              enable row level security;
alter table user_interests        enable row level security;
alter table user_field_levels     enable row level security;
alter table user_language_levels  enable row level security;
alter table user_articles         enable row level security;
alter table highlights            enable row level security;
alter table quiz_responses        enable row level security;
alter table trail_nodes           enable row level security;
alter table spaced_rep            enable row level security;

-- Shared, read-only to clients.
create policy "read fields"    on fields    for select to authenticated using (true);
create policy "read subfields" on subfields for select to authenticated using (true);
create policy "read articles"  on articles  for select to authenticated using (true);
create policy "read branches"  on branches  for select to authenticated using (true);

-- Profiles: a user owns their own row.
create policy "own profile select" on profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Owner-only CRUD for every user-scoped table.
do $$
declare t text;
begin
  foreach t in array array[
    'user_interests','user_field_levels','user_language_levels',
    'user_articles','highlights','quiz_responses','trail_nodes','spaced_rep'
  ] loop
    execute format(
      'create policy "own rows" on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t
    );
  end loop;
end $$;
