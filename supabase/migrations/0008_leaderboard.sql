-- Lumina · Phase 8: leaderboard
-- A leaderboard needs to read across users, but user data is RLS owner-scoped.
-- This SECURITY DEFINER function aggregates public-ish stats (display name +
-- articles read + active days) and is the only cross-user read clients can do.

create or replace function get_leaderboard(limit_n int default 10)
returns table (user_id uuid, display_name text, articles bigint, days_active bigint)
language sql
security definer
set search_path = public
as $$
  select t.user_id,
         coalesce(p.display_name, 'Learner') as display_name,
         count(*) as articles,
         count(distinct date_trunc('day', t.created_at)) as days_active
  from trail_nodes t
  join profiles p on p.id = t.user_id
  group by t.user_id, p.display_name
  order by articles desc, days_active desc
  limit limit_n;
$$;

grant execute on function get_leaderboard(int) to authenticated;
