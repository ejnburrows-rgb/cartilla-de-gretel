# Recovery Plan — La Cartilla de Gretel

Written from a full read-only audit (Phase 1), then restructured into the
fastest safe build order. Tasks are numbered in run order — do them in
order unless a task explicitly says it can run in parallel. Each task
lists a Goal, the files it touches (max 5), a "Done when" check the owner
can perform in a browser, and a Status. All tasks start at
**Status: NOT STARTED** unless marked otherwise.

**Run order (why it's ordered this way):** build health first (nothing
else is trustworthy if the build/tests/CI are broken), then Supabase and
data flows (the CRM's real backbone), then the splash screen and hiding
the half-built Gretel avatar (the two most visible first-impression
items), then art and the reader (finishing the student workbook), then
the flipchart and the remaining lessons, then dead-code cleanup — **cleanup
tasks that delete or archive code run only after the live flow they
duplicate has been verified working**, never before — and finally a full
phone + desktop pass over everything. This still delivers the owner's
original 6 stated priorities (app runs clean; Supabase auth + teacher
accounts + add students; student actions reflected + isolation; student
workbook art + flip; flipchart complete; all lessons wired) — they're just
resequenced here for the fastest safe path, with the two most-requested
visible fixes (splash, hidden Gretel) pulled forward instead of buried at
the end.

**Standing rule for every task below, not just Task 3:** don't let lint
problems in a file grow just because that file was touched for something
else — if a task's Files list already has a file open, clean up obvious
lint issues in it as part of that task, not as separate busywork.

Gretel avatar polish, TTS, and cosmetic extras are ON HOLD at the bottom —
do not schedule them.

---

## Group A — Build health first

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
integrity test lists 13 real broken paths (see Task 15/16 below) — those
13 failures are a duplicate signal of the art-gap work in Group D, not a
separate bug to fix here.
**Files:** `src/components/intro/BookHeroGretel.tsx`,
`src/components/intro/__tests__/BookHeroGretel.test.tsx`,
`src/routes/__tests__/-home-landing.test.tsx`
**Done when:** `pnpm test` shows 0 failed test files for the Gretel-hero
tests (the manifest-integrity test will go green automatically once Task
15/16 are done, not from this task).
**Status: NOT STARTED**

### Task 3 — Get `pnpm run lint` to a clean baseline
**Goal:** `pnpm run lint` currently reports 7,097 problems (mostly Prettier
formatting, plus real `@typescript-eslint/no-explicit-any` violations). It
is also linting non-app files (`update_paths.cjs`, `scratch/`, `generated/`,
`.agents/`) that were never meant to ship. Scope ESLint to `src/` +
`scripts/` only, run `pnpm exec eslint . --fix` for the auto-fixable batch,
then hand-fix the real `no-explicit-any` errors. This is the one-time
baseline cleanup; the standing rule at the top of this plan keeps it from
regressing task by task.
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

---

## Group B — Supabase and data flows

### Task 5 — Get live Supabase credentials into a working environment
**Goal:** No `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` exist in
this sandbox — confirmed via `env | grep SUPABASE` (empty) and no `.env`/
`.env.local` file anywhere in the repo, only `.env.example`. The client
code (`src/integrations/supabase/client.ts`) degrades gracefully to a
disabled stub without them, so nothing crashes, but nothing real can be
tested either. This is the one task that genuinely needs the owner — the
credentials live in the owner's Supabase/Vercel project settings, not
anywhere discoverable in the repo. Everything else in this group depends
on it.
**Files:** `.env.local` (not committed — created locally only)
**Done when:** running `pnpm dev` and opening `/login` shows a real
Supabase-backed sign-in (not the "not configured" state).
**Status: NOT STARTED**

### Task 6 — Fix the `lesson_verifications` table gap
**Goal:** `src/lib/lesson-verification.functions.ts` (used for L7-24 lesson
sign-off) calls `.from("lesson_verifications" as any)` — the `as any` is
there because no migration file defines this table and it does not appear
in the committed `src/integrations/supabase/types.ts`. Every call in that
file will fail at runtime with "relation does not exist" unless the table
was created by hand directly against the live database outside of git.
Either write the missing migration (if the table genuinely doesn't exist
live) or, if it does exist live, write a migration that matches it and
regenerate `types.ts` so the `as any` cast can be removed. Write real RLS
policies for it too (teacher-scoped, same pattern as the other progress
tables) — there are none today because the table itself isn't migrated.
**Files:** `supabase/migrations/<new>.sql`,
`src/integrations/supabase/types.ts`,
`src/lib/lesson-verification.functions.ts`
**Done when:** `pnpm run typecheck` passes with the `as any` cast removed,
and a real query against `lesson_verifications` succeeds against the live
Supabase project (needs Task 5's credentials).
**Status: NOT STARTED**

### Task 7 — Live-verify teacher signup → class → add-students
**Goal:** Code review already confirms this chain is real (`src/routes/login.tsx`
real `supabase.auth.signUp`/`signInWithPassword`; `src/lib/teacher.functions.ts`
`createClass()`/`addStudents()` insert real rows scoped to `teacher_id`).
It has never been run against a live project in a session. Once Task 5 is
done, confirm it live.
**Files:** none (browser verification only)
**Done when:** create a teacher account, create a class, add 2 students in
the browser; confirm the rows exist via the Supabase table editor.
**Status: NOT STARTED**

### Task 8 — Live-verify student progress reaches the teacher dashboard
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

### Task 9 — Live-verify multi-teacher data isolation
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

### Task 10 — Build authorized administrative viewing of other teachers' data
**Goal:** An `admin` role already exists in the database (`app_role` enum:
`'teacher' | 'admin'`, `has_role` RPC, `hasTeacherOrAdminRole` gate that
lets an admin account into the teacher lane at all) — but that's as far as
it goes today. No RLS policy anywhere grants an admin row access across
*other* teachers' `classes`/`students`/progress tables (every policy found
is scoped to `auth.uid() = teacher_id`, with no admin bypass clause), and
no UI screen exists for browsing across teachers. This is a real, currently
missing feature, not just an unwired one — it needs a new RLS policy
(admin role can `SELECT` across all teachers' rows, while a regular teacher
still can't) plus a simple admin-only screen to browse teachers/classes.
Confirm first whether "administrative viewing" should be read-only (safer
default, recommended) or also allow edits — flag to the owner if genuinely
ambiguous, don't assume edit rights.
**Files:** `supabase/migrations/<new>.sql` (admin SELECT policies),
`src/lib/teacher.functions.ts` or a new `src/lib/admin.functions.ts`,
one new route under `src/routes/cartilla/teacher/` gated to admin-only
**Done when:** logging in with an account that has the `admin` role shows a
screen listing every teacher's classes/students (read-only), while a
regular teacher account still sees only its own — verified with two real
accounts, one admin, one plain teacher.
**Status: NOT STARTED**

---

## Group C — Splash screen and hiding the Gretel avatar

### Task 11 — Hide Gretel avatar
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
call sites are found, same pattern as Task 26/29 below)
**Done when:** clicking through every screen (landing, login, join,
student lessons, teacher hub/CRM/roster/guía/presentar) shows no Gretel
avatar or hero element anywhere, and `pnpm run typecheck` + `pnpm test` +
`pnpm build` all still pass.
**Status: NOT STARTED**

### Task 12 — Splash screen
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

## Group D — Art and the reader

### Task 13 — Wire the 3 confirmed-good, currently-unwired crops
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

### Task 14 — Fix the live wrong-art bug: `vocal-a/abeja.webp`
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

### Task 15 — Re-crop the remaining "file exists but wrong" words
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

### Task 17 — Build the two-reader system: student horizontal, teacher vertical, auto-selected by role
**Goal:** The workbook reader must present the book's full page set —
**flag, don't guess:** the physical book's total page count including
covers/blanks may be ~95 per `AGENTS.md`, but the actual *content* page
count confirmed in `page-layouts.json` is 90; per `CLAUDE.md`'s own CANON
FACTS rule, page count isn't a magic number — every real content page must
be reachable, blank/filler pages are logged, not chased as a gap — as a
**horizontal** page-turn for students and a **vertical** page-turn for
teachers, auto-selected by which lane the user is in, with **no visible
toggle** for the user to switch orientation manually. Today: the student
side already uses `BookPageFlip` (horizontal, per its own description) —
confirm that's still true and it's genuinely wired to every lesson. The
teacher side (`FlipchartHdPanel`) currently uses a plain cross-fade, not a
vertical flip — building or restoring a real vertical page-turn for the
teacher lane is real work, not just a confirmation. On top of the
orientation split, **the page-turn animation itself must be slow, elegant,
and book-like** — a page visibly curls/turns like a real book, not an
instant swap or a slide — and it must stay smooth (no stutter or jank) on
a modest school computer, not just a high-end dev machine, on both
readers.
**Files:** `src/components/cartilla/BookPageFlip.tsx` (student, horizontal),
`src/components/cartilla/FlipchartHdPanel.tsx` (teacher, needs the vertical
flip built/restored), plus any shared flip-animation hook/CSS file (confirm
exact path at execution time; split into a student sub-task and a teacher
sub-task if the file count runs over 5)
**Done when:** open a lesson as a student — the page turn is horizontal,
slow, elegant, and book-like, smooth on a modest machine, no orientation
toggle visible; open the flipchart as a teacher — the page turn is
vertical, same slow/elegant/book-like quality, no toggle visible; both
checked on 3 different lessons.
**Status: NOT STARTED**

### Task 18 — Student "Escuchar" (listen) option for children who can't read yet
**Goal:** Non-reading students need a way to have the page read aloud
instead of relying on the printed text. Before building anything new:
`/cartilla/voces` already exists in the repo — it's a real, working
Spanish-voice-selection "audition" tool (built to help pick a good
browser/OS TTS voice, using real printed lesson text, not invented) but it
is currently orphaned — no link/`navigate()` anywhere points a student at
it, and it's a voice-picker, not a per-page "listen" button on the actual
workbook pages. Reuse its voice-selection logic rather than rebuilding TTS
from scratch (matches the existing `gretel-tts.ts` speech pattern already
used for Gretel's spoken feedback). Add a real "Escuchar" control on the
student workbook page that reads the current page's real printed text
aloud using the already-chosen/best-available voice — never invented text,
always what's actually printed on that page.
**Files:** `src/routes/cartilla/voces.tsx` (existing voice picker, reuse
its logic), `src/lib/gretel-tts.ts` (existing TTS wiring, reuse the
pattern), plus the student page-rendering component that needs the new
"Escuchar" control (confirm exact file at execution time)
**Done when:** on a student lesson page, tapping "Escuchar" reads that
page's real printed text aloud, audible in-browser, on both a lesson with
short text and one with longer text.
**Status: NOT STARTED**

---

## Group E — Flipchart and the remaining lessons

### Task 19 — Resolve the duplicate flipchart scan sets
**Goal:** Two separate full-page flipchart scan sets exist:
`public/cartilla/art/hd/flipchart/` (+ `raw/flipchart/`, 62 pages each) and
`public/cartilla/images/teacher-flipchart/` (62 pages, different naming).
Confirm which one `/cartilla/presentar/$n` (the live teacher flipchart
route) actually reads, and mark the other clearly as superseded (move, do
not delete, per the project's hard rule) so future sessions don't guess
wrong or edit the unused copy. This is about the image-scan duplication
specifically — the separate duplicate *route* (`/cartilla/sesiones`) is
handled in Task 27, after this task confirms the real flipchart is
complete.
**Files:** the route/component that renders `/cartilla/presentar/$n`
(`FlipchartHdPanel`, same file touched in Task 17 — coordinate so this
doesn't double-count against the file cap), plus a one-line note in
`ART_BACKLOG.md`
**Done when:** `/cartilla/presentar/1` through the last lesson page load
correctly in the browser, and the code comment/doc note states unambiguously
which folder is the real source.
**Status: NOT STARTED**

### Task 20 — Map all 90 workbook pages to their flipchart page scan
**Goal:** With 90 workbook pages and 62 flipchart scans, confirm every
workbook page has a corresponding flipchart scan, and explicitly log any
workbook page that genuinely has none (front matter, covers, or similar —
not a gap to chase).
**Files:** `public/cartilla/art/manifest.json` (the existing page-level
manifest — extend it, don't create a new doc)
**Done when:** every one of the 90 pages has either a flipchart page number
or an explicit "no flipchart scan for this page" note in the manifest.
**Status: NOT STARTED**

### Task 21 — Resolve the ActivityCarousel contradiction (needs the owner)
**Goal:** `CLAUDE.md`'s "Visual direction" section and `SPEC.md` both used
to describe `ActivityCarousel.tsx` (word matching, syllable ordering, piano
pronunciation) as currently live "under every vowel lesson" — both have
since been corrected (see the "Correct project docs" / "Correct project
instructions" commits) to state it is REMOVED and ON HOLD. The current
`src/routes/cartilla/leccion.$n.tsx` (rewritten 2026-07-12) renders only
the book's own pages in order, with an explicit code comment: "no invented
sections/tabs/screens around them (locked canon 7/9)." This is a genuine
product-shape conflict between two "locked" decisions in the docs' history,
not a bug with one obvious fix — it needs the owner to say which is the
real target before any code changes.
**Files:** none yet — decision task only
**Done when:** the owner confirms, in one line, whether "book pages only"
(current code) or the ActivityCarousel games layer (the old CLAUDE.md
wording) is the real target for the student lesson screen. Follow-up tasks
get scoped once that's answered.
**Status: NOT STARTED — OPERATOR INPUT NEEDED**

### Task 22 — Fill Teacher's Guide content for Lessons 17-24
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

### Task 23 — Smoke-test all 24 lessons' interactive regions
**Goal:** The grading/interaction engine (`FaithfulPageRenderer.tsx` +
`buildPageArray.tsx`) is generic and lesson-agnostic in code, and was
verified in-browser for lessons 1, 2, and 7 in an earlier session. The
other 21 lessons have never been individually smoke-tested. Do this after
Task 17's reader work so the smoke test covers the real, finished
horizontal/vertical readers, not the pre-fix version.
**Files:** none (browser verification only)
**Done when:** each of the 24 lessons loads with no console errors, and at
least one exercise per lesson has been tapped both correctly and
incorrectly to confirm grading fires and Gretel reacts (or, if Task 11 has
already run, confirm grading still fires with Gretel hidden).
**Status: NOT STARTED**

### Task 24 — Correct the stale docs found during this audit
**Goal:** Several docs actively misled about current app state. **Update:
most of this is now done** — `CLAUDE.md`'s "Visual direction" section,
`SPEC.md`'s 3-tab-flow description and its teacher-guide status table for
L16/L21-24, `CONTENT-SPEC.md`'s stale "UNREADABLE" table, and
`MISSING_ASSETS.md`'s stale "RECOVERED"/"REJECTED" claims for `ojos`,
`libro`, `pajaro`, `dulce` were all corrected in the "Correct project docs"
and "Correct project instructions" commits on this branch. **Remaining:**
`ART_BACKLOG.md` is known to still contain some of its own stale
"fixed and merged" claims (found in the original audit — several crop
files it claims were re-cropped and merged were unchanged in git blob
history) — that file was deliberately left untouched in the docs-cleanup
passes so far, since it's a 500+ line actively-changing operational log,
not a static instruction doc, and re-auditing it in full is real,
separate work.
**Files:** `ART_BACKLOG.md` only (the rest are done)
**Done when:** `ART_BACKLOG.md`'s claims about which crops are "fixed and
merged" match what's actually on disk (`git cat-file`/blob history, same
verification method used for the rest of this doc pass).
**Status: PARTIALLY DONE — CLAUDE.md/SPEC.md/CONTENT-SPEC.md/MISSING_ASSETS.md fixed; ART_BACKLOG.md still open**

---

## Group F — Dead-code cleanup (run only after the live flow each item duplicates is verified working above)

### Task 25 — Archive the unreachable parallel student-screen subtree
**Goal:** The entire `/cartilla/student/*` subtree (`student/lecciones`,
`student/practica`, `student/repaso`, `student/mi-progreso`,
`student/libro`, `student/libro-vivo`) duplicates the real, live student
path (`/cartilla/lecciones` → `/cartilla/leccion/$n`) but nothing links to
it — confirmed by repo-wide search for `<Link>`/`navigate()`/`redirect()`
targets. **Do this only after Task 17 (reader) and Task 23 (smoke-test)
confirm the real path is fully working** — that's the proof this task's
own instructions require before deleting/archiving a duplicate. Follow the
project's own established pattern (`src/_archive/orphaned-authenticated-teacher-v2/README.md`)
of moving to an archive folder with a README explaining why, not deleting
outright.
**Files:** batch by file — the `student/` route folder is more than 5
files, so split into ≤5-file sub-tasks at execution time (move + update
the one README each batch)
**Done when:** `pnpm build` still succeeds after the full subtree is moved,
and grep confirms zero remaining imports of the moved files.
**Status: NOT STARTED**

### Task 26 — Consolidate the 4 print/binder implementations into ONE teacher-only Imprimir/PDF
**Goal:** Four separate, complete print implementations exist, none wired
into any nav: `/cartilla/binder` + `/cartilla/binder/$lesson`
(`LessonBinderSheet`/`BinderCover`/`BinderTOC`); `/cartilla/imprimir/$n` +
`/cartilla/imprimir/all` (`PdfPage` + inline worksheet exercises);
`/print/$lessonId` + `/print/binder` (a third `PrintBinder` component); and
`teacher/print.tsx`, a literal placeholder ("Las fichas de trabajo
imprimibles estarán disponibles próximamente"). Pick the strongest real
candidate — `/cartilla/imprimir/*` is the closest match to a genuine
"Imprimir/PDF" feature by name and by what it already does (`PdfPage` +
real worksheet content) — confirm it actually produces a usable printout
end to end, wire it into the teacher nav as the one real Imprimir/PDF
entry point, then archive the other three (same move-not-delete pattern as
Task 25). **Do this only after confirming which one genuinely works** —
don't pick by name alone.
**Files:** the chosen implementation's route files (≤5), plus the teacher
nav component to add the entry point (confirm exact file at execution
time); archiving the other 3 clusters is a separate ≤5-file sub-task each
**Done when:** a teacher can reach one "Imprimir" entry point from the
teacher nav, generate a real printable page for a real lesson, and the
other 3 implementations are archived with zero remaining imports (`grep`
confirms).
**Status: NOT STARTED**

### Task 27 — Remove the duplicate flipchart console
**Goal:** `/cartilla/sesiones` + `/cartilla/sesion/$n` is a second, fully
built "live session console" (`SessionProjector`, `SessionStepRail`,
`AudioNarrationDock`, `AccessibilityPanel`, `SessionShareCard`) that
duplicates the purpose of the linked, real `/cartilla/presentar/$n`
flipchart — not referenced anywhere. **Do this only after Task 17 (teacher
vertical reader) and Task 19 (real flipchart scan source) confirm
`/cartilla/presentar/$n` is the complete, correct flipchart** — that's the
"live flow it duplicates" this task's own instructions require verified
first.
**Files:** the `sesiones`/`sesion` route files (≤5; split further if more
are found)
**Done when:** `pnpm build` still succeeds after the cluster is archived,
and grep confirms zero remaining imports.
**Status: NOT STARTED**

### Task 28 — Redirect the confirmed dead-end route
**Goal:** `teacher/recursos/$recursoId.tsx` expects PDFs at
`public/teacher/{rimas,respuestas,evaluaciones,blacklines,guia-del-profesor}.pdf`
— that folder doesn't exist, so every one of its 5 resource keys shows an
empty "Esperando el PDF" state. Its own sibling route, `teacher/index.tsx`,
already has a code comment confirming it was deprecated ("a dead end that
asked the operator to upload PDFs that were never coming — replaced with
real, already-built content"). Nothing links to it today, but if someone
reaches it directly (an old bookmark, a typed URL), it should not dead-end
— redirect it to a real, working screen (`teacher/guia` is the closest
replacement, per the same code comment) rather than leaving the empty
state live.
**Files:** `src/routes/cartilla/teacher/recursos.$recursoId.tsx`
**Done when:** navigating directly to `/cartilla/teacher/recursos/<anything>`
redirects to a real, working teacher screen instead of showing the empty
"Esperando el PDF" state.
**Status: NOT STARTED**

### Task 29 — Archive the remaining orphaned duplicate/standalone routes
**Goal:** After Tasks 25-27 carve out the student subtree, print cluster,
and sesiones cluster, what's left: `teacher/guide.tsx` (duplicates
`teacher/guia/`, not referenced), and standalone orphaned pages with no
inbound link anywhere — `/credits`, `/intro`, `/activities`, `/classroom`,
`/book`, `/cartilla/pilot-faithful/$n`, `/cartilla/autora`. (`/cartilla/voces`
is excluded from this list — see Task 18, it's being reused, not archived.)
Same archive-don't-delete pattern as the rest of this group.
**Files:** batch by cluster — split into ≤5-file sub-tasks at execution
time
**Done when:** `pnpm build` still succeeds after each move, and grep
confirms zero remaining imports of the moved files.
**Status: NOT STARTED**

---

## Group G — Final verification

### Task 30 — Final phone and desktop verification of everything
**Goal:** After every task above, do one full pass confirming the whole
app — not just the piece each task touched — actually works together:
splash → login/join → lessons (horizontal reader, art, Escuchar, grading,
hidden Gretel) → teacher (vertical flipchart, roster, progress, admin view
if built, Imprimir/PDF) — with no console errors, on both a phone-width
and a desktop-width viewport.
**Files:** none (browser verification only)
**Done when:** the full click-path above completes with no console errors
and no visibly broken/unfinished element, checked at both a phone width
(e.g. 390px) and a laptop width (e.g. 1280px).
**Status: NOT STARTED**

---

## ON HOLD — do not schedule until the owner asks

- **Gretel living-character work.** Task 11 above only hides the current
  half-built avatar/hero UI — it does not cancel or replace this. The full
  living-character version (richer animation beyond the 7 frames already
  wired: blink/talk/wave/cheer refinement, placement audit beyond what's
  already fixed) stays ON HOLD until the owner asks for it; when it's
  built, it replaces the hidden elements from Task 11, it doesn't restart
  from scratch.
- Gretel TTS voice polish / real recorded human voice (note: Task 18's
  "Escuchar" reuses the *existing* robot TTS voice-picker as-is — this
  ON HOLD item is about upgrading that voice quality later, not about
  whether Escuchar itself can ship now)
- Garden background rollout beyond the current interim `gretel-authentic.jpg`
  soft background
- Full "channel" (Activities/games section) redesign — separate from Task
  21's yes/no decision; the actual rebuild stays on hold either way, per
  the owner's own standing instruction not to start it unprompted
- Removing the stray empty `cartilla-de-gretel/` directory and the
  `public/cartilla/art/illustrations/` folder (70 unreferenced
  "Flow_*.jpeg" files, named like AI-generation tool output, zero
  references in `src/` — harmless as long as nothing wires them in, but
  worth a human decision before deleting anything, per the never-delete
  rule)
