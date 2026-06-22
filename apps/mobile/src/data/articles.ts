import { supabase } from './supabase';
import type { Focus } from '@lumina/shared';

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
    })
    .select('id')
    .single();
  if (error) return null;
  return data?.id ?? null;
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
