import { useMemo, useState } from 'react';
import { AppShell, Card, SourceLine, Stack, Hero } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: "آلة الزمن السعودية",
  titleEn: "Saudi Time Machine",
  descAr: "اختر سنة وشاهد كيف كانت المملكة في تلك الحقبة: أحداث، ملامح اجتماعية، رياضة وثقافة.",
} as const;

import type { DatedEvent } from '@mofeed/content';
import { eventsForDay, sortByYear, todayUtc } from '@mofeed/engines';

const POOL = seed as DatedEvent[];

export default function App() {
  const [pickedDate, setPickedDate] = useState<Date>(todayUtc());
  const todays = useMemo(() => sortByYear(eventsForDay(POOL, pickedDate)), [pickedDate]);

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) return;
    const parts = v.split('-');
    if (parts.length !== 3) return;
    const [y, m, d] = parts.map((n) => Number.parseInt(n, 10));
    if (!y || !m || !d) return;
    setPickedDate(new Date(Date.UTC(y, m - 1, d)));
    track('date_pick', { app: "saudi-time-machine" });
  };

  const isoDate = pickedDate.toISOString().slice(0, 10);

  return (
    <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
      <Stack>
        <Hero>
          <h1>{META.titleAr}</h1>
          <p className="mf-muted">{META.descAr}</p>
        </Hero>
        <Card>
          <Stack>
            <label>
              اختر تاريخًا (يوم/شهر يهمّ، السنة تُتجاهل):
              <input
                type="date"
                value={isoDate}
                onChange={onDateChange}
                style={{
                  display: 'block',
                  marginTop: 8,
                  padding: 8,
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  borderRadius: 8,
                  border: '1px solid var(--mf-color-border)',
                }}
              />
            </label>
          </Stack>
        </Card>
        {todays.length === 0 ? (
          <Card><p className="mf-muted">لا توجد أحداث موثقة لهذا اليوم بعد.</p></Card>
        ) : (
          <Stack>
            {todays.map((ev) => (
              <Card key={ev.id}>
                <Stack>
                  <h3>{ev.year} — {ev.title}</h3>
                  {ev.description ? <p>{ev.description}</p> : null}
                  <SourceLine name={ev.sourceName} url={ev.sourceUrl} bookReference={ev.bookReference} isFictional={ev.isFictional} />
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </AppShell>
  );
}
