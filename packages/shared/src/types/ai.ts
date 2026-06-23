import type { Cefr, Difficulty, FieldLevel, Focus } from './learning';

// Dual-ladder context (CLAUDE.md §7) threaded into every generation/personalization.
type LadderContext = {
  languageLevel?: Cefr; // CEFR the article should target/teach
  fieldLevel?: FieldLevel; // field depth 1..5
  focus?: Focus; // which ladder this article pushes
};

// The client-side personalization layer (CLAUDE.md §6b). A baseline article in,
// a version rewritten to the user's language + level out.
export type PersonalizeInput = {
  title: string;
  body: string[];
  language: string;
  difficulty: Difficulty;
  targetMinutes: number;
} & LadderContext;

export type Personalized = { body: string[]; note?: string };

export interface Personalizer {
  id: string;
  personalize(input: PersonalizeInput): Promise<Personalized>;
}

// Generate a fresh article about a topic, at the reader's level.
export type GenerateInput = {
  topic: string;
  difficulty: Difficulty;
  language: string;
  targetMinutes: number;
} & LadderContext;
export type Generated = { title: string; topic: string; body: string[]; note?: string };

export interface Generator {
  id: string;
  generate(input: GenerateInput): Promise<Generated>;
}
