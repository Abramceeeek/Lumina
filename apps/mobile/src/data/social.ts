import { supabase } from './supabase';

export type LeaderRow = { userId: string; name: string; articles: number; daysActive: number; isYou: boolean };

// Cross-user leaderboard via the get_leaderboard() SECURITY DEFINER function.
export async function getLeaderboard(): Promise<LeaderRow[]> {
  if (!supabase) return [];
  const { data: u } = await supabase.auth.getUser();
  const myId = u.user?.id;
  const { data } = await supabase.rpc('get_leaderboard', { limit_n: 10 });
  return ((data ?? []) as Array<{ user_id: string; display_name: string; articles: number; days_active: number }>).map((r) => ({
    userId: String(r.user_id),
    name: r.display_name || 'Learner',
    articles: Number(r.articles),
    daysActive: Number(r.days_active),
    isYou: r.user_id === myId,
  }));
}
