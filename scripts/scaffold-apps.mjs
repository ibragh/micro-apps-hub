#!/usr/bin/env node
// Generates app skeletons under apps/<slug>/ based on scripts/apps.manifest.mjs.
// Safe to re-run: only writes files that don't already exist (use --force to overwrite).
// Hand-authored content lives in apps/<slug>/src/content/seed.json and is never overwritten.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { apps } from './apps.manifest.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const force = process.argv.includes('--force');
// --regen-code: re-write the generated code (App.tsx, shim, smoke test) only,
// preserving seed.json and any other hand-authored files.
const regenCode = process.argv.includes('--regen-code');

async function writeFileIfMissing(filePath, content, { regenerable = false } = {}) {
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  if (exists && !force && !(regenCode && regenerable)) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}

function packageJson(app) {
  return JSON.stringify(
    {
      name: `@mofeed/${app.slug}`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview --port 4173',
        typecheck: 'tsc --noEmit',
        test: 'vitest run',
      },
      dependencies: {
        '@mofeed/analytics': 'workspace:*',
        '@mofeed/content': 'workspace:*',
        '@mofeed/engines': 'workspace:*',
        '@mofeed/security': 'workspace:*',
        '@mofeed/seo': 'workspace:*',
        '@mofeed/ui': 'workspace:*',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
      },
      devDependencies: {
        '@mofeed/testing': 'workspace:*',
        '@testing-library/jest-dom': '^6.5.0',
        '@testing-library/react': '^16.0.0',
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.7.0',
        jsdom: '^25.0.0',
        typescript: '^5.5.0',
        vite: '^6.4.2',
        vitest: '^3.2.4',
      },
    },
    null,
    2,
  ) + '\n';
}

function indexHtml(app) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="${app.accent}" />
    <title>${app.nameAr} — ${app.nameEn}</title>
    <meta name="description" content="${app.descAr.replace(/"/g, '&quot;')}" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='${encodeURIComponent(
      app.accent,
    )}'/%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='34' font-family='sans-serif'%3Eت%3C/text%3E%3C/svg%3E" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function viteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
  },
});
`;
}

function tsConfig() {
  return JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        types: ['vite/client'],
      },
      include: ['src/**/*'],
    },
    null,
    2,
  ) + '\n';
}

function vitestConfig() {
  return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mofeed/content': path.resolve(__dirname, '../../packages/content/src/index.ts'),
      '@mofeed/engines': path.resolve(__dirname, '../../packages/engines/src/index.ts'),
      '@mofeed/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@mofeed/security': path.resolve(__dirname, '../../packages/security/src/index.ts'),
      '@mofeed/seo': path.resolve(__dirname, '../../packages/seo/src/index.ts'),
      '@mofeed/analytics': path.resolve(__dirname, '../../packages/analytics/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['../../packages/testing/src/setup.ts'],
    css: false,
  },
});
`;
}

function mainTsx(app) {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: '${app.slug}',
  titleAr: '${app.nameAr}',
  titleEn: '${app.nameEn}',
  descriptionAr: ${JSON.stringify(app.descAr)},
  category: '${app.category}',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
}

function publicHeaders() {
  // CSP includes Plausible (plausible.io) on both script-src and connect-src
  // so that opting analytics in via VITE_PLAUSIBLE_DOMAIN at build time does
  // not require touching the headers. Plausible is the only third-party
  // script we ship; nothing else is allowed.
  return `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://plausible.io; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;
}

function publicRedirects() {
  return `/* /index.html 200
`;
}

function viteEnvDts() {
  return `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_HOST?: string;
  readonly VITE_SITE_ORIGIN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`;
}

function vitestShim() {
  return `/* eslint-disable @typescript-eslint/no-empty-object-type */
/// <reference types="@testing-library/jest-dom" />
import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
`;
}

function emptySeedJson(app) {
  // Skeleton seed for tier-2 apps. The first 10 ship their own hand-authored seeds.
  const sample = {
    quiz: [
      {
        id: `${app.slug}-q1`,
        title: 'سؤال نموذج',
        category: app.category,
        sourceName: 'يُكمل لاحقًا',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        question: 'سؤال نموذج — يُستبدل بمحتوى موثق.',
        options: ['أ', 'ب', 'ج', 'د'],
        correctIndex: 0,
        explanation: 'هذا محتوى أولي.',
      },
    ],
    decision: [
      {
        id: `${app.slug}-s1`,
        title: 'سيناريو نموذج',
        category: app.category,
        sourceName: 'افتراضي',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        prompt: 'موقف افتراضي للتجربة فقط.',
        choices: [
          { id: 'a', label: 'الاختيار الحذر', consequence: 'نتيجة الحذر.', style: 'cautious' },
          { id: 'b', label: 'الاختيار الجريء', consequence: 'نتيجة الجرأة.', style: 'bold' },
        ],
      },
    ],
    scenario: [
      {
        id: `${app.slug}-s1`,
        title: 'مشهد نموذج',
        category: app.category,
        sourceName: 'افتراضي',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        prompt: 'مشهد افتراضي للتجربة.',
        choices: [
          { id: 'a', label: 'مضي قُدمًا', consequence: 'تستمر القصة.' },
          { id: 'b', label: 'تراجع', consequence: 'تنتهي القصة هنا.' },
        ],
      },
    ],
    voting: [
      {
        id: `${app.slug}-v1`,
        title: 'سؤال للتصويت',
        category: app.category,
        sourceName: 'افتراضي',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        question: 'سؤال نموذج — ما رأيك؟',
        options: [
          { id: 'yes', label: 'نعم' },
          { id: 'no', label: 'لا' },
        ],
      },
    ],
    timeline: [
      {
        id: `${app.slug}-e1`,
        title: 'حدث افتراضي',
        category: app.category,
        sourceName: 'يُستبدل بمصدر موثق',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        month: 1,
        day: 1,
        year: 2000,
      },
    ],
    clue: [
      {
        id: `${app.slug}-c1`,
        title: 'قضية افتراضية',
        category: app.category,
        sourceName: 'افتراضي',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        scenario: 'قضية افتراضية لأغراض العرض فقط.',
        suspects: [
          { id: 's1', name: 'المشتبه الأول', profile: 'وصف موجز.' },
          { id: 's2', name: 'المشتبه الثاني', profile: 'وصف موجز.' },
          { id: 's3', name: 'المشتبه الثالث', profile: 'وصف موجز.' },
        ],
        clues: ['دليل مبدئي.', 'دليل ثانٍ.', 'دليل ثالث.'],
        culpritId: 's2',
      },
    ],
    auction: [
      {
        id: `${app.slug}-q1`,
        title: 'سؤال مزاد',
        category: app.category,
        sourceName: 'يُكمل لاحقًا',
        confidenceLevel: 'low',
        isVerified: false,
        isFictional: true,
        question: 'سؤال نموذج للمزاد.',
        options: ['أ', 'ب', 'ج', 'د'],
        correctIndex: 1,
      },
    ],
  };
  return JSON.stringify(sample[app.engine] ?? [], null, 2) + '\n';
}

function appTsx(app) {
  // Each engine has its own App template. For tier-1 apps we use the same template
  // but pair it with richer seed content.
  switch (app.engine) {
    case 'quiz':
    case 'auction':
      return quizAppTemplate(app);
    case 'decision':
    case 'scenario':
      return scenarioAppTemplate(app);
    case 'voting':
      return votingAppTemplate(app);
    case 'timeline':
      return timelineAppTemplate(app);
    case 'clue':
      return clueAppTemplate(app);
    default:
      return quizAppTemplate(app);
  }
}

function commonHeader(app, hooks, uiNames) {
  return `import { ${hooks.join(', ')} } from 'react';
import { ${uiNames.join(', ')} } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import seed from './content/seed.json';

const META = {
  titleAr: ${JSON.stringify(app.nameAr)},
  titleEn: ${JSON.stringify(app.nameEn)},
  descAr: ${JSON.stringify(app.descAr)},
} as const;
`;
}

function quizAppTemplate(app) {
  return `${commonHeader(
    app,
    ['useMemo', 'useState'],
    ['AppShell', 'Card', 'Button', 'Choice', 'ProgressBar', 'SourceLine', 'Badge', 'Stack', 'Hero'],
  )}
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
          <Button block onClick={() => { setIndex(0); setPicks([]); setDone(false); track('quiz_restart', { app: ${JSON.stringify(app.slug)} }); }}>
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
    track('quiz_answer', { app: ${JSON.stringify(app.slug)}, q: q.id, correct: selectedIndex === q.correctIndex });
    if (index + 1 >= total) {
      setDone(true);
      track('quiz_complete', { app: ${JSON.stringify(app.slug)}, total });
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
`;
}

function scenarioAppTemplate(app) {
  return `${commonHeader(
    app,
    ['useState'],
    ['AppShell', 'Card', 'Button', 'Choice', 'ProgressBar', 'SourceLine', 'Stack', 'Hero'],
  )}
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
    track('scenario_pick', { app: ${JSON.stringify(app.slug)}, sId: s.id, cId: choiceId });
    if (index + 1 >= total) { setDone(true); track('scenario_complete', { app: ${JSON.stringify(app.slug)} }); }
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
`;
}

function votingAppTemplate(app) {
  return `${commonHeader(
    app,
    ['useState'],
    ['AppShell', 'Card', 'Button', 'Choice', 'ProgressBar', 'SourceLine', 'Stack'],
  )}
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
    track('vote', { app: ${JSON.stringify(app.slug)}, item: item.id, choice: optionId });
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
`;
}

function timelineAppTemplate(app) {
  return `${commonHeader(
    app,
    ['useMemo', 'useState'],
    ['AppShell', 'Card', 'SourceLine', 'Stack', 'Hero'],
  )}
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
    track('date_pick', { app: ${JSON.stringify(app.slug)} });
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
`;
}

function clueAppTemplate(app) {
  return `${commonHeader(
    app,
    ['useState'],
    ['AppShell', 'Card', 'Button', 'Choice', 'SourceLine', 'Badge', 'Stack', 'Hero'],
  )}
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
                <Button variant="ghost" onClick={() => { setState(revealNextClue(state, c)); track('reveal_clue', { app: ${JSON.stringify(app.slug)} }); }}>
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
                        track('guess', { app: ${JSON.stringify(app.slug)}, suspect: sus.id });
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
`;
}

function appSmokeTest(app) {
  return `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('${app.slug} smoke', () => {
  it('renders the AppShell', () => {
    render(<App />);
    expect(screen.getByTestId('app-root')).toBeInTheDocument();
    // title appears in the header and may also appear in a Hero — assert >= 1.
    expect(screen.getAllByText(${JSON.stringify(app.nameAr)}).length).toBeGreaterThan(0);
  });
});
`;
}

async function scaffoldApp(app) {
  const dir = path.join(root, 'apps', app.slug);
  // regenerable = true means --regen-code will overwrite. seed.json is never regenerable.
  const writes = [
    [path.join(dir, 'package.json'), packageJson(app), true],
    [path.join(dir, 'tsconfig.json'), tsConfig(), true],
    [path.join(dir, 'vite.config.ts'), viteConfig(), true],
    [path.join(dir, 'vitest.config.ts'), vitestConfig(), true],
    [path.join(dir, 'index.html'), indexHtml(app), true],
    [path.join(dir, 'src', 'main.tsx'), mainTsx(app), true],
    [path.join(dir, 'src', 'App.tsx'), appTsx(app), true],
    [path.join(dir, 'src', 'vite-env.d.ts'), viteEnvDts(), true],
    [path.join(dir, 'src', 'vitest.shims.d.ts'), vitestShim(), true],
    [path.join(dir, 'src', 'content', 'seed.json'), emptySeedJson(app), false],
    [path.join(dir, 'public', '_headers'), publicHeaders(), true],
    [path.join(dir, 'public', '_redirects'), publicRedirects(), true],
    [path.join(dir, 'src', '__tests__', `${app.slug}.smoke.test.tsx`), appSmokeTest(app), true],
  ];
  let written = 0;
  for (const [p, content, regenerable] of writes) {
    if (await writeFileIfMissing(p, content, { regenerable })) written++;
  }
  return { slug: app.slug, written };
}

async function main() {
  let total = 0;
  for (const app of apps) {
    const r = await scaffoldApp(app);
    total += r.written;
    console.log(`  ${r.slug.padEnd(24)} +${r.written} files`);
  }
  console.log(`\nTotal files written: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
