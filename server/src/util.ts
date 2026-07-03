// Pure helpers shared across the pipeline (no db / network / env access, so they
// are unit-testable without Supabase credentials). See src/__tests__/util.test.ts.

// GDELT "seendate" is "YYYYMMDDTHHMMSSZ". Returns an ISO string, or null if the
// value is missing / too short / unparseable.
export function parseSeendate(s?: string): string | null {
  if (!s || s.length < 15) return null;
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// Clamp an importance score into [0, 1]; NaN falls back to a neutral 0.5.
export function clamp01(n: number): number {
  return Number.isNaN(n) ? 0.5 : Math.max(0, Math.min(1, n));
}
