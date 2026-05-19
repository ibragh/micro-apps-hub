import { useMemo, useState } from 'react';
import { Button, SourceLine } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';
import type { QuizQuestion } from '@mofeed/content';
import { buildQuiz, scoreQuiz } from '@mofeed/engines';

const META = {
  titleAr: 'اختبار السيرة النبوية',
  titleEn: 'Seerah Quiz',
  descAr:
    'اختبار تفاعلي عن سيرة النبي محمد ﷺ — مكة، الهجرة، المدينة، أحداث ومواقف موثقة من مصادر معتمدة.',
} as const;

const POOL = seed as QuizQuestion[];

// Arabesque corner ornament. Repeated in the four corners of the manuscript.
function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg className={`sq-corner sq-corner--${position}`} viewBox="0 0 80 80" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 78 L2 32 Q2 2 32 2 L78 2" />
        <path d="M8 78 L8 36 Q8 8 36 8 L78 8" />
        <circle cx="22" cy="22" r="3" />
        <path d="M22 22 L22 4 M22 22 L4 22" />
      </g>
    </svg>
  );
}

function Ornament() {
  return (
    <svg className="sq-rule" viewBox="0 0 320 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <line x1="0" y1="12" x2="120" y2="12" />
        <line x1="200" y1="12" x2="320" y2="12" />
        <path d="M140 12 L160 4 L180 12 L160 20 Z" />
        <circle cx="160" cy="12" r="3" />
      </g>
    </svg>
  );
}

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
      <div className="sq-page">
        <div className="sq-manuscript">
          <p>لا توجد أسئلة متاحة بعد.</p>
        </div>
      </div>
    );
  }

  if (done || !q) {
    const result = scoreQuiz(questions, picks);
    return (
      <div className="sq-page sq-page--result">
        <div className="sq-manuscript sq-manuscript--result">
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
          <Ornament />
          <div className="sq-result__eyebrow">خلاصة الاختبار</div>
          <div className="sq-result__score">{result.score}<span>%</span></div>
          <div className="sq-result__line">
            أجبت بصواب {result.correct} من {result.total}
          </div>
          <Ornament />
          <div className="sq-result__items">
            {questions.map((qq, i) => {
              const row = result.perQuestion[i];
              return (
                <div key={qq.id} className="sq-result__item" data-correct={row?.correct ? '1' : '0'}>
                  <div className="sq-result__num">{i + 1}</div>
                  <div className="sq-result__body">
                    <strong>{qq.question}</strong>
                    <div className="sq-result__answer">
                      الجواب الصحيح: <em>{qq.options[qq.correctIndex]}</em>
                    </div>
                    {qq.explanation ? <p>{qq.explanation}</p> : null}
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
              track('quiz_restart', { app: 'seerah-quiz' });
            }}
          >
            إعادة الاختبار
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
      app: 'seerah-quiz',
      q: q.id,
      correct: selectedIndex === q.correctIndex,
    });
    if (index + 1 >= total) {
      setDone(true);
      track('quiz_complete', { app: 'seerah-quiz', total });
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="sq-page" data-testid="app-root">
      <a href="#sq-main" className="mf-skip-link">تجاوز إلى المحتوى</a>
      <header className="sq-masthead" role="banner">
        <div className="sq-masthead__title">
          <span>{META.titleAr}</span>
          <small dir="ltr">{META.titleEn}</small>
        </div>
        <div className="sq-progress" aria-live="polite" dir="ltr">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`sq-progress__pip ${i < index ? 'is-done' : ''} ${i === index ? 'is-now' : ''}`}
              aria-hidden="true"
            />
          ))}
          <span className="sq-progress__count">{index + 1} / {total}</span>
        </div>
      </header>

      <main id="sq-main" className="sq-main" role="main">
        <article className="sq-manuscript">
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />

          <div className="sq-folio">باب {index + 1}</div>
          <Ornament />

          <h1 className="sq-question">{q.question}</h1>

          <Ornament />

          <ol className="sq-choices" role="radiogroup" aria-label="خيارات الإجابة">
            {q.options.map((opt, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="sq-choice"
                  role="radio"
                  aria-checked={false}
                  onClick={() => onPick(i)}
                >
                  <span className="sq-choice__letter" aria-hidden="true">
                    {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][i] || ''}
                  </span>
                  <span className="sq-choice__text">{opt}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="sq-source">
            <SourceLine
              name={q.sourceName}
              url={q.sourceUrl}
              bookReference={q.bookReference}
              isFictional={q.isFictional}
            />
          </div>
        </article>
      </main>

      <footer className="sq-foot" role="contentinfo">
        <span>© مفيد — تطبيقات صغيرة</span>
        <span>المحتوى الواقعي مستند إلى مصادر موثقة.</span>
      </footer>
    </div>
  );
}
