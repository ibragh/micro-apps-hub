import { describe, it, expect } from 'vitest';
import { eventsForDay, sortByYear } from '../timeline';
import type { DatedEvent } from '@mofeed/content';

const events: DatedEvent[] = [
  {
    id: 'e1', title: 't1', category: 'history',
    sourceName: 'unit', confidenceLevel: 'high',
    isVerified: true, isFictional: false,
    month: 1, day: 1, year: 1900,
  },
  {
    id: 'e2', title: 't2', category: 'history',
    sourceName: 'unit', confidenceLevel: 'high',
    isVerified: true, isFictional: false,
    month: 2, day: 29, year: 2000,
  },
  {
    id: 'e3', title: 't3', category: 'history',
    sourceName: 'unit', confidenceLevel: 'high',
    isVerified: true, isFictional: false,
    month: 1, day: 1, year: 1800,
  },
];

describe('eventsForDay', () => {
  it('matches month + day, ignoring year', () => {
    const r = eventsForDay(events, new Date('2024-01-01T00:00:00Z'));
    expect(r.map((e) => e.id).sort()).toEqual(['e1', 'e3']);
  });

  it('handles leap day (Feb 29)', () => {
    const r = eventsForDay(events, new Date('2024-02-29T00:00:00Z'));
    expect(r.map((e) => e.id)).toEqual(['e2']);
  });
});

describe('sortByYear', () => {
  it('orders by year ascending', () => {
    expect(sortByYear(events).map((e) => e.year)).toEqual([1800, 1900, 2000]);
  });
});
