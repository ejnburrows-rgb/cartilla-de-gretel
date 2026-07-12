# Teacher CRM Depth + Cloud Security — Audit Report

**Worker:** B (CRM / cloud-security verifier)  
**Branch:** `grok-swarm/crm`  
**Base:** `origin/main` `079aec9` (PR #171 merged CRM depth from #170)  
**Date:** 2026-07-12  
**Screenshots (prior depth sprint, still present):** `generated/crm-depth-qa/` (12 files — mobile 390×844 + desktop 1440×900)  
**This-session logs:** `generated/crm-qa/`

## Terminal status

| Terminal | Status | Evidence |
|----------|--------|----------|
| **CRM_DEPTH** | **CRM_DEPTH_WORKER_COMPLETE** | Features present in source + unit tests + production build chunks + prior browser screenshots |
| **CRM_CLOUD** | **CRM_CLOUD_HARD_BLOCKED** | Missing `E2E_TEACHER_A_PASSWORD`, `E2E_TEACHER_B_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` in process env and no `.env` / `.env.local` in workspace |

---

## PART A — CRM feature verification (code + local tests)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | 24-tile lesson grid + status colors + assigned dot + click-through | **PASS** | `src/features/teacher-crm/components/LessonTileGrid.tsx`; `buildLessonTiles()` in `src/lib/progress-calculation.ts`; `TOTAL_LESSONS = CATALOG.length // 24` in `src/lib/lesson-catalog.ts`; wired on student page `crm.$classId.$studentId.index.tsx`. Unit tests: `progress-calculation.test.ts` (`buildLessonTiles`). Screenshots: `*-03-estudiante-tiles.png`, `*-04-leccion-detail.png`. |
| 2 | Class overview (completion bars, attention list first) | **PASS** | `crm.$classId.index.tsx` — attention section rendered first, then 24 per-lesson bars, roster links. Screenshots: `*-02-clase-overview.png`, `*-06-attention-list.png`. |
| 3 | Students needing attention | **PASS** | `checkNeedsAttention()` (7+ days inactive / low scores) + dashboard `needsAttention()` (3-day + &lt;40% completion). Seed students Diego + Camila flagged. Unit coverage in `progress-calculation.test.ts`. |
| 4 | Drill-down Panel → Clase → Estudiante → Lección | **PASS** | Nested real routes (not modals): `crm.index.tsx` → `crm.$classId.index.tsx` → `crm.$classId.$studentId.index.tsx` → `crm.$classId.$studentId.$lessonId.tsx`. Parent layouts export `<Outlet/>`. Breadcrumbs via `CrmBreadcrumbs.tsx`. |
| 5 | Family report (printable) | **PASS** | `crm.$classId.$studentId.reporte.tsx` — print CSS, branding, progress stats, encouragement tiers. Chunk built: `crm._classId._studentId.reporte.*.js`. Screenshot: `*-05-reporte-familias.png`. |
| 6 | CSV export of class progress | **PASS** | Shared `src/lib/csv-export.ts` (`exportClassProgressCsv` / `exportStudentProgressCsv`); button on class overview + Reportes page. Unit tests: `csv-export.test.ts` (5/5). |
| 7 | Seed demo lane with varied realistic states | **PASS (code)** | `src/lib/seed-data.ts`: 5 students spanning completed / in-progress / inactive / zero-activity; assignment L19 drives assigned blue dot. |
| 8 | Demo mode hard-disabled in production builds | **PASS** | `demoModeAllowed()` requires `import.meta.env.VITE_ALLOW_DEMO_MODE === "true"`. Absent/unset → `isSeedSessionActive()` always false. Teacher `beforeLoad` only bypasses Supabase when seed active. **Dist scan (this session):** no `ALLOW_DEMO_MODE…true` pattern and no `service_role` / `sb_secret_` strings in `dist/`. |

### CRM route map (verified files exist)

```
/cartilla/teacher/crm                              → Panel
/cartilla/teacher/crm/$classId                     → Clase overview
/cartilla/teacher/crm/$classId/$studentId          → Estudiante tiles
/cartilla/teacher/crm/$classId/$studentId/$lessonId → Lección detail
/cartilla/teacher/crm/$classId/$studentId/reporte  → Reporte familias
```

Production build emitted dedicated chunks for all of the above under `dist/assets/crm*`.

---

## PART B — Cloud release / security scripts

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Env vars for cloud E2E | **HARD_BLOCKED** | Process: all four required vars **MISSING**. Files: `.env` / `.env.local` **ABSENT** in repo workspace. GitHub repo secrets **names** include `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (and Vercel tokens) but **no** `E2E_TEACHER_A_PASSWORD` / `E2E_TEACHER_B_PASSWORD`. Secret *values* are not readable from this worker (`gh secret list` names only). |
| 2 | `scripts/e2e-cloud-fixture.mjs` | **Improved this session** | Schema-aligned to migrations: class/student/assignment create → progress via `log_student_progress` RPC (app path; teachers lack INSERT policy on `student_lesson_progress`) → read-back → cleanup. Loads `.env.local` if present. Redacted logs + writes `generated/crm-qa/cloud-e2e-output.txt`. |
| 3 | `scripts/rls-negative-test.mjs` | **Improved this session** | Filters progress by `student_id` (not nonexistent `class_id`). Asserts empty/denied on classes, students, assignments, `student_lesson_progress`, `progress_events`, `assignment_progress`. Blocks cross-teacher UPDATE. Distinct-user check. Redacted log → `generated/crm-qa/rls-output.txt`. |
| 4 | Live cloud E2E (Teacher A) | **NOT RUN (blocked)** | See verbatim log below. |
| 5 | Live RLS negative (Teacher B) | **NOT RUN (blocked)** | See verbatim log below. |

### Verbatim cloud script runs — 2026-07-12 (this session)

```
[e2e-cloud-fixture.mjs]
=== B3 Cloud E2E fixture (Teacher A) ===
Env presence: E2E_TEACHER_A_PASSWORD=MISSING VITE_SUPABASE_URL=MISSING VITE_SUPABASE_PUBLISHABLE_KEY=MISSING
FATAL: E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED
EXIT=1

[rls-negative-test.mjs]
=== B4 RLS Negative Test (Teacher B vs Teacher A) ===
Env presence: A_PW=MISSING B_PW=MISSING URL=MISSING KEY=MISSING
FATAL: E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED
EXIT=1
```

**CRM_CLOUD_HARD_BLOCKED — exact missing vars:**

1. `E2E_TEACHER_A_PASSWORD`
2. `E2E_TEACHER_B_PASSWORD`
3. `VITE_SUPABASE_URL` (local process / `.env.local`)
4. `VITE_SUPABASE_PUBLISHABLE_KEY` (local process / `.env.local`)

**What would unblock:** supply the four env vars (or a local `.env.local` never committed) for two real fixture teachers in the Supabase project, then re-run:

```bat
node scripts/e2e-cloud-fixture.mjs
node scripts/rls-negative-test.mjs
```

Logs land under `generated/crm-qa/`. Prefer also adding `E2E_TEACHER_*_PASSWORD` to GitHub Actions secrets (they are **not** present today) so CI can run B3/B4 with network.

**What this does NOT block:** CRM UI depth (Part A), demo hard-disable, unit tests, typecheck, production build.

---

## QA (this session)

| Check | Result |
|-------|--------|
| `pnpm install` | OK (523 packages) |
| Typecheck (`tsc --noEmit` via `pnpm typecheck`) | Clean (prior full-suite run exit 0; no CRM TS errors observed) |
| CRM unit tests (6 files) | **51/51 passed** — `progress-calculation`, `csv-export`, `student.functions`, teacher `-route.auth`, `release-integration`, `auth-role` |
| Full `pnpm test` | **350 passed**, **1 failed** (`src/routes/__tests__/student-routing.test.tsx` — student join UI textbox; **pre-existing / out of CRM scope**), **2 expected fail** |
| `pnpm build` | **Succeeded** (~56s); CRM route chunks present; dist secret/demo scan clean |
| Cloud E2E | HARD_BLOCKED (missing env) |
| RLS negative | HARD_BLOCKED (missing env) |

---

## Script improvements (this worker)

Compared to the skeleton scripts already on `main` after PR #171:

1. **Schema correctness:** progress write uses `log_student_progress` RPC; progress tables queried by `student_id` / `lesson_id` (no fake `class_id` / `completion_percent` columns).
2. **App-path fidelity:** assignment insert matches `assignments` table; cleanup deletes progress + assignment + student + class.
3. **RLS breadth:** assignment_progress isolation + blocked UPDATE on foreign class + same-user fixture guard.
4. **Ops:** auto-load `.env.local` / `.env` without printing values; redacted email/host logs; durable output under `generated/crm-qa/`.

---

## Honesty note

This report does **not** claim `CRM_CLOUD_COMPLETE`. Cloud E2E and live RLS were **not** executed against Supabase. Any prior claim of cloud complete without credentials/logs is incorrect; this worker re-verified the blocker and improved scripts for the next environment that holds secrets.

---

## OPERATOR-QUEUE (unblock cloud only)

1. Create two fixture teachers in Supabase (confirmed emails) and set passwords as `E2E_TEACHER_A_PASSWORD` / `E2E_TEACHER_B_PASSWORD` (local `.env.local` and/or GitHub Actions secrets — never commit).
2. Add matching optional emails `E2E_TEACHER_A_EMAIL` / `E2E_TEACHER_B_EMAIL` if not using the script defaults.
3. Provide local `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable/anon only) in `.env.local` for script runners outside Vercel/GitHub Actions.
4. Optional: keep `VITE_ALLOW_DEMO_MODE=true` **only** on Vercel Preview — never Production (code already enforces absent = off).
