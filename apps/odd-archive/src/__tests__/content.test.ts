import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { DatedEvent } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as DatedEvent[];

describe('odd-archive content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });
  it('every fact has a description', () => {
    for (const ev of items) {
      expect(ev.description).toBeTruthy();
      expect(ev.isFictional).toBe(false);
      expect(ev.isVerified).toBe(true);
    }
  });
});
