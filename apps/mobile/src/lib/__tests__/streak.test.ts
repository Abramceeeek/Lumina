import { describe, it, expect } from '@jest/globals';
import { dayStreak } from '../streak';

describe('dayStreak', () => {
  it('counts consecutive days ending at the latest', () => {
    expect(dayStreak(['2026-06-21T08:00:00Z', '2026-06-22T09:00:00Z', '2026-06-23T07:00:00Z'])).toBe(3);
  });

  it('collapses multiple reads on one day', () => {
    expect(dayStreak(['2026-06-23T08:00:00Z', '2026-06-23T20:00:00Z'])).toBe(1);
  });

  it('breaks the streak on a gap', () => {
    expect(dayStreak(['2026-06-20T08:00:00Z', '2026-06-22T08:00:00Z', '2026-06-23T08:00:00Z'])).toBe(2);
  });

  it('is 0 for no activity', () => {
    expect(dayStreak([])).toBe(0);
  });
});
