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
  - Activities incomplete: Lessons 1-5, 7, 9 ready; 6, 8, 10-24 pending.
  - `progreso.tsx` still lets teacher manually toggle lesson completion via disconnected local-only `crmService`.

## PHASE 1: Build Health

### Task 1.1: Repair clean-install and Verify Check
- **Goal:** Repair the broken clean-install (stale lockfile) so the Verify check on GitHub passes again.
- **Exact expected files or area:** `package-lock.json` or `pnpm-lock.yaml`, `package.json`
- **Done when:** `pnpm install` runs cleanly without stale lockfile warnings and GitHub Verify action turns green.
- **Status:** NOT STARTED
- **Browser check:** EJN can look at the GitHub PR status and see a green checkmark for the Verify step.

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
- **Status:** BLOCKED - Sandbox lacks live internet to authenticate against Supabase endpoints. Needs cloud env keys or a live environment.
- **Browser check:** EJN can log in on the preview URL using test teacher credentials and reach the dashboard.

### Task 2.2: Adding Students & Strict Isolation
- **Goal:** Adding students correctly assigns them to the teacher's account; enforce strict isolation of each teacher's private data.
- **Exact expected files or area:** `supabase/migrations/*`, `src/lib/teacher.functions.ts` (maximum five files).
- **Done when:** RLS policies prevent Teacher A from seeing Teacher B's students, and new students appear correctly.
- **Status:** BLOCKED - Sandbox lacks live internet to authenticate against Supabase endpoints. Needs cloud env keys or a live environment.
- **Browser check:** EJN can log in as Teacher A, add a student, and confirm that Teacher B cannot see this student.

### Task 2.3: Admin Viewing & lesson_verifications Migration
- **Goal:** Allow authorized administrative viewing of other teachers' data and create the missing `lesson_verifications` migration and policies.
- **Exact expected files or area:** `supabase/migrations/*`, admin dashboard components (maximum five files).
- **Done when:** Admins can view all data and `lesson_verifications` table is active with strict RLS.
- **Status:** BLOCKED - Sandbox lacks live internet to authenticate against Supabase endpoints. Needs cloud env keys or a live environment.
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
- **Status:** NOT STARTED
- **Browser check:** EJN goes to the workbook pages for abeja, remolino, oruga, and aguja and sees the correct colored art.

### Task 4.2: Reader Layouts (Student & Teacher)
- **Goal:** Full 95-page student reader (horizontal), teacher reader vertical, selected automatically by role, no visible orientation toggle.
- **Exact expected files or area:** `src/components/cartilla/LivingWorkbookPage.tsx`, reader routing components (maximum five files).
- **Done when:** Students see the horizontal view and teachers see the vertical view automatically.
- **Status:** NOT STARTED
- **Browser check:** EJN logs in as a student on a tablet and sees horizontal orientation; logs in as a teacher and sees vertical orientation.

### Task 4.3: Physical-Book Page-Turn Animation
- **Goal:** Implement a slow, elegant, physical-book page-turn animation (visibly curls and turns, never slides/swaps instantly).
- **Exact expected files or area:** Reader CSS, page transition component (maximum five files).
- **Done when:** Navigating pages triggers a smooth curling animation on modest hardware.
- **Status:** NOT STARTED
- **Browser check:** EJN clicks "Next Page" and sees the page physically curl and turn like a real book.

### Task 4.4: Student Escuchar Option
- **Goal:** Add Escuchar (listen) option for children who cannot read.
- **Exact expected files or area:** Student exercise components, TTS trigger component (maximum five files).
- **Done when:** An audio playback button correctly reads the instructions aloud.
- **Status:** NOT STARTED
- **Browser check:** EJN taps the Escuchar button and hears the instructions spoken clearly.

## PHASE 5: Flipchart and Lessons

### Task 5.1: Complete Teacher Flipchart
- **Goal:** Complete the teacher flipchart view so it is fully functional for classroom projection.
- **Exact expected files or area:** `src/routes/cartilla/teacher/flipchart.tsx`, flipchart components (maximum five files).
- **Done when:** The flipchart displays lessons correctly in the teacher lane.
- **Status:** NOT STARTED
- **Browser check:** EJN opens the flipchart in the teacher dashboard and clicks through the presentation slides.

### Task 5.2: Connect All Sourced Lessons and Activities
- **Goal:** Connect all sourced lessons and activities (do not invent Teacher's Guide or lesson content). Ensure missing lessons (6, 8, 10-24) are wired correctly.
- **Exact expected files or area:** `src/data/page-layouts.json`, activity routing files (maximum five files).
- **Done when:** All 24 lessons and their activities are navigable and contain faithful content.
- **Status:** NOT STARTED
- **Browser check:** EJN clicks into Lesson 24 and verifies the exercises and pages load correctly.

## PHASE 6: Dead-Code Cleanup
*(Note: Cleanup tasks that delete code run only AFTER the live flows they duplicate are verified working)*

### Task 6.1: Remove Unreachable Student-Screen Subtree
- **Goal:** Remove the entire unreachable parallel student-screen subtree.
- **Exact expected files or area:** `src/routes/cartilla/student-legacy/*` or equivalent obsolete folders (maximum five files per task).
- **Done when:** The legacy student subtree is deleted and tests still pass.
- **Status:** NOT STARTED
- **Browser check:** EJN verifies the app works normally and the legacy route URLs return a 404.

### Task 6.2: Consolidate Print Implementations
- **Goal:** Consolidate the 4 print implementations into one teacher-only Imprimir/PDF implementation.
- **Exact expected files or area:** Print utility files, teacher report components (maximum five files).
- **Done when:** Only one print trigger exists in the teacher UI and generates a clean PDF.
- **Status:** NOT STARTED
- **Browser check:** EJN clicks "Imprimir" on a student report and gets a properly formatted print dialog.

### Task 6.3: Remove Duplicate Flipchart Console
- **Goal:** Remove the duplicate flipchart console, keeping exactly one working flipchart.
- **Exact expected files or area:** Legacy flipchart routes/components (maximum five files).
- **Done when:** Duplicate flipchart code is gone and the canonical flipchart remains untouched.
- **Status:** NOT STARTED
- **Browser check:** EJN verifies there is only one "Flipchart" option in the teacher menu.

### Task 6.4: Redirect Dead-End Routes
- **Goal:** Remove or REDIRECT the confirmed dead-end route so every path a user can reach leads to a real working screen.
- **Exact expected files or area:** Dead-end routing files (maximum five files).
- **Done when:** Users are seamlessly routed away from dead ends to functional areas.
- **Status:** NOT STARTED
- **Browser check:** EJN tries to manually enter a dead-end URL and gets redirected to the dashboard or a working page.

## PHASE 7: Final Verification

### Task 7.1: Phone and Desktop Verification
- **Goal:** Final phone and desktop verification of everything built.
- **Exact expected files or area:** Entire application (Review).
- **Done when:** All features render beautifully and function correctly across mobile and desktop.
- **Status:** NOT STARTED
- **Browser check:** EJN tests the preview URL on both an iPhone and a desktop browser and finds zero layout or functional bugs.

## ON HOLD
- **Living Gretel Character:** The full animated, reactive Gretel character with blink, talk, wave, and cheer frames.
- **TTS Polish:** Implementing high-quality real human recorded voice instead of browser TTS.
- **Nonessential Cosmetic Extras:** Additional visual flair outside the core strict requirements.
