// Earned badges, derived from real reading stats (pure + unit-tested).
export type Badge = { label: string; note: string; emoji: string };
export type BadgeStats = { articlesRead: number; dayStreak: number; topicsExplored: number };

export function computeBadges(s: BadgeStats): Badge[] {
  const out: Badge[] = [];
  if (s.articlesRead >= 1) out.push({ label: 'First steps', note: 'Read your first article', emoji: '🌱' });
  if (s.articlesRead >= 10) out.push({ label: '10 deep', note: '10 articles read', emoji: '📚' });
  if (s.articlesRead >= 30) out.push({ label: 'Devoted reader', note: '30 articles read', emoji: '🏆' });
  if (s.dayStreak >= 3) out.push({ label: 'On a roll', note: `${s.dayStreak}-day streak`, emoji: '🔥' });
  if (s.dayStreak >= 7) out.push({ label: 'Week strong', note: 'Seven days running', emoji: '⚡' });
  if (s.topicsExplored >= 3) out.push({ label: 'Explorer', note: `${s.topicsExplored} fields explored`, emoji: '🧭' });
  return out;
}
