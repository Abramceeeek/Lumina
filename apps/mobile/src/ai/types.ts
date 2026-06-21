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

// Generate a fresh article about a topic, at the reader's level.
export type GenerateInput = { topic: string; difficulty: Difficulty; language: string; targetMinutes: number };
export type Generated = { title: string; topic: string; body: string[]; note?: string };

export interface Generator {
  id: string;
  generate(input: GenerateInput): Promise<Generated>;
}
