# STATUS — La Cartilla de Gretel

Honest current state. Updated 2026-07-21. Read this before starting work.

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
- **Illustration coverage** — most cells show real book art; `abrigo`,
  `aguja`, `remolino` still need coloring (source located, see
  `ART_BACKLOG.md`); `oruga`/`globo` have no located source.
- **Welcome/landing screen** — a version shipped and was rejected by the
  owner; a redo brief exists but has not been executed.

### 3. BROKEN OR RISKY
- **Secrets/live-data:** none found — this area is clean (good).
- **CI "BuildFailed" workflow fails on every commit, including on `main`.**
  It is a ghost/orphaned workflow (its registered path is literally
  `BuildFailed` with no matching file in `.github/workflows/`). Harmless to
  the build itself, but it masks real failures and looks broken. Not fixable
  by a code change — needs the owner to delete it in GitHub's Actions UI.
- **Lint debt:** ~362 problems (≈321 errors, ≈41 warnings). Not a crash risk,
  but real quality drift; bulk auto-fixing carries its own behavior-change
  risk, so it needs a careful pass, not a blind one.
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

- **Live Supabase run.** Teacher sign-in, class management, join-by-code, and
  progress sync are code-complete but have never been run against a real
  Supabase project in any session. This needs the owner's project
  credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) and a
  first-time migration apply. Treat the first live run as real first-time
  risk, not a formality.
- **Admin cross-teacher dashboard.** Confirmed genuinely unbuilt (no
  admin-viewing components, no security policy for it). Needs the owner to
  confirm it is still wanted before scoping.
- **`oruga` / `globo` art.** No clean source located after checking all 15
  vowel-lesson workbook pages; the 62-page teacher flipchart is the only
  unchecked source. Both stay "pendiente" for now.

## KNOWN ISSUES

- **Lint noise.** `pnpm lint` currently reports ~362 problems (≈321 errors,
  ≈41 warnings). Real drift; not urgent, but should be cleaned up before any
  "production-quality" claim.
- **CI "BuildFailed" workflow fails on every commit, including on `main`
  itself.** It is an orphaned workflow reference, not a real build failure —
  safe to disregard as a merge blocker. Cleaning it up is a housekeeping item.
- **Two merged branches need deleting on GitHub:**
  `claude/finish-app-batch1` and `claude/page-layout-art-gap`. Branch
  deletion from the automated environment fails with an HTTP 403 from the git
  proxy, so this is a manual click in GitHub.
