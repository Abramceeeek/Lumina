import { db } from './db.js';
import { callModel, extractJson } from './llm.js';
import { clamp01 } from './util.js';

// Research/synthesis agent. For each field, gather today's ingested headlines and
// have Claude identify the most significant story, then write an ORIGINAL neutral
// brief (never copying headline wording) plus target vocab + key concepts. One
// fresh story per field per run; attribution recorded in story_sources.

type FieldRow = { id: string; slug: string; label: string };
type RawRow = { id: string; title: string };

type Brief = {
  title: string;
  summary: string;
  synthesis: string;
  importance: number;
  concepts: string[];
  vocabulary: { word: string; definition: string }[];
};

async function synthesizeBrief(field: string, titles: string[]): Promise<Brief | null> {
  const prompt = `You are a neutral news editor for a language-learning reader. Below are today's English headlines in the field of ${field}. Identify the single most significant story they point to, then write an ORIGINAL, balanced synthesis — do NOT copy any headline's wording; write fresh prose explaining the development and why it matters.

Headlines:
${titles.map((t) => `- ${t}`).join('\n')}

Respond with ONLY JSON (no markdown fences): {"title": string, "summary": string, "synthesis": string, "importance": number, "concepts": string[], "vocabulary": [{"word": string, "definition": string}]}. "synthesis" ~350 words, neutral and self-contained. "summary" one sentence. "importance" 0..1. "concepts" 4-6 key ideas. "vocabulary" 4-6 useful terms with short definitions.`;

  let text: string;
  try {
    text = await callModel(prompt, 1800);
  } catch (e) {
    console.error(`synthesis call failed for ${field}:`, (e as Error).message);
    return null;
  }
  const obj = extractJson(text);
  if (!obj || typeof obj.synthesis !== 'string') return null;
  const vocab = Array.isArray(obj.vocabulary) ? obj.vocabulary : [];
  return {
    title: String(obj.title ?? field),
    summary: String(obj.summary ?? ''),
    synthesis: String(obj.synthesis),
    importance: clamp01(Number(obj.importance)),
    concepts: Array.isArray(obj.concepts) ? obj.concepts.map(String).slice(0, 8) : [],
    vocabulary: vocab
      .filter((v): v is { word: string; definition: string } => !!v && typeof v.word === 'string' && typeof v.definition === 'string')
      .map((v) => ({ word: String(v.word), definition: String(v.definition) }))
      .slice(0, 8),
  };
}

export async function synthesize(): Promise<{ created: number; skipped: number }> {
  const { data: fields } = await db.from('fields').select('id, slug, label');
  let created = 0;
  let skipped = 0;

  for (const f of (fields ?? []) as FieldRow[]) {
    // Skip if a fresh story for this field already exists (one per field per day).
    const since = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    const { data: recent } = await db.from('stories').select('id').eq('field_id', f.id).gte('created_at', since).limit(1);
    if (recent && recent.length) {
      skipped++;
      continue;
    }

    const { data: items } = await db
      .from('raw_items')
      .select('id, title')
      .contains('raw', { query: f.label })
      .order('created_at', { ascending: false })
      .limit(20);
    const batch = (items ?? []) as RawRow[];
    if (batch.length < 3) {
      skipped++;
      continue;
    }

    const brief = await synthesizeBrief(f.label, batch.map((b) => b.title));
    if (!brief) {
      skipped++;
      continue;
    }

    const { data: story } = await db
      .from('stories')
      .insert({ title: brief.title, summary: brief.summary, synthesis: brief.synthesis, importance: brief.importance, field_id: f.id })
      .select('id')
      .single();
    if (!story) {
      skipped++;
      continue;
    }
    const storyId = story.id as string;

    await db.from('story_sources').insert(batch.slice(0, 8).map((b) => ({ story_id: storyId, raw_item_id: b.id })));
    if (brief.concepts.length) {
      await db.from('story_concepts').insert(brief.concepts.map((c) => ({ story_id: storyId, concept: c })));
    }
    if (brief.vocabulary.length) {
      await db.from('story_vocabulary').insert(brief.vocabulary.map((v) => ({ story_id: storyId, word: v.word, definition: v.definition })));
    }
    created++;
  }

  return { created, skipped };
}
