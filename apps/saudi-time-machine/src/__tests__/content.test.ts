import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { DatedEvent } from '@mofeed/content';
import { eventsForDay } from '@mofeed/engines';
import seed from '../content/seed.json';

const events = seed as DatedEvent[];

describe('saudi-time-machine content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(events)).not.toThrow();
  });

  it('every event is verified, sourced, non-fictional', () => {
    for (const ev of events) {
      expect(ev.isFictional).toBe(false);
      expect(ev.isVerified).toBe(true);
      expect(ev.sourceName).toBeTruthy();
    }
  });

  it('returns Vision 2030 event on April 25', () => {
    const r = eventsForDay(events, new Date(Date.UTC(2030, 3, 25)));
    expect(r.some((e) => e.id === 'stm-2016')).toBe(true);
  });
});
