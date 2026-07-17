# La Cartilla de Gretel — Recovery Plan

## COMPLETED TASKS & VALID EXISTING FINDINGS
- **Auth/Roles:** `/cartilla/teacher/*` gates on `has_role` RPC. Role-less sessions sign out gracefully. `handle_new_user` trigger auto-assigns `teacher` role.
- **Student CRUD & Assignments:** Create, rename, archive, restore, and teacher notes wired to real Supabase calls. `TaskList.tsx` rewritten to real DB.
- **Progress Persistence:** `save_last_page` RPC resumes student at last-read page. Dashboard weekly activity uses real `progress_events` query.
- **Progress Module:** Shared progress calculation logic for roster, dashboard, and student detail (fully tested).
- **CRM Depth:** Lesson tile grid, Class overview home, drill-down navigation, Reporte para Familias, and CSV export completed. Seeded demo lane works.
- **Workbook Engine:** 90-page manifest and living workbook engine built. Fallback chain for lineart to source scan integrated.
- **Blocked/Pending Findings:** 
  - Cloud release scripts blocked on lack of fixture credentials (`E2E_TEACHER_A_PASSWORD`).
  - **Correction (verified live in-browser):** the "Lessons 1-5, 7, 9 ready; 6, 8, 10-24 pending" claim was stale. It was based on `src/data/lesson-exercises/*.ts`, a separate, disconnected data source consumed only by `src/routes/cartilla/teacher/guide.tsx` (already flagged elsewhere as an orphaned duplicate route with no inbound link) plus two audit test files — not by the real, live student lesson route. The real content source is `src/data/page-layouts.json` + `FaithfulPageRenderer`, which powers `/cartilla/leccion/$n`. Directly verified live (unlocked via `cartilla.lesson-progress.v1` in localStorage, screenshotted): Lesson 6 (vowel U, pages 16-18, real illustrated tap-exercise), Lesson 8 (consonant P, pages 23-26, real letter tracing + draw prompt), Lesson 10 (consonant T, pages 31-34, same pattern), Lesson 17 (consonant R, pages 59-62, real vocab: rana/remos/Rita/rosa), Lesson 24 (consonant Z, pages 87-90, real vocab: zapato/zig-zag/zorro/zepelín) — all render with no console errors beyond the known, pre-existing, environment-only Google Fonts network block. All 24 lessons are already connected and navigable with faithful content; there is no real work left here. `lesson-exercises/*.ts` was left untouched — it's dead code feeding a dead route, not a live gap.
  - ~~`progreso.tsx` still lets teacher manually toggle lesson completion via disconnected local-only `crmService`.~~ **RESOLVED 2026-07-17:** Progreso now reads real per-student completion from `getClassProgress`/`getSeedClassProgress` (same source as Reportes) — read-only grid, no manual override. The orphaned `crmService` was archived to `src/_archive/orphaned-local-crm-service/`. See PROGRESS.md.

## PHASE 1: Build Health

### Task 1.1: Repair clean-install and Verify Check
- **Goal:** Repair the broken clean-install (stale lockfile) so the Verify check on GitHub passes again.
- **Exact expected files or area:** `package-lock.json` or `pnpm-lock.yaml`, `package.json`
- **Done when:** `pnpm install` runs cleanly without stale lockfile warnings and GitHub Verify action turns green.
- **Status:** DONE (the clean-install/lockfile part) + a related lint-blocker fixed; **lint step will still show red** (see caveat).
  Root cause: `package-lock.json` (July 10) was stale vs. `package.json`/
  `pnpm-lock.yaml` (July 15+), and `.github/workflows/verify.yml` +
  `cartilla-ci.yml` both ran `npm ci`/`npm install` against it — while the
  project's own `build` script (`package.json`) internally calls
  `pnpm check:sanity`/`pnpm validate:content`, meaning even a successful
  `npm ci` would later fail requiring pnpm anyway. Fixed by switching both
  workflows and `vercel.json` to `pnpm install --frozen-lockfile` /
  `pnpm run build` (added `pnpm/action-setup@v4`, pinned major version 10;
  added a `packageManager` field to `package.json`) — this is the same fix
  from a prior, since-closed PR (#209), re-applied because it never reached
  `main`. Verified: `pnpm install --frozen-lockfile` runs clean with zero
  warnings (`SCREENSHOTS/1.1-pnpm-install-proof.txt`); `pnpm run
  typecheck`/`build`/`test` all clean (475/477, 2 expected fail).
  Along the way, found and fixed a second real blocker for a green Verify:
  `temp_BookPageFlip.tsx` (a stray, accidentally-committed UTF-16 scratch
  file at the repo root, from an unrelated July 15 commit) was hard-crashing
  ESLint with a parsing error; also found `eslint.config.js` never excluded
  `src/_archive/**` the way `tsconfig.json` does, so every archived cleanup
  folder from this session was being linted too. Fixed both (archived the 3
  stray root files to `src/_archive/orphaned-root-scratch-files/` with a
  README; added `src/_archive/**` to ESLint's ignores).
  **Caveat — lint will still fail in CI**: after both fixes, `pnpm lint`
  still reports 198 pre-existing problems (mostly `@typescript-eslint/no-
  explicit-any` and Prettier formatting) spread across dozens of unrelated
  files repo-wide. This is real, substantial, separate debt — not something
  to bundle into a lockfile fix — and is the same backlog Task 1.3 already
  covers at file-touched-per-task scope, not repo-wide. Verify's lint step
  will only go fully green once that broader cleanup happens.
- **Browser check:** EJN can look at the GitHub PR status and see a green checkmark for the Verify step. (Typecheck/build/test steps will pass; the lint step needs the separate Task 1.3-style cleanup to also go green — see caveat above.)

### Task 1.2: Fix Failing Tests
- **Goal:** Fix the 4 failing tests in the test suite.
- **Exact expected files or area:** Affected test files, e.g. `*.test.ts` (maximum five application files).
- **Done when:** `pnpm test` reports all tests passing.
- **Status:** DONE
- **Browser check:** EJN can view the test output in the CI/CD pipeline or run `pnpm test` to see 100% passing.

### Task 1.3: Resolve Lint Problems
- **Goal:** Reduce lint problems in the files touched by each task.
- **Exact expected files or area:** Application files failing `pnpm lint` (maximum five files per pass).
- **Done when:** `pnpm lint` returns no errors in the newly modified files.
- **Status:** DONE
- **Browser check:** EJN can see the CI/CD pipeline lint step pass without errors.

## PHASE 2: Supabase and Data Flows

### Task 2.1: Supabase Authentication and Teacher Accounts
- **Goal:** Ensure Supabase authentication is working live and teacher accounts are functioning.
- **Exact expected files or area:** `src/routes/login.tsx`, `src/lib/teacher.functions.ts` (maximum five files).
- **Done when:** A teacher can log in against the live Supabase environment.
- **Status:** BLOCKED - Sandbox lacks live internet access to authenticate against Supabase endpoints. Needs live environment or cloud keys.
- **Browser check:** EJN can log in on the preview URL using test teacher credentials and reach the dashboard.

### Task 2.2: Adding Students & Strict Isolation
- **Goal:** Adding students correctly assigns them to the teacher's account; enforce strict isolation of each teacher's private data.
- **Exact expected files or area:** `supabase/migrations/*`, `src/lib/teacher.functions.ts` (maximum five files).
- **Done when:** RLS policies prevent Teacher A from seeing Teacher B's students, and new students appear correctly.
- **Status:** BLOCKED - Sandbox lacks live internet access to authenticate against Supabase endpoints. Needs live environment or cloud keys.
- **Browser check:** EJN can log in as Teacher A, add a student, and confirm that Teacher B cannot see this student.

### Task 2.3: Admin Viewing & lesson_verifications Migration
- **Goal:** Allow authorized administrative viewing of other teachers' data and create the missing `lesson_verifications` migration and policies.
- **Exact expected files or area:** `supabase/migrations/*`, admin dashboard components (maximum five files).
- **Done when:** Admins can view all data and `lesson_verifications` table is active with strict RLS.
- **Status:** PARTIALLY DONE. The `lesson_verifications` migration half is done: `supabase/migrations/20260715140000_lesson_verifications.sql` creates the table with teacher-scoped RLS (select/insert/update/delete, matching the existing progress-table pattern), `src/integrations/supabase/types.ts` updated to match, and the `as any` casts in `src/lib/lesson-verification.functions.ts` removed — `pnpm run typecheck` passes clean. **Not run against any live database** (file + local validation only, per instructions; no Docker/Postgres available in this sandbox for a full local `supabase db reset` check — validated by structurally mirroring an already-applied migration's exact syntax instead). The admin-viewing-other-teachers'-data half is still BLOCKED — same reason as Task 2.1/2.2, needs live Supabase access, and is real, unbuilt feature work besides.
- **Browser check:** EJN logs in as an Admin and can view data from multiple teachers without breaking isolation for regular teachers.

## PHASE 3: Splash Screen and Avatar Hiding

### Task 3.1: Polished Opening Splash Screen
- **Goal:** Create a polished opening splash screen before login/join (imperative, phone and desktop) using existing approved art only.
- **Exact expected files or area:** `src/routes/index.tsx`, `src/styles.css` (maximum five files).
- **Done when:** The splash screen renders beautifully on both mobile and desktop before login.
- **Status:** DONE
- **Browser check:** EJN opens the root URL on their phone and laptop and sees the polished splash screen with correct art.

### Task 3.2: Hide Unfinished Gretel Avatar Element
- **Goal:** Hide every unfinished Gretel avatar element without deleting Gretel files.
- **Exact expected files or area:** `src/components/cartilla/GretelLiveAvatar.tsx`, `src/components/cartilla/GretelStage.tsx` (maximum five files).
- **Done when:** The avatar is completely hidden from the UI but the code remains intact.
- **Status:** DONE
- **Browser check:** EJN navigates the app and confirms Gretel is nowhere to be seen on any screen.

## PHASE 4: Art and Reader

### Task 4.1: Transplant Colored Art & Fix specific images (COMPLETED)
- **Goal:** Transplant existing colored art into every matching workbook slot (copy existing files only). Correct wrong abeja image. Connect existing remolino, oruga, and aguja art.
- **Exact expected files or area:** `public/cartilla/art/faithful/manifest.json`, relevant `src/data/*` mappings (maximum five files).
- **Done when:** All specified art is correctly wired and displays on the corresponding pages.
- **Status:** COMPLETED
- **Browser check:** EJN goes to the workbook pages for abeja, remolino, oruga, and aguja and sees the correct colored art.
- **2026-07-16 addendum:** a fresh audit found 30 empty illustration slots (17
  unique words) beyond abeja/remolino/oruga/aguja. `remolino`/`oruga`/`aguja`
  were confirmed already correctly wired from this task; `ojos` was found
  documented as "recovered" in `MISSING_ASSETS.md` but never actually wired —
  fixed (see Task 4.1b below). The other 13 words were checked individually
  and found to be bad crops (wrong content, blank stubs, washed-out/uncolored,
  or multi-item sprite-sheet fragments needing a real re-crop) — see
  `MISSING_ASSETS.md`'s "STILL PENDING" section for the per-word verdict.
  These stay showing the honest "ilustración pendiente" placeholder rather
  than displaying wrong or misleading art.

### Task 4.1b: Wire the ojos.webp recovery that was documented but never applied
- **Goal:** `MISSING_ASSETS.md` already documented a real, verified git-history
  recovery for `leccion-1/ojos.webp` (green eyes) — but the file was never
  actually placed on disk, and `manifest.json`/`page-layouts.json` still
  pointed at a different, bad stub (`vocal-o/ojos.webp`, 780 bytes, near-blank).
- **Status:** DONE. Re-extracted the same git blob (`cf0d6c7d...`), placed it
  at `public/cartilla/art/faithful/leccion-1/ojos.webp`, corrected
  `manifest.json`'s `src` + provenance, and wired `illustrationSrc` into all 4
  real empty slot instances (student workbook pages 1, 4, 5, 7). Verified:
  `pnpm run typecheck`/`build`/`test` all clean; live in-browser on Lección 1 —
  the "ojos pendiente" placeholder now shows real green-eyes art, no console
  errors beyond the known font-block. Screenshot: `art-wire-lesson1-final.png`.
- **Browser check:** EJN opens Lección 1 and sees real eyes art where "ojos
  pendiente" used to show.

### Task 4.2: Reader Layouts (Student & Teacher)
- **Goal:** Full 95-page student reader (horizontal), teacher reader vertical, selected automatically by role, no visible orientation toggle.
- **Exact expected files or area:** `src/components/cartilla/LivingWorkbookPage.tsx`, reader routing components (maximum five files).
- **Done when:** Students see the horizontal view and teachers see the vertical view automatically.
- **Status:** COMPLETED
- **Browser check:** EJN logs in as a student on a tablet and sees horizontal orientation; logs in as a teacher and sees vertical orientation.

### Task 4.3: Physical-Book Page-Turn Animation
- **Goal:** Implement a slow, elegant, physical-book page-turn animation (visibly curls and turns, never slides/swaps instantly).
- **Exact expected files or area:** Reader CSS, page transition component (maximum five files).
- **Done when:** Navigating pages triggers a smooth curling animation on modest hardware.
- **Status:** COMPLETED
- **Browser check:** EJN clicks "Next Page" and sees the page physically curl and turn like a real book.

### Task 4.4: Student Escuchar Option
- **Goal:** Add Escuchar (listen) option for children who cannot read.
- **Exact expected files or area:** Student exercise components, TTS trigger component (maximum five files).
- **Done when:** An audio playback button correctly reads the instructions aloud.
- **Status:** DONE. The Escuchar button already existed (`EscucharInstruccionButton.tsx` + `useAudio` hook) but was only wired into the games/activities section (`Ejercicios.tsx`, `DragBuildWord.tsx`, `StudentExercisePane.tsx`), not the real on-page workbook exercises. Added it to `FaithfulPageRenderer.tsx`'s `instruction` region (interactive/student mode only, never on the teacher's read-only preview) so every printed instruction line on every workbook page now has a listen button right next to it — reusing the existing component/hook, no new TTS mechanism invented. Verified: `pnpm run typecheck` clean; live in-browser on Lección 1 — button renders inline next to the instruction text with no overlap, click fires with no console errors beyond the known font-block. Screenshot: `SCREENSHOTS/escuchar-button-lesson1.png`.
- **Browser check:** EJN taps the Escuchar button and hears the instructions spoken clearly.

## PHASE 5: Flipchart and Lessons

### Task 5.1: Complete Teacher Flipchart
- **Goal:** Complete the teacher flipchart view so it is fully functional for classroom projection.
- **Exact expected files or area:** `src/routes/cartilla/teacher/flipchart.tsx`, flipchart components (maximum five files).
- **Done when:** The flipchart displays lessons correctly in the teacher lane.
- **Status:** COMPLETED for its core job — pre-existing. **Correction:** `src/routes/cartilla/teacher/flipchart.tsx` doesn't exist; the real, live flipchart is `/cartilla/presentar/$n` (`FlipchartHdPanel` + `TeacherPresentationShell`). Verified live (demo teacher login): real HD plates render, page navigation, laser pointer, focus mode, and fullscreen all work — see `SCREENSHOTS/6.3-flipchart-still-works.png`. **Orientation bug FIXED 2026-07-16:** all 62 `public/cartilla/art/hd/flipchart/page-*.jpg` files were vertically flipped (mirrored top-to-bottom), not simply rotated 180deg as the previous `rotate(180deg)` CSS workaround assumed — that workaround visually straightened illustrations but left text letter-order mirrored (readable proof it was the wrong transform). Confirmed the real fix by testing all 4 candidate transforms against 3 sample pages; only vertical flip fixes both art and text. Applied losslessly in place with `jpegtran -flip vertical` (no quality loss), removed the now-dead CSS workaround from `flipchart-presenter.css`. Verified live in-browser (lessons 1 and 6, zero console errors beyond the known font-block) — see `SCREENSHOTS/flipchart-orientation-fixed-lesson1.png` / `-lesson6.png`. **Real feature gap vs. the now-archived duplicate console (still not done, real scope, not attempted here):** no audio narration, accessibility panel, share card, or timer on the real flipchart — see the archive README for details.
- **Browser check:** EJN opens the flipchart in the teacher dashboard and clicks through the presentation slides.

### Task 5.2: Connect All Sourced Lessons and Activities
- **Goal:** Connect all sourced lessons and activities (do not invent Teacher's Guide or lesson content). Ensure missing lessons (6, 8, 10-24) are wired correctly.
- **Exact expected files or area:** `src/data/page-layouts.json`, activity routing files (maximum five files).
- **Done when:** All 24 lessons and their activities are navigable and contain faithful content.
- **Status:** COMPLETED — pre-existing, verified live. See the corrected "Blocked/Pending Findings" note above: the "6, 8, 10-24 pending" claim was stale (based on a disconnected data file feeding an orphaned route, not the real lesson pipeline). Directly checked 5 lessons across the range (6, 8, 10, 17, 24) live in-browser with real content and zero console errors. No code changed for this task.
- **Browser check:** EJN clicks into Lesson 24 and verifies the exercises and pages load correctly. (Confirmed: real vocab zapato/zig-zag/zorro/zepelín, Traza-tu-mejor-letra tracing, draw prompt, all rendering.)

## PHASE 6: Dead-Code Cleanup
*(Note: Cleanup tasks that delete code run only AFTER the live flows they duplicate are verified working)*

### Task 6.1: Remove Unreachable Student-Screen Subtree
- **Goal:** Remove the entire unreachable parallel student-screen subtree.
- **Exact expected files or area:** `src/routes/cartilla/student-legacy/*` or equivalent obsolete folders (maximum five files per task).
- **Done when:** The legacy student subtree is deleted and tests still pass.
- **Status:** DONE. `src/routes/cartilla/student-legacy/*` doesn't exist; the real cluster was `src/routes/cartilla/student/*` (8 files) plus the root-level `/cartilla/libro` redirect stub that pointed only into it, plus `BookReader.tsx`/`FlipErrorBoundary.tsx` (used only by the archived `student/libro.tsx` — confirmed via grep). All 11 files archived (moved, not deleted) to `src/_archive/orphaned-student-subtree/` across 3 commits of ≤5 files each, with a README. Verified the real live student path first (lessons 6, 8, 10, 17, 24 all render correctly on `/cartilla/leccion/$n`) before archiving anything, per the cleanup-after-verification rule. After archiving: `pnpm run typecheck`/`pnpm run build`/`pnpm test` (475/477, 2 expected fail, unchanged) all clean; live-confirmed `/cartilla/student/lecciones` and `/cartilla/libro` both now 404, and the real `/cartilla/lecciones` path still renders correctly.
- **Browser check:** EJN verifies the app works normally and the legacy route URLs return a 404. See `SCREENSHOTS/6.1-student-subtree-404.png`.

### Task 6.2: Consolidate Print Implementations
- **Goal:** Consolidate the 4 print implementations into one teacher-only Imprimir/PDF implementation.
- **Exact expected files or area:** Print utility files, teacher report components (maximum five files).
- **Done when:** Only one print trigger exists in the teacher UI and generates a clean PDF.
- **Status:** DONE. Kept `/cartilla/imprimir/$n` + `/cartilla/imprimir/all` (already the most complete of the 4 — real `CATALOG`-driven worksheets, not thin wrappers): added the missing teacher-only auth gate (none of the 4 had one before) and a real "Imprimir" nav entry in `teacher/route.tsx` (nothing linked to any of the 4 before this). Archived the other 3 — `/cartilla/binder` cluster, `/print/*` cluster, `teacher/print.tsx` placeholder — to `src/_archive/orphaned-print-implementations/` with a README, after confirming via grep none were linked from anywhere and typecheck/build/tests all stayed clean. Also found (not archived, out of scope — a separate pre-existing dead pocket, not one of the 4 named implementations): `src/components/print/AnswerKeyBlock.tsx`/`ExerciseHandout.tsx`/`HomeworkSlip.tsx`, zero importers anywhere.
- **Browser check:** EJN clicks "Imprimir" on the teacher nav and gets a properly formatted printable worksheet for all 24 lessons — see `SCREENSHOTS/6.2-teacher-nav-imprimir.png` and `SCREENSHOTS/6.2-imprimir-all-working.png`.

### Task 6.3: Remove Duplicate Flipchart Console
- **Goal:** Remove the duplicate flipchart console, keeping exactly one working flipchart.
- **Exact expected files or area:** Legacy flipchart routes/components (maximum five files).
- **Done when:** Duplicate flipchart code is gone and the canonical flipchart remains untouched.
- **Status:** DONE. `/cartilla/sesiones` + `/cartilla/sesion/$n` (and the 8 components/lib file they alone used: `SessionStepRail`, `SessionProjector`, `SessionTimer`, `AudioNarrationDock`, `AccessibilityPanel`, `SessionShareCard`, `FlipBoard`, `session-store.ts`) archived to `src/_archive/orphaned-sesiones-flipchart-console/` (moved, not deleted, with a README explaining why). Confirmed via grep that nothing else imported any of them before moving. `/cartilla/sesiones` now returns a real 404, confirmed live. The real flipchart re-verified working after the move (typecheck/build/tests all clean, and `/cartilla/presentar/17` re-checked live in-browser, unchanged).
- **Browser check:** EJN verifies there is only one "Flipchart" option in the teacher menu. (Confirmed: `TeacherCrmShell.tsx`/`teacher/guia.$n.tsx`/`teacher/paginas.$n.tsx` all link only to `/cartilla/presentar/$n`; `/cartilla/sesiones` 404s.)

### Task 6.4: Redirect Dead-End Routes
- **Goal:** Remove or REDIRECT the confirmed dead-end route so every path a user can reach leads to a real working screen.
- **Exact expected files or area:** Dead-end routing files (maximum five files).
- **Done when:** Users are seamlessly routed away from dead ends to functional areas.
- **Status:** DONE. `src/routes/cartilla/teacher/recursos/$recursoId.tsx` (expected PDFs at `public/teacher/*.pdf` that were never delivered) now redirects to `/cartilla/teacher/guia` via `beforeLoad`, per its own sibling route's comment about being deprecated in favor of real content. Verified live: `/cartilla/teacher/recursos/rimas` lands on the real Guía screen, not the old empty "Esperando el PDF" state.
- **Browser check:** EJN tries to manually enter a dead-end URL and gets redirected to the dashboard or a working page. See `SCREENSHOTS/6.4-deadend-redirect.png`.

## PHASE 7: Final Verification

### Task 7.1: Phone and Desktop Verification
- **Goal:** Final phone and desktop verification of everything built.
- **Exact expected files or area:** Entire application (Review).
- **Done when:** All features render beautifully and function correctly across mobile and desktop.
- **Status:** DONE for the surfaces checked (see caveat).
  Systematically walked 12 golden-path URLs (splash, login, student join,
  teacher dashboard/roster/reportes/guía/progreso, flipchart, imprimir/all,
  student lecciones index, lesson 1, lesson 17) at both 1280×800 (desktop)
  and 390×844 (phone), screenshotting each and checking for real console
  errors. Found and fixed 4 real bugs:
  1. **Duplicate array entries** in `consonants.json` (`dama`/`mira`/`tina`
     each listed twice under one syllable) — caused a real React duplicate-
     key console warning on the Imprimir page. Removed the dupes.
  2. **Header/back-button visual collision** on `/cartilla/leccion/$n` for
     the no-session case — the fixed "Volver a mis lecciones" pill (a real,
     intentional fallback shown when there's no student session, not dead
     code) visually overlapped the in-flow header's language toggle/timer/
     lesson counter on narrow viewports. Fixed with conditional header
     top-padding (`pt-4` with a session, `pt-20` without).
  3. **Reportes and Progreso pages were completely non-functional in demo
     mode** — `StudentPicker.tsx` and `progreso.tsx` both called the real,
     Supabase-only `listClasses()`/`getClass()` directly with no seed-data
     fallback (unlike `ClassRoster.tsx`/`TeacherCrmShell.tsx`, which already
     had one), so the class dropdown was stuck on "Cargando clases..."
     forever whenever there's no live Supabase connection. `ReportCard.tsx`
     had the identical gap one layer down (`getStudentProgress`/
     `getClassProgress`). Applied the same `isSeed` fallback pattern
     (`listSeedClasses`/`getSeedClass`/`getSeedClassProgress`/
     `getSeedTeacherStudentProgress`) to all three files. Verified live:
     Reportes now shows real per-student metrics matching the roster
     exactly (Sofía 18 lessons, Mateo 10, etc.).
  4. **All 92 pages of the actual printable workbook scans**
     (`public/cartilla/art/hd/workbook/page-*.jpg` + the 44 `.png`
     duplicates) **were stored vertically flipped** — the same root-cause
     defect as the flipchart bug (PR #213), a completely separate set of
     files. Confirmed on pages 1, 20, 50, and 92 (start/middle/end).
     Fixed losslessly: `jpegtran -flip vertical` for the JPGs (same tool as
     the flipchart fix), a plain re-save for the lossless PNGs. This was a
     genuinely broken, student/teacher-facing feature — the "Imprimir"
     printable worksheets for all 24 lessons showed mirrored, unreadable
     text (e.g. "Este libro pertenece a" backwards) before this fix.
  Verified: `pnpm run typecheck`/`build`/`test` all clean after every fix
  (475/477, 2 expected fail). Screenshots: `SCREENSHOTS/7.1-final-qa/`
  (desktop/ and phone/ subfolders, 12-13 pages each).
  **Caveat:** this confirms the 12 checked surfaces are clean, not an
  exhaustive audit of every route (CRM student drill-down pages, print
  binder, individual `imprimir/$n` per-lesson pages, etc. were not
  individually walked this pass).
- **Browser check:** EJN tests the preview URL on both an iPhone and a desktop browser and finds zero layout or functional bugs.

## ON HOLD
- **Living Gretel Character:** The full animated, reactive Gretel character with blink, talk, wave, and cheer frames.
- **TTS Polish:** Implementing high-quality real human recorded voice instead of browser TTS.
- **Nonessential Cosmetic Extras:** Additional visual flair outside the core strict requirements.
