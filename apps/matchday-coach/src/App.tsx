import { useState } from 'react';
import { Button, SourceLine } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';
import type { ScenarioItem } from '@mofeed/content';
import { tallyDecisions } from '@mofeed/engines';

const META = {
  titleAr: 'مدرب الجولة',
  titleEn: 'Matchday Coach',
  descAr: 'لعبة قرارات تكتيكية: تبديلات، تشكيلة، إصابات، وضغط الدقائق الأخيرة.',
} as const;

const POOL = seed as ScenarioItem[];

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
      <div className="mc-stadium">
        <p>لا توجد سيناريوهات متاحة بعد.</p>
      </div>
    );
  }

  if (done || !s) {
    const tally = tallyDecisions(POOL, picks);
    return (
      <div className="mc-stadium mc-stadium--result" data-testid="app-root">
        <div className="mc-fulltime">
          <div className="mc-fulltime__whistle">FULL-TIME</div>
          <div className="mc-fulltime__score">90<span>'</span></div>
          <div className="mc-fulltime__sub">أسلوبك في إدارة المباراة</div>
          <div className="mc-fulltime__style">{styleLabel(tally.dominantStyle)}</div>
          <div className="mc-fulltime__plays">
            {picks.map((p, i) => {
              const scn = POOL.find((x) => x.id === p.scenarioId);
              const ch = scn?.choices.find((c) => c.id === p.choiceId);
              return (
                <div key={i} className="mc-play">
                  <span className="mc-play__minute" dir="ltr">{20 + i * 18}'</span>
                  <div className="mc-play__body">
                    <strong>{scn?.prompt}</strong>
                    <div className="mc-play__decision">قرارك: {ch?.label}</div>
                    <div className="mc-play__consequence">{ch?.consequence}</div>
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
            مباراة جديدة
          </Button>
        </div>
      </div>
    );
  }

  const onPick = (choiceId: string) => {
    const next = [...picks, { scenarioId: s.id, choiceId }];
    setPicks(next);
    track('scenario_pick', { app: 'matchday-coach', sId: s.id, cId: choiceId });
    if (index + 1 >= total) {
      setDone(true);
      track('scenario_complete', { app: 'matchday-coach' });
    } else setIndex(index + 1);
  };

  const minute = 18 + index * 22; // simulated match clock
  const half = minute < 45 ? 'first' : 'second';

  return (
    <div className="mc-stadium" data-testid="app-root">
      <a href="#mc-main" className="mf-skip-link">تجاوز إلى المحتوى</a>

      <div className="mc-scoreboard">
        <div className="mc-scoreboard__teams">
          <div className="mc-scoreboard__team mc-scoreboard__team--home">
            <span className="mc-scoreboard__crest" aria-hidden="true">⬢</span>
            <span className="mc-scoreboard__name">{META.titleAr}</span>
            <span className="mc-scoreboard__score">{Math.min(2, index)}</span>
          </div>
          <div className="mc-scoreboard__clock">
            <span className="mc-scoreboard__minute" dir="ltr">{minute}'</span>
            <span className="mc-scoreboard__half">{half === 'first' ? 'الشوط الأول' : 'الشوط الثاني'}</span>
          </div>
          <div className="mc-scoreboard__team mc-scoreboard__team--away">
            <span className="mc-scoreboard__score">{Math.max(0, 2 - index)}</span>
            <span className="mc-scoreboard__name">الخصم</span>
            <span className="mc-scoreboard__crest" aria-hidden="true">◆</span>
          </div>
        </div>
        <div className="mc-scoreboard__rounds" aria-label="الجولات">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`mc-scoreboard__pip ${i < index ? 'is-done' : ''} ${i === index ? 'is-now' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <main id="mc-main" className="mc-pitch" role="main">
        <div className="mc-pitch__chalk" aria-hidden="true">
          <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2">
              <rect x="20" y="20" width="760" height="460" />
              <line x1="400" y1="20" x2="400" y2="480" />
              <circle cx="400" cy="250" r="70" />
              <rect x="20" y="150" width="100" height="200" />
              <rect x="680" y="150" width="100" height="200" />
              <rect x="20" y="80" width="180" height="340" strokeOpacity="0.15" />
              <rect x="600" y="80" width="180" height="340" strokeOpacity="0.15" />
            </g>
          </svg>
        </div>

        <article className="mc-board">
          <header className="mc-board__header">
            <span className="mc-board__tag">SCENARIO</span>
            <span className="mc-board__minute" dir="ltr">MIN {minute}</span>
          </header>
          <h1 className="mc-board__prompt">{s.prompt}</h1>

          <div className="mc-board__formation" aria-hidden="true">
            <span>4</span><span className="dot" /><span>3</span><span className="dot" /><span>3</span>
            <span className="mc-board__label">التشكيلة</span>
          </div>

          <ol className="mc-options" role="radiogroup" aria-label="قرارات التدريب">
            {s.choices.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="mc-option"
                  role="radio"
                  aria-checked={false}
                  onClick={() => onPick(c.id)}
                >
                  <span className="mc-option__nub" aria-hidden="true">{i + 1}</span>
                  <span className="mc-option__label">{c.label}</span>
                  <span className="mc-option__arrow" aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mc-source">
            <SourceLine
              name={s.sourceName}
              url={s.sourceUrl}
              bookReference={s.bookReference}
              isFictional={s.isFictional}
            />
          </div>
        </article>
      </main>
    </div>
  );
}
