import { supabase } from './supabase';
import { useBanner } from '@/store/useBanner';

// Persist a quiz attempt (Phase 1). No-ops in local mode / when signed out.
export async function saveQuizResponse(
  articleId: string | null | undefined,
  r: { answers: Record<number, number>; mcScore: number; reflection?: string },
): Promise<void> {
  if (!supabase || !articleId) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { error } = await supabase.from('quiz_responses').insert({
    user_id: u.user.id,
    article_id: articleId,
    answers: r.answers,
    mc_score: r.mcScore,
    reflection: r.reflection?.trim() || null,
  });
  if (error) useBanner.getState().show("Couldn't reach the server — your quiz result is kept on this device.");
}

// The reader's most recent reflection, injected into the next day's generation
// prompt so "build on it" is true. Null in local mode / when signed out / none yet.
export async function getLatestReflection(): Promise<string | null> {
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase
    .from('quiz_responses')
    .select('reflection')
    .eq('user_id', u.user.id)
    .not('reflection', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const r = (data as { reflection?: string | null } | null)?.reflection;
  return r?.trim() ? r : null;
}
