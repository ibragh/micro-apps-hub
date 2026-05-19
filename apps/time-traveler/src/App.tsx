import { useState } from 'react';
import { Button, SourceLine } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';
import type { ScenarioItem } from '@mofeed/content';
import { tallyDecisions } from '@mofeed/engines';

const META = {
  titleAr: 'المسافر عبر الزمن',
  titleEn: 'Time Traveler',
  descAr:
    'تجد نفسك في حقبة تاريخية: ماذا تختار؟ خياراتك تُقيَّم ضمن السياق التاريخي الموثق لتلك الحقبة.',
} as const;

const POOL = seed as ScenarioItem[];

const ERA_YEARS = ['632', '780', '1185', '1453', '1922']; // suggestive era markers

function styleLabel(s: string): string {
  const map: Record<string, string> = {
    cautious: 'حذر',
    bold: 'جريء',
    analytical: 'تحليلي',
    diplomatic: 'دبلوماسي',
    emotional: 'عاطفي',
    practical: 'عملي',
    strategic: 'استراتيجي',
    unstyled: 'متنوع',
  };
  return map[s] ?? s;
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<{ scenarioId: string; choiceId: string }>>([]);
  const [done, setDone] = useState(false);
  const total = POOL.length;
  const s = POOL[index];

  if (total === 0) {
    return (
      <div className="tt-cosmos">
        <p>لا توجد سيناريوهات متاحة بعد.</p>
      </div>
    );
  }

  if (done || !s) {
    const tally = tallyDecisions(POOL, picks);
    return (
      <div className="tt-cosmos tt-cosmos--result" data-testid="app-root">
        <div className="tt-portal">
          <div className="tt-portal__halo" aria-hidden="true" />
          <div className="tt-portal__eyebrow">عاد المسافر</div>
          <div className="tt-portal__style">{styleLabel(tally.dominantStyle)}</div>
          <div className="tt-portal__sub">{META.descAr}</div>
        </div>
        <div className="tt-log">
          {picks.map((p, i) => {
            const scn = POOL.find((x) => x.id === p.scenarioId);
            const ch = scn?.choices.find((c) => c.id === p.choiceId);
            return (
              <div key={i} className="tt-log__entry">
                <span className="tt-log__year" dir="ltr">{ERA_YEARS[i] || (i + 1) * 200}</span>
                <div className="tt-log__body">
                  <strong>{scn?.prompt}</strong>
                  <div className="tt-log__decision">اخترتَ: {ch?.label}</div>
                  <div className="tt-log__consequence">{ch?.consequence}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          block
          onClick={() => {
            setIndex(0);
            setPicks([]);
            setDone(false);
          }}
        >
          سافر مرة أخرى
        </Button>
      </div>
    );
  }

  const onPick = (choiceId: string) => {
    const next = [...picks, { scenarioId: s.id, choiceId }];
    setPicks(next);
    track('scenario_pick', { app: 'time-traveler', sId: s.id, cId: choiceId });
    if (index + 1 >= total) {
      setDone(true);
      track('scenario_complete', { app: 'time-traveler' });
    } else setIndex(index + 1);
  };

  const era = ERA_YEARS[index] || `${(index + 1) * 200}`;

  return (
    <div className="tt-cosmos" data-testid="app-root">
      <a href="#tt-main" className="mf-skip-link">تجاوز إلى المحتوى</a>

      <div className="tt-stars" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="tt-star" style={{
            left: `${(i * 137) % 100}%`,
            top: `${(i * 71) % 100}%`,
            animationDelay: `${(i % 7) * 0.4}s`,
            opacity: 0.15 + ((i % 5) * 0.18),
          }} />
        ))}
      </div>

      <header className="tt-hud" role="banner">
        <div className="tt-hud__brand">
          <span className="tt-hud__sigil" aria-hidden="true">◐</span>
          <div className="tt-hud__title">
            <span>{META.titleAr}</span>
            <small dir="ltr">{META.titleEn}</small>
          </div>
        </div>
        <div className="tt-hud__chronometer">
          <span className="tt-hud__label">CHRONO</span>
          <span className="tt-hud__year" dir="ltr">{era}</span>
          <span className="tt-hud__suffix">م</span>
        </div>
        <div className="tt-hud__progress" aria-live="polite">
          <span dir="ltr">{index + 1} / {total}</span>
        </div>
      </header>

      <main id="tt-main" className="tt-arrival" role="main">
        <div className="tt-arrival__rim" aria-hidden="true" />
        <div className="tt-arrival__inner">
          <div className="tt-arrival__era">العصر · {era}م</div>
          <h1 className="tt-arrival__prompt">{s.prompt}</h1>

          <ol className="tt-options" role="radiogroup" aria-label="خياراتك">
            {s.choices.map((c, i) => (
              <li key={c.id} style={{ animationDelay: `${i * 80}ms` }}>
                <button
                  type="button"
                  className="tt-option"
                  role="radio"
                  aria-checked={false}
                  onClick={() => onPick(c.id)}
                >
                  <span className="tt-option__node" aria-hidden="true" />
                  <span className="tt-option__label">{c.label}</span>
                  <span className="tt-option__chev" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="tt-source">
            <SourceLine
              name={s.sourceName}
              url={s.sourceUrl}
              bookReference={s.bookReference}
              isFictional={s.isFictional}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
