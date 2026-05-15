import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { QuizQuestion } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as QuizQuestion[];

describe('predict-the-decision content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });

  it('every item is verified + sourced + non-fictional', () => {
    for (const q of items) {
      expect(q.isVerified).toBe(true);
      expect(q.isFictional).toBe(false);
      expect(q.sourceName).toBeTruthy();
    }
  });

  it('every item has 3-4 options with a valid correctIndex', () => {
    for (const q of items) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});
