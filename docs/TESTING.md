# Testing

Tests are required. The repo has three layers, all runnable from root.

| Layer | Tool | Where it lives | What it covers |
|---|---|---|---|
| Unit | Vitest + Testing Library | `apps/<slug>/src/__tests__/*.test.ts(x)` and `packages/*/src/__tests__/*.test.ts` | engines, scoring, randomization, content filters, date logic |
| Component / smoke | Vitest + jsdom | same as unit | App renders, main interaction fires |
| E2E | Playwright | `e2e/*.spec.ts` | each app loads, RTL renders, main flow works |

---

## Commands

```bash
# all unit tests across the workspace
pnpm test

# unit tests just for one app or package
pnpm --filter @mofeed/seerah-quiz test
pnpm --filter @mofeed/engines test

# install browsers (one-time, ~120MB)
pnpm test:e2e:install

# run E2E (will start the dev preview servers it needs)
pnpm test:e2e
```

CI runs all of the above. Local pre-commit isn't required, but
`pnpm test && pnpm test:e2e` before pushing keeps the build green.

---

## What we test, per the brief

### 1. Smoke
- E2E spec `e2e/smoke.spec.ts` visits every app's built preview and asserts:
  - the document loads (status 200, body has text)
  - `<html lang="ar" dir="rtl">` is set
  - the main `[data-testid="app-root"]` element renders
  - no `console.error` during initial render

### 2. Regression
- Shared engine tests (`packages/engines/src/__tests__`) cover quiz scoring,
  decision weighting, voting tallies, timeline ordering, clue elimination.
- Apps that consume an engine import its types; any breaking engine change
  fails TypeScript everywhere.

### 3. UI / UX
- E2E specs run at 360×640 (mobile), 768×1024 (tablet), 1280×720 (desktop)
  and screenshot the key states. Layout regressions diff against the
  committed reference screenshots in `e2e/__screenshots__/`.
- Accessibility: each E2E spec runs `@axe-core/playwright` against the
  loaded page and asserts no `critical` / `serious` violations.

### 4. Unit
- `packages/engines/src/__tests__/quiz.test.ts` — scoring, partial credit,
  time bonus, randomisation determinism (seeded).
- `packages/engines/src/__tests__/decision.test.ts` — outcome mapping.
- `packages/engines/src/__tests__/voting.test.ts` — tally + percentage math.
- `packages/content/src/__tests__/validate.test.ts` — schema enforcement,
  rejection of unsourced facts.
- `apps/today-history/src/__tests__/date.test.ts` — date-based selection
  (leap years, year-over-year stability).

### 5. E2E
- Initial coverage: the first 10 apps each have a `e2e/apps/<slug>.spec.ts`.
- A directory scan in `e2e/smoke.spec.ts` adds a baseline smoke test for
  every remaining app so all 30 are at least loaded by CI.

---

## Vitest configuration

Per-app `vitest.config.ts` extends `packages/testing/vitest.shared.ts`,
which sets `jsdom`, RTL setup, and globals.

## Playwright configuration

`playwright.config.ts` at repo root:
- Projects: `chromium-desktop`, `chromium-mobile` (Pixel 5 emulation).
- Web server: spins up `pnpm preview` for the apps under test.
- Retries: 2 on CI, 0 locally.
- Reporter: `list` + `html` (report at `playwright-report/`).

---

## Done definition

A change is "tested" when:

1. `pnpm typecheck` passes.
2. `pnpm test` is green.
3. `pnpm build` succeeds for every touched app.
4. `pnpm test:e2e` is green for every touched app (or its smoke spec).
5. New behavior has at least one new test asserting it.
