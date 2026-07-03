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
