import { db } from './db.js';
import { callModel, extractJson } from './llm.js';
import { domainOf } from './util.js';

// Turn synthesized stories into baseline articles the client reads + personalizes
// (sync point S2). Per field, only the highest-importance fresh story converts.
// Body = the neutral synthesis; vocab = the story's target words; quiz + branches
// are generated from the brief — an article with no quiz is skipped, not shipped
// (a quiz-less baseline breaks the client's quiz/ladder/recall loop). Source count
// + publisher domains are copied onto the row for the client's disclosure line.
// Written with author_id null (shared baseline; readable by all authenticated users).

type StoryRow = { id: string; field_id: string | null; title: string; summary: string | null; synthesis: string; importance: number };

function paragraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

async function genQuizAndBranches(title: string, synthesis: string): Promise<{ quiz: unknown[]; branches: unknown[] }> {
  const prompt = `From this neutral news brief titled "${title}", create learning scaffolding.

${synthesis}

Respond with ONLY JSON (no fences): {"quiz": [{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number,"explanation":string},{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number,"explanation":string},{"type":"open","q":string,"placeholder":string}], "branches": [{"title":string,"description":string}]}. "branches": 4-5 related threads to explore next; "correct" is the 0-based index; "explanation" is one short sentence on why the correct option is right.`;
  try {
    const obj = extractJson(await callModel(prompt, 1200));
    return {
      quiz: Array.isArray(obj?.quiz) ? (obj!.quiz as unknown[]) : [],
      branches: Array.isArray(obj?.branches) ? (obj!.branches as unknown[]) : [],
    };
  } catch {
    return { quiz: [], branches: [] };
  }
}

type SourceItem = { url: string | null; raw: { domain?: string | null } | null };

// Attribution copied from story_sources -> raw_items (service-role-only tables).
async function sourceAttribution(storyId: string): Promise<{ count: number; domains: string[] }> {
  const { data } = await db.from('story_sources').select('raw_items(url, raw)').eq('story_id', storyId);
  const rows = (data ?? []) as { raw_items: SourceItem | SourceItem[] | null }[];
  const domains = new Set<string>();
  for (const r of rows) {
    const item = Array.isArray(r.raw_items) ? r.raw_items[0] : r.raw_items;
    const d = domainOf(item?.url, item?.raw?.domain);
    if (d) domains.add(d);
  }
  return { count: rows.length, domains: [...domains].slice(0, 6) };
}

export async function buildBaselines(): Promise<{ created: number; skipped: number }> {
  const since = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const { data: stories } = await db
    .from('stories')
    .select('id, field_id, title, summary, synthesis, importance')
    .gte('created_at', since)
    .order('importance', { ascending: false });
  let created = 0;
  let skipped = 0;
  const doneFields = new Set<string>();

  for (const s of (stories ?? []) as StoryRow[]) {
    if (!s.field_id) continue;
    // Ranked by importance desc: the first story per field wins the day.
    if (doneFields.has(s.field_id)) {
      skipped++;
      continue;
    }
    const { data: existing } = await db.from('articles').select('id').eq('story_id', s.id).limit(1);
    if (existing && existing.length) {
      doneFields.add(s.field_id);
      continue;
    }

    const { data: vocabRows } = await db.from('story_vocabulary').select('word, definition').eq('story_id', s.id);
    const vocabulary = (vocabRows ?? []).map((v) => ({ word: v.word, definition: v.definition }));
    const { quiz, branches } = await genQuizAndBranches(s.title, s.synthesis);
    if (!quiz.length) {
      console.error(`baseline skipped (quiz generation failed): ${s.title}`);
      skipped++;
      continue;
    }
    const attribution = await sourceAttribution(s.id);
    const words = s.synthesis.split(/\s+/).filter(Boolean).length;

    const { error } = await db.from('articles').insert({
      author_id: null, // shared/server baseline
      field_id: s.field_id,
      story_id: s.id,
      title: s.title,
      summary: s.summary,
      body: paragraphs(s.synthesis),
      base_difficulty: 3,
      focus: 'field',
      est_read_minutes: Math.max(2, Math.min(15, Math.round(words / 200) || 2)),
      lang: 'en',
      is_seed: false,
      quiz_questions: quiz,
      vocabulary,
      branches_text: branches,
      source_count: attribution.count,
      source_domains: attribution.domains,
    });
    if (!error) {
      created++;
      doneFields.add(s.field_id);
    } else {
      console.error(`baseline insert failed for "${s.title}": ${error.message}`);
      skipped++;
    }
  }
  return { created, skipped };
}
