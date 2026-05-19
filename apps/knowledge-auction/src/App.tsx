import { useMemo, useState } from 'react';
import { Button, SourceLine } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';
import type { QuizQuestion } from '@mofeed/content';
import { buildQuiz, scoreQuiz } from '@mofeed/engines';

const META = {
  titleAr: 'مزاد المعرفة',
  titleEn: 'Knowledge Auction',
  descAr:
    'لديك رصيد افتراضي تراهن منه على ثقتك في إجابة كل سؤال. ثقة أعلى → ربح أعلى وخطر أعلى.',
} as const;

const POOL = seed as QuizQuestion[];

const LATIN_DIGITS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ'];

export default function App() {
  const questions = useMemo(() => buildQuiz(POOL, { total: Math.min(5, POOL.length) }), []);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<
    Array<{ questionId: string; selectedIndex: number; elapsedMs: number }>
  >([]);
  const [done, setDone] = useState(false);
  const q = questions[index];

  if (questions.length === 0) {
    return (
      <div className="ka-stage">
        <p>لا توجد أسئلة متاحة بعد.</p>
      </div>
    );
  }

  if (done || !q) {
    const result = scoreQuiz(questions, picks);
    return (
      <div className="ka-stage ka-stage--result" data-testid="app-root">
        <div className="ka-result">
          <div className="ka-result__stamp">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="3" />
              <text x="60" y="55" textAnchor="middle" fontSize="14" letterSpacing="2">
                LOT
              </text>
              <text x="60" y="80" textAnchor="middle" fontSize="32" fontWeight="700">
                {result.score}%
              </text>
            </svg>
          </div>
          <div className="ka-result__title">انتهى المزاد</div>
          <div className="ka-result__sub">
            رصيدك النهائي: <em>{result.correct}</em> / {result.total} إجابة صحيحة
          </div>
          <div className="ka-result__lots">
            {questions.map((qq, i) => {
              const row = result.perQuestion[i];
              return (
                <div key={qq.id} className="ka-result__lot" data-correct={row?.correct ? '1' : '0'}>
                  <span className="ka-result__lotnum">رقم {String(i + 1).padStart(2, '0')}</span>
                  <strong>{qq.question}</strong>
                  <div className="ka-result__answer">
                    المضمار الصحيح: <em>{qq.options[qq.correctIndex]}</em>
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
              track('quiz_restart', { app: 'knowledge-auction' });
            }}
          >
            افتح مزادًا جديدًا
          </Button>
        </div>
      </div>
    );
  }

  const total = questions.length;
  const onPick = (selectedIndex: number) => {
    const next = [...picks, { questionId: q.id, selectedIndex, elapsedMs: 0 }];
    setPicks(next);
    track('quiz_answer', {
      app: 'knowledge-auction',
      q: q.id,
      correct: selectedIndex === q.correctIndex,
    });
    if (index + 1 >= total) {
      setDone(true);
      track('quiz_complete', { app: 'knowledge-auction', total });
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="ka-stage" data-testid="app-root">
      <a href="#ka-main" className="mf-skip-link">تجاوز إلى المحتوى</a>

      <div className="ka-house">
        <div className="ka-house__brand">
          <div className="ka-house__name">
            <span>{META.titleAr}</span>
            <small dir="ltr">{META.titleEn} · House of Knowledge</small>
          </div>
          <div className="ka-house__date" dir="ltr">SESSION · {new Date().getFullYear()}</div>
        </div>

        <div className="ka-house__paddle" aria-live="polite">
          <span className="ka-house__paddle-num" dir="ltr">{String(index + 1).padStart(2, '0')}</span>
          <span className="ka-house__paddle-of" dir="ltr">/ {total}</span>
        </div>
      </div>

      <main id="ka-main" className="ka-lot" role="main">
        <header className="ka-lot__header">
          <span className="ka-lot__no" dir="ltr">LOT {String(index + 1).padStart(3, '0')}</span>
          <span className="ka-lot__estimate" dir="ltr">EST. {1000 + index * 250}–{1500 + index * 350}</span>
        </header>

        <h1 className="ka-lot__title">{q.question}</h1>
        <div className="ka-lot__rule" aria-hidden="true">
          <span /><span className="ka-lot__diamond" /><span />
        </div>
        <p className="ka-lot__caption">اختر الإجابة التي تثق بها أكثر — كل عرض غير قابل للتراجع.</p>

        <ol className="ka-paddles" role="radiogroup" aria-label="خيارات الإجابة">
          {q.options.map((opt, i) => (
            <li key={i}>
              <button
                type="button"
                className="ka-paddle"
                role="radio"
                aria-checked={false}
                onClick={() => onPick(i)}
              >
                <span className="ka-paddle__num" aria-hidden="true">{LATIN_DIGITS[i] || String(i + 1)}</span>
                <span className="ka-paddle__text">{opt}</span>
                <span className="ka-paddle__bid" dir="ltr" aria-hidden="true">BID</span>
              </button>
            </li>
          ))}
        </ol>

        <footer className="ka-lot__footer">
          <SourceLine
            name={q.sourceName}
            url={q.sourceUrl}
            bookReference={q.bookReference}
            isFictional={q.isFictional}
          />
        </footer>
      </main>
    </div>
  );
}
