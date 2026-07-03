import type { QuizQuestion, VocabItem, BranchOption } from '@lumina/shared';

// Coerce model-produced JSON into valid shapes (or undefined so screens fall back).

export function sanitizeQuiz(raw: unknown): QuizQuestion[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: QuizQuestion[] = [];
  for (const q of raw) {
    if (!q || typeof q !== 'object') continue;
    const o = q as Record<string, unknown>;
    if (o.type === 'mc' && typeof o.q === 'string' && Array.isArray(o.opts) && o.opts.length >= 2) {
      const correct = Number(o.correct);
      out.push({
        type: 'mc',
        q: o.q,
        opts: o.opts.map(String),
        correct: Number.isInteger(correct) ? correct : 0,
        ...(typeof o.explanation === 'string' && o.explanation.trim() ? { explanation: o.explanation.trim() } : {}),
      });
    } else if (o.type === 'open' && typeof o.q === 'string') {
      out.push({ type: 'open', q: o.q, placeholder: typeof o.placeholder === 'string' ? o.placeholder : 'Type your thoughts…' });
    }
  }
  return out.length ? out : undefined;
}

export function sanitizeVocab(raw: unknown): VocabItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .filter((v): v is Record<string, unknown> => !!v && typeof v === 'object')
    .filter((v) => typeof v.word === 'string' && typeof v.definition === 'string')
    .map((v) => ({ word: String(v.word), definition: String(v.definition) }));
  return out.length ? out : undefined;
}

export function sanitizeBranches(raw: unknown): BranchOption[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
    .filter((b) => typeof b.title === 'string')
    .map((b) => ({ title: String(b.title), description: typeof b.description === 'string' ? b.description : '' }));
  return out.length ? out : undefined;
}
