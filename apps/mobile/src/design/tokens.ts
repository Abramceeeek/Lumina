// Lumina design tokens — ported verbatim from the prototype's `T` object
// (design-reference/kf-v2-shared.jsx). Single source of truth for color/shape/type.

export const colors = {
  bg: '#FAF9F7',
  card: '#FFFFFF',
  border: '#E5E3DF',
  text: '#1A1A1A',
  textSec: '#6B6860',
  textTer: '#75706C', // darkened from the prototype's #9E9C98 — that value was 2.65:1 on bg, WCAG AA needs 4.5:1
  accent: '#4A7C6F',
  accentLight: '#E6F0EE',
} as const;

// User-switchable accent themes (prototype Tweaks panel).
export const accentThemes = {
  forest: { accent: '#4A7C6F', accentLight: '#E6F0EE' },
  slate: { accent: '#5B7BA8', accentLight: '#EAEDF5' },
  plum: { accent: '#8A6BA8', accentLight: '#F0EBF7' },
  terra: { accent: '#C96442', accentLight: '#F5EDE9' },
} as const;
export type AccentTheme = keyof typeof accentThemes;

export const difficultyColors = {
  Simple: '#5B8A6B',
  Medium: '#4A7C6F',
  Hard: '#8A5B5B',
} as const;

// One-off semantic colors (from the prototype) so screens don't hardcode hex.
export const semantic = {
  white: '#FFFFFF',
  accentPressed: '#3D6960',
  accentWash: 'rgba(74,124,111,0.08)',
  timerGradientEnd: '#6BAA9C',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  surfaceSubtle: '#FAFAF9',
  trackMuted: '#D4D2CE',
  densityBg: '#F5F4F2',
} as const;

export const radius = { card: 12, sm: 8, pill: 100 } as const;

export const shadow = {
  // RN shadow (iOS) + elevation (Android) approximating the prototype's soft shadow.
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
} as const;

export const font = {
  family: 'Inter',
  // Body size is user-switchable; reading column width too (prototype Tweaks).
  bodySizes: [16, 18, 20] as const,
  readWidths: [580, 680, 780] as const,
};

// Field taxonomy + dual-ladder levels now live in @lumina/shared (single source of
// truth for client + server); re-exported so `@/design/tokens` imports keep working.
export { TOPICS, CEFR, FIELD_LEVELS } from '@lumina/shared';
export type { Topic, TopicId, Cefr, FieldLevel, Difficulty, Focus } from '@lumina/shared';
