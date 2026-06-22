import { supabase } from './supabase';

// Append the just-read article to the user's trail (timeline + graph, Phase 1 write;
// Phase 4 reads it back). Links to the previous node, advances the day counter, and
// marks this node current. No-ops in local mode / when signed out.
export async function appendTrailNode(articleId: string | null | undefined): Promise<void> {
  if (!supabase || !articleId) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const uid = u.user.id;

  const { data: prev } = await supabase
    .from('trail_nodes')
    .select('id, day')
    .eq('user_id', uid)
    .order('day', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextDay = (prev?.day ?? 0) + 1;
  if (prev) {
    await supabase.from('trail_nodes').update({ is_current: false }).eq('user_id', uid).eq('is_current', true);
  }
  await supabase.from('trail_nodes').insert({
    user_id: uid,
    article_id: articleId,
    parent_id: prev?.id ?? null,
    day: nextDay,
    is_current: true,
  });
}
