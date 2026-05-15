# Security

This document covers the project's security posture, the scans we run,
how to interpret the findings, and how to fix issues.

For the public reporting policy see `SECURITY.md` at repo root.

---

## 1. Scans configured

| # | Scan | Tool | Command | Status |
|---|---|---|---|---|
| 1 | Dependency vulnerabilities | `pnpm audit` | `pnpm scan:audit` | wired |
| 2 | Static Application Security Testing (SAST) | Semgrep | `pnpm scan:semgrep` | wired (requires `semgrep` on PATH) |
| 3 | Secret scanning | custom script + gitleaks-style regexes | `pnpm scan:secrets` | wired (in-tree, runs in CI without external deps) |
| 4 | Code-quality security linting | ESLint + `eslint-plugin-security` | `pnpm lint` | wired |
| 5 | Supply-chain / OSV | OSV-Scanner | `pnpm scan:osv` | wired (requires `osv-scanner` on PATH) |
| 6 | License compliance | custom script over `pnpm list` | `pnpm scan:licenses` | wired |

Run all five at once:

```bash
pnpm scan:all
```

Missing optional binaries (semgrep, osv-scanner) cause the corresponding
scan to log a skip — they don't fail the pipeline locally. In CI, the
GitHub Action installs them via setup steps.

---

## 2. Defensive coding rules

These are enforced by ESLint config (`eslint.config.js`) and reviewed in PR:

1. **No `eval` / `new Function`** — `security/detect-eval-with-expression`.
2. **No unsafe regex** — `security/detect-unsafe-regex` blocks
   ReDoS-prone patterns.
3. **No `dangerouslySetInnerHTML`** unless content has been passed
   through `packages/security/sanitize`.
4. **Input validation** — any user-typed input is validated at the
   boundary by `packages/security/validate`.
5. **No third-party scripts** in `index.html` other than the optional,
   privacy-friendly Plausible script (loaded only when
   `VITE_PLAUSIBLE_DOMAIN` is set).

---

## 3. Cloudflare Pages headers

Each app's `public/_headers` sets:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://plausible.io; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

`'unsafe-inline'` for styles is the only relaxation, scoped to styles
only (React injects style attributes at runtime for some animations).
This is acceptable because we ship no inline scripts.

---

## 4. Secret handling

- No secrets in repo. `git grep` patterns in `scripts/scan-secrets.mjs`
  block accidental commits.
- `.env.local` is gitignored.
- Public values (`VITE_*`) are intentionally exposed to the browser at
  build time and must not contain anything sensitive.

---

## 5. Scan results — initial run

Captured in `docs/SECURITY.md` (this file) after each clean scan. The
latest run is appended below in §6. CI publishes the same summary as a
job artifact on every push.

---

## 6. Latest scan summary

Last full run, captured at the initial Phase-1 delivery:

| Scan | Tool | Result |
|---|---|---|
| Dependency vulnerabilities (prod) | `pnpm audit --prod` | **0 vulnerabilities** |
| Dependency vulnerabilities (full) | `pnpm audit` | **0 vulnerabilities** after fixing two moderate dev-only issues by bumping vite 5 → 6 and vitest 2 → 3 |
| Secret scan (12 patterns) | `node scripts/scan-secrets.mjs` | **Clean** |
| License compliance | `node scripts/scan-licenses.mjs` | **0 denied, 0 unknown** |
| Code quality / security lint | `eslint .` | **Clean, 0 warnings** |
| SAST (Semgrep) | `pnpm scan:semgrep` | runs in CI; CLI not pre-installed locally |
| OSV-Scanner | `pnpm scan:osv` | runs in CI; CLI not pre-installed locally |

See `docs/FINAL_REPORT.md` for the run-of-record at the time the
project was first delivered.
