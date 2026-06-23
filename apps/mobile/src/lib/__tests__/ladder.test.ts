import { describe, it, expect } from '@jest/globals';
import { difficultyToLevels, nextCefr, nextFieldLevel, flipFocus, fieldLevelName } from '@lumina/shared';

describe('ladder helpers', () => {
  it('maps the comfort choice to both ladders', () => {
    expect(difficultyToLevels('Simple')).toEqual({ cefr: 'A1', fieldLevel: 1 });
    expect(difficultyToLevels('Medium')).toEqual({ cefr: 'B1', fieldLevel: 2 });
    expect(difficultyToLevels('Hard')).toEqual({ cefr: 'C1', fieldLevel: 3 });
  });

  it('advances CEFR one rung, clamped at C2', () => {
    expect(nextCefr('A1')).toBe('A2');
    expect(nextCefr('B2')).toBe('C1');
    expect(nextCefr('C2')).toBe('C2');
  });

  it('advances field level, clamped at 5', () => {
    expect(nextFieldLevel(1)).toBe(2);
    expect(nextFieldLevel(5)).toBe(5);
  });

  it('alternates focus', () => {
    expect(flipFocus('language')).toBe('field');
    expect(flipFocus('field')).toBe('language');
  });

  it('names field levels', () => {
    expect(fieldLevelName(1)).toBe('Intro');
    expect(fieldLevelName(3)).toBe('Intermediate');
    expect(fieldLevelName(5)).toBe('Professional');
  });
});
