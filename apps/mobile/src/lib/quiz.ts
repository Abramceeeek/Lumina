// Pure quiz-scoring logic, extracted from the Quiz screen so it's unit-testable.
import type { QuizQuestion } from '@lumina/shared';

export type { QuizQuestion };

export function mcCount(quiz: QuizQuestion[]): number {
  return quiz.filter((q) => q.type === 'mc').length;
}

export function mcScore(quiz: QuizQuestion[], answers: Record<number, number>): number {
  return quiz.reduce((acc, q, i) => (q.type === 'mc' && answers[i] === q.correct ? acc + 1 : acc), 0);
}

export function allMcAnswered(quiz: QuizQuestion[], answers: Record<number, number>): boolean {
  return quiz.every((q, i) => q.type !== 'mc' || answers[i] !== undefined);
}
