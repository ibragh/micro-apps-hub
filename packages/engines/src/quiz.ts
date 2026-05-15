import type { QuizQuestion } from '@mofeed/content';
import { mulberry32, hashString, sample } from './random';

export interface QuizConfig {
  /** number of questions to draw from the pool */
  total: number;
  /** optional deterministic seed (any string). If omitted, picks random. */
  seed?: string;
}

export interface QuizAttempt {
  questionId: string;
  selectedIndex: number;
  /** ms elapsed answering this question */
  elapsedMs: number;
}

export interface QuizResult {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;        // 0..100
  perQuestion: Array<{
    questionId: string;
    correct: boolean;
    selectedIndex: number;
    correctIndex: number;
  }>;
}

/**
 * Build the question set for a quiz. Deterministic when a seed is given.
 */
export function buildQuiz(pool: readonly QuizQuestion[], config: QuizConfig): QuizQuestion[] {
  if (pool.length === 0) return [];
  const seed = config.seed ? hashString(config.seed) : Math.floor(Math.random() * 2 ** 32);
  const rng = mulberry32(seed);
  return sample(pool, config.total, rng);
}

/**
 * Score a quiz. `score` is a percentage from 0 to 100. Unanswered
 * questions count as wrong but are reported separately so apps can
 * differentiate skipped vs. wrong answers in the result screen.
 */
export function scoreQuiz(
  questions: readonly QuizQuestion[],
  attempts: readonly QuizAttempt[],
): QuizResult {
  const total = questions.length;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const perQuestion: QuizResult['perQuestion'] = [];

  for (const q of questions) {
    const a = attempts.find((x) => x.questionId === q.id);
    if (!a) {
      unanswered++;
      perQuestion.push({
        questionId: q.id,
        correct: false,
        selectedIndex: -1,
        correctIndex: q.correctIndex,
      });
      continue;
    }
    const isCorrect = a.selectedIndex === q.correctIndex;
    if (isCorrect) correct++;
    else wrong++;
    perQuestion.push({
      questionId: q.id,
      correct: isCorrect,
      selectedIndex: a.selectedIndex,
      correctIndex: q.correctIndex,
    });
  }

  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { total, correct, wrong, unanswered, score, perQuestion };
}

/**
 * Auction-style scoring (knowledge-auction app).
 * The user bids 1..maxBid on each answer. Correct → +bid. Wrong → -bid.
 */
export function scoreAuction(
  attempts: ReadonlyArray<QuizAttempt & { bid: number; correctIndex: number }>,
): { total: number; bank: number } {
  let bank = 0;
  for (const a of attempts) {
    const correct = a.selectedIndex === a.correctIndex;
    bank += correct ? a.bid : -a.bid;
  }
  return { total: attempts.length, bank };
}
