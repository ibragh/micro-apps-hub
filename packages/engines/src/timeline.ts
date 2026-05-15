import type { DatedEvent } from '@mofeed/content';

/**
 * Get events for a given month + day. Year is ignored on the input
 * date — this is "this day in history" semantics.
 */
export function eventsForDay(events: readonly DatedEvent[], date: Date): DatedEvent[] {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return events.filter((e) => e.month === m && e.day === d);
}

/** Sort events by year ascending. Stable for ties. */
export function sortByYear(events: readonly DatedEvent[]): DatedEvent[] {
  return events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => a.e.year - b.e.year || a.i - b.i)
    .map((x) => x.e);
}

/** Today, in UTC — convenience used by today-history app. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
