import { db } from './db.js';
import { parseSeendate } from './util.js';

// Ingest from GDELT's free DOC 2.0 API. We pull only headlines + metadata (never
// full article bodies), bucket-querying by field label, and store de-duplicated
// rows in raw_items. Synthesis (Phase 7b) turns clusters of these into neutral
// briefs; this step never republishes source copy.

const GDELT = 'https://api.gdeltproject.org/api/v2/doc/doc';

type GdeltArticle = { url?: string; title?: string; seendate?: string; domain?: string };

async function ensureSource(): Promise<string> {
  const { data: existing } = await db.from('sources').select('id').eq('kind', 'gdelt').maybeSingle();
  if (existing?.id) return existing.id as string;
  const { data } = await db.from('sources').insert({ name: 'GDELT', kind: 'gdelt', terms_ok: true }).select('id').single();
  return data!.id as string;
}

async function fetchGdelt(query: string): Promise<GdeltArticle[]> {
  const u = new URL(GDELT);
  // Quote multi-word labels ("Art & Design") so GDELT treats them as a phrase.
  const q = /\s/.test(query) ? `"${query}"` : query;
  u.searchParams.set('query', `${q} sourcelang:english`);
  u.searchParams.set('mode', 'ArtList');
  u.searchParams.set('format', 'json');
  u.searchParams.set('maxrecords', '25');
  u.searchParams.set('timespan', '1d');
  u.searchParams.set('sort', 'HybridRel');
  const res = await fetch(u, { headers: { 'user-agent': 'Lumina/0.1 (news synthesis)' } });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => null)) as { articles?: GdeltArticle[] } | null;
  return data?.articles ?? [];
}

export async function ingest(): Promise<{ fetched: number; inserted: number }> {
  const sourceId = await ensureSource();
  const { data: fields } = await db.from('fields').select('label');
  const queries = (fields ?? []).map((f) => f.label as string);

  let fetched = 0;
  const seen = new Set<string>();
  const rows: Record<string, unknown>[] = [];

  let first = true;
  for (const q of queries) {
    // GDELT throttles rapid-fire requests (empty responses after ~3 quick calls);
    // its guidance is roughly one request per 5 seconds.
    if (!first) await new Promise((r) => setTimeout(r, 6000));
    first = false;
    const arts = await fetchGdelt(q);
    console.log(`ingest: ${q} -> ${arts.length} headlines`);
    fetched += arts.length;
    for (const a of arts) {
      if (!a.url || !a.title || seen.has(a.url)) continue;
      seen.add(a.url);
      rows.push({
        source_id: sourceId,
        external_id: a.url,
        title: a.title,
        url: a.url,
        published_at: parseSeendate(a.seendate),
        lang: 'en',
        raw: { domain: a.domain ?? null, query: q },
      });
    }
  }

  if (!rows.length) return { fetched, inserted: 0 };
  const { data, error } = await db
    .from('raw_items')
    .upsert(rows, { onConflict: 'external_id', ignoreDuplicates: true })
    .select('id');
  if (error) {
    console.error('raw_items upsert failed:', error.message);
    return { fetched, inserted: 0 };
  }
  await db.from('sources').update({ last_run_at: new Date().toISOString() }).eq('id', sourceId);
  return { fetched, inserted: data?.length ?? 0 };
}
