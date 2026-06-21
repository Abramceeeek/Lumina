import { supabase } from './supabase';
import type { SavedHighlight } from '@/store/useAppStore';

// Highlights persist to Supabase (cross-device). The highlights table has
// quote + note; we pack the article title + topic into `note` as JSON so no
// schema change is needed for the MVP. RLS scopes rows to the owner.

export async function addHighlightRemote(h: { quote: string; article: string; topic: string }): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from('highlights').insert({
    user_id: data.user.id,
    quote: h.quote,
    note: JSON.stringify({ article: h.article, topic: h.topic }),
  });
}

export async function listHighlightsRemote(): Promise<SavedHighlight[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('highlights')
    .select('id, quote, note, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []).map((r) => {
    let meta: { article?: string; topic?: string } = {};
    try {
      meta = r.note ? JSON.parse(r.note) : {};
    } catch {
      meta = {};
    }
    return {
      id: String(r.id),
      quote: r.quote,
      article: meta.article ?? '',
      topic: meta.topic ?? '',
      date: relativeDate(r.created_at),
    };
  });
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}
