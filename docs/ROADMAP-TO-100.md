# ROADMAP-TO-100 — La Cartilla de Gretel

The task queue for the autonomous worker (`LOOP-CLAUDE.md`). Each task is a
complete, memory-less prompt: a coding agent with no prior context can pick the
first `Status: NOT STARTED` task and do it. Ordered by priority. `Status:`
values: `NOT STARTED` · `DONE` · `BLOCKED` · `BLOCKED (owner)`.

Rules every task inherits (from `AGENTS.md`): branch off latest `origin/main`;
author `EJN <ejnburrows@gmail.com>`; commit `type: short description`; no
"Co-authored-by"/AI names; never force-push; never hardcode secrets; verify with
real test output or a real screenshot before "done"; never touch
`src/routeTree.gen.ts`, the Gretel animation state machine, or invent art.

Verify bar for every task: `pnpm typecheck && pnpm test && pnpm build` green.

---

## STUDENT SIDE

### S1 — Teacher demo reports show real numbers instead of "—" / "0 mins"
Status: DONE
Files: `src/lib/seed-data.ts` (+ read-only reference `src/lib/teacher.functions.ts`, `src/components/teacher/ReportCard.tsx`)

Background: In demo mode the class report shows "Precisión General: —", "Tiempo
Total: 0 mins", and an all-"—" exercise grid. Root cause: `getSeedClassProgress()`
hardcodes `accuracy: null`, `timeSeconds: 0`, and `perStudentExercise: {}` even
though the seed events (`generateSeedEvents`) already carry real per-student
scores and `time_seconds`. The real Supabase path (`teacher.functions.ts`
`getClassProgress()`) computes these correctly — mirror its aggregation in the
seed path.

Exactly what to change: In `getSeedClassProgress()`, aggregate the seed events
the same way `getClassProgress()` does — accumulate score/total/time per student,
set `accuracy = total > 0 ? score/total : null`, `timeSeconds = summed time`, and
build `perStudentExercise` from the seed exercise events. Do not change
`ReportCard.tsx` or the real path.

Done when: In demo mode (seed teacher `leonore` / `Cartilla2026!`, class `DEMO12`),
the class report's "Precisión General" shows a real % and "Tiempo Total" shows
real minutes, and the "Aciertos por Tipo de Ejercicio" grid shows numbers.
Proof: screenshot of the demo class report with populated numbers + `pnpm test` output.

### S2 — Assert grading across all 24 lessons
Status: DONE
Files: `src/lib/__tests__/` (new or extended test file), read-only: lesson content + grading logic

Background: Only lesson 1 grading was hand-verified in the audit. Add Vitest
coverage that loads each lesson's exercises and asserts a correct answer grades
correct and a wrong answer grades wrong, for all 24 lessons, so a content or
grading regression is caught automatically.

Done when: a test iterates all 24 lessons and asserts grading both ways; it fails
if you deliberately break one lesson's answer key (verify that, then revert).
Proof: `pnpm test` output showing the new tests, plus the deliberate-break check.

### S3 — Scan and remove any residual English in the student-facing UI
Status: DONE
Files: student routes under `src/routes/cartilla/**`, `src/content/student-copy.*`

Background: `AGENTS.md` forbids English text in the student UI (the English
toggle was already removed, #162/#251). Sweep the student screens for any
remaining hardcoded English strings and move them to the Spanish copy source.

Done when: no English user-facing strings remain on student screens; a grep for
common English words in student routes returns only code identifiers/comments.
Proof: before/after grep output + a screenshot of any screen that changed.

---

## TEACHER SIDE

### T1 — Complete the classroom flipchart deck beyond lesson 1
Status: NOT STARTED
Files: flipchart route `src/routes/cartilla/presentar/$n.tsx` + its slide data source

Background: The projector flipchart renders, but lesson 1 showed only "Sheet 1 of
1". Wire the existing page-faithful lesson art/content into multi-slide decks per
lesson using only art already present in `public/cartilla/art/` (no new/invented
art). If a lesson genuinely has only one faithful slide available, leave it and
note which lessons are art-limited.

Done when: lessons with multiple faithful pages present show multiple projector
slides with working next/prev; art-limited lessons are listed in `REPORT.md`.
Proof: screenshots of a multi-slide lesson advancing in the flipchart.

---

## OWNER-BLOCKED (not in the autonomous loop — see docs/OWNER-MANUAL-STEPS.md)

- **Live Supabase run** (teacher/student login, classes, join codes, progress
  sync) — `Status: BLOCKED (owner)`; needs real project credentials + first
  migration apply.
- **Admin cross-teacher dashboard** — `Status: BLOCKED (owner)`; genuinely
  unbuilt, needs owner to confirm scope before building.
- **Welcome splash (#243)** — `Status: BLOCKED (owner)`; held for creative
  sign-off (Gretel alone on approved art; no animal crowd, no new painting).
- **Color the grayscale art** (`abrigo`, `aguja`, `remolino`; and `oruga`,
  `globo` with no clean source) — `Status: BLOCKED (owner)`; auto-coloring is
  forbidden (no invented art). Owner supplies colored scans or they stay
  `pendiente` (correctly falling back per the art-color validator).
