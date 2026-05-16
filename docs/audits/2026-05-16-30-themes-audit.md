# Audit — 30 topical themes rollout

Date: 2026-05-16 · Branch: `feat/30-themes`

## Result

**All 30 apps + hub re-themed. No regressions.**

| Gate | Before | After |
|---|---|---|
| Unit tests | 130+ green | 130+ green (35 test files) |
| Playwright E2E | 68 / 68 | **68 / 68** |
| `pnpm build` | 31 apps | 31 apps |
| `pnpm typecheck` | clean | clean |
| `pnpm lint --max-warnings=0` | clean | clean |
| Lighthouse mobile hub: A11y | 94 | **94** |
| Lighthouse mobile hub: Best Practices | 100 | **100** |
| Lighthouse mobile hub: SEO | 91 | **91** |
| Apps with `data-theme` + `data-engine` on body | 0 | **31 / 31** (verified via bundle grep) |

## What landed

### Font infrastructure (self-hosted, CSP unchanged)

7 Arabic+Latin font families, vendored as WOFF2 in `packages/ui/src/fonts/`:

| Family | Weights | Where used |
|---|---|---|
| Amiri | 400 / 700 | Islamic + classical apps (seerah-quiz, in-his-place, history-secrets) |
| Cairo | 400 / 700 | default editorial body (Thamanya stand-in) |
| Reem Kufi | 400 / 700 | display kufi for auctions / voting (knowledge-auction, what-if, impossible-choice) |
| Tajawal | 400 / 700 | clear sport / game (guess-saudi-player, matchday-coach, thinking-compass) |
| IBM Plex Sans Arabic | 400 / 600 | news / business / detective (news-detective, consultant-test, missing-clue, unknown-suspect) |
| El Messiri | 400 / 700 | story / timeline (today-history, time-traveler, crossroads, history-court, who-is-wrong, odd-archive, wisdom-index, logic-judge, last-minute-decision) |
| Saudi MOC | 400 / 700 | Saudi institutional (saudi-history-quiz, saudi-time-machine, predict-the-decision, national-memory, saudi-mood-map, if-minister, decision-council, diplomat-test) |

Total: 26 WOFF2 files, **644 KB on disk**, lazily fetched per Unicode subset (typical app loads ≤ 80 KB of fonts).

> **Note on "Thamanya":** No public Arabic font by that name exists. Thamanya.com itself uses Plus Jakarta Sans (Latin only). Substituted with **Cairo** — the closest free Arabic editorial sans matching the brand register.

### Theme contract

- Each app sets `<body data-theme="<slug>" data-engine="<engine>">` via `applyTheme()` from `@mofeed/ui`.
- Each app provides `apps/<slug>/src/theme.css` declaring `--t-*` overrides.
- Shared `@mofeed/ui` shell reads `var(--t-<name>, var(--mf-<name>))` so any app without a theme stays vanilla.
- Background motif is a tiny inline `data:image/svg+xml` URI, opacity- and size-tuned per app.

### Engine-grouped motion (8 variants)

In `packages/ui/src/themes/motion.css`, gated by `@media (prefers-reduced-motion: no-preference)`:

| Engine | Motion grammar |
|---|---|
| quiz | page-enter rise + choice press scale |
| decision / scenario | card fade-up |
| voting | vote bar fill from inline-start |
| timeline | dot march |
| scenario | page-turn (subtle 3D rotateY) |
| clue | typewriter reveal |
| auction | rolling-digit odometer |
| static | hub — page-enter rise only |

### The 30 themes (final mapping)

| slug | palette | display | body | dark mode |
|---|---|---|---|---|
| hub | indigo / cream gallery | Cairo | Cairo | auto |
| seerah-quiz | sage parchment | Amiri | Naskh | — |
| today-history | parchment sepia | El Messiri | Cairo | — |
| saudi-history-quiz | sand emerald | Saudi | Cairo | — |
| guess-saudi-player | pitch green + gold | Tajawal | Tajawal | — |
| if-minister | navy sand | Saudi | Cairo | — |
| history-court | brass oak | El Messiri | Cairo | — |
| news-detective | newsprint + ink red | Plex Arabic | Plex Arabic | — |
| last-minute-decision | warning amber | El Messiri | Cairo | — |
| knowledge-auction | dark wine + gold | Reem Kufi | Cairo | always dark |
| time-traveler | violet dusk | El Messiri | Cairo | always dark |
| decision-council | senate blue + gold | Saudi | Cairo | — |
| in-his-place | amber parchment | Amiri | Cairo | — |
| logic-judge | slate + cyan | El Messiri | Cairo | — |
| saudi-time-machine | turquoise + sand | Saudi | Saudi | — |
| crossroads | road grey + sky | El Messiri | Cairo | — |
| who-is-wrong | dual red + neutral | El Messiri | Cairo | — |
| consultant-test | corporate teal | Plex Arabic | Cairo | — |
| history-secrets | deep purple + gold | Amiri | Cairo | always dark |
| predict-the-decision | emerald + sand | Saudi | Cairo | — |
| matchday-coach | pitch green | Tajawal | Tajawal | always dark |
| what-if | violet + orange | Reem Kufi | Cairo | — |
| thinking-compass | compass blue + gold | Tajawal | Cairo | — |
| impossible-choice | crimson + navy | Reem Kufi | El Messiri | — |
| odd-archive | museum cabinet + brass | El Messiri | Cairo | — |
| missing-clue | noir + red | Plex Arabic | Plex Arabic | always dark |
| unknown-suspect | noir + sepia | Plex Arabic | Plex Arabic | always dark |
| wisdom-index | sage + gold | El Messiri | Cairo | — |
| diplomat-test | grey + gold | Saudi | Cairo | — |
| saudi-mood-map | warm sun + sky | Saudi | Saudi | — |
| national-memory | patriot green + gold | Saudi | Saudi | — |

5 apps go full-dark by default: knowledge-auction, time-traveler, history-secrets, matchday-coach, missing-clue, unknown-suspect. Each pairs a dark surface with a high-contrast accent and reads cleanly in WCAG-AA terms.

### Files changed

```
+ packages/ui/src/fonts/                26 WOFF2 files (~644 KB)
+ packages/ui/src/themes/fonts.css      @font-face declarations
+ packages/ui/src/themes/base.css       --t-* token contract + motif layer
+ packages/ui/src/themes/motion.css     8 engine motion variants
+ packages/ui/src/index.ts              applyTheme() helper
+ packages/ui/src/components.tsx        Hero now accepts {variant, eyebrow, motif}
+ packages/ui/src/styles.css            @imports themes, adds .mf-hero variant CSS
+ apps/<slug>/src/theme.css             ×31 (30 apps + hub)
+ apps/<slug>/src/main.tsx              ×31 patched to import theme + applyTheme()
+ docs/superpowers/specs/2026-05-16-30-themes-design.md  the spec
+ docs/audits/2026-05-16-30-themes-audit.md              this file
```

Build sizes per-app: CSS jumped from ~6 KB → ~17-21 KB (themes are inline data URIs). JS unchanged (~152 KB). No new dependencies.

## Risks left open

- The two oldest dark themes (knowledge-auction, history-secrets) flash a light-cream background for a tick during the initial paint while CSS loads — only visible on slow throttling. Fix path: inline a small `<style>` block in `index.html` that sets the dark bg early. Deferred.
- `data:` URIs for motifs are tiny (≤ 1 KB each gzipped) but tile the entire viewport — on very large screens (>2k px) the pattern can look pixelated. Acceptable for mobile-first audience.
- `font-display: swap` causes a brief FOUT (flash of unstyled text) while WOFF2 downloads — by design, keeps content visible.

## Re-validation steps for anyone picking this up

```bash
pnpm install
pnpm build && pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e          # 68 / 68 expected on chromium-desktop + Pixel 5
# Start local preview ports for hub + apps:
# (see docs/audits/2026-05-16-functional-audit.md §"Local runbook")
# Open http://127.0.0.1:4400/ and click through each card.
```
