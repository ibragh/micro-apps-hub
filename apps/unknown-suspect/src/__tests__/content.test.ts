import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { ClueCase } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as ClueCase[];

describe('unknown-suspect content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });
  it('every case has suspects + clues and a valid culpritId', () => {
    for (const c of items) {
      expect(c.suspects.length).toBeGreaterThanOrEqual(2);
      expect(c.clues.length).toBeGreaterThanOrEqual(1);
      expect(c.suspects.some((s) => s.id === c.culpritId)).toBe(true);
    }
  });
});
