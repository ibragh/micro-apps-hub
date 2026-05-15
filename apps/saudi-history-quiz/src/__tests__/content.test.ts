import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { QuizQuestion } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as QuizQuestion[];

describe('saudi-history-quiz content', () => {
  it('passes shared content validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });
  it('all items have an https source or named book reference', () => {
    for (const q of items) {
      const ok = (q.sourceUrl && q.sourceUrl.startsWith('https://')) || q.sourceName;
      expect(ok).toBeTruthy();
    }
  });
});
