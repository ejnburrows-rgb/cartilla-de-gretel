# STATUS — La Cartilla de Gretel

Honest current state. Updated 2026-07-21. Read this before starting work.

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
