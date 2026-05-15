# Tech Stack — Research & Decision

Status: **Decided** — Vite + React + TypeScript + Capacitor on a pnpm-workspaces monorepo, deployed to Cloudflare Pages.

This document is Phase 1 of the project plan. Implementation only began after this document was reviewed.

---

## 1. Goal recap

We need a stack that supports:

1. Web-first development
2. Easy conversion to iOS / Android later
3. 30 **independent** mini apps, deployable as separate subdomains
4. Shared UI, layout, SEO, analytics, monetization placeholders
5. Cloudflare Pages hosting
6. Low hosting cost
7. Strong mobile-browser performance (Arabic, RTL)
8. Path to mobile via Capacitor / Expo / RN Web

---

## 2. Option comparison

Scores are 1 (worst) — 5 (best). Weighting is informal; see the rationale below the table.

| Option | Web-first DX | Bundle size / perf | Static deploy fit | Mobile-wrap path | Monorepo fit | Arabic / RTL story | Risk |
|---|---|---|---|---|---|---|---|
| **Vite + React + TS + Capacitor** | 5 | 5 | 5 | 5 (Capacitor) | 5 | 5 | Low |
| Astro + React islands + Capacitor | 5 | 5 | 5 | 3 (Capacitor needs SPA shell) | 4 | 5 | Medium — Capacitor wraps SPAs, not MPAs; you end up running React anyway |
| Next.js static export + Capacitor | 4 | 3–4 | 4 (output: 'export' has quirks) | 4 | 4 | 5 | Medium — heavier framework, opinionated routing, slower cold dev |
| SvelteKit + Capacitor | 4 | 5 | 4 (adapter-static) | 3 (smaller ecosystem) | 4 | 5 | Medium — small team familiarity, fewer shared component libs |
| Ionic React | 3 | 3 | 4 | 5 | 3 | 4 | High — heavy framework, web-first feel is mediocre, opinionated |
| Expo / React Native Web | 3 | 3 | 3 (RNW bundles are larger) | 5 | 3 | 4 | High — RNW is great for native-first projects; we are web-first |

### Why **Vite + React + TS + Capacitor** wins

1. **Web-first feel** — Vite gives instant HMR, plain HTML output, smallest possible bundles. Each mini app builds to a static `dist/` (HTML + JS + CSS) that drops straight into Cloudflare Pages.
2. **Independent apps, shared packages** — pnpm workspaces let each `apps/<slug>` be its own buildable, publishable, and (later) Capacitor-wrappable unit, while reusing `packages/ui`, `packages/content`, etc.
3. **Mobile path** — Capacitor wraps any static SPA into an iOS / Android shell with one config file (`capacitor.config.ts`) and `npx cap add ios|android`. No source rewrite. We keep `packages/mobile` with a shared Capacitor config template.
4. **Cloudflare Pages** — `dist/` is pure static; no SSR runtime needed, no Workers required for Phase 1. Each app subdomain = one Pages project pointing to `apps/<slug>/dist`.
5. **RTL / Arabic** — React + plain CSS variables + `dir="rtl"` on `<html>` is the simplest, most-supported RTL story. No framework-specific RTL plugin needed.
6. **Performance on mobile browsers** — Vite + React 18 + code-splitting + system fonts + minimal JS. Target Lighthouse perf > 90 on 3G mid-tier Android.
7. **Future migration to RN** — If a specific app outgrows web, React knowledge transfers directly to React Native or Expo. Capacitor is the cheap middle step.

### Why not the others

- **Astro** — Excellent for content sites, but mini apps are interactive; we'd ship a React island per app anyway. We lose Astro's MPA win and gain config complexity. Capacitor wants an SPA, not MPA.
- **Next.js static export** — Larger framework, slower cold dev, app-router quirks under `output: 'export'`. Overkill for a 30-app hub of small interactive games. Better fit for SEO-heavy marketing sites.
- **SvelteKit** — Genuinely smaller bundles than React, great Arabic support, but the component ecosystem is narrower (we want to reuse UI patterns across 30 apps), and team familiarity with React is broader.
- **Ionic React** — Web-mobile hybrid, but it imposes a mobile-app look-and-feel. We want each mini app to feel like a snappy web mini-game, not a mobile shell.
- **Expo / React Native Web** — Native-first. We're web-first. RNW's bundles are larger than React DOM, and platform-specific styling overhead is unnecessary when the target is mobile **browsers**, not native shells (yet).

---

## 3. Recommended stack — full picture

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript 5 (strict) | Type safety across shared packages |
| UI framework | React 18 | Ecosystem, hooks, easy mental model |
| Bundler / dev server | Vite 5 | Fastest DX, smallest static output |
| Routing (intra-app) | `react-router-dom` v6 | Standard, tree-shakeable |
| Styling | CSS Modules + CSS variables | No runtime CSS-in-JS overhead; RTL-friendly |
| State (per-app) | React hooks + small `zustand`-style stores when needed | Keep it lightweight |
| Monorepo | pnpm workspaces | Disk-efficient, fast, native workspace support |
| Tests — unit | Vitest | Native to Vite, fast |
| Tests — E2E | Playwright | Multi-browser, mobile emulation |
| Linting | ESLint (with security plugin) + Prettier | Phase 7 security |
| Mobile wrap | Capacitor 6 | Drop-in SPA → iOS/Android |
| Analytics | Pluggable interface; default Plausible (privacy-friendly) | No cookie banner needed |
| SEO | Per-app `<meta>` + JSON-LD via `packages/seo` | Static generated at build |
| Hosting | Cloudflare Pages (one project per app) | Cheap, fast, global CDN |
| CI | GitHub Actions (lint + test + build) | Standard |

---

## 4. Folder layout

```
mofeed-mini-apps/
  apps/
    seerah-quiz/             # one independent Vite app per slug
    today-history/
    ... (30 total)
  packages/
    ui/                       # shared React components: Button, Card, AppShell, RTLProvider
    content/                  # types + loaders for verified content (FactItem schema)
    engines/                  # quiz, decision, voting, timeline, scenario, clue engines
    seo/                      # meta + JSON-LD helpers
    analytics/                # pluggable interface
    testing/                  # vitest + playwright shared config and helpers
    security/                 # input sanitisation helpers
    mobile/                   # Capacitor config template + scripts
  docs/                       # this file and friends
  e2e/                        # Playwright specs (cross-app smoke)
  scripts/                    # repo automation
```

Each `apps/<slug>` has:
```
apps/<slug>/
  package.json
  vite.config.ts
  index.html              # RTL, Arabic <html lang="ar" dir="rtl">
  tsconfig.json
  public/                 # favicon, og image
  src/
    main.tsx
    App.tsx
    content/              # JSON content with full source metadata
    components/           # app-specific UI on top of @mofeed/ui
    __tests__/            # vitest unit tests
```

---

## 5. Deployment strategy

### Cloudflare Pages — one project per app

1. Each app builds to `apps/<slug>/dist/`.
2. Create one Pages project per slug. Build command:
   `pnpm install --frozen-lockfile && pnpm --filter @mofeed/<slug> build`
   Output: `apps/<slug>/dist`.
3. Bind a subdomain: `seerah-quiz.mofeed-mini-apps.example` via Pages → Custom domains.
4. Root domain `mofeed-mini-apps.example` is its own Pages project that builds the **hub landing page** (`apps/hub`, optional Phase 2).

Why per-project (not one project with rewrites)?
- Independent rollouts and rollbacks
- Independent analytics per app
- Smaller bundles (no shared shell forces shared deps)
- Matches the future "each app is its own product" model

### Mobile conversion

When an app is mobile-ready:
1. `pnpm --filter @mofeed/<slug> build`
2. `cd apps/<slug> && npx cap add ios && npx cap add android`
3. `npx cap sync` copies `dist/` into the native shell
4. Open in Xcode / Android Studio to ship

Shared Capacitor config lives in `packages/mobile/capacitor.base.ts` and each app extends it.

See `docs/DEPLOYMENT.md` for the full runbook.

---

## 6. Cost model

Cloudflare Pages free tier:
- 500 builds/month
- Unlimited bandwidth
- Unlimited sites (one per app = 30 projects, well within limits)

Estimated monthly cost for 30 apps, web-only: **$0** until traffic forces a Workers Paid plan upgrade.

Mobile shells: one-time Apple Developer ($99/yr), Google Play ($25 once). Optional, on-demand per app.

---

## 7. What we explicitly rejected and why

- **Server-side rendering** — Not needed for interactive mini games; static is faster and cheaper.
- **Tailwind** — Adds build complexity and large utility surface; CSS variables + modules cover our needs and keep bundles small. Re-evaluate if shared design tokens get unwieldy.
- **Monolithic single SPA** — Would force every visitor to download all 30 apps' code. Independent per-app builds give better perceived performance.
- **Service workers / PWA install banners by default** — Add per app only when the app benefits (e.g., quiz apps that work offline).

---

## 8. Open items for later phases

- Picking a CMS/headless content source if non-developer editors need to add quiz items (currently JSON in-repo).
- Image optimization pipeline (Cloudflare Images) if/when apps add custom artwork.
- Donation / Pro feature gating mechanism — placeholder UI exists in `packages/ui/Footer`.
