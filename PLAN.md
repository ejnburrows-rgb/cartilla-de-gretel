# Recovery Plan — La Cartilla de Gretel

Written from a full read-only audit (Phase 1). Nothing in this plan has been
built yet. Tasks are numbered in run order — do them in this order unless a
task explicitly says it can run in parallel. Each task lists a Goal, the
files it touches (max 5), and a "Done when" check the owner can perform in
a browser or with one command. All tasks start at **Status: NOT STARTED**.

Priorities follow the owner's stated order:
1. App runs clean end to end
2. Supabase auth + teacher accounts + add students
3. Student actions reflected in the teacher account; other teachers' data view
4. Student workbook: transplant existing colored illustrations, flip mechanism works
5. Flipchart complete
6. All lessons with activities wired

Gretel avatar polish, TTS, and cosmetic extras are ON HOLD at the bottom —
do not schedule them.

---

## Priority 1 — App runs clean end to end

### Task 1 — Fix the broken `npm ci` / lockfile mismatch that fails CI
**Goal:** `.github/workflows/verify.yml` runs `npm ci`, which fails outright
today — `package-lock.json` is dated 2026-07-10 but `package.json` and
`pnpm-lock.yaml` were both updated 2026-07-12. Confirmed by running
`npm ci --dry-run` locally: it errors with "can only install packages when
your package.json and package-lock.json... are in sync," listing ~20+
missing/invalid packages. Pick one package manager (the team develops with
`pnpm` per `AGENTS.md`) and make CI use the same one everywhere.
**Files:** `package-lock.json`, `.github/workflows/verify.yml`,
`.github/workflows/cartilla-ci.yml`, `vercel.json`
**Done when:** a fresh `git clone` + `npm ci` (or `pnpm install --frozen-lockfile`,
whichever is chosen) succeeds with no errors, and the next push shows a green
"Verify" check on GitHub.
**Status: NOT STARTED**

### Task 2 — Fix the 4 failing tests (Gretel hero + art-manifest integrity)
**Goal:** `pnpm test` currently reports 4 failed / 471 passed. Two causes:
(a) `BookHeroGretel.tsx` no longer renders `data-testid="book-hero-gretel"`
or a `.book-hero-gretel__presence-wrap` element that its own tests expect —
component and test drifted apart in a later edit; (b) the art-manifest
integrity test lists 13 real broken paths (see Task 13/14 below) — those
13 failures are a duplicate signal of the art-gap work in Priority 4, not a
separate bug to fix here.
**Files:** `src/components/intro/BookHeroGretel.tsx`,
`src/components/intro/__tests__/BookHeroGretel.test.tsx`,
`src/routes/__tests__/-home-landing.test.tsx`
**Done when:** `pnpm test` shows 0 failed test files for the Gretel-hero
tests (the manifest-integrity test will go green automatically once Task
13/14 are done, not from this task).
**Status: NOT STARTED**

### Task 3 — Get `pnpm run lint` to exit 0
**Goal:** `pnpm run lint` currently reports 7,097 problems (7,097 errors
across the whole tree, mostly Prettier formatting, plus real
`@typescript-eslint/no-explicit-any` violations). It is also linting
non-app files (`update_paths.cjs`, `scratch/`, `generated/`, `.agents/`)
that were never meant to ship. Scope ESLint to `src/` + `scripts/` only,
run `pnpm exec eslint . --fix` for the ~6,962 auto-fixable issues, then hand-fix
the real `no-explicit-any` errors.
**Files:** `eslint.config.js`, plus whichever `src/` files still fail after
`--fix` (fix in small follow-up batches, 5 files at a time)
**Done when:** `pnpm run lint` exits 0.
**Status: NOT STARTED**

### Task 4 — Make the Vercel production build match what's actually developed
**Goal:** `vercel.json`'s `buildCommand` is `npm run build`, but the team
works in `pnpm` (`AGENTS.md`) and both `package-lock.json` and
`pnpm-lock.yaml` are committed side by side — a real risk that production
installs a different dependency tree than local dev/CI ever tested. Pick
one package manager (recommend `pnpm`, matching `AGENTS.md`), update
`vercel.json`, and remove the unused lockfile.
**Files:** `vercel.json`, `package-lock.json` or `pnpm-lock.yaml` (remove
whichever is not chosen)
**Done when:** the Vercel preview deployment for this branch shows a
successful build in the Vercel dashboard.
**Status: NOT STARTED**

### Task 5 — Fix the `lesson_verifications` table gap
**Goal:** `src/lib/lesson-verification.functions.ts` (used for L7-24 lesson
sign-off) calls `.from("lesson_verifications" as any)` — the `as any` is
there because no migration file defines this table and it does not appear
in the committed `src/integrations/supabase/types.ts`. Every call in that
file will fail at runtime with "relation does not exist" unless the table
was created by hand directly against the live database outside of git.
Either write the missing migration (if the table genuinely doesn't exist
live) or, if it does exist live, write a migration that matches it and
regenerate `types.ts` so the `as any` cast can be removed.
**Files:** `supabase/migrations/<new>.sql`,
`src/integrations/supabase/types.ts`,
`src/lib/lesson-verification.functions.ts`
**Done when:** `pnpm run typecheck` passes with the `as any` cast removed,
and a real query against `lesson_verifications` succeeds against the live
Supabase project (needs live credentials — see Task 8).
**Status: NOT STARTED**

### Task 6 — Hide Gretel avatar
**Goal:** No half-built Gretel avatar/hero element (`GretelPresence`,
`GretelLiveAvatar`, `GretelCelebration`, `BookHeroGretel`) is visible
anywhere in the app — student, teacher, or login screens. Hide or unmount
the rendering of these UI elements; do **not** delete the component files,
data, or assets — the full living-character version is still planned, it
is just ON HOLD for now (see the bottom of this plan). This is a visibility
change only.
**Files:** the shared mount points for these components — starting point
per the last audit: `src/components/gretel/GretelPresence.tsx`,
`src/components/intro/BookHeroGretel.tsx`,
`src/components/gretel/GretelCelebration.tsx` (confirm every route-level
mount point at execution time; split into further ≤5-file sub-tasks if more
call sites are found, same pattern as Task 14/21 below)
**Done when:** clicking through every screen (landing, login, join,
student lessons, teacher hub/CRM/roster/guía/presentar) shows no Gretel
avatar or hero element anywhere, and `pnpm run typecheck` + `pnpm test` +
`pnpm build` all still pass.
**Status: NOT STARTED**

### Task 7 — Splash screen
**Goal:** A polished opening splash screen shows first, before login/join,
on both the student and teacher paths — it is the first thing anyone sees
when the app loads — then transitions cleanly into the current start
screen. A splash component (`CartillaSplash`, route `/cartilla`) already
exists in the repo but is not wired into the live entry path today — the
real first screen is `/` (`Landing`), which goes straight to the
"Estudiantes"/"Maestros" buttons with no splash first. Check whether
`CartillaSplash` is reusable as-is or needs rework, then wire it (or a
rebuilt version) as the true first screen shown on load, ahead of `/`. Use
**only** existing colored art already in the repo (art transplant rule —
no generation, no cropping, no redrawing); reuse an already-cropped/painted
asset already wired elsewhere (e.g. the garden/`gretel-authentic.jpg` art
already used on the landing hero) rather than sourcing anything new.
**Files:** `src/routes/cartilla/index.tsx` (existing `CartillaSplash`),
`src/routes/index.tsx` (`Landing`), plus the splash component's own file
(confirm exact path at execution time)
**Done when:** opening the app (a cold load at `/`) shows the splash
screen first; it transitions cleanly into the current start screen; and it
looks finished, not half-built, on both a laptop-width and a phone-width
viewport, checked in-browser.
**Status: NOT STARTED**

---

## Priority 2 — Supabase auth + teacher accounts + add students

### Task 8 — Get live Supabase credentials into a working environment
**Goal:** No `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` exist in
this sandbox — confirmed via `env | grep SUPABASE` (empty) and no `.env`/
`.env.local` file anywhere in the repo, only `.env.example`. The client
code (`src/integrations/supabase/client.ts`) degrades gracefully to a
disabled stub without them, so nothing crashes, but nothing real can be
tested either. This is the one task that genuinely needs the owner — the
credentials live in the owner's Supabase/Vercel project settings, not
anywhere discoverable in the repo.
**Files:** `.env.local` (not committed — created locally only)
**Done when:** running `pnpm dev` and opening `/login` shows a real
Supabase-backed sign-in (not the "not configured" state).
**Status: NOT STARTED**

### Task 9 — Live-verify teacher signup → class → add-students
**Goal:** Code review already confirms this chain is real (`src/routes/login.tsx`
real `supabase.auth.signUp`/`signInWithPassword`; `src/lib/teacher.functions.ts`
`createClass()`/`addStudents()` insert real rows scoped to `teacher_id`).
It has never been run against a live project in a session. Once Task 8 is
done, confirm it live.
**Files:** none (browser verification only)
**Done when:** create a teacher account, create a class, add 2 students in
the browser; confirm the rows exist via the Supabase table editor.
**Status: NOT STARTED**

---

## Priority 3 — Student actions reflected in teacher account; multi-teacher isolation

### Task 10 — Live-verify student progress reaches the teacher dashboard
**Goal:** Code review confirms an unbroken chain: student join
(`src/routes/cartilla/unirse.tsx` → `enter_class_as_student` RPC) → activity
completion (`log_student_progress` RPC → `progress_events` /
`student_lesson_progress` tables) → teacher queries
(`getClass`/`getClassProgress`/`getAllTeacherStudents` in
`teacher.functions.ts`) → `roster.tsx` / `progreso.tsx` / `reportes.tsx` /
`crm.$classId.index.tsx`. Never run live.
**Files:** none (browser verification only)
**Done when:** as a test student, complete one page/activity; refresh the
teacher's roster/progreso/reportes screens and see it reflected.
**Status: NOT STARTED**

### Task 11 — Live-verify multi-teacher data isolation
**Goal:** Code review confirms isolation is enforced twice — client queries
filter `.eq('teacher_id', userId)` everywhere, and RLS policies
independently restrict `classes`/`students`/all 4 progress tables to
`auth.uid() = teacher_id` (a migration history shows an earlier public-read
policy leak was found and closed:
`20260515215000_platform_hardening_and_progress_tables.sql`). Never verified
against two real logged-in teacher accounts.
**Files:** none (browser verification only)
**Done when:** log in as a second real teacher account; confirm the first
teacher's classes/students appear nowhere in the second teacher's UI.
**Status: NOT STARTED**

---

## Priority 4 — Student workbook: transplant existing colored illustrations

### Task 12 — Wire the 3 confirmed-good, currently-unwired crops
**Goal:** `remolino.webp` (leccion-1), `oruga.webp` (vocal-o), and
`aguja.webp` (vocal-a) already exist as correct, verified crops in
`public/cartilla/art/faithful/` with real `faithful/manifest.json` entries,
but their cells in `src/data/page-layouts.json` have no `illustrationSrc`
key. Zero-risk — just wire the existing paths in.
**Files:** `src/data/page-layouts.json`
**Done when:** open the Lección 1 workbook page and the vowel-O and vowel-A
lessons in the browser; remolino/oruga/aguja render instead of the blank
"art pending" placeholder.
**Status: NOT STARTED**

### Task 13 — Fix the live wrong-art bug: `vocal-a/abeja.webp`
**Goal:** This file is wired and currently shown to students in the vowel-A
lesson, but it does not show a bee — it's an unrelated color fragment. This
is worse than a gap because it's live and wrong, not just missing. As an
immediate stopgap, remove the `illustrationSrc` reference so students see
the honest "art pending" placeholder instead of wrong content; then re-crop
`abeja` from `public/cartilla/images/source/a/` (the raw source page scan
already exists locally) and re-wire it.
**Files:** `src/content/lessons.json`,
`public/cartilla/art/faithful/vocal-a/abeja.webp`,
`public/cartilla/art/faithful/manifest.json`
**Done when:** the vowel-A lesson page shows a real bee illustration for
"abeja" (or, as an interim step, shows the honest placeholder instead of
the current wrong image).
**Status: NOT STARTED**

### Task 14 — Re-crop the remaining "file exists but wrong" words
**Goal:** `arbol.webp`, `ardilla.webp` (vocal-a), `ojos.webp` (vocal-o),
`iguana.webp`, `igual.webp` (vocal-i), `ola.webp` (leccion-1), and
`erizo.webp` (vocal-e, real hedgehog art but badly cut off) all have a
manifest entry and a file, but the file shows the wrong subject or a bad
crop. `ART_BACKLOG.md` claims several of these were already fixed and
merged — checked against git blob history and they were not (unchanged
since commit `f6a44ca`, 2026-07-10); that doc entry is stale. Re-crop each
from its raw source page in `public/cartilla/images/source/<letter>/`
(already on disk, no new scanning needed) and re-wire.
**Files:** batch by lesson folder — e.g. one task for `vocal-a/` (arbol,
ardilla), one for `vocal-o/` (ojos), one for `vocal-i/` (iguana, igual),
one for `leccion-1/` (ola) + `vocal-e/` (erizo), plus
`public/cartilla/art/faithful/manifest.json` each time (split into 4
sub-tasks of ≤5 files to stay under the file cap)
**Done when:** each affected lesson page shows the correct illustration for
its labeled word, checked by eye against the printed caption.
**Status: NOT STARTED**

### Task 15 — Confirm and polish the page-flip mechanism: slow, elegant, book-like page-turn
**Goal:** Docs (`PROJECT.md`, `SPEC.md`, `CLAUDE.md`, several `.agents/*`
files) reference a `StudentWorkbookFlip` component as load-bearing — it
does not exist anywhere in `src/` (confirmed by search). The actual live
component is `BookPageFlip` (`src/components/.../BookPageFlip.tsx`, appears
in the production build output). Confirm this is genuinely the current
flip mechanism (not another dead duplicate) and that it renders wired
illustrations correctly across a few lessons. **On top of that
confirmation, the page flip itself must be a SLOW, ELEGANT, book-like
page-turn animation** — a page visibly curls/turns like a real book, not
an instant swap or a slide — and it must stay smooth (no stutter or jank)
on a modest school computer, not just a high-end dev machine. If the
current `BookPageFlip` behavior is an instant swap or a plain slide instead
of a visible curl/turn, upgrading the animation itself is part of this
task, not a separate one.
**Files:** none (verification only) if the current animation already meets
the bar; correct the stale `StudentWorkbookFlip` references in
`SPEC.md`/`PROJECT.md` if confirmed dead
**Done when:** open 3 different lessons' pages in the student workbook in
the browser and turn a page: the transition is a slow, elegant, book-like
curl/turn (not an instant swap or slide), illustrations display correctly
inside the flipped page, and the animation stays smooth with no stutter on
a modest/older school computer, not only a fast dev machine.
**Status: NOT STARTED**

### Task 16 — Consonant-lesson vocab gap: leave as-is, re-verify only
**Goal:** 28 of 31 missing `consonants.json` illustration words have a
manifest entry and file, but every one sampled (15+) shows the wrong
subject — traced to the crop tool grabbing a fixed pixel region off the
wrong source page (e.g. `moto`/`mapa` point at `m-page-10.jpg`, which is
the "Mi mamá" poem page with no motorcycle or map art at all).
`ART_BACKLOG.md` already documents an exhaustive, page-by-page audit
concluding most of these words were never illustrated in this book edition
at all — that conclusion is independently corroborated by this audit and
should not be re-litigated. 3 words (Rita, carrusel, Tierra) have no
manifest entry or file anywhere and are genuinely absent. No re-crop work
needed here; this task is only to spot-re-verify the "confirmed absent"
list isn't itself stale, given how often earlier "confirmed" claims in this
repo turned out to be wrong.
**Files:** none (verification only)
**Done when:** spot-check 5 of the "confirmed absent" words directly
against their lesson's raw source pages; confirm none were missed.
**Status: NOT STARTED**

---

## Priority 5 — Flipchart complete

### Task 17 — Resolve the duplicate flipchart scan sets
**Goal:** Two separate full-page flipchart scan sets exist:
`public/cartilla/art/hd/flipchart/` (+ `raw/flipchart/`, 62 pages each) and
`public/cartilla/images/teacher-flipchart/` (62 pages, different naming).
Confirm which one `/cartilla/presentar/$n` (the live teacher flipchart
route) actually reads, and mark the other clearly as superseded (move, do
not delete, per the project's hard rule) so future sessions don't guess
wrong or edit the unused copy.
**Files:** the route/component that renders `/cartilla/presentar/$n`
(`FlipchartHdPanel` or equivalent), plus a one-line note in `ART_BACKLOG.md`
**Done when:** `/cartilla/presentar/1` through the last lesson page load
correctly in the browser, and the code comment/doc note states unambiguously
which folder is the real source.
**Status: NOT STARTED**

### Task 18 — Map all 90 workbook pages to their flipchart page scan
**Goal:** With 90 workbook pages and 62 flipchart scans, confirm every
workbook page has a corresponding flipchart scan, and explicitly log any
workbook page that genuinely has none (front matter, covers, or similar —
not a gap to chase).
**Files:** `public/cartilla/art/manifest.json` (the existing page-level
manifest — extend it, don't create a new doc)
**Done when:** every one of the 90 pages has either a flipchart page number
or an explicit "no flipchart scan for this page" note in the manifest.
**Status: NOT STARTED**

---

## Priority 6 — All lessons with activities wired

### Task 19 — Resolve the ActivityCarousel contradiction (needs the owner)
**Goal:** `CLAUDE.md`'s "Visual direction" section and `SPEC.md` both
describe `ActivityCarousel.tsx` (word matching, syllable ordering, piano
pronunciation) as currently live "under every vowel lesson." It is not —
confirmed by grep, it is imported nowhere. The current
`src/routes/cartilla/leccion.$n.tsx` (rewritten 2026-07-12) renders only
the book's own pages in order, with an explicit code comment: "no invented
sections/tabs/screens around them (locked canon 7/9)." This is a genuine
product-shape conflict between two "locked" decisions in the docs, not a
bug with one obvious fix — it needs the owner to say which is the real
target before any code changes.
**Files:** none yet — decision task only
**Done when:** the owner confirms, in one line, whether "book pages only"
(current code) or the ActivityCarousel games layer (current CLAUDE.md
wording) is the real target for the student lesson screen. Follow-up tasks
get scoped once that's answered.
**Status: NOT STARTED — OPERATOR INPUT NEEDED**

### Task 20 — Fill Teacher's Guide content for Lessons 17-24
**Goal:** `src/content/guides/lesson-17.tsx` through `lesson-24.tsx` are
6-line stubs rendering `PartialLessonGuide` with objectives and procedure
both marked `SOURCE-NOT-IN-REPO`. This is real, transcribable content that
does not exist locally — per `CLAUDE.md`, Notion's "Step 4 Teacher's Guide"
page is supposed to be canonical for this, and this audit had no Notion
access. Cannot be invented; needs the real source pulled in.
**Files:** `src/content/guides/lesson-17.tsx` through `lesson-24.tsx` (do
in 2 batches of 4 to stay under the file cap)
**Done when:** each of L17-24's `/cartilla/teacher/guia/$n` page shows real
objectives and procedure text instead of the stub message.
**Status: NOT STARTED — needs real source content (Notion pull or book scan)**

### Task 21 — Archive the orphaned duplicate student/print/session routes
**Goal:** Multiple complete, parallel implementations of the same features
exist but are unreachable from any real click-path: the entire
`/cartilla/student/*` subtree duplicates `/cartilla/lecciones` +
`/cartilla/leccion/$n`; four separate print/binder implementations
(`/cartilla/binder`, `/cartilla/imprimir/*`, `/print/*`,
`teacher/print.tsx`'s literal placeholder) exist with none wired into any
nav; `/cartilla/sesiones` + `/cartilla/sesion/$n` duplicates
`/cartilla/presentar/$n`; `teacher/guide.tsx` duplicates `teacher/guia/`;
`teacher/recursos/$recursoId.tsx` is a confirmed dead end (expects PDFs
that were never delivered, per its own sibling route's code comment).
Follow the project's own established pattern (`src/_archive/orphaned-authenticated-teacher-v2/README.md`)
of moving to an archive folder with a README explaining why, not deleting.
**Files:** batch by cluster (student/* subtree, print/binder cluster,
sesiones cluster, teacher/guide.tsx + recursos) — split into ≤5-file
sub-tasks at execution time
**Done when:** `pnpm build` still succeeds after each move, and grep
confirms zero remaining imports of the moved files.
**Status: NOT STARTED**

### Task 22 — Smoke-test all 24 lessons' interactive regions
**Goal:** The grading/interaction engine (`FaithfulPageRenderer.tsx` +
`buildPageArray.tsx`) is generic and lesson-agnostic in code, and was
verified in-browser for lessons 1, 2, and 7 in an earlier session. The
other 21 lessons have never been individually smoke-tested.
**Files:** none (browser verification only)
**Done when:** each of the 24 lessons loads with no console errors, and at
least one exercise per lesson has been tapped both correctly and
incorrectly to confirm grading fires and Gretel reacts.
**Status: NOT STARTED**

### Task 23 — Correct the stale docs found during this audit
**Goal:** Several docs actively mislead about current app state and will
cost a future session real time re-discovering the same things: `CLAUDE.md`'s
"Visual direction" section (ActivityCarousel claimed live, isn't —
resolved by Task 19's answer first), `SPEC.md`'s 3-tab-flow description and
its wrong teacher-guide status table for L16/L21-24, `CONTENT-SPEC.md`
(entirely superseded — every row says text is "UNREADABLE," but
`page-layouts.json` has full transcriptions for all 90 pages),
`MISSING_ASSETS.md`'s stale "RECOVERED"/"REJECTED" claims for `ojos`,
`libro`, `pajaro`, `dulce` (libro/pajaro/dulce were actually fixed by a
later commit; `ojos`/`carro` genuinely still don't exist on disk).
**Files:** `CONTENT-SPEC.md`, `MISSING_ASSETS.md`, `SPEC.md` (do in
separate small commits, not one 5+-file batch)
**Done when:** each doc's content matches what a fresh `find`/`grep` of the
current repo actually shows.
**Status: NOT STARTED**

---

## ON HOLD — do not schedule until the owner asks

- **Gretel living-character work.** Task 6 above only hides the current
  half-built avatar/hero UI — it does not cancel or replace this. The full
  living-character version (richer animation beyond the 7 frames already
  wired: blink/talk/wave/cheer refinement, placement audit beyond what's
  already fixed) stays ON HOLD until the owner asks for it; when it's
  built, it replaces the hidden elements from Task 6, it doesn't restart
  from scratch.
- Gretel TTS voice polish / real recorded human voice
- Garden background rollout beyond the current interim `gretel-authentic.jpg`
  soft background
- Full "channel" (Activities/games section) redesign — separate from Task
  19's yes/no decision; the actual rebuild stays on hold either way, per
  the owner's own standing instruction not to start it unprompted
- Removing the stray empty `cartilla-de-gretel/` directory and the
  `public/cartilla/art/illustrations/` folder (70 unreferenced
  "Flow_*.jpeg" files, named like AI-generation tool output, zero
  references in `src/` — harmless as long as nothing wires them in, but
  worth a human decision before deleting anything, per the never-delete
  rule)
