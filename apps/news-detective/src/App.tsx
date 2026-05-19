import { useState } from 'react';
import { Button, SourceLine } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';
import type { PollItem } from '@mofeed/content';
import { tallyVotes } from '@mofeed/engines';

const META = {
  titleAr: 'محقق الأخبار',
  titleEn: 'News Detective',
  descAr:
    'لعبة وعي إعلامي. تقرأ سيناريو خبري افتراضي وتقرر: صحيح، مضلل، ناقص السياق، أم مفبرك؟',
} as const;

const POOL = seed as PollItem[];

const TODAY = new Date().toLocaleDateString('en-CA');

export default function App() {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const total = POOL.length;
  const item = POOL[index];

  if (total === 0 || !item) {
    return (
      <div className="nd-press">
        <p>لا توجد بنود متاحة بعد.</p>
      </div>
    );
  }

  const myVote = votes[item.id];
  const onVote = (optionId: string) => {
    const next = { ...votes, [item.id]: optionId };
    setVotes(next);
    track('vote', { app: 'news-detective', item: item.id, choice: optionId });
  };

  const fakeOthers = item.options.map((o, i) => ({ optionId: o.id, n: (i + 1) * 7 + i * 3 }));
  const fakeVoteList = fakeOthers.flatMap(({ optionId, n }) =>
    Array.from({ length: n }, () => ({ optionId })),
  );
  const myVoteList = myVote ? [{ optionId: myVote }] : [];
  const result = tallyVotes(
    item.options.map((o) => o.id),
    [...fakeVoteList, ...myVoteList],
  );

  return (
    <div className="nd-press" data-testid="app-root">
      <a href="#nd-main" className="mf-skip-link">تجاوز إلى المحتوى</a>

      <div className="nd-broadsheet">
        <header className="nd-masthead">
          <div className="nd-masthead__row1" dir="ltr">
            <span>VOL. I · NO. {String(index + 1).padStart(3, '0')}</span>
            <span className="nd-masthead__edition">EVIDENCE EDITION</span>
            <span>{TODAY}</span>
          </div>
          <h1 className="nd-masthead__title">{META.titleAr}</h1>
          <div className="nd-masthead__row2">
            <span className="nd-masthead__tagline">{META.titleEn} · صحيفة الوعي الإعلامي</span>
            <span className="nd-masthead__price" dir="ltr">FREE PRESS · مجانًا</span>
          </div>
        </header>

        <main id="nd-main" className="nd-grid" role="main">
          <aside className="nd-grid__sidebar">
            <div className="nd-stamp" aria-hidden="true">
              <div className="nd-stamp__inner">
                <span>EXHIBIT</span>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>OF {String(total).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="nd-tag">
              <span className="nd-tag__label">DOSSIER</span>
              <span className="nd-tag__value">{item.id}</span>
            </div>
            <div className="nd-tag">
              <span className="nd-tag__label">VERDICT</span>
              <span className="nd-tag__value">{myVote ? 'submitted' : 'pending'}</span>
            </div>
          </aside>

          <article className="nd-grid__article">
            <div className="nd-kicker">
              <span className="nd-kicker__dot" />
              <span>EXHIBIT A · حالة معروضة</span>
            </div>
            <h2 className="nd-headline">{item.question}</h2>
            <p className="nd-subdek">حدد حكمك بعد قراءة الإفادة. لكل حكم سبب — اختر بعناية.</p>

            <ol className="nd-verdicts" role="radiogroup" aria-label="خيارات الحكم">
              {item.options.map((opt, i) => {
                const percent = myVote ? result.perOption.find((p) => p.optionId === opt.id)?.percent ?? 0 : 0;
                const isMine = myVote === opt.id;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      className="nd-verdict"
                      role="radio"
                      aria-checked={isMine}
                      data-state={!myVote ? 'open' : isMine ? 'mine' : 'other'}
                      onClick={() => onVote(opt.id)}
                    >
                      <span className="nd-verdict__no" dir="ltr">№ {String(i + 1).padStart(2, '0')}</span>
                      <span className="nd-verdict__label">{opt.label}</span>
                      {myVote ? (
                        <span className="nd-verdict__pct" dir="ltr">
                          <span className="nd-verdict__pct-bar" style={{ width: `${percent}%` }} />
                          <span className="nd-verdict__pct-num">{percent}%</span>
                        </span>
                      ) : (
                        <span className="nd-verdict__stamp" aria-hidden="true">VOTE</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="nd-source">
              <SourceLine
                name={item.sourceName}
                url={item.sourceUrl}
                bookReference={item.bookReference}
                isFictional={item.isFictional}
              />
            </div>

            <div className="nd-nav">
              <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                ← القضية السابقة
              </Button>
              <Button disabled={index + 1 >= total} onClick={() => setIndex(index + 1)}>
                القضية التالية →
              </Button>
            </div>
          </article>
        </main>

        <footer className="nd-foot">
          <span>© مفيد — تطبيقات صغيرة</span>
          <span>المحتوى الواقعي مستند إلى مصادر موثقة.</span>
        </footer>
      </div>
    </div>
  );
}
