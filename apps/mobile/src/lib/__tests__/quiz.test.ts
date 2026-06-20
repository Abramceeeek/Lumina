import { describe, it, expect } from '@jest/globals';
import { mcCount, mcScore, allMcAnswered, QuizQuestion } from '../quiz';

const quiz: QuizQuestion[] = [
  { type: 'mc', q: 'a', opts: ['x', 'y'], correct: 1 },
  { type: 'mc', q: 'b', opts: ['x', 'y'], correct: 0 },
  { type: 'open', q: 'c', placeholder: '' },
];

describe('quiz scoring', () => {
  it('counts only multiple-choice questions', () => {
    expect(mcCount(quiz)).toBe(2);
  });

  it('scores correct answers, ignoring the open question', () => {
    expect(mcScore(quiz, { 0: 1, 1: 0 })).toBe(2);
    expect(mcScore(quiz, { 0: 0, 1: 0 })).toBe(1);
    expect(mcScore(quiz, {})).toBe(0);
  });

  it('detects when all multiple-choice questions are answered', () => {
    expect(allMcAnswered(quiz, { 0: 1, 1: 0 })).toBe(true);
    expect(allMcAnswered(quiz, { 0: 1 })).toBe(false);
    expect(allMcAnswered(quiz, {})).toBe(false);
  });
});
