# STATUS — La Cartilla de Gretel

Honest current state. Updated 2026-07-26. Read this before starting work.

> **2026-07-26 — admin dashboard is live, and a public hole was closed.**
> - **Cross-teacher admin reads work against the real database** (#355). This
>   was not a wiring job: there was no admin read path at all — every rule was
>   scoped to the signed-in teacher, so the `admin` role saw only its own rows.
>   Six read-only rules were added, plus a missing EXECUTE grant on `has_role`
>   without which the client's role check was refused and *every* real admin was
>   silently treated as not-an-admin. Applied and proven live: admin reads
>   across teachers, cannot write, plain teacher still sees zero foreign rows.
> - **The Dirección page now opens for a real admin** (#361), not just the demo
>   account, and reads live data.
> - **D7 is COMPLETE** (#364). Its last piece, the live "needs attention" count,
>   is now a real figure rather than a dash. It reuses the teacher's own
>   calculation instead of a second one: `buildRecentAccuracies` was extracted so
>   both the teacher's class overview and the admin roll-up feed the same
>   `checkNeedsAttention`. The two screens cannot disagree about the same child.
>   Live check: 6 of 7 students flagged with real reasons, and the global tile
>   equals the sum of the per-class counts. **Every item in the AGENT-LOOP task
>   queue is now checked off.**
> - **SECURITY — fixed:** `seed_cartilla_classroom_for_teacher` was callable by
>   anyone on the internet (permissions sat at the Postgres default, which grants
>   EXECUTE to PUBLIC). It grants the `teacher` role to any account named by
>   email, creates classes/students under a real teacher, and would overwrite
>   real children's names in any class using join code GRETEL or NOVO26. EXECUTE
>   revoked from PUBLIC/`anon`/`authenticated`; verified an anonymous call now
>   gets "permission denied" and the student lane still works (#363).
> - **Leaked-password protection: NOT available on this plan.** Supabase gates
>   the HaveIBeenPwned breach check behind Pro and above; this project is on the
>   Free plan and the control is locked. Mitigated in the app instead —
>   `src/lib/password-strength.ts` rejects short, common, sequential,
>   repeated-character, and self-identifying (own email/name) passwords at
>   sign-up, minimum length 10. Not equivalent to a breach check, and
>   client-side, so it guards against accidental weak choices rather than a
>   determined API caller. Optional free hardening still available in the
>   dashboard: Supabase's own password-requirements settings (minimum length +
>   required character classes) are server-enforced and included on the Free plan.
> - **Teacher accounts can now be deleted** from Dirección, via the
>   `delete-teacher` Edge Function (deleting a login needs the service-role key,
>   which cannot be in the browser). It refuses to delete a teacher who still
>   owns classes unless explicitly confirmed, and reports how many classes and
>   students would go — `classes.teacher_id` has no foreign key to the login, so
>   deleting the account alone would orphan children's records. Server-side
>   guards: admin-only, no self-deletion, cannot remove the last admin. Student
>   and class deletion already existed in the class roster.
> - Suite: **1174 passing**, lint 0 errors, build green. The owner's account is
>   the only holder of the `admin` role. No test data left in the database
>   (3 classes / 7 students / 8 progress events).

> **2026-07-25 reconciliation.** Three items this file listed as NOT STARTED or
> as open issues had in fact shipped, and the numbers had drifted. Corrected
> below and recorded here so the history is visible:
> - **Live Supabase run — now DONE.** Proven end to end by #334 (student cloud
>   save) and #335 (teacher backend + live reports), both against the real
>   project, with test data removed afterward.
> - **Admin cross-teacher dashboard — now DONE**, shipped in #333.
> - **Lint — was recorded as ~362 problems (≈321 errors).** Actual today:
>   **0 errors, 24 warnings**, and `pnpm lint` exits green.
> - **Book-realism refresh — DONE**, shipped in #336 (see DONE below).

---

## Wave 1 review + Wave 2 staging (2026-07-21)

- **Open pull requests handled:** #233 (empty wrong-repo placeholder) closed;
  #232 (docs, built on a stale `main`) closed without merging — merging would
  have reverted the AGENTS.md documentation standard — but its accurate
  Spanish teacher guide was preserved as `docs/GUIA-RAPIDA-DOCENTE.md` and its
  `npm`→`pnpm` README fixes re-applied. No other PRs were open.
- **Wave 1 (#239 Supabase go-live kit, #240 teacher-CRM test coverage):
  COMPLETE.** The background agent (Jules) generated the code for both but
  reported it "was unable to push the branch ... to GitHub," so its work never
  reached the repo. To keep things moving, both tasks were completed
  directly and merged (PR #247 → #239, PR #248 → #240): `docs/SUPABASE-SETUP.md`
  + `scripts/smoke-supabase.mjs` (`pnpm smoke:supabase`), and 12 new teacher-CRM
  tests (suite now 545 passing). The **Jules→GitHub push problem remains
  unresolved** — until the Jules GitHub app is granted push access to this
  repo, any future Jules-assigned task will generate code it cannot push.
- **Wave 2: four of five items COMPLETE (done directly).** Because the Jules
  pipeline still can't push, the mechanical Wave 2 items were implemented and
  merged directly: #244 remove English toggle (Spanish-only UI, PR #251), #163
  theme-toggle accessibility (44px + aria-label, PR #250), #164 dark-mode
  contrast (readable `unirse` header + separated card tokens, PR #252), #165
  homepage theme toggle (PR #253). Full suite now 546 passing.
- **Only the landing redo (#243) remains, and it is HELD for owner sign-off.**
  It is the creative splash the owner rejected once; the approved direction is
  Gretel-alone on existing art, but it should be reviewed before merge rather
  than auto-built. Wave 3: #245 (lint pass) still open.
- **Jules push is still broken.** Any future Jules-assigned task will generate
  code it cannot push until the Jules GitHub app is granted push access.
- **Owner decisions recorded:** landing = Gretel alone (no new art); UI going
  Spanish-only (English toggle removed, #162 closed); admin dashboard
  deferred post-launch; lint deferred to Wave 3.

---

## Full sweep analysis (2026-07-21)

A whole-project review done against the real code (not from documents).
Brutally honest, plain language.

### 1. DONE — genuinely works end to end
- **Public reading mode** — the app loads and the 24 lessons work without any
  backend configured (the Supabase client degrades gracefully via
  `isSupabaseConfigured`).
- **24-lesson student workbook** — page-faithful rendering, all six exercise
  types, tracing, listen ("Escuchar") button, real-time grading, and the
  Gretel guide reacting to real student events.
- **Teacher flipchart** for whole-class presentation.
- **Art color quality** — all 164 crops + 17 Gretel poses graded; failures
  pulled back to honest "pendiente"; a build-time validator guards it.
- **Automated test suite** — 533 unit tests pass (+2 intentionally-skipped).
- **Secrets hygiene** — verified: no keys in code; Supabase keys load from
  env vars only; `.env*` is git-ignored; `.env.example` holds placeholders.

### 2. HALF-DONE — started, incomplete
- **Teacher/student cloud backend** — fully written (auth, classes, join
  codes, progress, row-level-security migrations) but NEVER run against a
  real database. Code-complete, unverified live. This is the biggest gap.
- **English (EN) language toggle** — exists but only partially translates the
  UI, leaving mixed Spanish/English screens (already filed as issue #162).
  This also sits oddly against the AGENTS.md rule "no English in student UI."
- **Illustration coverage** — down to **16 cells across 6 words**
  (`abeja`, `aguja`, `remolino`, `abrigo`, `oruga`, `globo`). `escoba` was
  fixed 2026-07-25 from the teacher flipchart. All 6 remaining words are
  confirmed to have no color source anywhere in the scanned material, so they
  stay honestly "pendiente". An earlier "498 of 700 cells / 71%" figure in
  this file was **wrong** — it counted `syllable-match` text cells, which have
  no illustration slot at all. See KNOWN ISSUES and `ART_BACKLOG.md`.
- **Welcome/landing screen** — a version shipped and was rejected by the
  owner; a redo brief exists but has not been executed.

### 3. BROKEN OR RISKY
- **Secrets/live-data:** none found — this area is clean (good).
- **CI "BuildFailed" workflow fails on every commit, including on `main`.**
  It is a ghost/orphaned workflow (its registered path is literally
  `BuildFailed` with no matching file in `.github/workflows/`). Harmless to
  the build itself, but it masks real failures and looks broken. Not fixable
  by a code change — needs the owner to delete it in GitHub's Actions UI.
- **Lint debt: cleared 2026-07-25.** `pnpm lint` now exits green with 0 errors
  and 24 remaining warnings — see KNOWN ISSUES for why those 24 are a
  deliberate hold rather than drift.
- **Open QA bugs (#162–#165):** incomplete i18n, dark-mode contrast gaps, a
  too-small theme toggle missing an accessible name, and missing theme
  controls on the homepage. Real launch-quality issues, already filed.

### 4. MISSING FOR LAUNCH (before a real person could use it)
- A live Supabase project with the two env values set, and the migrations
  applied and verified — nothing cloud-related has run live.
- A landing screen the owner approves (first impression).
- The accessibility/i18n QA bugs (#162–#165) resolved, or a decision to ship
  without them.
- The ghost CI workflow removed so "is the build healthy?" is answerable.

### Recommendation — single best path to launch, in order
1. **Stand up Supabase and verify it live** (owner supplies credentials; the
   new "go-live kit" issue prepares the guide + a one-command check). Nothing
   else about the teacher product is real until this is done.
2. **Decide and ship the landing screen** (owner picks the creative
   direction; a ready brief exists).
3. **Clear the launch-quality QA bugs (#162–#165)** and remove the ghost CI
   workflow so the repo reads as healthy.
4. **Then** harden: lint pass, more test coverage, an end-to-end smoke test.

The execution plan for the parts a background coding agent can do safely is
filed as GitHub issues (Wave 1 = label `jules`, Wave 2 = label `wave-2`).
The rest is owner-decision work, listed in `docs/DECISIONS.md`.

---

> Plain-language note: this is the real picture, not a wish-list. "Verified"
> means someone actually ran it or looked at it, not that a document claimed
> it was done.

## DONE (verified in code / in the running app)

- **Live Supabase, proven end to end (#334, #335).** Student cloud save, and
  the teacher backend (auth, class creation, join codes, roster, RLS
  isolation) plus live report precision/time, all verified against the real
  project using the app's own auth and queries. Test data removed afterward.
- **Admin cross-teacher dashboard (#333).**
- **Classic-book realism refresh (#336).** Warm palette (orange `#d4541a`
  primary, green `#2a7d4f`, gold `#e8a820`, warm ink/chrome) replacing the
  cool indigo/stone that read as washed-out; self-hosted Fredoka + Lora;
  hardback cover, paper fibre texture, gutter/outer tone gradient and a
  progress-driven page-edge stack on the student reader; richer (no longer
  desaturated) page art; 24 per-lesson accent colours, each WCAG-AA on cream
  and white. All four themes and reduced-motion re-verified.
- **All fonts self-hosted — no Google Fonts dependency.** Andika, Fredoka,
  Lora, Caveat and OpenDyslexic all ship as local woff2, so type renders on
  the classroom network where Google Fonts is blocked.
- **24-lesson student workbook.** All lessons (5 vowels + consonants) render
  as page-faithful digital pages with real book text and fonts, tap-to-answer
  exercises across all six question types (picture-grid, pick-one, match-all,
  line-match, syllable-match, fill-in-blank), letter tracing, and an
  "Escuchar" (listen) button using the browser's text-to-speech.
- **Grading + Gretel reactions.** Correct/incorrect answers grade in real
  time; the Gretel guide character reacts to real student actions (start,
  correct, wrong, complete) via an event bus — not hardcoded to page numbers.
  Gretel lives in a fixed screen corner and never covers the content.
- **Teacher flipchart** for whole-class presentation at
  `/cartilla/presentar/$n`.
- **Teacher/student/progress backend code.** Real Supabase calls (sign-in,
  class + student management, join-by-code, progress sync, lesson
  verification), Zod-validated, with row-level-security database migrations
  present. See KNOWN ISSUES — this is code-complete but not yet run against a
  live database.
- **Art color-quality QA.** All 164 faithful crops + 17 Gretel pose cutouts
  were inspected and graded PASS/FAIL in
  `public/cartilla/art/faithful/qa-results.json`; every FAIL was pulled from
  live use back to an honest "pendiente" (pending) placeholder.
- **Art-completeness build gate fixed.** `scripts/validate-art-color.mjs` now
  checks vowel-lesson vocabulary too (it previously only checked consonant
  lessons, hiding real gaps).
- **Vowel-vocab art gaps resolved.** `iglú` re-cropped from the correct
  source page; `ojo` wired to an existing verified crop;
  `abeja`/`escoba`/`urna` confirmed to have no colored art anywhere in the
  book and marked accordingly.
- **`carro` page-layout crop fixed** (a good crop was sitting unused while a
  wrong image was wired).
- **Backend test coverage.** 43 unit tests added across the four previously
  untested Supabase modules (teacher, assignments, folder-assignments,
  lesson-verification), plus the flaky art-color test stabilized.
- **Dead-code cleanup** (legacy student subtree, duplicate print + flipchart
  implementations) archived to `src/_archive/`, no longer reachable.
- **Demo-mode teacher reports now show real numbers.** `getSeedClassProgress()`
  in `src/lib/seed-data.ts` previously hardcoded `accuracy: null`,
  `timeSeconds: 0`, and an empty exercise breakdown even though the seed
  events already carried real scores and time. It now aggregates the same
  way the live `getClassProgress()` does, so the demo-mode class report
  shows real percentages, minutes, and per-exercise hit/attempt counts
  instead of always "—" / "0 mins".
- **2026-07-21 — Grading now has automated coverage across all 24 lessons.**
  Previously only lesson 1's grading had been hand-verified. New
  `src/lib/__tests__/lesson-grading.test.ts` walks every lesson's real content
  (`page-layouts.json` via `getWorkbookPagesForLesson`/`getPageLayout`) and
  asserts each gradable exercise's answer key is structurally valid and
  grades a correct answer as correct and a wrong one as wrong. Verified it
  actually catches regressions by deliberately breaking one lesson's answer
  key, confirming the test failed, then reverting.
- **2026-07-21 — Residual English removed from the student UI.** `ayuda.tsx`
  had its own working ES/EN toggle, independent of and unaffected by the
  earlier app-wide toggle removal (#162/#251), publicly reachable with no
  login — it is now Spanish-only. Also fixed dormant English error-fallback
  strings in `mi-progreso.tsx`, `unirse.tsx`, and the globally-mounted
  `SkipLink.tsx` that could only surface for a returning user with a stale
  `localStorage` language flag from before the toggle was removed, and two
  unconditional English labels on the internal `pilot-faithful` preview
  route. `ThemeSwitcher.tsx`/`lib/locale.ts` still carry unused ES/EN-toggle
  code with zero importers — flagged as follow-up cleanup, not a live bug.
- **2026-07-21 — Confirmed the classroom flipchart's multi-slide deck
  already works for 18 of 24 lessons.** `FlipchartHdPanel.tsx` already has
  full working prev/next, keyboard nav, and a thumbnail filmstrip; "Sheet 1
  of 1" on lesson 1 was never a bug — the source 62-page flipchart PDF
  genuinely has only one physical page for lessons 1–6 (verified against
  `teacher-flipchart.json` and the 62 files on disk). Lessons 7–24 already
  flip through all 3 of their real HD pages correctly, verified live in the
  browser. Lessons 1–6 are art-limited and documented as such in
  `REPORT.md`; no additional flipchart art exists to add.
- **2026-07-22 — Adopted the Faithful Restoration Standard for art (owner
  approval, 2026-07-22).** `AGENTS.md` now allows pixel-cleanup restoration
  (upscaling, noise/scan-speckle removal, shadow removal, white-balance,
  palette normalization) on top of an already-faithful crop, gated by a
  mandatory per-image overlay/edge-diff acceptance test against the
  original. This supersedes the old blanket "no AI-touched art" wording —
  generation, redraws, style transfer, and anything that adds/moves/
  reshapes a line, face, or object stay banned with no exceptions; only the
  crop-first, never-invent-art principle is unchanged. No restoration
  pipeline exists yet; this commit only updates the rule text.

## IN PROGRESS / PARTIAL

- **Illustration coverage.** Most cells show real cropped book art; a small
  number honestly show "pendiente." Specifically `abrigo`, `aguja`, and
  `remolino` have real grayscale book line art located (exact page + crop box
  recorded in `ART_BACKLOG.md`) but still need coloring — that is new
  art-extraction work, not a wiring fix.
- **Welcome / landing screen.** A "¡Bienvenidos!" splash shipped and was then
  rejected by the owner as not good enough. A diagnosis and a ready-to-paste
  redo brief exist (see the plan file referenced in `PROGRESS.md`); the redo
  itself has not been executed.

## NOT STARTED

- **`oruga` / `globo` art.** No clean source located after checking all 15
  vowel-lesson workbook pages; the 62-page teacher flipchart is the only
  unchecked source. Both stay "pendiente" for now.

## KNOWN ISSUES

- **Illustration coverage — now down to 16 cells / 6 words, all confirmed
  sourceless.** (Corrects an earlier figure in this file: a first pass counted
  "498 of 700 caption cells missing art / 71%". That count was wrong. ~480 of
  those are `syllable-match` cells — pure text exercises whose schema has no
  `illustrationSrc` field at all, so they are not a gap.) The real gap was
  **18 cells across 7 distinct words**; `escoba` was fixed 2026-07-25, leaving
  **16 cells / 6 words**: `abeja` (7 cells), `aguja` (3), `remolino` (2),
  `abrigo` (2), `oruga` (1), `globo` (1). The 62-page teacher flipchart — the
  last unsearched color source — has now been scanned page by page, and none
  of these 6 appears as a labeled vocab cell anywhere. They have **no known
  color source in the scanned material** and stay honestly "pendiente" unless
  new scans are added. See `ART_BACKLOG.md` 2026-07-25 for the full record.
- **`abrigo` / `aguja` / `remolino` are additionally blocked by the coloring
  ban.** Their only known source is grayscale line art, and coloring it would
  be inventing color — banned by the art contract outright.
- **24 lint warnings remain (0 errors — `pnpm lint` exits green).** 23 are
  `react-refresh/only-export-components` spread across 17 files (a hot-reload
  DX hint with no runtime effect; clearing them means splitting 17 working
  files, i.e. a broad refactor). The 1 remaining
  `react-hooks/exhaustive-deps` sits in `GretelLiveAvatar.tsx` — the Gretel
  animation state machine, which AGENTS.md forbids touching without explicit
  written approval. Both are deliberate holds, not drift.
- **CI "BuildFailed" workflow fails on every commit, including on `main`
  itself.** It is an orphaned workflow reference, not a real build failure —
  safe to disregard as a merge blocker. Cleaning it up is a housekeeping item.
- **29 merged branches need deleting on GitHub.** Re-inventoried 2026-07-29:
  33 branches remain on the server, 29 of them already fully in `main` (each
  verified twice — a merged pull request with that branch as head, and its
  squash commit found on `main`). The two branches named here previously
  (`claude/finish-app-batch1`, `claude/page-layout-art-gap`) are already gone.
  Branch deletion from the automated environment still fails with an HTTP 403
  from the git proxy, and the GitHub tools available there can create refs but
  not delete them, so this stays an owner-side step: run
  `scratch/delete-merged-branches-2026-07-29.sh` from a machine signed in with
  the GitHub CLI. Full list, plus the 2 unmerged branches and 3 open pull
  requests that need an owner decision, in
  `docs/BRANCH-INVENTORY-REPORT.md` → "Re-inventory — 2026-07-29".
