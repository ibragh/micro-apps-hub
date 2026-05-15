import { describe, it, expect } from 'vitest';
import { buildQuiz, scoreQuiz, scoreAuction } from '../quiz';
import type { QuizQuestion } from '@mofeed/content';

const pool: QuizQuestion[] = Array.from({ length: 10 }, (_, i) => ({
  id: `q${i}`,
  title: `q${i}`,
  category: 'test',
  sourceName: 'unit',
  confidenceLevel: 'high',
  isVerified: true,
  isFictional: false,
  question: `question ${i}?`,
  options: ['a', 'b', 'c', 'd'],
  correctIndex: i % 4,
}));

describe('buildQuiz', () => {
  it('returns the requested number of questions', () => {
    expect(buildQuiz(pool, { total: 5, seed: 'x' })).toHaveLength(5);
  });

  it('is deterministic for the same seed', () => {
    const a = buildQuiz(pool, { total: 5, seed: 'same' }).map((q) => q.id);
    const b = buildQuiz(pool, { total: 5, seed: 'same' }).map((q) => q.id);
    expect(a).toEqual(b);
  });

  it('caps at pool size when total exceeds pool', () => {
    expect(buildQuiz(pool, { total: 100, seed: 'x' })).toHaveLength(pool.length);
  });

  it('returns [] on empty pool', () => {
    expect(buildQuiz([], { total: 5, seed: 'x' })).toEqual([]);
  });
});

describe('scoreQuiz', () => {
  it('counts correct, wrong, and unanswered', () => {
    const questions = pool.slice(0, 4);
    const attempts = [
      { questionId: 'q0', selectedIndex: 0, elapsedMs: 100 }, // correct (0%4=0)
      { questionId: 'q1', selectedIndex: 0, elapsedMs: 100 }, // wrong (correct=1)
      { questionId: 'q2', selectedIndex: 2, elapsedMs: 100 }, // correct (2%4=2)
      // q3 unanswered
    ];
    const r = scoreQuiz(questions, attempts);
    expect(r.correct).toBe(2);
    expect(r.wrong).toBe(1);
    expect(r.unanswered).toBe(1);
    expect(r.score).toBe(50);
  });

  it('handles zero questions', () => {
    expect(scoreQuiz([], []).score).toBe(0);
  });
});

describe('scoreAuction', () => {
  it('rewards correct bids and deducts wrong bids', () => {
    const r = scoreAuction([
      { questionId: 'q0', selectedIndex: 0, correctIndex: 0, elapsedMs: 0, bid: 50 },
      { questionId: 'q1', selectedIndex: 0, correctIndex: 1, elapsedMs: 0, bid: 30 },
    ]);
    expect(r.bank).toBe(20);
    expect(r.total).toBe(2);
  });
});
