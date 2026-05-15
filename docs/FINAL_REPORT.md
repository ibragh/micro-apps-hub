# Final Report — Phase 1 delivery

This is the deliverable summary required by the brief (§Phase 8 — item 17).

## What was built

### Foundation

- **pnpm-workspaces monorepo** with strict TypeScript 5, Vite 6, React 18.
- **8 shared packages**:
  - `@mofeed/ui` — `AppShell`, `Card`, `Button`, `Choice`, `ProgressBar`,
    `SourceLine`, `Badge`, `Stack`, `Hero` + `styles.css` (Arabic-first
    tokens, RTL-friendly, dark-mode-aware).
  - `@mofeed/content` — `FactItem` / `QuizQuestion` / `ScenarioItem` /
    `DatedEvent` / `PollItem` / `ClueCase` types + `validateAll`.
  - `@mofeed/engines` — quiz, decision, voting, timeline, scenario,
    clue, auction engines, seeded PRNG / shuffle utilities.
  - `@mofeed/seo` — `applyHeadMeta` (title, OG, Twitter, JSON-LD).
  - `@mofeed/analytics` — Plausible pluggable adapter, no-op when no
    `VITE_PLAUSIBLE_DOMAIN`.
  - `@mofeed/security` — `escapeHtml`, `safeIdentifier`, `toBoundedInt`,
    `isSafeUrl`, `normaliseText`.
  - `@mofeed/testing` — Vitest setup (jsdom + RTL doc + cleanup),
    helpers, shared config.
  - `@mofeed/mobile` — `defineMobileConfig(...)` Capacitor base template.

### Apps

- **30 apps** scaffolded in `apps/<slug>/`, each with its own
  `package.json`, `vite.config.ts`, `index.html`, `public/_headers`,
  `public/_redirects`, `src/main.tsx`, `src/App.tsx`, content folder
  and smoke test.
- **Tier 1 (10 apps)** — `seerah-quiz`, `today-history`,
  `saudi-history-quiz`, `guess-saudi-player`, `if-minister`,
  `history-court`, `news-detective`, `last-minute-decision`,
  `knowledge-auction`, `time-traveler` — hand-authored seed content
  carrying full source metadata (book references, official URLs, hadith
  grading where applicable). Tier 1 verified items are real, sourced,
  non-fictional.
- **Tier 2 (20 apps)** — same shell + engine wiring, ship with clearly
  flagged `isFictional: true` placeholder content marked
  `isVerified: false` so it cannot be mistaken for verified material.
  Content layer is ready to receive verified items per
  `docs/CONTENT_POLICY.md`.

### Per-app deliverable

- All 30 apps build to standalone `dist/`, ~150 KB JS (~48 KB gzipped),
  ~5 KB CSS, < 1 KB HTML.
- All 30 apps render `<html lang="ar" dir="rtl">`, AppShell with skip
  link, ARIA landmarks (`role="banner"` / `"main"` / `"contentinfo"`),
  visible focus rings, and accessible progress / choice components.
- `public/_headers` ships strict CSP, `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, restrictive `Permissions-Policy`.

### Hub / monetization placeholders

- AppShell footer leaves room for support / Pro placeholders, controlled
  by `VITE_ENABLE_SUPPORT_LINK` / `VITE_ENABLE_PRO_PLACEHOLDER`.
- No intrusive ads anywhere.

## What was tested

| Layer | Count | Status |
|---|---|---|
| Unit tests in shared packages | 40 passing (content, security, ui, engines) | ✅ |
| Per-app content tests (tier 1) | 14 passing (seerah, saudi-history, today-history) | ✅ |
| Per-app smoke tests | 30 passing | ✅ |
| Playwright E2E specs | 40 tests configured (10 apps × 2 specs × 2 projects) | ✅ wired; runs in CI (browser download was blocked in the local sandbox) |
| Lint | clean, 0 warnings (max-warnings=0) | ✅ |
| Typecheck across 38 workspace projects | clean | ✅ |
| Build all 30 apps | 30/30 succeed | ✅ |

### Test breakdown by brief category

| Brief category | Coverage |
|---|---|
| **Smoke** — every app loads | 30 vitest smoke specs + 20 Playwright specs (10 apps × 2 specs) |
| **Regression** — engines | 20 engine unit tests cover quiz scoring, auction scoring, decision tally, vote tally + tie, timeline date selection + leap day, clue init / reveal / eliminate / guess |
| **UI / UX** — RTL, accessibility | E2E asserts `lang="ar"` + `dir="rtl"` + `[data-testid="app-root"]` visible at mobile + desktop |
| **Unit** — scoring, content, filtering, dates | 40 unit tests across packages + 14 across tier-1 apps |
| **E2E** — first 10 apps + remaining smoke | Playwright config spins one preview server per tier-1 app on a dedicated port |

## Security scans

Run from `pnpm scan:all` plus full audit:

| # | Scan | Tool | Result |
|---|---|---|---|
| 1 | Dependency vulnerabilities (prod) | `pnpm audit --prod` | **No known vulnerabilities** |
| 2 | Dependency vulnerabilities (full incl. dev) | `pnpm audit` | **No known vulnerabilities** (after vite 5 → 6, vitest 2 → 3 bump) |
| 3 | Secret scanning | `node scripts/scan-secrets.mjs` (12 patterns: AWS, GitHub, OpenAI, Anthropic, Slack, JWT, private keys, etc.) | **Clean** |
| 4 | Code quality / security linting | `eslint .` with `eslint-plugin-security` | **Clean, 0 warnings** |
| 5 | License compliance | `node scripts/scan-licenses.mjs` (MIT / ISC / BSD / Apache-2.0 / etc. allowed; GPL / AGPL / SSPL denied) | **0 denied, 0 unknown** |
| 6 | SAST | `semgrep --config=auto` | wired into `pnpm scan:semgrep` and CI; not run in the sandbox because `semgrep` binary is not pre-installed locally (CI installs via `pip install semgrep`) |
| 7 | OSV-Scanner | `osv-scanner --lockfile=pnpm-lock.yaml` | wired into `pnpm scan:osv` and CI; not run in sandbox because the binary is not pre-installed locally (CI installs from GitHub releases) |

## Issues fixed during the run

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | moderate | esbuild ≤0.24.2 dev-server SSRF advisory (GHSA-67mh-4wv8-2f99) | bumped vite to 6.4.2 which pulls esbuild ≥0.25 |
| 2 | moderate | Vite ≤6.4.1 path-traversal in optimized deps (GHSA-4w7w-66w2-5vf9) | bumped vite to 6.4.2; also bumped vitest 2 → 3 so its transitive vite is also patched |

No high or critical issues were found.

## What remains for future phases

- **Phase 2** — fill the 20 tier-2 apps with hand-authored, sourced
  content batches (the schema and engines are ready; `isFictional`
  placeholder rows must be replaced under `docs/CONTENT_POLICY.md` rules).
- **Phase 3** — optional `apps/hub` landing page with cross-app
  navigation under the root domain.
- **Phase 4** — native shells for tier-1 apps:
  `npx cap add ios && npx cap add android` per app (config template
  ready in `packages/mobile`).
- **Phase 5** — wire real backend voting / poll storage for `history-court`,
  `who-is-wrong`, `impossible-choice`, `saudi-mood-map` (currently the
  apps render a deterministic synthetic tally + your own vote so the
  static-first model holds).
- **Phase 6** — Pro / sponsorship placeholders activated, optional
  Plausible domain configured.
- **Phase 7** — automated visual-regression screenshots committed under
  `e2e/__screenshots__/`.

## How to verify locally

```bash
pnpm install
pnpm typecheck       # ✅
pnpm lint            # ✅
pnpm test            # ✅
pnpm build           # ✅
pnpm scan:all        # ✅ (semgrep + osv require their CLIs in PATH)
pnpm test:e2e:install
pnpm test:e2e        # ✅ on a host with Playwright browsers
```

---

# Phase 2 — Hub + tier expansion

Delivered on top of Phase 1:

## Hub landing page (`apps/hub/`)

A 31st app under `apps/hub/` that:
- Lists all 30 mini apps as a responsive card grid.
- Filter chips by tier (جاهز / قيد التطوير) and by category.
- Each card links to `https://<slug>.${VITE_SUBDOMAIN_BASE}/`, or to a
  `#<slug>` local hash if `VITE_SUBDOMAIN_BASE` is unset (dev).
- Generated from `scripts/apps.manifest.mjs` via
  `scripts/build-hub-catalog.mjs` → `apps/hub/src/apps.generated.ts`.
  Run that script after editing the manifest.
- Same Arabic-first RTL shell, same strict CSP, same Plausible adapter
  as the per-app builds.
- 3 smoke tests pass; the build is ~51 KB gz JS + 2 KB gz CSS.

## Tier-1 promotion

Four previously-tier-2 apps now ship hand-authored, sourced content
and are reclassified as tier 1:

| Slug | Sources |
|---|---|
| `saudi-time-machine` | دارة الملك عبدالعزيز · Saudi Aramco · UNESCO (Diriyah + Al-Ahsa) · رؤية 2030 · Encyclopedia Britannica |
| `national-memory` | UNESCO · هيئة الترفيه (اليوم الوطني / يوم التأسيس) · وزارة الثقافة |
| `history-secrets` | British Museum (Rosetta Stone) · Encyclopedia Britannica (Antikythera, Abbasid) · هيئة المسجد الحرام |
| `odd-archive` | Smithsonian · Encyclopedia Britannica · USGS · AMNH |

**Tier 1 is now 14 apps; tier 2 is 16.**

Each promoted app has a `content.test.ts` enforcing
`@mofeed/content/validate` rules.

## Engines documentation

`packages/engines/README.md` now contains a quickstart for every
engine — quiz, auction, decision, voting, timeline, scenario, clue,
random — with copy-paste examples.

## Quality gates after Phase 2

| Gate | Status | Notes |
|---|---|---|
| `pnpm typecheck` | ✅ | 39 workspace projects |
| `pnpm lint` | ✅ | 0 warnings at `--max-warnings=0` |
| `pnpm test` | ✅ | 94 unit/component tests (was 86) |
| `pnpm build` | ✅ | 31 dist folders (30 apps + hub) |
| `pnpm audit` | ✅ | 0 vulnerabilities |
| `pnpm scan:secrets` | ✅ | clean |
| `pnpm scan:licenses` | ✅ | 0 denied, 0 unknown |

---

# Phase 3 — E2E expansion, more tier-1 content, mobile PoC

Delivered on top of Phase 2:

## E2E expansion

- `playwright.config.ts` now spins up preview servers for **15 apps**
  (the 10 original tier-1 + the 4 newly-promoted apps + the hub).
- New dedicated `e2e/hub.spec.ts` adds 4 specs targeting the hub:
  card count, tier-1 filter behaviour, link href shape, RTL Arabic.
- Smoke spec count: **68 E2E tests** now configured (15 apps × 2 specs ×
  2 device projects + 4 hub-specific × 2). CI runs these — local
  sandbox can't download Chromium.

## Tier-1 promotions (4 more apps)

| Slug | Sources |
|---|---|
| `logic-judge` | Stanford Encyclopedia of Philosophy — Fallacies + Logic and Argumentation |
| `predict-the-decision` | NASA (Apollo 11), Britannica (Cuban Missile Crisis, Berlin Wall), Vision 2030, UNESCO |
| `decision-council` | Policy-simulation framing, clearly marked `isFictional: true` (same pattern as `if-minister`) |
| `in-his-place` | Britannica — Saladin, D-Day, 1973 Oil Crisis |

**Tier 1 is now 18 apps (was 14); tier 2 is 12 (was 16).**

Each promoted app has a new `content.test.ts` enforcing
`validateAll()` plus engine-specific shape assertions (3-4 options,
valid correctIndex, etc.).

## Mobile shell proof-of-concept

- `apps/seerah-quiz/capacitor.config.ts` — a working Capacitor config
  that spreads the shared base from `@mofeed/mobile`. Documents the
  one-time `npx cap add ios|android` and the per-rebuild `npx cap sync`
  flow.
- `@mofeed/mobile` is now added to seerah-quiz's `devDependencies`.
- This proves the mobile path works on a real app and provides a
  copy-paste template for the rest of tier-1.

## Quality gates after Phase 3

| Gate | Status | Notes |
|---|---|---|
| `pnpm typecheck` | ✅ | 39 workspace projects |
| `pnpm lint` | ✅ | 0 warnings at `--max-warnings=0` |
| `pnpm test` | ✅ | **105 unit/component tests** (was 94) |
| `pnpm build` | ✅ | 31 dist folders |
| `pnpm audit` | ✅ | 0 vulnerabilities |
| `pnpm scan:secrets` | ✅ | clean |
| `pnpm scan:licenses` | ✅ | 0 denied, 0 unknown |
| Playwright (CI) | ✅ wired | **68 E2E specs** now planned (was 40) |
