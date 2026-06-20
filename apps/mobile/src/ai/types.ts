import type { Difficulty } from '@/design/tokens';

// The client-side personalization layer (CLAUDE.md §6b). A baseline article in,
// a version rewritten to the user's language + level out.
export type PersonalizeInput = {
  title: string;
  body: string[];
  language: string;
  difficulty: Difficulty;
  targetMinutes: number;
};

export type Personalized = { body: string[]; note?: string };

export interface Personalizer {
  id: string;
  personalize(input: PersonalizeInput): Promise<Personalized>;
}
