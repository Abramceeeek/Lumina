import { supabase } from './supabase';
import { sanitizeQuiz, sanitizeVocab, sanitizeBranches } from '@/ai/sanitize';
import type { Focus, QuizQuestion, VocabItem, BranchOption } from '@lumina/shared';

// Persistence for the daily loop (Phase 1). The client generates an article, then
// stores it as the user's own baseline (RLS: author_id = auth.uid) so reads/quiz/
// trail can reference a real article id. All functions no-op gracefully in local
// mode (no Supabase) or when signed out — callers don't branch on it.

export type PersistArticleInput = {
  fieldId: string;
  title: string;
  body: string[];
  focus?: Focus;
  estReadMinutes?: number;
  lang?: string;
  quiz?: QuizQuestion[];
  vocabulary?: VocabItem[];
  branches?: BranchOption[];
};

// Insert a client-generated article; returns its id (or null if not persisted).
export async function saveGeneratedArticle(a: PersistArticleInput): Promise<string | null> {
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await supabase
    .from('articles')
    .insert({
      author_id: u.user.id,
      field_id: a.fieldId,
      title: a.title,
      body: a.body,
      focus: a.focus ?? 'field',
      est_read_minutes: a.estReadMinutes ?? 5,
      lang: a.lang ?? 'en',
      quiz_questions: a.quiz ?? [],
      vocabulary: a.vocabulary ?? [],
      branches_text: a.branches ?? [],
    })
    .select('id')
    .single();
  if (error) return null;
  return data?.id ?? null;
}

export type Baseline = {
  id: string;
  title: string;
  body: string[];
  quiz?: QuizQuestion[];
  vocabulary?: VocabItem[];
  branches?: BranchOption[];
  focus?: Focus;
  sourceCount?: number;
  sourceDomains?: string[];
};

// The freshest server-synthesized baseline article for a field (author_id null),
// for the client to personalize (sync point S2). Only baselines from the last 48h
// count — the pipeline runs daily, and stale "news" is worse than generating fresh.
// Null when none exists — caller falls back to on-device generation.
export async function getTodaysBaseline(fieldId: string | null | undefined): Promise<Baseline | null> {
  if (!supabase || !fieldId) return null;
  const freshSince = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from('articles')
    .select('id, title, body, quiz_questions, vocabulary, branches_text, focus, source_count, source_domains')
    .is('author_id', null)
    .eq('field_id', fieldId)
    .gte('created_at', freshSince)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: String(data.id),
    title: String(data.title),
    body: Array.isArray(data.body) ? (data.body as unknown[]).map(String) : [],
    quiz: sanitizeQuiz(data.quiz_questions),
    vocabulary: sanitizeVocab(data.vocabulary),
    branches: sanitizeBranches(data.branches_text),
    focus: (data.focus as Focus) ?? undefined,
    sourceCount: typeof data.source_count === 'number' ? data.source_count : undefined,
    sourceDomains: Array.isArray(data.source_domains) ? (data.source_domains as unknown[]).map(String) : undefined,
  };
}

export type ReviewArticle = { title: string; topic: string; body: string[]; vocabulary?: VocabItem[] };

// A past article for read-only review from the trail. RLS: articles are readable
// by any authenticated user, so any trail node resolves.
export async function getArticleForReview(articleId: string): Promise<ReviewArticle | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('articles').select('title, body, vocabulary, fields(label)').eq('id', articleId).maybeSingle();
  if (!data) return null;
  const fld = data.fields as { label?: string } | { label?: string }[] | null;
  const label = Array.isArray(fld) ? fld[0]?.label : fld?.label;
  return {
    title: String(data.title),
    topic: label ?? '',
    body: Array.isArray(data.body) ? (data.body as unknown[]).map(String) : [],
    vocabulary: sanitizeVocab(data.vocabulary),
  };
}

// Record that the user read an article (one row per read).
export async function recordRead(articleId: string | null | undefined, opts?: { focus?: Focus }): Promise<void> {
  if (!supabase || !articleId) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from('user_articles').insert({
    user_id: u.user.id,
    article_id: articleId,
    focus: opts?.focus ?? null,
    read_at: new Date().toISOString(),
  });
}
