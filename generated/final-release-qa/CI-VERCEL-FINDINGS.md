# CI / Vercel Findings — Prep Snapshot

**Repo:** `ejnburrows-rgb/cartilla-de-gretel`  
**Base SHA:** `079aec9aa65f06c82fe756232a522bc35e5d5027`  
**Prep only — not a release verdict.**

---

## Package / build

| Fact | Detail |
|---|---|
| Local package manager | `pnpm` (`pnpm-lock.yaml` + `pnpm-workspace.yaml`) |
| `package.json` build | `pnpm check:sanity && pnpm validate:content && vite build` |
| Vercel buildCommand | `npm run build` |
| CI install | Mostly `npm ci` / `npm install` (Node 22) |
| Preview script | `vite preview --host 127.0.0.1` |
| SPA hosting | `vercel.json` rewrite all → `index.html` |

**Risk:** npm vs pnpm lock divergence. Final validation should record which tool built the artifact under test.

---

## CI jobs relevant to release

| Workflow | Gate strength |
|---|---|
| `cartilla-ci.yml` | Standard PR/main: typecheck, lint, build |
| `verify.yml` | Same on main |
| `production-deploy.yml` | Verify only; **does not push to Vercel CLI** — relies on Vercel Git |
| `deploy.yml` | GitHub Pages path; Pages site **not found** via API (404) |
| `build-probe.yml` | Diagnostic; may mask failures (`exit 0`) |

**Missing for true release gate:** browser route smoke, asset integrity job, cloud E2E (env secrets).

---

## URL patterns (real)

| Role | URL |
|---|---|
| Production alias | `https://cartilla-de-gretel.vercel.app` |
| Deployment hosts | `https://cartilla-de-gretel-<deploymentId>-ejns-projects-1b938dd2.vercel.app` |
| Project | Vercel team path `ejns-projects-1b938dd2/cartilla-de-gretel` |

Verified 2026-07-12:

- Production deployment environment for `079aec9` exists (GitHub Deployments API).
- HEAD `https://cartilla-de-gretel.vercel.app/` → HTTP 200 + Vercel headers.
- HEAD `https://cartilla-de-gretel.vercel.app/cartilla` → HTTP 200 + Vercel headers.
- **Caveat:** 200 on hub routes is necessary but **not sufficient** proof of workbook/CRM/activity health.

Preview example (prior branch deploy, not current validation branch):

- Environment `Preview` → `https://cartilla-de-gretel-1ymjeowsx-ejns-projects-1b938dd2.vercel.app`

---

## Env vars required for cloud paths

From `.env.example` / README:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Without these, teacher auth, join codes, and cloud progress cannot be release-certified.

---

## How to pick the URL for final QA

1. Open integration PR → wait for Vercel Preview deployment status.  
2. Copy `environment_url` from GitHub Deployments / Vercel status.  
3. Set `QA_BASE_URL` to that URL (never invent).  
4. Only after merge + prod deploy, re-run against `https://cartilla-de-gretel.vercel.app` **and** spot-check a few deep routes.
