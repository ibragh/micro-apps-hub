# Deployment

We host on **Cloudflare Pages**, one project per mini app, one custom
subdomain per app. The repo is structured so that each `apps/<slug>` can
be built independently and deployed to its own Pages project.

---

## 1. Per-app build

Each app builds to its own static `dist/`:

```bash
# from repo root
pnpm install --frozen-lockfile
pnpm --filter @mofeed/<slug> build
```

Output:
```
apps/<slug>/dist/
  index.html
  assets/...
  _headers       # CSP / security headers (copied by Vite via public/)
  _routes.json   # optional, only if app needs SPA fallback
```

---

## 2. Cloudflare Pages — per-app project setup

For each app (one-time per slug):

1. Go to Cloudflare Dashboard → Pages → **Create a project** → **Connect
   to Git** → pick this repo.
2. Project name: `mofeed-<slug>` (e.g., `mofeed-seerah-quiz`).
3. Production branch: `main`.
4. Build settings:
   - **Framework preset**: None
   - **Build command**:
     ```
     corepack enable && pnpm install --frozen-lockfile && pnpm --filter @mofeed/<slug> build
     ```
   - **Build output directory**: `apps/<slug>/dist`
   - **Root directory**: leave at repo root (`/`)
   - **Environment variables** (Production):
     - `NODE_VERSION` = `20`
     - `VITE_SITE_ORIGIN` = `https://<slug>.mofeed-mini-apps.example`
     - Optional: `VITE_PLAUSIBLE_DOMAIN` per app
5. Save and deploy.

### Custom domains

1. In the project → **Custom domains** → add
   `<slug>.mofeed-mini-apps.example`.
2. Cloudflare auto-provisions the TLS cert.
3. Repeat for each app.

### Why one project per app?

- Independent rollouts, rollbacks, analytics.
- Smaller bundles (no shared shell forcing shared deps).
- Matches "each app is its own product" model.
- Stays within Cloudflare Pages free tier (500 builds/mo, unlimited
  projects).

---

## 3. Security headers

Each app ships a `public/_headers` file. Cloudflare Pages serves it
automatically. Default contents:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://plausible.io; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

If an app uses inline scripts (it shouldn't), update its `_headers` with
a nonce-based CSP.

---

## 4. SPA fallback

Each app uses `react-router-dom` so requests to nested paths must fall
back to `index.html`. Each app ships `public/_redirects`:

```
/* /index.html 200
```

---

## 5. Hub landing page (optional, Phase 2)

A root project at `mofeed-mini-apps.example` listing the 30 apps. To be
implemented under `apps/hub/` later; not required for Phase 1.

---

## 6. CI

`.github/workflows/ci.yml` runs on every push to `main` and on PRs:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test:unit`
5. `pnpm build`
6. `pnpm test:e2e` (Playwright, chromium only on CI to keep it cheap)
7. `pnpm scan:audit` (advisory, non-blocking on low/moderate)

Cloudflare Pages handles deploys directly from Git — CI just gates merges.

---

## 7. Mobile (Capacitor) build, on-demand

For an app that's ready to ship as a mobile shell:

```bash
cd apps/<slug>
pnpm build
npx cap init "<App Name>" "com.mofeed.<slug>" --web-dir=dist
npx cap add ios       # one-time
npx cap add android   # one-time
npx cap sync          # after every web rebuild
```

Then open `ios/App.xcworkspace` in Xcode or `android/` in Android Studio
to build / sign / ship.

A shared base Capacitor config lives in
`packages/mobile/capacitor.base.ts` — each app's `capacitor.config.ts`
spreads it.

---

## 8. Rollback

Cloudflare Pages keeps every deployment. To roll back:

1. Pages → project → **Deployments** → pick a previous successful build
   → **Rollback to this deployment**.

Per-app projects mean a rollback of one app doesn't affect any other.
