import { describe, it, expect } from '@jest/globals';
import { computeBadges } from '../badges';

describe('computeBadges', () => {
  it('gives nothing before the first read', () => {
    expect(computeBadges({ articlesRead: 0, dayStreak: 0, topicsExplored: 0 })).toEqual([]);
  });

  it('awards first-steps on the first article', () => {
    const b = computeBadges({ articlesRead: 1, dayStreak: 1, topicsExplored: 1 });
    expect(b.map((x) => x.label)).toEqual(['First steps']);
  });

  it('stacks reading + streak + explorer badges', () => {
    const labels = computeBadges({ articlesRead: 30, dayStreak: 7, topicsExplored: 3 }).map((x) => x.label);
    expect(labels).toEqual(['First steps', '10 deep', 'Devoted reader', 'On a roll', 'Week strong', 'Explorer']);
  });
});
