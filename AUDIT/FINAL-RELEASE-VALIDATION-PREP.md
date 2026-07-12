# Final Release Validation — PREPARATION (Worker F)

**Terminal for this phase:** `FINAL_VALIDATION_PREP_COMPLETE`  
**Not yet:** final validation results, production pass/fail, or release sign-off.

| Field | Value |
|---|---|
| Worker | F — Independent release validator |
| Phase | READ-ONLY preparation only |
| Branch | `grok-swarm/validation` |
| Base inspected | `main` @ `079aec9aa65f06c82fe756232a522bc35e5d5027` |
| Prep date (UTC) | 2026-07-12 |
| Repo | `ejnburrows-rgb/cartilla-de-gretel` |

## Scope of this phase

Allowed artifacts only:

- `scripts/validation/**`
- `scripts/final-release-qa.mjs`
- `generated/final-release-qa/` (checklists + empty result slots)
- `AUDIT/FINAL-RELEASE-VALIDATION-PREP.md` (this file)

Product lanes (workbook / CRM / activities / art / Gretel) were **not** modified.

---

## 1. Package scripts (from `package.json`)

| Script | Purpose for final QA |
|---|---|
| `pnpm dev` / `vite dev` | Local interactive exploration only |
| `pnpm build` | Gate: `check:sanity` → `validate:content` → `vite build` |
| `pnpm preview` | Local prod bundle at `127.0.0.1` (default Vite 4173) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit suite |
| `pnpm validate:content` | Content validator (`scripts/validate-content.mjs`) |
| `pnpm validate:activities-content` | Activities content validator |
| `pnpm validate:manifest` | Workbook manifest validator |
| `pnpm check:assets` | Asset path scan (`scripts/check-assets.ts`) |
| `pnpm check:sanity` | Assets + lessons (`scripts/check-assets-and-lessons.ts`) |

**Notes for post-integration run:**

- Local tooling prefers **pnpm** (`pnpm-lock.yaml` present); several CI workflows use **npm** (`npm ci` / `npm install`). Final validation should record which package manager was used.
- Existing integration browser QA: `scripts/release-browser-qa.mjs` (Playwright; viewports 390×844 / 1440×900).
- Cloud/E2E shells exist and are env-gated: `scripts/e2e-cloud-fixture.mjs`, `scripts/e2e-login-test.mjs`, `scripts/rls-negative-test.mjs`.

---

## 2. CI workflows (`.github/workflows/`)

| Workflow file | Trigger | What it proves |
|---|---|---|
| `cartilla-ci.yml` | PR + push `main` + manual | `npm install` → typecheck → lint → build |
| `verify.yml` | push `main` + manual | `npm ci` → typecheck → lint → build |
| `production-deploy.yml` | push `main` + manual | Same verify chain; **does not deploy** — notes that Vercel Git integration deploys `main` |
| `deploy.yml` | push `main` + manual | Build with `GITHUB_PAGES=true` → GitHub Pages artifact. Pages API currently **404** (site not configured / not live). Do **not** treat GH Pages as production. |
| `build-probe.yml` | push `main` | Build log probe + optional PDF commit; exits 0 even on build fail (diagnostic). |
| `supabase-migrations.yml` / `supabase-pr-check.yml` | Supabase-related | Migrations / PR checks (separate from SPA smoke). |
| Others (`extract-art`, `import-book-pdf`, `polish-pdf`, `regenerate-command-center`, `diag-pushback`) | Ops / content | Not primary release smoke gates. |

**CI gaps to re-check after integration:**

1. No Playwright / route-smoke job in CI today.
2. No package-manager lock alignment (npm vs pnpm).
3. Green CI ≠ cloud features work (needs `VITE_SUPABASE_*`).
4. Homepage HTTP 200 ≠ student/teacher deep routes healthy.

---

## 3. Vercel configuration

From `vercel.json`:

| Setting | Value |
|---|---|
| Framework | `vite` |
| Build command | `npm run build` |
| Output | `dist` |
| SPA rewrite | `/(.*) → /index.html` |
| Git auto-deploy | `main: true` only |
| Headers | Cache for `/book/book.pdf`, `/assets/*` |

### Real URL patterns (verified via `gh` + HTTP headers)

| Kind | Pattern / example | Notes |
|---|---|---|
| **Production alias** | `https://cartilla-de-gretel.vercel.app` | Repo `homepage` / README **Live** URL. HEAD `/` and `/cartilla` returned **200** with `X-Vercel-*` (2026-07-12). **Does not prove** deep app surfaces. |
| **Per-deployment production URL** | `https://cartilla-de-gretel-<hash>-ejns-projects-1b938dd2.vercel.app` | e.g. prod deployment for `079aec9` used a deployment-specific host. |
| **Preview (PR/branch)** | Same host pattern, environment `Preview` | Use Vercel/GitHub deployment `environment_url`, not the production alias. |
| **Vercel dashboard** | `https://vercel.com/ejns-projects-1b938dd2/cartilla-de-gretel/...` | Commit status context `Vercel`. |
| **GitHub Pages** | (none live) | `deploy.yml` exists; Pages API 404 — ignore for release smoke unless re-enabled. |

**Final validation rule:** always pin `QA_BASE_URL` to an explicit deployment URL (preview after integration PR, or production alias only when validating production). Screenshot of marketing homepage alone is insufficient.

---

## 4. Route checklist source of truth

Prepared under:

- [`generated/final-release-qa/ROUTE-CHECKLIST.md`](../generated/final-release-qa/ROUTE-CHECKLIST.md)

**Important route-map honesty:**

- File-based routes under `src/routes/**` are the live SPA surface.
- `src/lib/cartilla-routes.ts` still lists aspirational `/cartilla/maestro/*` and `/cartilla/familia/*` builders that **do not** match the current teacher/student file routes (`/cartilla/teacher/*`, `/cartilla/student/*`). Final QA must exercise **file routes**, not only the helper map.
- Family report for launch CRM is:  
  `/cartilla/teacher/crm/$classId/$studentId/reporte`  
  CSV export is UI action (`src/lib/csv-export.ts` on reportes / class overview), not a dedicated path.

---

## 5. Viewport checklist

Prepared under:

- [`generated/final-release-qa/VIEWPORT-CHECKLIST.md`](../generated/final-release-qa/VIEWPORT-CHECKLIST.md)

| Name | Size | Role |
|---|---|---|
| Mobile | **390 × 844** | Phone / iPhone-class student use |
| Desktop | **1440 × 900** | Classroom teacher + wide student |

Matches existing `scripts/release-browser-qa.mjs`.

---

## 6. Scripts prepared for post-integration

| Path | Role when final validation runs |
|---|---|
| `scripts/final-release-qa.mjs` | Orchestrator: optional build/preview hook + route smoke + asset checks; writes `generated/final-release-qa/results/` |
| `scripts/validation/check-asset-integrity.mjs` | Manifest + public file existence for faithful art / known public paths |
| `scripts/validation/check-missing-references.mjs` | Scan JSON/TS/TSX for `/cartilla/...` and `/art/...` refs missing under `public/` |
| `scripts/validation/routes.mjs` | Shared route list for smoke (importable) |
| `generated/final-release-qa/CI-VERCEL-FINDINGS.md` | Condensed CI/Vercel findings |
| `generated/final-release-qa/RESULTS-SLOT.md` | Empty slot template — **no fake pass/fail filled in** |

Reuse after integration:

```bash
# Local prod bundle
pnpm build
pnpm preview --host 127.0.0.1 --port 4173

# Asset / reference checks (no browser)
node scripts/validation/check-asset-integrity.mjs
node scripts/validation/check-missing-references.mjs

# Full orchestrated smoke (browser + assets)
set QA_BASE_URL=http://127.0.0.1:4173
node scripts/final-release-qa.mjs

# Against a real Vercel preview (after integration PR deploys)
set QA_BASE_URL=https://cartilla-de-gretel-<hash>-ejns-projects-1b938dd2.vercel.app
node scripts/final-release-qa.mjs
```

---

## 7. Preconditions for **final** validation (after swarm integration)

Do **not** claim release readiness until all of the following are true:

1. Integration branch/PR exists and merges product lanes onto current `main`.
2. CI green on that PR (`typecheck` + `lint` + `build` at minimum).
3. Explicit preview (or production) URL recorded; deep routes smoke-tested at **both** viewports.
4. Asset integrity + missing-reference scripts run with reports under `generated/final-release-qa/results/`.
5. Teacher CRM paths requiring auth exercised with real or documented fixture credentials — empty shell alone is not a pass.
6. CSV export + family reporte drill-down exercised when class/student data available (local seed or cloud).
7. Cloud blockers from prior audits (`CRM_CLOUD_HARD_BLOCKED` / missing Supabase env) re-evaluated honestly — not assumed fixed.

---

## 8. Readiness summary (prep only)

| Item | Status |
|---|---|
| CI/Vercel inspection | Done (prep) |
| Production / preview URL patterns | Documented |
| Route checklist | Created |
| Viewport checklist | Created |
| Asset / missing-ref script stubs | Created |
| Final browser/cloud validation | **Not run** (waiting on integration) |
| Release sign-off | **Not claimed** |

**Terminal:** `FINAL_VALIDATION_PREP_COMPLETE`
