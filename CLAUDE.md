# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

**mofeed-mini-apps** is a pnpm-workspaces monorepo of **30 Arabic-first mini web apps + 1 hub** (`apps/<slug>/`), all built on Vite 6 + React 18 + TypeScript and sharing 8 packages under `@mofeed/*`. Each app builds to its own `dist/` and deploys to its own Cloudflare Pages project / subdomain — there is no shared runtime shell.

For per-task playbooks and the prioritised "what's next" list, read `docs/HANDOFF.md` and `docs/FINAL_REPORT.md` before planning any non-trivial change.

## Commands

```bash
pnpm install                                # install all workspaces
pnpm --filter @mofeed/<slug> dev            # run one app (port 5173)
pnpm --filter @mofeed/<slug> build          # build one app to apps/<slug>/dist/
pnpm --filter @mofeed/<slug> test           # vitest for one app
pnpm dev                                    # run ALL 31 apps in parallel (heavy)
pnpm build / typecheck / test / lint        # workspace-wide
pnpm test:e2e:install                       # one-time Playwright browser install
pnpm test:e2e                               # Playwright across tier-1 apps
pnpm scan:all                               # audit + secrets + semgrep + osv + licenses
```

CI runs `lint && typecheck && test && build` plus all scans. `pnpm lint` enforces `--max-warnings=0`, so unused imports/vars fail CI via ESLint (not tsc — `noUnusedLocals` is off).

Run a single Vitest spec: `pnpm --filter @mofeed/<slug> exec vitest run path/to/file.test.tsx`.

## Architecture — what's not obvious from a casual read

### Manifest-driven scaffolding (do not hand-edit generated files)

`scripts/apps.manifest.mjs` is the **canonical list of all 30 apps** with `slug, nameAr, nameEn, descAr, descEn, category, engine, accent, tier`. Three generators consume it:

| Generator | What it (re)writes |
|---|---|
| `node scripts/scaffold-apps.mjs` | Per-app skeleton: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, smoke + content tests, `public/_headers`, `public/_redirects` |
| `node scripts/scaffold-capacitor.mjs` | Per-app `capacitor.config.ts` (uses `@mofeed/mobile`) |
| `node scripts/build-hub-catalog.mjs` | `apps/hub/src/apps.generated.ts` — the hub card grid |

When adding/renaming/recategorising an app, edit the **manifest** and re-run the relevant generator(s). Hand-edits to generated files get clobbered. Per-app *content* (`apps/<slug>/src/content/seed.json`) and any app-specific UI on top of the scaffold are not generated — those are safe to hand-edit.

### Engines: the eight per-app behaviours

`packages/engines/` exports the eight gameplay engines (`quiz`, `decision`, `voting`, `timeline`, `scenario`, `clue`, `auction`, plus the seeded `random` PRNG). Each app declares its engine in the manifest, and `App.tsx` composes that engine on top of `@mofeed/ui`'s `AppShell + Card + Choice + ProgressBar + Hero + SourceLine`. New gameplay → add an engine in `packages/engines`, then wire it via the manifest + scaffolder, don't fork an app's `App.tsx`.

### Content schema is enforced by per-app tests

`packages/content` defines `FactItem` and a `validateAll()` used by every app's `content.test.ts`. **Non-fictional items require `sourceName` + `isVerified: true`** (see `docs/CONTENT_POLICY.md` §1 for accepted sources). Scenario / decision / clue / poll apps ship `isFictional: true` and the UI marks them as such via `SourceLine`. Adding factual content from a source not yet in the accepted list means adding it to `CONTENT_POLICY.md` too.

### Security perimeter

- Every app's `public/_headers` ships a strict CSP that allows `script-src 'self' https://plausible.io` only. **Any new third-party script (analytics, embeds) must update the CSP in every relevant app.**
- `packages/security` exports `escapeHtml`, `isSafeUrl`, `toBoundedInt`, `normaliseText` — use these at any boundary that ingests user/JSON input rather than hand-rolling.
- `scripts/scan-secrets.mjs` is an in-tree regex scan with no external deps; `scripts/scan-licenses.mjs` walks `node_modules` and denies the GPL family. Both run in `pnpm scan:all` and CI.

### Mobile / Capacitor

Every app has a `capacitor.config.ts` (generated), but **Capacitor itself is not installed in any app yet**. `npx cap add ios|android` has never been run; `apps/<slug>/ios/` and `apps/<slug>/android/` are gitignored. The per-app install + add flow is documented in `docs/DEPLOYMENT.md` §7. Don't assume native folders exist.

### Hub

`apps/hub/` is its own Vite app that deploys to the root domain. Its card list is `src/apps.generated.ts` — regenerate via `build-hub-catalog.mjs` after manifest changes. Each card deep-links to the per-slug subdomain.

## TypeScript / tooling gotchas

- **`noUncheckedIndexedAccess: true`** in `tsconfig.base.json` — array/object index access returns `T | undefined`. The codebase pattern is `arr[i] ?? fallback` or destructure with a guard. Don't disable this per-app.
- `apps/<slug>` packages have their own `tsconfig.json`; the root `tsconfig.base.json` is shared. Run `pnpm typecheck` from the **root** after touching any `packages/*` to catch downstream breakage across all apps.
- `scripts/**` is excluded from ESLint. The generators in there are intentionally plain Node ESM (`.mjs`).
- `apps/<slug>/dist`, `ios/`, `android/` are gitignored — never commit build output or native projects.
- `packageManager` in root `package.json` pins pnpm to `10.33.0` via corepack. Use `corepack enable` once locally; don't switch to npm/yarn.

## RTL / Arabic conventions

Every app's `index.html` is `<html lang="ar" dir="rtl">`. Styling is plain CSS variables + CSS modules in `packages/ui/styles.css` — there is no Tailwind, no CSS-in-JS, and no RTL plugin. New components should follow the same pattern (logical properties or RTL-aware tokens, not hardcoded `left`/`right`).

## When in doubt

- New app → edit manifest, run all three generators, fill `seed.json`, add to `playwright.config.ts` tier1 if you want E2E.
- New content → edit `apps/<slug>/src/content/seed.json`, the per-app `content.test.ts` re-validates.
- New engine → `packages/engines/` (see its README), then wire via manifest.
- Anything user-visible across many apps → likely belongs in `packages/ui` so all 30 apps benefit.
