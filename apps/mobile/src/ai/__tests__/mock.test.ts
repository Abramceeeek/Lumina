import { describe, it, expect } from '@jest/globals';
import { mockPersonalizer } from '../providers/mock';

describe('mockPersonalizer', () => {
  const body = ['p1', 'p2', 'p3', 'p4', 'p5'];

  it('returns a note describing the run', async () => {
    const out = await mockPersonalizer.personalize({ title: 't', body, language: 'English', difficulty: 'Medium', targetMinutes: 5 });
    expect(out.note).toContain('English');
    expect(out.note).toContain('Medium');
  });

  it('trims for short reads but keeps at least 3 paragraphs', async () => {
    const short = await mockPersonalizer.personalize({ title: 't', body, language: 'English', difficulty: 'Simple', targetMinutes: 5 });
    expect(short.body.length).toBeGreaterThanOrEqual(3);
    expect(short.body.length).toBeLessThanOrEqual(body.length);
  });

  it('keeps the full body for long reads', async () => {
    const long = await mockPersonalizer.personalize({ title: 't', body, language: 'English', difficulty: 'Hard', targetMinutes: 15 });
    expect(long.body).toHaveLength(body.length);
  });
});
