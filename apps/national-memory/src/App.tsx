import { useMemo, useState } from 'react';
import { AppShell, Card, Button, Choice, ProgressBar, SourceLine, Badge, Stack, Hero } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: "الذاكرة الوطنية",
  titleEn: "National Memory",
  descAr: "تطبيق ذاكرة وأسئلة عن أحداث وأماكن ورموز ثقافية سعودية موثقة.",
} as const;

import type { QuizQuestion } from '@mofeed/content';
import { buildQuiz, scoreQuiz } from '@mofeed/engines';

const POOL = seed as QuizQuestion[];

export default function App() {
  const questions = useMemo(() => buildQuiz(POOL, { total: Math.min(5, POOL.length) }), []);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Array<{ questionId: string; selectedIndex: number; elapsedMs: number }>>([]);
  const [done, setDone] = useState(false);
  const q = questions[index];

  if (questions.length === 0) {
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Card><p>لا توجد أسئلة متاحة بعد.</p></Card>
      </AppShell>
    );
  }

  if (done || !q) {
    const result = scoreQuiz(questions, picks);
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Stack>
          <Hero>
            <h1>النتيجة</h1>
            <p className="mf-muted">{META.descAr}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{result.score}%</p>
            <p>إجابات صحيحة: {result.correct} من {result.total}</p>
          </Hero>
          <Card>
            <Stack>
              {questions.map((qq, i) => {
                const row = result.perQuestion[i];
                return (
                  <div key={qq.id}>
                    <strong>{qq.question}</strong>
                    <div className="mf-muted">
                      الجواب الصحيح: {qq.options[qq.correctIndex]}
                      {' '}
                      {row?.correct ? <Badge>صحيح</Badge> : <Badge tone="danger">خطأ</Badge>}
                    </div>
                    {qq.explanation ? <p className="mf-muted">{qq.explanation}</p> : null}
                    <SourceLine name={qq.sourceName} url={qq.sourceUrl} bookReference={qq.bookReference} isFictional={qq.isFictional} />
                  </div>
                );
              })}
            </Stack>
          </Card>
          <Button block onClick={() => { setIndex(0); setPicks([]); setDone(false); track('quiz_restart', { app: "national-memory" }); }}>
            إعادة الاختبار
          </Button>
        </Stack>
      </AppShell>
    );
  }

  const total = questions.length;
  const onPick = (selectedIndex: number) => {
    const next = [...picks, { questionId: q.id, selectedIndex, elapsedMs: 0 }];
    setPicks(next);
    track('quiz_answer', { app: "national-memory", q: q.id, correct: selectedIndex === q.correctIndex });
    if (index + 1 >= total) {
      setDone(true);
      track('quiz_complete', { app: "national-memory", total });
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <AppShell
      titleAr={META.titleAr}
      titleEn={META.titleEn}
      headerExtra={<span aria-live="polite" dir="ltr">{index + 1} / {total}</span>}
    >
      <Stack>
        <ProgressBar value={index} max={total} label="تقدم الاختبار" />
        <Card>
          <Stack>
            <h2 style={{ fontSize: '1.1rem' }}>{q.question}</h2>
            <div className="mf-choice-list" role="radiogroup" aria-label="خيارات الإجابة">
              {q.options.map((opt, i) => (
                <Choice key={i} onClick={() => onPick(i)} role="radio" aria-checked={false}>{opt}</Choice>
              ))}
            </div>
            <SourceLine name={q.sourceName} url={q.sourceUrl} bookReference={q.bookReference} isFictional={q.isFictional} />
          </Stack>
        </Card>
      </Stack>
    </AppShell>
  );
}
