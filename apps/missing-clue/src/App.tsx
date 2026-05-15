import { useState } from 'react';
import { AppShell, Card, Button, Choice, SourceLine, Badge, Stack, Hero } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: "الدليل الناقص",
  titleEn: "Missing Clue",
  descAr: "قصة ناقصة، استنتج الدليل المفقود من الأدلة المتاحة.",
} as const;

import type { ClueCase } from '@mofeed/content';
import { initCase, revealNextClue, eliminate, guess } from '@mofeed/engines';

const POOL = seed as ClueCase[];

export default function App() {
  const [caseIndex, setCaseIndex] = useState(0);
  const c = POOL[caseIndex];
  const [state, setState] = useState(() => (c ? initCase(c) : null));

  if (!c || !state) {
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Card><p>لا توجد قضايا متاحة بعد.</p></Card>
      </AppShell>
    );
  }

  const next = () => {
    const ni = (caseIndex + 1) % POOL.length;
    setCaseIndex(ni);
    const nc = POOL[ni];
    if (nc) setState(initCase(nc));
  };

  return (
    <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
      <Stack>
        <Hero>
          <h1>{META.titleAr}</h1>
          <Badge tone={c.isFictional ? 'warning' : 'info'}>
            {c.isFictional ? 'قضية افتراضية' : 'قضية موثقة'}
          </Badge>
        </Hero>
        <Card>
          <Stack>
            <p>{c.scenario}</p>
            <div>
              <strong>الأدلة المكشوفة ({state.revealed} / {c.clues.length}):</strong>
              <ul>
                {c.clues.slice(0, state.revealed).map((cl, i) => (
                  <li key={i}>{cl}</li>
                ))}
              </ul>
              {state.revealed < c.clues.length && state.solved === null ? (
                <Button variant="ghost" onClick={() => { setState(revealNextClue(state, c)); track('reveal_clue', { app: "missing-clue" }); }}>
                  اكشف دليلًا آخر
                </Button>
              ) : null}
            </div>
            <div>
              <strong>المشتبه بهم:</strong>
              <div className="mf-choice-list" style={{ marginTop: 8 }}>
                {c.suspects.map((sus) => {
                  const isEliminated = state.eliminated.includes(sus.id);
                  const isGuess = state.guess === sus.id;
                  const guessState = state.solved !== null && isGuess ? (state.solved ? 'correct' : 'wrong') : undefined;
                  return (
                    <Choice
                      key={sus.id}
                      onClick={() => {
                        if (state.solved !== null) return;
                        if (isEliminated) return;
                        setState(guess(state, c, sus.id));
                        track('guess', { app: "missing-clue", suspect: sus.id });
                      }}
                      state={guessState}
                      style={isEliminated ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}
                    >
                      <div>
                        <strong>{sus.name}</strong>
                        <div className="mf-muted">{sus.profile}</div>
                      </div>
                    </Choice>
                  );
                })}
              </div>
              {state.solved === null ? (
                <p className="mf-muted" style={{ marginTop: 8 }}>
                  انقر مشتبهًا لاتهامه. أو استبعد مشتبهًا بزر «استبعد».
                </p>
              ) : null}
              <div className="mf-row" style={{ marginTop: 8 }}>
                {c.suspects.map((sus) => (
                  <Button
                    key={'elim-' + sus.id}
                    variant="ghost"
                    onClick={() => { if (state.solved === null) setState(eliminate(state, sus.id)); }}
                    disabled={state.eliminated.includes(sus.id) || state.solved !== null}
                  >
                    استبعد {sus.name}
                  </Button>
                ))}
              </div>
            </div>
            {state.solved === true ? <p><Badge>أحسنت — الإجابة صحيحة.</Badge></p> : null}
            {state.solved === false ? <p><Badge tone="danger">إجابة خاطئة. الجاني: {c.suspects.find((s) => s.id === c.culpritId)?.name}</Badge></p> : null}
            <SourceLine name={c.sourceName} url={c.sourceUrl} bookReference={c.bookReference} isFictional={c.isFictional} />
            <Button block onClick={next}>قضية أخرى</Button>
          </Stack>
        </Card>
      </Stack>
    </AppShell>
  );
}
