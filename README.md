# mofeed-mini-apps

Monorepo of **30 Arabic-first mini web apps** that all live under one
brand. Each app is independent, web-first, designed to feel snappy on
mobile browsers, and ready to be wrapped as an iOS / Android shell via
Capacitor when its time comes.

## Project at a glance

- **Stack** — Vite + React 18 + TypeScript on a pnpm-workspaces monorepo.
  Decision recorded in [`docs/TECH_STACK.md`](docs/TECH_STACK.md).
- **Apps** — 30 slugs under `apps/<slug>/`. Each ships its own
  `vite.config.ts`, `index.html`, and content folder so it can be built
  and deployed independently.
- **Shared packages** — `@mofeed/ui`, `@mofeed/content`, `@mofeed/engines`
  (quiz / decision / voting / timeline / scenario / clue), `@mofeed/seo`,
  `@mofeed/analytics`, `@mofeed/security`, `@mofeed/testing`,
  `@mofeed/mobile`.
- **Hosting** — Cloudflare Pages, one project per app, one subdomain per
  app. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
- **Testing** — Vitest (unit + component) + Playwright (E2E, chromium +
  Pixel 5 emulation). See [`docs/TESTING.md`](docs/TESTING.md).
- **Security** — five scans wired into `pnpm scan:all` plus ESLint
  security plugin. See [`docs/SECURITY.md`](docs/SECURITY.md) and
  [`SECURITY.md`](SECURITY.md).
- **Content** — every fact carries a source, grading, and verification
  flag. See [`docs/CONTENT_POLICY.md`](docs/CONTENT_POLICY.md).

## Quick start

```bash
# clone + install
pnpm install

# start one app in dev mode
pnpm --filter @mofeed/seerah-quiz dev      # http://localhost:5173

# start every app in parallel (heavy)
pnpm dev

# unit tests
pnpm test

# build every app
pnpm build
```

## The 30 apps

| Slug | Arabic | English | Engine | Tier |
|---|---|---|---|---|
| seerah-quiz | اختبار السيرة النبوية | Seerah Quiz | quiz | 1 |
| today-history | حدث في مثل هذا اليوم | Today in History | timeline | 1 |
| saudi-history-quiz | اختبار تاريخ السعودية | Saudi History Quiz | quiz | 1 |
| guess-saudi-player | خمن اللاعب السعودي | Guess the Saudi Player | clue | 1 |
| if-minister | لو كنت وزيرًا | If You Were a Minister | decision | 1 |
| history-court | محكمة التاريخ | History Court | voting | 1 |
| news-detective | محقق الأخبار | News Detective | voting | 1 |
| last-minute-decision | قرار الدقيقة الأخيرة | Last-Minute Decision | decision | 1 |
| knowledge-auction | مزاد المعرفة | Knowledge Auction | auction | 1 |
| time-traveler | المسافر عبر الزمن | Time Traveler | scenario | 1 |
| saudi-time-machine | آلة الزمن السعودية | Saudi Time Machine | timeline | 1 |
| national-memory | الذاكرة الوطنية | National Memory | quiz | 1 |
| history-secrets | أسرار التاريخ | History Secrets | timeline | 1 |
| odd-archive | أرشيف الغرائب | Odd Archive | timeline | 1 |
| logic-judge | قاضي المنطق | Logic Judge | quiz | 1 |
| predict-the-decision | توقع القرار | Predict the Decision | quiz | 1 |
| decision-council | مجلس القرار | Decision Council | decision | 1 |
| in-his-place | لو كنت مكانه | In His Place | scenario | 1 |
| crossroads | مفترق الطرق | Crossroads | scenario | 1 |
| who-is-wrong | مين المخطئ؟ | Who Is Wrong? | voting | 1 |
| consultant-test | اختبار المستشار | Consultant Test | decision | 1 |
| matchday-coach | مدرب الجولة | Matchday Coach | decision | 1 |
| what-if | ماذا لو؟ | What If? | scenario | 1 |
| thinking-compass | بوصلة التفكير | Thinking Compass | decision | 1 |
| impossible-choice | القرار المستحيل | Impossible Choice | voting | 1 |
| missing-clue | الدليل الناقص | Missing Clue | clue | 1 |
| unknown-suspect | المتهم المجهول | Unknown Suspect | clue | 1 |
| wisdom-index | مؤشر الحكمة | Wisdom Index | decision | 1 |
| diplomat-test | اختبار الدبلوماسي | Diplomat Test | decision | 1 |
| saudi-mood-map | خريطة المزاج السعودي | Saudi Mood Map | voting | 1 |

A landing **hub** lives at `apps/hub/` and lists every app with
category filters; it deploys to the root domain and links each card to
the per-slug subdomain.

**Mobile shells** are wired via `@mofeed/mobile` (Capacitor). The
`seerah-quiz` app ships a working `capacitor.config.ts` as the
proof-of-concept. See `docs/DEPLOYMENT.md` §7 for the per-app native
build runbook.

**All 30 apps are tier 1** as of Phase 4: each ships with
hand-authored content, a content-validation test, a generated
Capacitor config, and full smoke-test coverage. The `tier` field is
preserved on the manifest schema so future apps can ship as `tier: 2`
skeletons and be promoted later.

Factual quizzes (`seerah-quiz`, `today-history`, `saudi-history-quiz`,
`knowledge-auction`, `predict-the-decision`, `national-memory`,
`history-secrets`, `odd-archive`, `logic-judge`, `saudi-time-machine`)
ship sourced, non-fictional content per `docs/CONTENT_POLICY.md`.
Scenario / decision / clue / poll apps ship `isFictional: true`
simulations clearly marked in the UI via the shared `SourceLine`
component.

## Repo layout

```
apps/<slug>/        # 30 independent Vite apps
packages/           # shared UI, engines, content schema, testing, etc.
docs/               # tech stack, content policy, deployment, testing, security
e2e/                # Playwright specs
scripts/            # repo automation (scaffolder, scanners)
```

See [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for the per-app file
layout and reasoning.

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install deps for all packages |
| `pnpm dev` | Start every app in parallel (Vite) |
| `pnpm --filter @mofeed/<slug> dev` | Start one app |
| `pnpm build` | Build every app to its own `dist/` |
| `pnpm --filter @mofeed/<slug> build` | Build one app |
| `pnpm lint` | ESLint across the workspace, fails on warnings |
| `pnpm typecheck` | TypeScript across every package |
| `pnpm test` | Vitest in every package |
| `pnpm test:unit` | Vitest from root only |
| `pnpm test:e2e:install` | Install Playwright browsers (one-time) |
| `pnpm test:e2e` | Playwright E2E against tier-1 apps |
| `pnpm scan:all` | All security scans (audit + secrets + semgrep + osv + licenses) |
| `pnpm preview` | `vite preview` every app |
| `node scripts/scaffold-apps.mjs` | Re-scaffold any missing app skeletons |

## Deployment

- One Cloudflare Pages project per app, custom subdomain per app.
- Full runbook: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Mobile conversion

- Capacitor wraps each app's `dist/` into iOS / Android.
- Shared base config in `packages/mobile/`.
- Full runbook: [`docs/DEPLOYMENT.md#7-mobile-capacitor-build-on-demand`](docs/DEPLOYMENT.md).

## Roadmap

- **Phase 2** — Expand tier-2 apps with verified content batches.
- **Phase 3** — Optional hub landing page (`apps/hub`) + cross-app
  shared header navigation.
- **Phase 4** — Native shells for tier-1 apps via Capacitor.
- **Phase 5** — Optional Pro / sponsor / support placeholders activated.

## Contributing

- All new content must comply with
  [`docs/CONTENT_POLICY.md`](docs/CONTENT_POLICY.md).
- All PRs must pass `pnpm lint && pnpm typecheck && pnpm test &&
  pnpm build`.
- Security disclosures: see [`SECURITY.md`](SECURITY.md).

## License

Currently treated as all-rights-reserved during private development. A
license will be selected before the first public release.
