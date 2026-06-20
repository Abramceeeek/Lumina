import { describe, it, expect } from '@jest/globals';
import { TOPICS, CEFR, FIELD_LEVELS, accentThemes, difficultyColors } from '../tokens';

describe('design tokens', () => {
  it('carries the 12 prototype fields', () => {
    expect(TOPICS).toHaveLength(12);
    expect(TOPICS.map((t) => t.id)).toContain('finance');
  });

  it('defaults to the forest accent', () => {
    expect(accentThemes.forest.accent).toBe('#4A7C6F');
    expect(difficultyColors.Medium).toBe(accentThemes.forest.accent);
  });

  it('exposes the full CEFR language ladder', () => {
    expect(CEFR).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('has five field-depth levels (Intro → Professional)', () => {
    expect(FIELD_LEVELS).toHaveLength(5);
    expect(FIELD_LEVELS[0]).toBe('Intro');
    expect(FIELD_LEVELS[4]).toBe('Professional');
  });
});
