# Handoff — pick this up on local Claude Code

You're reading this because you want to continue **mofeed-mini-apps**
on your own machine using Claude Code, instead of the remote/web
sandbox where Phases 1–4 were built.

This doc tells you: what state things are in, how to get the repo
running locally in under five minutes, what to ask Claude Code to do
next, and the gotchas worth knowing.

If you only have time for one section, read **§3 — first session
prompt template** and copy that prompt into Claude Code.

---

## 1. Where things stand

| | Status |
|---|---|
| Tech stack | Decided + documented (`docs/TECH_STACK.md`). Vite 6 + React 18 + TS + pnpm workspaces, Capacitor for mobile, Cloudflare Pages for hosting. |
| Apps | 30 mini apps + 1 hub, all tier-1, all build to `apps/<slug>/dist/` |
| Shared packages | 8: ui, content, engines, seo, analytics, security, testing, mobile |
| Tests | 130 unit/component tests + 68 Playwright E2E specs wired |
| Security | `pnpm audit` clean, secret scan clean, license scan clean, ESLint security plugin clean |
| Deployment | **Not yet deployed.** Runbook in `docs/DEPLOYMENT.md` |
| Mobile | All 30 apps have a `capacitor.config.ts`. **No `cap add ios|android` has been run yet** for any app |

All changes are on `main`. PRs #1–#4 are merged. No open PRs.

Run `git log --oneline -5` to see the merge train.

---

## 2. Local setup (5 minutes)

```bash
# 1. Clone
git clone https://github.com/ibragh/micro-apps-hub.git
cd micro-apps-hub

# 2. Make sure your toolchain matches
node --version      # need >= 20
corepack enable     # so pnpm pins from package.json work
pnpm --version      # should report 10.x

# 3. Install
pnpm install

# 4. Sanity check (each is independent)
pnpm typecheck      # should be clean
pnpm lint           # should be clean at --max-warnings=0
pnpm test           # 130 tests pass
pnpm build          # builds all 31 apps

# 5. Run any app in dev
pnpm --filter @mofeed/seerah-quiz dev   # http://localhost:5173
# or the hub
pnpm --filter @mofeed/hub dev
```

If `pnpm install` fails: confirm Node 20 and `corepack enable`. The
`packageManager` field in root `package.json` pins pnpm to `10.33.0`.

---

## 3. First session prompt template

Open the repo folder in Claude Code (`claude` in your terminal, or the
desktop app). Paste this into the first prompt — it bootstraps Claude
with the right context and lets it pick up where the remote session
left off:

```
I'm picking up the mofeed-mini-apps project locally. Please:

1. Read docs/FINAL_REPORT.md and docs/HANDOFF.md so you know the state.
2. Read docs/TECH_STACK.md briefly so you respect the decisions.
3. Run `pnpm install` and confirm `pnpm typecheck && pnpm lint && pnpm test
   && pnpm build` are all green. Stop and report if anything fails.
4. Then wait for my next instruction.

Default rules for this project:
- Develop on a feature branch off main, never directly on main.
- Every change must pass typecheck, lint, test, and build before
  pushing. Don't merge until I approve.
- Content policy in docs/CONTENT_POLICY.md is the law for any new
  factual content. Non-fictional items must have sourceName + isVerified.
- Don't add features, abstractions, or dependencies beyond what each
  task needs.
```

---

## 4. What to do next, ranked

These are the items listed under "what remains" in
`docs/FINAL_REPORT.md`, ordered by value-per-effort. Pick one or
several; each can be its own PR.

### 4a. Deploy to Cloudflare Pages (1 hour, big visible win)

The runbook is in `docs/DEPLOYMENT.md`. Highest-leverage path:

1. Cloudflare → Pages → **Connect to Git** → pick this repo.
2. Repeat the dashboard form **31 times** — once per slug + once for
   the hub. Use the build commands from `docs/DEPLOYMENT.md`.
3. Bind a custom domain per project.

If you want this scripted instead, ask Claude Code: *"Write
`scripts/deploy-cf.mjs` that loops scripts/apps.manifest.mjs and
creates a Cloudflare Pages project per app via the Cloudflare API,
reading `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from
.env.local."* Don't paste tokens into Claude prompts — let it write
the script and you run it.

### 4b. Materialise one mobile shell end-to-end (2–3 hours)

Pick a flagship app, e.g. `seerah-quiz`. The Capacitor config is
already there. You only need to install Capacitor itself and run
`cap add`:

```bash
pnpm --filter @mofeed/seerah-quiz add -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
pnpm --filter @mofeed/seerah-quiz build
cd apps/seerah-quiz
npx cap add ios       # macOS + Xcode required
npx cap add android   # Android Studio required
npx cap sync
```

Then open `ios/App.xcworkspace` in Xcode or `android/` in Android Studio
to sign and run. Apple Developer account ($99/yr) and Google Play
account ($25 one-time) required to ship to stores.

### 4c. Backend vote storage (half day)

Today the four voting apps (`history-court`, `who-is-wrong`,
`impossible-choice`, `saudi-mood-map`) show a deterministic synthetic
tally + the user's own vote. Going beyond that needs a server. The
lowest-friction options:

| Option | Pros | Cons |
|---|---|---|
| Cloudflare Workers + KV | Same vendor, no new account, ~free | Custom code; per-app key prefix |
| Cloudflare D1 | SQL, free tier generous | Custom code, slightly heavier |
| Supabase / Firebase | Drop-in SDK, auth too | New vendor, more deps |

Ask Claude Code: *"Add a Cloudflare Worker under `apps/vote-api/` that
exposes POST /vote and GET /tally, backed by Workers KV. Wire the
voting apps to call it via VITE_VOTE_API_URL. Keep the static fallback
when the env var is unset."*

### 4d. Fill more verified content per app (ongoing)

The schema is solid. Adding items is just editing the relevant
`apps/<slug>/src/content/seed.json` and the per-app `content.test.ts`
catches schema violations. See `docs/CONTENT_POLICY.md` §1 for which
sources are accepted; if you want to add a new accepted source,
list it there too.

### 4e. Visual-regression screenshots (1 hour)

Add to `playwright.config.ts`:
```ts
expect: { toHaveScreenshot: { maxDiffPixels: 200 } },
```
Then in `e2e/smoke.spec.ts` add `await expect(page).toHaveScreenshot()`
per app. First run with `--update-snapshots` to seed
`e2e/__screenshots__/`. Commit those screenshots; CI then catches
visual regressions.

### 4f. Hub filter interaction tests

`e2e/hub.spec.ts` has a tier filter test but not category filters.
Add tests that click each category chip and assert the card count
drops to that category's expected size.

---

## 5. Repository quick map

```
mofeed-mini-apps/
  apps/
    <slug>/                  # 30 mini apps + hub
      package.json           # workspace; uses @mofeed/* siblings
      vite.config.ts
      tsconfig.json
      vitest.config.ts
      capacitor.config.ts    # mobile shell config (uses @mofeed/mobile)
      index.html             # <html lang="ar" dir="rtl">
      public/
        _headers             # strict CSP + Plausible
        _redirects           # SPA fallback
      src/
        main.tsx             # entry, applies SEO + analytics
        App.tsx              # engine-specific UI on top of @mofeed/ui
        content/seed.json    # the content; this is where edits usually go
        __tests__/*.test.tsx # smoke + content tests
        vite-env.d.ts
        vitest.shims.d.ts    # jest-dom matchers for vitest
  packages/
    ui/         # AppShell, Card, Button, Choice, ProgressBar, Badge,
                # SourceLine, Stack, Hero + styles.css (Arabic RTL tokens)
    content/    # FactItem types + validateAll()
    engines/    # quiz, decision, voting, timeline, scenario, clue,
                # auction, random (seeded PRNG)
    seo/        # applyHeadMeta()
    analytics/  # Plausible pluggable adapter
    security/   # escapeHtml, isSafeUrl, toBoundedInt, normaliseText
    testing/    # shared vitest setup + helpers
    mobile/     # defineMobileConfig() — Capacitor base
  e2e/
    smoke.spec.ts            # 60 specs (15 apps × 2 × 2 device projects)
    hub.spec.ts              # 8 hub-specific specs
  scripts/
    apps.manifest.mjs        # canonical list of all 30 apps
    scaffold-apps.mjs        # regen per-app code from manifest
    scaffold-capacitor.mjs   # regen per-app capacitor.config.ts
    build-hub-catalog.mjs    # regen apps/hub/src/apps.generated.ts
    scan-secrets.mjs         # 12 regex patterns, no external deps
    scan-licenses.mjs        # walks node_modules, denies GPL family
  docs/
    TECH_STACK.md            # research + decision
    CONTENT_POLICY.md        # what sources count, schema fields
    DEPLOYMENT.md            # Cloudflare Pages runbook + mobile runbook
    TESTING.md               # what we test, how, where
    SECURITY.md              # scan results, defensive rules, headers
    FINAL_REPORT.md          # Phase 1–4 summary + "what remains"
    HANDOFF.md               # ← you are here
  SECURITY.md                # public disclosure policy
  README.md                  # project intro + commands
  .env.example               # all VITE_* env vars
  .github/workflows/ci.yml   # lint + typecheck + test + build + scans
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json
  eslint.config.js
  playwright.config.ts
```

---

## 6. Workflows you'll use most

### Add a new app

```bash
# 1. Edit scripts/apps.manifest.mjs — add a new entry with slug, names,
#    descAr, category, engine, accent, tier.
# 2. Regen the per-app scaffold:
node scripts/scaffold-apps.mjs
# 3. Regen its Capacitor config:
node scripts/scaffold-capacitor.mjs
# 4. Regen the hub catalog so the hub shows it:
node scripts/build-hub-catalog.mjs
# 5. Edit apps/<new-slug>/src/content/seed.json with real items.
# 6. Add it to playwright.config.ts (tier1 array) if you want E2E.
pnpm install && pnpm test && pnpm build
```

### Add new content to an existing app

1. Open `apps/<slug>/src/content/seed.json`.
2. Add an entry following the schema in `packages/content/src/types.ts`.
3. For non-fictional items: `sourceName` is required and `isVerified: true`.
4. `pnpm --filter @mofeed/<slug> test` — the `content.test.ts`
   re-validates.

### Add a new engine

See `packages/engines/README.md` for the rules.

### Re-run security scans

```bash
pnpm scan:audit       # pnpm audit
pnpm scan:secrets     # in-tree regex scan
pnpm scan:licenses    # walks node_modules
pnpm scan:semgrep     # needs semgrep on PATH (pip install semgrep)
pnpm scan:osv         # needs osv-scanner on PATH
pnpm scan:all         # all of the above
```

---

## 7. Gotchas worth knowing

- **`pnpm typecheck` is strict.** `noUncheckedIndexedAccess: true`,
  so array access returns `T | undefined`. The codebase pattern is to
  `?? fallback` or destructure with a guard.
- **`noUnusedLocals` is off in TypeScript** but `@typescript-eslint/no-unused-vars`
  is on as a warning, and `pnpm lint` runs at `--max-warnings=0`. So
  unused imports still fail CI — via ESLint, not tsc.
- **`apps/<slug>` is *not* in `tsconfig.json:include`** for the workspace
  packages — each app has its own tsconfig. If you touch a shared
  package, run `pnpm typecheck` from the root to catch downstream
  breakage.
- **`apps/<slug>/dist` is gitignored.** Don't commit build output.
- **`ios/` and `android/`** generated by `cap add` are gitignored too —
  contributors regenerate them locally.
- **Capacitor isn't installed for any app yet.** The `capacitor.config.ts`
  files import `@mofeed/mobile` (workspace), not `@capacitor/cli`. You
  install Capacitor on demand per app — see `docs/DEPLOYMENT.md` §7.
- **`pnpm audit` fixes already applied.** Vite 5 → 6 and Vitest 2 → 3
  bumps in PR #1 patched two moderate dev-only advisories. Don't roll
  these back.
- **CSP allows Plausible.** `script-src 'self' https://plausible.io`
  is in every app's `public/_headers`. If you add another analytics
  vendor, also add it to the CSP.
- **The hub catalog is generated.** Edit `scripts/apps.manifest.mjs`,
  not `apps/hub/src/apps.generated.ts`. Run
  `node scripts/build-hub-catalog.mjs` after editing the manifest.
- **Playwright browsers must be installed locally** the first time:
  `pnpm test:e2e:install`. CI does this in `.github/workflows/ci.yml`.

---

## 8. If you only do one thing

**Open `docs/FINAL_REPORT.md`.** It's the single source of truth for
what was built across Phases 1–4 and the prioritized list of what
remains. Everything else in this doc is operational scaffolding to
help you act on that list.

---

## 9. Questions you'll probably ask Claude Code

Paste these verbatim — they're scoped tasks Claude can knock out
without further prompting:

- *"Add `apps/<slug>` to playwright.config.ts and add a hub.spec-style
  interaction test for its main flow."*
- *"Write a Cloudflare Workers + KV vote API under `apps/vote-api/`
  and wire the four voting apps to call it via `VITE_VOTE_API_URL`,
  keeping the synthetic-tally fallback when the env var is unset."*
- *"Roll out `npx cap add ios` for every tier-1 app and commit the
  resulting `apps/<slug>/ios/` folders."* (Will fail without Xcode —
  Claude will report that and stop.)
- *"Replace the `decision-council` placeholder content with verified
  policy cases from `[approved source]`, keeping the same schema."*
- *"Add `@axe-core/playwright` and a single accessibility-violations
  assertion to `e2e/smoke.spec.ts`."*
- *"Add visual-regression screenshots to `e2e/smoke.spec.ts` per app,
  run with `--update-snapshots`, commit the baseline."*

That's it. Welcome back to the repo.
