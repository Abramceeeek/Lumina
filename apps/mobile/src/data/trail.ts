import { supabase } from './supabase';
import { dayStreak } from '@/lib/streak';

const ACCENT = '#4A7C6F';

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

// ── Reads (Phase 4) ─────────────────────────────────────────────────────────

type RawNode = {
  id: string;
  parent_id: string | null;
  day: number;
  is_current: boolean;
  created_at: string;
  title: string;
  topic: string;
  color: string;
};

// supabase returns to-one embeds as an object, but normalize defensively.
function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined);
}

async function fetchNodes(): Promise<RawNode[]> {
  if (!supabase) return [];
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data } = await supabase
    .from('trail_nodes')
    .select('id, parent_id, day, is_current, created_at, articles(title, fields(label, color))')
    .eq('user_id', u.user.id)
    .order('day', { ascending: true });
  return (data ?? []).map((r: Record<string, unknown>) => {
    const art = one(r.articles as { title?: string; fields?: unknown } | undefined);
    const fld = one(art?.fields as { label?: string; color?: string } | undefined);
    return {
      id: String(r.id),
      parent_id: r.parent_id ? String(r.parent_id) : null,
      day: Number(r.day ?? 0),
      is_current: !!r.is_current,
      created_at: String(r.created_at ?? ''),
      title: art?.title ?? 'Article',
      topic: fld?.label ?? '',
      color: fld?.color ?? ACCENT,
    };
  });
}

export type TrailItem = { id: string; label: string; topic: string; color: string; day: number; isCurrent?: boolean; isNext?: boolean };

// Linear timeline: chronological nodes + a synthetic "tomorrow" node from the
// pending next topic.
export async function getTrail(nextTopic?: string | null): Promise<TrailItem[]> {
  const nodes = await fetchNodes();
  const items: TrailItem[] = nodes.map((n) => ({ id: n.id, label: n.title, topic: n.topic, color: n.color, day: n.day, isCurrent: n.is_current }));
  if (nextTopic && items.length) {
    const last = items[items.length - 1];
    items.push({ id: 'next', label: nextTopic, topic: last.topic, color: last.color, day: 0, isNext: true });
  }
  return items;
}

export type TrailStats = { articlesRead: number; dayStreak: number; topicsExplored: number };

export async function getTrailStats(): Promise<TrailStats> {
  const nodes = await fetchNodes();
  return {
    articlesRead: nodes.length,
    dayStreak: dayStreak(nodes.map((n) => n.created_at).filter(Boolean)),
    topicsExplored: new Set(nodes.map((n) => n.topic).filter(Boolean)).size,
  };
}

export type GraphNode = { id: string; label: string; topic: string; color: string; x: number; y: number; current?: boolean; next?: boolean };

// Knowledge graph: nodes laid out chronologically (y) and clustered by topic (x);
// edges from parent->child, plus the pending next node off the current one.
export async function getGraph(nextTopic?: string | null): Promise<{ nodes: GraphNode[]; edges: [string, string][] }> {
  const raw = await fetchNodes();
  const cols = new Map<string, number>();
  for (const n of raw) if (!cols.has(n.topic)) cols.set(n.topic, cols.size);

  const nodes: GraphNode[] = raw.map((n, i) => ({
    id: n.id,
    label: n.title,
    topic: n.topic,
    color: n.color,
    x: 90 + (cols.get(n.topic) ?? 0) % 4 * 130,
    y: 70 + i * 80,
    current: n.is_current,
  }));
  const edges: [string, string][] = raw.filter((n) => n.parent_id).map((n) => [n.parent_id as string, n.id]);

  if (nextTopic && raw.length) {
    const curr = raw.find((n) => n.is_current) ?? raw[raw.length - 1];
    const currNode = nodes.find((n) => n.id === curr.id);
    if (currNode) {
      nodes.push({ id: 'next', label: nextTopic, topic: curr.topic, color: curr.color, x: currNode.x + 60, y: currNode.y + 80, next: true });
      edges.push([curr.id, 'next']);
    }
  }
  return { nodes, edges };
}
