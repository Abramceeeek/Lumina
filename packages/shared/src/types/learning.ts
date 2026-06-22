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
