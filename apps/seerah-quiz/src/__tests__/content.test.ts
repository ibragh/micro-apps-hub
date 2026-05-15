import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { QuizQuestion } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as QuizQuestion[];

describe('seerah-quiz content', () => {
  it('passes shared content validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });

  it('all items are verified, sourced, and non-fictional', () => {
    for (const q of items) {
      expect(q.isFictional).toBe(false);
      expect(q.isVerified).toBe(true);
      expect(q.sourceName).toBeTruthy();
      expect(q.bookReference).toBeTruthy();
    }
  });

  it('every question has a valid correctIndex within options', () => {
    for (const q of items) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});
