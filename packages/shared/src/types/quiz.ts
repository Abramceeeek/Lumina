// Comprehension quiz attached to an article (typically 2 MC + 1 open reflection).
export type QuizQuestion =
  | { type: 'mc'; q: string; opts: string[]; correct: number }
  | { type: 'open'; q: string; placeholder?: string };
