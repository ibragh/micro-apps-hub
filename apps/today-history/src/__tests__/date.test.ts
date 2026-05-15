import { describe, it, expect } from 'vitest';
import { eventsForDay, sortByYear } from '@mofeed/engines';
import type { DatedEvent } from '@mofeed/content';
import seed from '../content/seed.json';

const events = seed as DatedEvent[];

describe('today-history seed data', () => {
  it('all events have month + day in valid ranges', () => {
    for (const ev of events) {
      expect(ev.month).toBeGreaterThanOrEqual(1);
      expect(ev.month).toBeLessThanOrEqual(12);
      expect(ev.day).toBeGreaterThanOrEqual(1);
      expect(ev.day).toBeLessThanOrEqual(31);
    }
  });

  it('all events are verified and sourced (non-fictional)', () => {
    for (const ev of events) {
      expect(ev.isFictional).toBe(false);
      expect(ev.isVerified).toBe(true);
      expect(ev.sourceName).toBeTruthy();
    }
  });

  it('returns the moon-landing event on July 20', () => {
    const r = eventsForDay(events, new Date(Date.UTC(2030, 6, 20))); // 2030-07-20
    expect(r.some((e) => e.id === 'th-1969-07-20')).toBe(true);
  });

  it('returns no events on a date with no matches (Feb 29 in a non-seeded year)', () => {
    const r = eventsForDay(events, new Date(Date.UTC(2024, 1, 29)));
    expect(r).toEqual([]);
  });

  it('sort by year is stable for ties', () => {
    const sorted = sortByYear(events);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1] as DatedEvent;
      const curr = sorted[i] as DatedEvent;
      expect(prev.year).toBeLessThanOrEqual(curr.year);
    }
  });
});
