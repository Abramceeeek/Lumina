import { supabase } from './supabase';
import { advanceLadder } from './ladder';
import { sanitizeQuiz } from '@/ai/sanitize';
import type { Focus, QuizQuestion } from '@lumina/shared';

// Spaced repetition (Phase 5). One schedule per (user, article); `stage` walks the
// interval ladder. Recall performance reschedules + feeds the retention score and
// the focus-matched learning ladder. All functions no-op in local / signed-out mode.

const INTERVAL_DAYS = [1, 3, 7, 30];

function dueDate(stage: number): string {
  const days = INTERVAL_DAYS[Math.min(stage, INTERVAL_DAYS.length - 1)];
  return new Date(Date.now() + days * 86400000).toISOString();
}

// Schedule (or reset) a recall for an article — called when the user finishes its quiz.
export async function scheduleRecall(articleId: string | null | undefined): Promise<void> {
  if (!supabase || !articleId) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from('spaced_rep').upsert(
    { user_id: u.user.id, article_id: articleId, stage: 0, due_at: dueDate(0), last_score: null },
    { onConflict: 'user_id,article_id' },
  );
}

export type DueRecall = { id: string; articleId: string; title: string; quiz: QuizQuestion[]; focus?: Focus; fieldId?: string };

// The oldest due recall (if any), with the article's stored quiz to re-test.
export async function getDueRecall(): Promise<DueRecall | null> {
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase
    .from('spaced_rep')
    .select('id, article_id, articles(title, focus, field_id, quiz_questions)')
    .eq('user_id', u.user.id)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const a = (data as { articles?: unknown }).articles;
  const art = (Array.isArray(a) ? a[0] : a) as { title?: string; focus?: Focus; field_id?: string; quiz_questions?: unknown } | undefined;
  const quiz = sanitizeQuiz(art?.quiz_questions);
  if (!quiz?.length) return null; // nothing to test on (e.g. pre-Phase-3 article)
  return {
    id: String(data.id),
    articleId: String(data.article_id),
    title: art?.title ?? 'a past article',
    quiz,
    focus: art?.focus,
    fieldId: art?.field_id ?? undefined,
  };
}

// Record a recall result: reschedule, recompute retention, advance the ladder on a pass.
export async function recordRecall(opts: { id: string; passed: boolean; focus?: Focus; fieldId?: string }): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const uid = u.user.id;
  const { data: row } = await supabase.from('spaced_rep').select('stage').eq('id', opts.id).maybeSingle();
  // Lapse steps back one stage instead of resetting to 0 — residual memory survives
  // a miss, and full resets pile up overdue reviews (FSRS/SM-2 lapse research).
  const prev = Number(row?.stage) || 0;
  const stage = opts.passed ? Math.min(prev + 1, INTERVAL_DAYS.length - 1) : Math.max(prev - 1, 0);
  await supabase.from('spaced_rep').update({ stage, due_at: dueDate(stage), last_score: opts.passed ? 5 : 2 }).eq('id', opts.id);
  await recomputeRetention(uid);
  if (opts.passed && opts.focus) await advanceLadder({ focus: opts.focus, fieldId: opts.fieldId, passed: true });
}

// retention_score = average recall score (0..5) scaled to 0..100.
async function recomputeRetention(uid: string): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.from('spaced_rep').select('last_score').eq('user_id', uid).not('last_score', 'is', null);
  const scores = (data ?? []).map((r) => Number((r as { last_score: unknown }).last_score)).filter((n) => !Number.isNaN(n));
  if (!scores.length) return;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  await supabase.from('profiles').update({ retention_score: Math.round((avg / 5) * 100) }).eq('id', uid);
}
