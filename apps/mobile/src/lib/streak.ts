// Consecutive-day streak ending at the most recent activity date.
// Input: ISO timestamps; output: run length of back-to-back calendar days.
export function dayStreak(isoTimestamps: string[]): number {
  const days = Array.from(new Set(isoTimestamps.map((d) => d.slice(0, 10))))
    .sort()
    .reverse();
  if (!days.length) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((Date.parse(days[i - 1]) - Date.parse(days[i])) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
