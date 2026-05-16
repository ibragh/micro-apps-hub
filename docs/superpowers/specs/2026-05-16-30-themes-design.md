# Design — 30 Topical Themes Across the Mini Apps

Status: **Approved** · Date: 2026-05-16 · Brainstormed in-session, user delegated final approval to the assistant.

## Why

The current UI is correct but generic — one accent colour per app, shared font, identical hero. Goal: every app should _feel_ like its topic from the first second. Add seven Arabic fonts (Thamanya + Saudi MOC font + Amiri + Reem Kufi + Tajawal + IBM Plex Sans Arabic + El Messiri), give each app a topical palette, motif, and motion grammar.

Hard constraints:

- Must not regress 130 unit tests / 68 E2E / Lighthouse a11y ≥ 90 on hub
- CSS-variable driven (no Tailwind, no CSS-in-JS runtime)
- RTL correctness preserved (`inset-inline-*`, `text-align: start`, etc.)
- CSP stays strict (`font-src 'self'` only — all fonts self-hosted)
- Manifest-driven so future apps inherit the system

## Font system

Seven WOFF2 families vendored under `packages/ui/src/fonts/`, subset to Arabic + Latin glyphs. Target ≤60 KB per family.

| Family | Source | Role |
|---|---|---|
| Thamanya | thamanya.com (per user) | default body / general |
| Saudi MOC | engage.moc.gov.sa | Saudi cultural / institutional |
| Amiri | Google Fonts (Amiri 1.000) | classical / Islamic |
| Reem Kufi | Google Fonts | display, geometric |
| Tajawal | Google Fonts | clear, sport / quiz |
| IBM Plex Sans Arabic | Google Fonts | news / business / detective |
| El Messiri | Google Fonts | semi-cursive, story / history |

`fonts.css` declares all seven with `@font-face` + `font-display: swap`. Each app's `theme.css` only references the two it actually uses, so unused fonts are not preloaded.

## Theme token contract

Each app sets `<body data-theme="<slug>">` and supplies overrides in `apps/<slug>/src/theme.css`. The shared `@mofeed/ui` keeps the existing `--mf-*` tokens as fallbacks so removing a theme never breaks the shell.

```css
:root[data-theme="<slug>"], body[data-theme="<slug>"] {
  --t-bg, --t-bg-soft, --t-surface,
  --t-text, --t-text-muted,
  --t-accent, --t-accent-strong, --t-accent-soft,
  --t-border, --t-shadow,
  --t-font-display, --t-font-body, --t-font-scale,
  --t-radius-card, --t-radius-choice,
  --t-motion-duration, --t-motion-ease,
  --t-motif-url, --t-motif-opacity, --t-motif-position;
}
```

`@mofeed/ui/styles.css` reads `var(--t-<name>, var(--mf-<name>))` so the shell falls back gracefully.

## Engine-grouped motion

`packages/ui/src/themes/motion.css` defines eight engine classes that apps opt into via `data-engine="<engine>"`. All wrapped in:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

| Engine | Motion |
|---|---|
| quiz | number flip on counter, choice scale 0.96→1 on press |
| decision | scenario card fades out/up while next fades in |
| voting | vote bars fill from start (220ms), count-up on percent |
| timeline | dot marches along vertical rail; events stagger-fade |
| scenario | page-turn (3D rotate-Y subtle, 280ms) between scenes |
| clue | typewriter reveal of next clue (`@keyframes steps`) |
| auction | rolling-digit odometer on bid |
| static | for hub — no motion beyond `prefers-reduced-motion` baseline |

## The 30 themes — palette + motif + fonts + motion

| slug | palette name | motif | display font | body font | motion |
|---|---|---|---|---|---|
| seerah-quiz | sage parchment | 8-fold arabesque star | Amiri | Naskh | quiz |
| today-history | parchment sepia | timeline rail | El Messiri | Thamanya | timeline |
| saudi-history-quiz | sand emerald | palm-and-swords echo | Saudi MOC | Thamanya | quiz |
| guess-saudi-player | pitch green gold | football silhouette | Tajawal | Tajawal | clue |
| if-minister | navy sand | ministry seal | Saudi MOC | Thamanya | decision |
| history-court | brass oak | scales | El Messiri | Thamanya | voting |
| news-detective | ink black red | typewriter row | IBM Plex Sans Ar | IBM Plex Sans Ar | clue |
| last-minute-decision | warning amber dark | clock face | El Messiri | Thamanya | decision |
| knowledge-auction | gold wine | gavel | Reem Kufi | Thamanya | auction |
| time-traveler | violet dusk | clock-hands | El Messiri | Thamanya | scenario |
| decision-council | senate blue gold | columns | Saudi MOC | Thamanya | decision |
| in-his-place | amber parchment | scroll | Amiri | Thamanya | scenario |
| logic-judge | slate cyan | proof tree | El Messiri | Thamanya | quiz |
| saudi-time-machine | turquoise sand | dial | Saudi MOC | Saudi MOC | timeline |
| crossroads | road grey sky | fork in road | El Messiri | Thamanya | scenario |
| who-is-wrong | dual red blue | balance | El Messiri | Thamanya | voting |
| consultant-test | corporate teal | bar chart | IBM Plex Sans Ar | Thamanya | decision |
| history-secrets | deep purple gold | keyhole | Amiri | Thamanya | timeline |
| predict-the-decision | emerald sand | palm | Saudi MOC | Thamanya | quiz |
| matchday-coach | pitch green white | tactics board | Tajawal | Tajawal | decision |
| what-if | violet orange | branching paths | Reem Kufi | Thamanya | scenario |
| thinking-compass | compass blue gold | compass rose | Tajawal | Thamanya | decision |
| impossible-choice | crimson navy | tipping scale | Reem Kufi | El Messiri | voting |
| odd-archive | museum cabinet brass | cabinet | El Messiri | Thamanya | timeline |
| missing-clue | noir black red | magnifier | IBM Plex Sans Ar | IBM Plex Sans Ar | clue |
| unknown-suspect | noir sepia | suspect line-up | IBM Plex Sans Ar | IBM Plex Sans Ar | clue |
| wisdom-index | sage gold | tree | El Messiri | Thamanya | decision |
| diplomat-test | grey gold | handshake | Saudi MOC | Thamanya | decision |
| saudi-mood-map | warm sun sky | radial sunburst | Saudi MOC | Saudi MOC | voting |
| national-memory | patriot green gold | shield | Saudi MOC | Saudi MOC | quiz |
| hub | neutral premium | gallery grid | Thamanya | Thamanya | static |

## File-level architecture

```
packages/ui/src/
  fonts/                      # 7 .woff2 files + LICENSE notices
  themes/
    fonts.css                 # @font-face declarations
    base.css                  # --t-* defaults that delegate to --mf-*
    motion.css                # 8 engine classes + reduced-motion guard
  motifs/                     # 30 small SVG files (~3-8 KB each)
  Hero.tsx                    # extended: takes variant + motif slug
  components.tsx              # consumes --t-* tokens via styles.css

apps/<slug>/src/
  theme.css                   # data-theme="<slug>" overrides
  App.tsx                     # imports theme.css, sets data-theme + data-engine
```

Manifest gets two new fields per app (already implicit, now explicit):

```js
theme: '<slug>',  // matches slug
fonts: { display: 'amiri', body: 'naskh' },
```

## Scaffolder changes

`scripts/scaffold-apps.mjs` extended so:

- New apps get a stub `theme.css` import in their `App.tsx`
- `data-theme="<slug>"` and `data-engine="<engine>"` applied to body via `useEffect` in `main.tsx` template

## Test/regression strategy

- Existing 130 unit + 68 E2E specs are theme-agnostic — they assert text + roles, not pixel layouts. No expected regressions.
- Add one **theme-smoke E2E** that for each tier-1 app verifies:
  - `document.body.dataset.theme === '<slug>'`
  - `getComputedStyle(body).getPropertyValue('--t-accent')` is non-empty
  - the page's `font-family` resolves to the declared display font
- Lighthouse a11y must stay ≥ 90 on hub and ≥ 85 on the 3 sampled apps post-implementation.

## Wave sequencing (commit per wave)

| Wave | Scope | Stop-able? |
|---|---|---|
| W1 | Font infra (7 WOFF2s + `fonts.css` + `base.css` + `motion.css`) + hub re-theme | Yes — hub looks new |
| W2 | 5 flagship apps re-themed (seerah-quiz, today-history, saudi-history-quiz, knowledge-auction, news-detective) + new `<Hero variant>` | Yes — 5 distinct themes shipped |
| W3 | Engine-grouped motion live + 7 Saudi-cultural apps themed | Yes — half done |
| W4 | Remaining 17 apps themed | Yes — all 30 done |
| W5 | Chrome DevTools sweep + Lighthouse spot checks + theme-smoke E2E + commit + merge to main | Done |

## Out of scope (explicit)

- Light/dark theme switcher (themes ship one variant; dark-mode auto-handles via existing `@media (prefers-color-scheme: dark)` in `--mf-*` fallbacks)
- Per-app icon font (motifs are SVG, not icon-font)
- Hand-tuned typography per-app beyond display vs body
- New animations beyond the eight engine variants
- Tailwind, CSS-in-JS runtime, or any new dependency family
