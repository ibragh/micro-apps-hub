import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { PollItem } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as PollItem[];

describe('saudi-mood-map content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });
  it('every poll has at least 2 options with unique ids', () => {
    for (const p of items) {
      expect(p.options.length).toBeGreaterThanOrEqual(2);
      const ids = new Set(p.options.map((o) => o.id));
      expect(ids.size).toBe(p.options.length);
    }
  });
});
