// Dual-ladder leveling primitives (CLAUDE.md §7). Shared by client + server.

// Language ladder: CEFR, per language.
export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Cefr = (typeof CEFR)[number];

// Field-depth ladder: 1 Intro · 2 Beginner · 3 Intermediate · 4 Advanced · 5 Professional.
export const FIELD_LEVELS = ['Intro', 'Beginner', 'Intermediate', 'Advanced', 'Professional'] as const;
export type FieldLevel = 1 | 2 | 3 | 4 | 5;

// Onboarding comfort choice; maps to a starting CEFR + field level.
export type Difficulty = 'Simple' | 'Medium' | 'Hard';

// Which ladder an article pushes (alternates per session). Mirrors the DB `focus` column.
export type Focus = 'language' | 'field';

// ── Pure ladder logic (shared by client + server; unit-tested) ──────────────

// The onboarding comfort choice seeds both ladders' starting points.
export function difficultyToLevels(d: Difficulty): { cefr: Cefr; fieldLevel: FieldLevel } {
  switch (d) {
    case 'Simple':
      return { cefr: 'A1', fieldLevel: 1 };
    case 'Hard':
      return { cefr: 'C1', fieldLevel: 3 };
    default:
      return { cefr: 'B1', fieldLevel: 2 };
  }
}

// Advance one rung, clamped at the top of each ladder.
export function nextCefr(c: Cefr): Cefr {
  return CEFR[Math.min(CEFR.length - 1, CEFR.indexOf(c) + 1)];
}

export function nextFieldLevel(l: FieldLevel): FieldLevel {
  return Math.min(5, l + 1) as FieldLevel;
}

// Articles alternate which ladder they push.
export function flipFocus(f: Focus): Focus {
  return f === 'language' ? 'field' : 'language';
}

// Display name for a numeric field level (1 → "Intro" … 5 → "Professional").
export function fieldLevelName(l: FieldLevel): string {
  return FIELD_LEVELS[l - 1];
}
