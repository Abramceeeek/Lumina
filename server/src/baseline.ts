import { db } from './db.js';
import { callClaude, extractJson } from './anthropic.js';

// Turn each synthesized story into a baseline article the client reads + personalizes.
// Body = the neutral synthesis; vocab = the story's target words; quiz + branches are
// generated from the brief. Written with author_id null (a shared/server baseline) so
// every user can read it (RLS: articles are readable by all authenticated users).

type StoryRow = { id: string; field_id: string | null; title: string; summary: string | null; synthesis: string };

function paragraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

async function genQuizAndBranches(title: string, synthesis: string): Promise<{ quiz: unknown[]; branches: unknown[] }> {
  const prompt = `From this neutral news brief titled "${title}", create learning scaffolding.

${synthesis}

Respond with ONLY JSON (no fences): {"quiz": [{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number},{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number},{"type":"open","q":string,"placeholder":string}], "branches": [{"title":string,"description":string}]}. "branches": 4-5 related threads to explore next; "correct" is the 0-based index.`;
  try {
    const obj = extractJson(await callClaude(prompt, 1200));
    return {
      quiz: Array.isArray(obj?.quiz) ? (obj!.quiz as unknown[]) : [],
      branches: Array.isArray(obj?.branches) ? (obj!.branches as unknown[]) : [],
    };
  } catch {
    return { quiz: [], branches: [] };
  }
}

export async function buildBaselines(): Promise<{ created: number }> {
  const since = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const { data: stories } = await db.from('stories').select('id, field_id, title, summary, synthesis').gte('created_at', since);
  let created = 0;

  for (const s of (stories ?? []) as StoryRow[]) {
    if (!s.field_id) continue;
    const { data: existing } = await db.from('articles').select('id').eq('story_id', s.id).limit(1);
    if (existing && existing.length) continue;

    const { data: vocabRows } = await db.from('story_vocabulary').select('word, definition').eq('story_id', s.id);
    const vocabulary = (vocabRows ?? []).map((v) => ({ word: v.word, definition: v.definition }));
    const { quiz, branches } = await genQuizAndBranches(s.title, s.synthesis);

    const { error } = await db.from('articles').insert({
      author_id: null, // shared/server baseline
      field_id: s.field_id,
      story_id: s.id,
      title: s.title,
      summary: s.summary,
      body: paragraphs(s.synthesis),
      base_difficulty: 3,
      focus: 'field',
      est_read_minutes: 5,
      lang: 'en',
      is_seed: false,
      quiz_questions: quiz,
      vocabulary,
      branches_text: branches,
    });
    if (!error) created++;
  }
  return { created };
}
