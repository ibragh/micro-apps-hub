import { useState } from 'react';
import { AppShell, Card, Button, Choice, ProgressBar, SourceLine, Stack } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: "محقق الأخبار",
  titleEn: "News Detective",
  descAr: "لعبة وعي إعلامي. تقرأ سيناريو خبري افتراضي وتقرر: صحيح، مضلل، ناقص السياق، أم مفبرك؟",
} as const;

import type { PollItem } from '@mofeed/content';
import { tallyVotes } from '@mofeed/engines';

const POOL = seed as PollItem[];

export default function App() {
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const total = POOL.length;
  const item = POOL[index];

  if (total === 0 || !item) {
    return (
      <AppShell titleAr={META.titleAr} titleEn={META.titleEn}>
        <Card><p>لا توجد بنود متاحة بعد.</p></Card>
      </AppShell>
    );
  }

  const myVote = votes[item.id];

  const onVote = (optionId: string) => {
    const next = { ...votes, [item.id]: optionId };
    setVotes(next);
    track('vote', { app: "news-detective", item: item.id, choice: optionId });
  };

  // Simulated tally: for the demo we tally the user's pick + a stable spread.
  // Real production would call an API; for static-first we keep it client-only.
  const fakeOthers = item.options.map((o, i) => ({ optionId: o.id, n: (i + 1) * 7 + (i * 3) }));
  const fakeVoteList = fakeOthers.flatMap(({ optionId, n }) =>
    Array.from({ length: n }, () => ({ optionId })),
  );
  const myVoteList = myVote ? [{ optionId: myVote }] : [];
  const result = tallyVotes(item.options.map((o) => o.id), [...fakeVoteList, ...myVoteList]);

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
            <h2 style={{ fontSize: '1.1rem' }}>{item.question}</h2>
            <div className="mf-choice-list">
              {item.options.map((opt) => (
                <Choice
                  key={opt.id}
                  onClick={() => onVote(opt.id)}
                  selected={myVote === opt.id}
                >
                  {opt.label}
                  {myVote ? (
                    <span className="mf-muted" style={{ marginInlineStart: 8 }}>
                      ({result.perOption.find((p) => p.optionId === opt.id)?.percent ?? 0}%)
                    </span>
                  ) : null}
                </Choice>
              ))}
            </div>
            <SourceLine name={item.sourceName} url={item.sourceUrl} bookReference={item.bookReference} isFictional={item.isFictional} />
            <div className="mf-row" style={{ justifyContent: 'space-between' }}>
              <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                السابق
              </Button>
              <Button disabled={index + 1 >= total} onClick={() => setIndex(index + 1)}>
                التالي
              </Button>
            </div>
          </Stack>
        </Card>
      </Stack>
    </AppShell>
  );
}
