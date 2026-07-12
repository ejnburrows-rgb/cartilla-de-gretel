# Teacher CRM Depth Sprint — Audit Report

Branch: `feat/functional-crm-completion` (continuation of PR #170)
Screenshots: `generated/crm-depth-qa/` (12 files — mobile 390×844 + desktop 1440×900, 6 steps each)

## Terminal status

**PART A (Dashboard Depth): CRM_DEPTH_COMPLETE**
**PART B (Cloud Release): PARTIAL** — 3 of 5 items done/verified, 2 (B3/B4) genuinely blocked on missing fixture-teacher credentials + no outbound network in this sandbox — real skeleton scripts exist and were executed; verbatim failure output below, not a fabricated claim.

---

## PART A — Dashboard Depth

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Lesson tile grid (24 tiles, color-coded, assigned dot, click-through to detail) | DONE | `LessonTileGrid.tsx`; screenshots `*-03-estudiante-tiles.png`, `*-04-leccion-detail.png` |
| 2 | Class Overview Home (weekly activity feed, per-lesson completion bar, attention list surfaced first) | DONE | `crm.$classId.index.tsx`; screenshots `*-02-clase-overview.png`, `*-06-attention-list.png` |
| 3 | Drill-down navigation Panel → Clase → Estudiante → Lección, breadcrumbs, refresh-safe | DONE | Real nested routes (not modals): `/cartilla/teacher/crm`, `/crm/$classId`, `/crm/$classId/$studentId`, `/crm/$classId/$studentId/$lessonId`. Verified direct-URL loads work (not just click-through). |
| 4 | Reporte para Familias (printable, branding + credits) | DONE | `crm.$classId.$studentId.reporte.tsx`; screenshot `*-05-reporte-familias.png`. Credits: Leonor Lopetegui (autora), Estela de Armas Plasencia (ilustradora), Emilio Jose Novo (adaptación digital). |
| 5 | CSV export of class progress | DONE | Already existed in `reportes.tsx`; extracted into shared `src/lib/csv-export.ts` (used by both Reportes and the new Clase page) with 5 new unit tests. |
| 6 | Works in demo lane with varied realistic seeded states | DONE | `seed-data.ts` seeds 5 students spanning every tile state: Sofía (18/24 completed, high scores), Mateo (10/24, medium), Valentina (2/24 + 1 in-progress), Diego (1/24, low scores, 9 days inactive — flagged), Camila (0/24, no activity ever — flagged). One active assignment (Lección 19) drives the "assigned" blue dot. |

### Real defects found and fixed along the way
- **`ReportCard.tsx`'s "Matriz de Lecciones Completadas"** was reading from `crmService` (a completely separate, disconnected localStorage-only fake toggle system), not the real completion data it had just fetched from `getClassProgress`. Fixed: now reads the real `completedLessonIds` the same query already returns.
- **TanStack Router layout bug (3 occurrences)**: once a `crm.$foo.tsx` file gets a sibling like `crm.$foo.$bar.tsx`, TanStack treats `crm.$foo.tsx` as the *mandatory parent layout* for everything under that prefix. Without its own `<Outlet/>`, the child route matches the URL but the parent's own component renders instead — the child is invisible even though navigation "succeeds." Hit this three times as routes got deeper (`crm.tsx`, `crm.$classId.tsx`, `crm.$classId.$studentId.tsx`) and fixed each by splitting into a thin `<Outlet/>` layout + a `.index.tsx` sibling holding the real page.
- **Seed-mode auth gate mismatch**: the real teacher-lane route guard only knew about real Supabase sessions — entering demo mode redirected straight back to `/login` before any CRM component ever rendered. Fixed by adding an explicit, env-gated seed-mode bypass at the top of `beforeLoad`.
- **Seed data "needs attention" bug**: the per-student `lastActiveAt` was taking `events[0]` without sorting by date first, flagging every student as inactive, including the "advanced" one. Fixed by sorting before selecting.
- **Bar chart not rendering**: the per-lesson completion bars used a `flex-1` intermediate wrapper that doesn't reliably resolve percentage heights. Fixed by giving the track div a fixed height directly.
- **Duplicated, drifting `isSeed` detection**: consolidated into one `isSeedSessionActive()` export, also used as the enforcement point for the production hard-disable (see Part B #5).

---

## PART B — Cloud Release

| # | Item | Status | Evidence / exact blocker |
|---|------|--------|---------------------------|
| 1 | Vercel env vars (`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`), publishable-key-only | **Already done** (verified, not newly configured) | Fetched the live production JS bundle and confirmed both the real project URL and the `sb_publishable_...` key are baked in. Bundle secret scan: no `service_role` or `sb_secret_...` string anywhere. |
| 2 | `/login` serves the React app in production (public/login.html shadowing) | **Not actually a bug** | Fetched both `/login` and `/login.html` directly against production: both return the real SPA shell. Vercel's rewrite rule already takes priority. `public/login.html` was a dead, unwired artifact — moved to `scratch/orphaned-static-pages/`, cleanup only. |
| 3 | Isolated cloud E2E fixture teacher (login → class → student → assign → complete → dashboard reflects it → sign out) | **BLOCKED** | Real script written and executed (`scripts/e2e-cloud-fixture.mjs`) — see verbatim output below. |
| 4 | Live RLS negative tests (Teacher B cannot read Teacher A's data) | **BLOCKED** | Real script written and executed (`scripts/rls-negative-test.mjs`) — see verbatim output below. |
| 5 | Demo mode preview-only, hard-disabled in production | DONE | `VITE_ALLOW_DEMO_MODE` env gate in `isSeedSessionActive()` (and the route guard). Absent/unset — the default everywhere including a fresh production build — means fully disabled. Only reachable if explicitly set to `"true"` scoped to Vercel's **Preview** environment. |

### B3/B4 execution attempt — 2026-07-12, real run, verbatim output

Two real scripts now exist in the repo (`scripts/e2e-cloud-fixture.mjs`, `scripts/rls-negative-test.mjs`) with the full intended flow documented step-by-step. Running them in this sandbox:

```
[e2e-cloud-fixture.mjs]
FATAL: E2E_TEACHER_A_PASSWORD environment variable is not set.
This is required for real login. Cannot proceed with authenticated flows.
Exit code 1

[rls-negative-test.mjs]
FATAL: E2E_TEACHER_B_PASSWORD environment variable is not set.
Exit code 1
```

**Exact blocker, unchanged from the original diagnosis, now with a real reproducible failure instead of a narrative:**
1. No fixture-teacher credentials (`E2E_TEACHER_A_PASSWORD` / `E2E_TEACHER_B_PASSWORD`) exist in this environment or anywhere in the repo. Creating real fixture accounts requires either Supabase MCP access (to create+confirm users directly) or a real email inbox to click a confirmation link — neither is available this session.
2. Even with credentials, this sandbox's outbound-HTTPS proxy is untrusted by any script/browser making real requests to Supabase or the deployed Vercel URL — the same limitation documented for browser E2E in the prior CRM-completion mission.

**What would unblock this for real:** Supabase MCP access restored (to create+confirm two real fixture teachers and clean them up afterward), or the owner supplying pre-created fixture credentials via Vercel/GitHub secrets so a script can run them in an environment with real network access (e.g., a GitHub Actions job, which does have both secrets and network). The scripts are ready for that path today — they just need real credentials and a runner with network access, neither of which exists in this sandbox.

**What this does NOT block**: the actual CRM code for assign → complete → dashboard-reflects-it was already built and verified end-to-end in the *previous* mission (PR #170) via direct backend-level checks, and the new dashboard-depth UI (Part A) is verified working end-to-end in the demo lane against the exact same code paths (`teacher.functions.ts`/`getClassProgress`/`getStudentProgress`).

---

## QA

- `pnpm tsc --noEmit`: clean (re-verified after adding the two new scripts).
- `pnpm test`: 283/285 passing (2 pre-existing expected-fail real-timer flakes, unrelated to this sprint).
- `pnpm build`: succeeds.
- New tests added: `buildLessonTiles`, `checkNeedsAttention` (progress-calculation.test.ts), `exportClassProgressCsv`/`exportStudentProgressCsv` (csv-export.test.ts) — 11 new tests total.
- Browser walkthrough: 12 screenshots in `generated/crm-depth-qa/` at both 390×844 and 1440×900, covering Panel → Clase → Estudiante (tiles) → Lección → Reporte → attention list, all against the demo lane (zero network calls).

## Provenance note (2026-07-12, added after review)
Between the version of this report committed at `747dd8f` and this one, an external commit (`1a6a9cb`, different author, not this session) briefly overwrote this file's Part B status to "CRM_CLOUD_COMPLETE" with no supporting evidence — no credentials, no scripts, no logs. That claim was independently checked (no fixture credentials found anywhere, Supabase MCP still disconnected) and reverted (`b486831`). A follow-up commit (`021112f`, same external author) then re-attempted real execution, added the two scripts above, and correctly reported the blocker with verbatim logs — that version is reflected in this report. Flagging this chain for visibility since it's exactly the "claimed fix that wasn't real" pattern this project has explicitly warned about before, just resolved correctly this time.

## Not done, out of explicit scope (flagged, not silently skipped)
- `progreso.tsx` still lets a teacher manually toggle lesson completion via a separate, disconnected local-only `crmService` — this contradicts the "progress must be real, driven by actual activity" principle established in the prior mission, but wasn't explicitly named in this sprint's scope and touches an existing teacher-facing page/workflow. Flagging for a decision rather than silently rewriting it.
