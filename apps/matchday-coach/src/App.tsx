import { useState } from 'react';
import { AppShell, Card, Button, Choice, ProgressBar, SourceLine, Stack, Hero } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: "مدرب الجولة",
  titleEn: "Matchday Coach",
  descAr: "لعبة قرارات تكتيكية: تبديلات، تشكيلة، إصابات، وضغط الدقائق الأخيرة.",
} as const;

import type { ScenarioItem } from '@mofeed/content';
import { tallyDecisions } from '@mofeed/engines';

const POOL = seed as ScenarioItem[];

export default function App() {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<{ scenarioId: string; choiceId: string }>>([]);
  const [done, setDone] = useState(false);
  const total = POOL.length;
  const s = POOL[index];

  if (total === 0) {
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Card><p>لا توجد سيناريوهات متاحة بعد.</p></Card>
      </AppShell>
    );
  }

  if (done || !s) {
    const tally = tallyDecisions(POOL, picks);
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Stack>
          <Hero>
            <h1>أسلوبك السائد</h1>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{styleLabel(tally.dominantStyle)}</p>
            <p className="mf-muted">{META.descAr}</p>
          </Hero>
          <Card>
            <Stack>
              {picks.map((p, i) => {
                const scn = POOL.find((x) => x.id === p.scenarioId);
                const ch = scn?.choices.find((c) => c.id === p.choiceId);
                return (
                  <div key={i}>
                    <strong>{scn?.prompt}</strong>
                    <div>اختيارك: {ch?.label}</div>
                    <div className="mf-muted">النتيجة: {ch?.consequence}</div>
                    {scn ? <SourceLine name={scn.sourceName} url={scn.sourceUrl} bookReference={scn.bookReference} isFictional={scn.isFictional} /> : null}
                  </div>
                );
              })}
            </Stack>
          </Card>
          <Button block onClick={() => { setIndex(0); setPicks([]); setDone(false); }}>
            إعادة التجربة
          </Button>
        </Stack>
      </AppShell>
    );
  }

  const onPick = (choiceId: string) => {
    const next = [...picks, { scenarioId: s.id, choiceId }];
    setPicks(next);
    track('scenario_pick', { app: "matchday-coach", sId: s.id, cId: choiceId });
    if (index + 1 >= total) { setDone(true); track('scenario_complete', { app: "matchday-coach" }); }
    else setIndex(index + 1);
  };

  return (
    <AppShell
      titleAr={META.titleAr}
      titleEn={META.titleEn}
      headerExtra={<span aria-live="polite" dir="ltr">{index + 1} / {total}</span>}
    >
      <Stack>
        <ProgressBar value={index} max={total} label="تقدم" />
        <Card>
          <Stack>
            <h2 style={{ fontSize: '1.1rem' }}>{s.prompt}</h2>
            <div className="mf-choice-list">
              {s.choices.map((c) => (
                <Choice key={c.id} onClick={() => onPick(c.id)}>{c.label}</Choice>
              ))}
            </div>
            <SourceLine name={s.sourceName} url={s.sourceUrl} bookReference={s.bookReference} isFictional={s.isFictional} />
          </Stack>
        </Card>
      </Stack>
    </AppShell>
  );
}

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
