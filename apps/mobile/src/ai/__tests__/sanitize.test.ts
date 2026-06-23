import { describe, it, expect } from '@jest/globals';
import { sanitizeQuiz, sanitizeVocab, sanitizeBranches } from '../sanitize';

describe('sanitize', () => {
  it('keeps valid quiz entries and drops malformed ones', () => {
    const q = sanitizeQuiz([
      { type: 'mc', q: 'x', opts: ['a', 'b'], correct: 1 },
      { type: 'open', q: 'y' },
      { type: 'mc', q: 'too few opts', opts: ['only one'] },
      null,
    ]);
    expect(q).toHaveLength(2);
    expect(q?.[0]).toEqual({ type: 'mc', q: 'x', opts: ['a', 'b'], correct: 1 });
    expect(q?.[1]).toMatchObject({ type: 'open', q: 'y', placeholder: 'Type your thoughts…' });
  });

  it('returns undefined for non-arrays and empty results', () => {
    expect(sanitizeQuiz('nope')).toBeUndefined();
    expect(sanitizeVocab([])).toBeUndefined();
    expect(sanitizeBranches(undefined)).toBeUndefined();
  });

  it('coerces vocab and branches, dropping junk', () => {
    expect(sanitizeVocab([{ word: 'a', definition: 'b' }, { word: 1 }])).toEqual([{ word: 'a', definition: 'b' }]);
    expect(sanitizeBranches([{ title: 't' }])).toEqual([{ title: 't', description: '' }]);
  });
});
