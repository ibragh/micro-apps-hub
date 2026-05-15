import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { DatedEvent } from '@mofeed/content';
import seed from '../content/seed.json';

const events = seed as DatedEvent[];

describe('history-secrets content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(events)).not.toThrow();
  });
  it('all events are verified + sourced', () => {
    for (const ev of events) {
      expect(ev.isFictional).toBe(false);
      expect(ev.isVerified).toBe(true);
      expect(ev.sourceName).toBeTruthy();
    }
  });
});
