# Functional audit — mofeed-mini-apps

Date: 2026-05-16 · Machine: macOS Darwin 25.2.0 · Node 25.8.2 · pnpm 10.33.0

## TL;DR

**Status: ready for local use and demo. Three bugs were found and fixed during this audit.** All 30 mini apps + the hub start up cleanly, render Arabic RTL correctly, pass 130+ unit tests, and pass 68/68 Playwright E2E specs across desktop + mobile Chromium. Security scans (audit, secrets, semgrep, OSV, licenses) are clean. Content review across 820 Arabic strings found no schema violations, no Latin punctuation in Arabic text, and no common typos.

| Gate | Result |
|---|---|
| `pnpm install` | clean |
| `pnpm typecheck` | clean, 31 packages |
| `pnpm lint` (`--max-warnings=0`) | clean |
| `pnpm test` (vitest) | 130+ tests, all green |
| `pnpm test:e2e` (Playwright) | 68/68 across `chromium-desktop` + `chromium-mobile` |
| `pnpm audit` | no vulnerabilities |
| `pnpm scan:secrets` | clean |
| `pnpm scan:licenses` | 0 denied, 0 unknown |
| `osv-scanner` | no issues (445 pkgs scanned) |
| `semgrep --config=auto` | 31 findings — all the same false-positive (SRI on inline `data:` favicons; SRI doesn't apply to data URIs) |
| Lighthouse — mobile (hub) | A11y **94**, Best Practices **100**, SEO **91** |
| Lighthouse — desktop (hub) | A11y **94**, Best Practices **100**, SEO **91** |
| HTTP smoke (31 apps) | 31/31 served 200 |
| `lang="ar" dir="rtl"` (31 apps) | 31/31 |
| Arabic in `<title>` (31 apps) | 31/31 |

## Bugs found and fixed during this audit

### 1. RTL bidi reversal of the question counter (UX, all 22 quiz/decision apps)
**Symptom:** The header counter `{index + 1} / {total}` rendered visually as `5 / 1` on question 1 of a 5-question quiz because the LTR digits inherit the surrounding RTL flow and reorder. Arabic readers would read it as "5 of 1".
**Fix:** Wrap the counter in `<span dir="ltr">` so the LTR token is isolated. Patched in `scripts/scaffold-apps.mjs` (the template source of truth) and in all 22 existing `apps/*/src/App.tsx` files via sed. Verified live in Chrome DevTools — counter now reads `1 / 5` as intended.
**Files:** `scripts/scaffold-apps.mjs` (3 occurrences), 22 × `apps/*/src/App.tsx`.

### 2. Duplicate "معرفة عامة" category button on the hub
**Symptom:** The hub had two identical "معرفة عامة" filter chips, because `knowledge-auction` used `category: 'knowledge'` and `odd-archive` used `category: 'general-knowledge'`, and both mapped to the same Arabic label in `CATEGORY_LABELS`.
**Fix:** Normalised `knowledge-auction` to use `category: 'general-knowledge'` in `scripts/apps.manifest.mjs`. Re-ran `node scripts/build-hub-catalog.mjs` to regenerate `apps/hub/src/apps.generated.ts`. Verified in browser: one "معرفة عامة" chip now.
**Files:** `scripts/apps.manifest.mjs`, `apps/hub/src/apps.generated.ts` (regenerated).

### 3. Hub cards were unclickable in local dev
**Symptom:** With no `VITE_SUBDOMAIN_BASE` set (no deploy yet), the hub fell back to `href="#slug"` anchors that went nowhere. The hub looked decorative locally.
**Fix:** Added a `VITE_LOCAL_PORT_MAP` JSON env that maps `slug → port`. Hub now resolves to `http://127.0.0.1:<port>/` when that env is present. Wrote `apps/hub/.env.local` with the canonical port assignment (4301–4330 for the 30 apps).
**Files:** `apps/hub/src/App.tsx`, `apps/hub/.env.local` (new, gitignored).

### Bonus: Playwright webServer + IPv4 binding
Pre-existing issue: `vite preview` defaults to binding to `[::1]` (IPv6) on macOS, but `playwright.config.ts` polled `http://127.0.0.1:…` (IPv4) — causing the E2E suite to time out at webServer startup. Patched the playwright config to pass `--host 127.0.0.1` to each preview command and raised `timeout` from 120s to 180s to give 15 parallel servers more headroom.
**Files:** `playwright.config.ts`.

### Bonus: stale `tier-1 filter` E2E assertion
The E2E test `tier-1 filter shows only ready apps` asserted `filteredCount < initialCount`, but per Phase 4 all 30 apps are tier 1, so the filter is a no-op (correctly). Relaxed to `<=` with a code comment explaining the invariant.
**Files:** `e2e/hub.spec.ts`, `apps/hub/src/__tests__/hub.smoke.test.tsx`.

### Defense-in-depth: `SourceLine` now refuses non-http(s) URLs
Even though all 55 `sourceUrl` values in seed content are `https://`, `SourceLine` was rendering any URL it received without protocol checks. Hardened to gate on `isSafeUrl()` from `@mofeed/security` — if a future content edit puts a `javascript:` or `data:` URL through, the link silently degrades to plain text.
**Files:** `packages/ui/src/components.tsx`.

## Phase results — by category

### Build / type / lint
All clean. Production builds emit ~150 KB JS gzipped per app, no source-map leaks, no warnings.

### Tests (Vitest)
| Package | Tests |
|---|---|
| `@mofeed/content` | 7 |
| `@mofeed/security` | 7 |
| `@mofeed/engines` | 22 |
| `@mofeed/ui` | 7 |
| Apps total | 87 (across 30 apps + hub) |
| **Workspace total** | **130** |

All green after fixes.

### E2E (Playwright, chromium-desktop + chromium-mobile aka Pixel 5)
68 specs, all green. Coverage: every tier-1 app loads with `data-testid="app-root"`, every `<h1>` contains Arabic, RTL is asserted via `lang` + `dir`, hub cards are present, filtering works, all cards have valid `href` (https / 127.0.0.1 dev port / hash anchor).

### Security
| Layer | Result |
|---|---|
| `pnpm audit --prod` | no known vulnerabilities |
| `scripts/scan-secrets.mjs` (12 regex patterns) | clean |
| `scripts/scan-licenses.mjs` (GPL-family deny list) | 0 denied, 0 unknown |
| `osv-scanner --lockfile=pnpm-lock.yaml` | no issues, 445 packages |
| `semgrep --config=auto` | 31 findings, **all false positives**: `missing-integrity` warning on inline `data:image/svg+xml` favicons. SRI doesn't apply to data URIs (no external fetch). Safe to ignore. |
| `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`, `innerHTML` | none in production code |
| `fetch` / `XMLHttpRequest` | none (apps are fully static) |
| `localStorage` / `sessionStorage` | not used |
| External `<a>` | one — `SourceLine`, with `target="_blank" rel="noopener noreferrer"` and (post-fix) `isSafeUrl()` gating |
| CSP (`apps/*/public/_headers`) | identical across all 31 apps, strict `default-src 'self'`, script-src only allows Plausible, `frame-ancestors 'none'`, plus `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geo |
| `<iframe> / <embed> / <object>` | none — no clickjacking surface |

The only known soft spot is `style-src 'self' 'unsafe-inline'` in the CSP (needed for React inline style props such as the hub card accent colour). Acceptable for a static SPA with no user-supplied styles; could be tightened to nonces in a future iteration.

### UI / UX (6-pillar lens)
| Pillar | Verdict |
|---|---|
| Hierarchy | ✅ skip link + `role="banner"` + `<main>` + `role="contentinfo"` + `<h1>` in main |
| Typography | ✅ Noto Naskh Arabic stack, 16px base, line-height 1.6 — comfortable for Arabic reading |
| Layout / spacing | ✅ 8pt-style scale (4/8/12/16/24/32/48), main capped at 720px and centred |
| Color / contrast | ✅ accent `#0e7c66` on white, dark-mode auto via `prefers-color-scheme`, semantic badge tones |
| Interaction states | ✅ hover / active / focus-visible ring, `aria-pressed` on selected Choice, `correct` / `wrong` states |
| RTL correctness | ✅ `inset-inline-*` logical properties, `text-align: start`, `dir="rtl"` on `<html>`, `<bdi>`-style isolation now applied to LTR counter (post-fix) |

### Arabic content (820 strings across 30 apps)
| Check | Result |
|---|---|
| Schema (non-fictional → sourceName + isVerified) | 30/30 apps pass |
| Question mark style (`؟` vs `?`) | 74/74 use `؟` |
| Comma style (`،` vs `,`) in Arabic-dominant strings | 0 violations |
| `صلعم` informal Prophet's blessing | 0 — all use ﷺ correctly |
| `لاكن` / `انشاء الله` common typos | 0 |
| Double spaces, space-before-punctuation | 0 |
| Tatweel decoration | 0 |
| Bare alif for أنت / أ-initials | 0 |
| Source quality (factual content) | reputable: الرحيق المختوم, دارة الملك عبدالعزيز, UNESCO, NASA, Britannica, Stanford SEP, Smithsonian |
| Fictional items marked `isFictional: true` | 5 apps (consultant-test, crossroads, if-minister, etc.) consistently labelled with `<Badge tone="warning">محتوى افتراضي / غير واقعي</Badge>` |
| `sourceUrl` protocol | 55/55 are `https://` |

## Local runbook (what's running)

All 31 preview servers are now running on these ports (IPv4):

| Port | App |
|---|---|
| 4301 | seerah-quiz |
| 4302 | today-history |
| 4303 | saudi-history-quiz |
| 4304 | guess-saudi-player |
| 4305 | if-minister |
| 4306 | history-court |
| 4307 | news-detective |
| 4308 | last-minute-decision |
| 4309 | knowledge-auction |
| 4310 | time-traveler |
| 4311 | decision-council |
| 4312 | in-his-place |
| 4313 | logic-judge |
| 4314 | saudi-time-machine |
| 4315 | crossroads |
| 4316 | who-is-wrong |
| 4317 | consultant-test |
| 4318 | history-secrets |
| 4319 | predict-the-decision |
| 4320 | matchday-coach |
| 4321 | what-if |
| 4322 | thinking-compass |
| 4323 | impossible-choice |
| 4324 | odd-archive |
| 4325 | missing-clue |
| 4326 | unknown-suspect |
| 4327 | wisdom-index |
| 4328 | diplomat-test |
| 4329 | saudi-mood-map |
| 4330 | national-memory |
| **4400** | **hub** (start here — clicking a card opens the right local app) |

To restart everything after a reboot:

```bash
cd /Users/ibrahemalghamdi/workspace/personal/micro-apps-hub
pnpm build         # produce dist/ for every app
# then launch all previews — see audit-2026-05-16/screenshots/ for the launch
# loop, or just start the hub which is the entry point:
pnpm --filter @mofeed/hub preview --port 4400 --strictPort --host 127.0.0.1
```

The hub reads `apps/hub/.env.local` (already created) so its cards link to
the right local port for each app. Open http://127.0.0.1:4400/ to start.

## What's still pending (not blockers for "fully functional locally")

- **No Cloudflare Pages deploy yet.** `docs/DEPLOYMENT.md` has the runbook.
- **Capacitor not yet installed in any app.** `capacitor.config.ts` exists per app; per-app `npx cap add ios|android` is the next step (`docs/DEPLOYMENT.md` §7).
- **Vote-storage backend** is not present — the four voting apps render a deterministic synthetic tally. `docs/HANDOFF.md` §4c proposes Cloudflare Workers + KV.
- **`style-src 'unsafe-inline'`** in CSP — acceptable for this app set; tighten to nonces if user-generated CSS is ever introduced.

## Files changed during this audit

```
M  apps/hub/src/App.tsx                              # local-port map env
M  apps/hub/src/__tests__/hub.smoke.test.tsx         # accept 127.0.0.1 hrefs
A  apps/hub/.env.local                               # local port map (gitignored)
M  apps/hub/src/apps.generated.ts                    # regen for category fix
M  apps/seerah-quiz/src/App.tsx                      # bidi fix
M  apps/saudi-history-quiz/src/App.tsx               # bidi fix
M  apps/today-history/src/App.tsx                    # bidi fix
… (22 apps total)                                    # bidi fix
M  scripts/apps.manifest.mjs                         # knowledge → general-knowledge
M  scripts/scaffold-apps.mjs                         # bidi fix in template
M  packages/ui/src/components.tsx                    # SourceLine isSafeUrl gate
M  playwright.config.ts                              # --host 127.0.0.1, timeout 180s
M  e2e/hub.spec.ts                                   # accept 127.0.0.1 hrefs + relax tier filter
A  CLAUDE.md                                         # AI assistant guide
A  audit-2026-05-16/FUNCTIONAL_REPORT.md             # this file
A  audit-2026-05-16/screenshots/*.png                # visual evidence (hub + 8 engine reps)
A  audit-2026-05-16/lighthouse/*                     # mobile Lighthouse on hub
A  audit-2026-05-16/lighthouse-hub-desktop/*         # desktop Lighthouse on hub
```
