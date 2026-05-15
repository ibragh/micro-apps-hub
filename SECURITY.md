# Security Policy

## Reporting a Vulnerability

If you find a security issue in **mofeed-mini-apps**, please report it
**privately** before disclosing publicly.

- Preferred: open a [GitHub Security Advisory](https://github.com/ibragh/micro-apps-hub/security/advisories/new)
  on this repo so we can triage in private.
- Alternative: email the maintainer listed in the repo `CODEOWNERS` (when added).

Please include:
- A clear description of the issue
- Steps to reproduce
- Affected app(s) / package(s)
- Impact (data exposure, XSS, RCE, etc.)

We will acknowledge within **3 business days** and aim to fix or mitigate
critical / high issues within **14 days**.

## Supported Versions

Only the `main` branch is supported. Older deployed builds may receive
fixes on a best-effort basis.

## Security Practices in This Repo

- **No secrets** are committed. Use `.env.local` (gitignored) per app, and
  `.env.example` at the repo root documents required variables.
- **Static-first** — apps build to plain HTML/JS/CSS hosted on Cloudflare
  Pages. No server runtime → no server-side injection surface.
- **No `dangerouslySetInnerHTML`** unless content has been validated by
  `packages/security/sanitize` (see `docs/SECURITY.md`).
- **Input validation** — all user input flows through helpers in
  `packages/security`.
- **No `eval` / `new Function`** — banned by ESLint `security` plugin.
- **Dependency scanning** — `pnpm audit`, OSV-Scanner, Semgrep, secret
  scanning, and license scanning are wired into `pnpm scan:all`.
- **Strict CSP** is set per app in the deployed Cloudflare Pages
  `_headers` file (see `docs/DEPLOYMENT.md`).

## Out of Scope

- Self-hosted Cloudflare account or DNS misconfiguration.
- Third-party services configured outside this repo (e.g., analytics
  provider account security).
- Social engineering of project maintainers.

See `docs/SECURITY.md` for the full security posture and scan results.
