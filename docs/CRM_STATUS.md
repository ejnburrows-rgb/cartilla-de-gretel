# Classroom CRM Status

Date: 2026-05-24

## What Works

- **Teacher Roster & Class Management**: Teachers can sign in, create classes, add students in bulk (split by line/comma), copy class join codes, view class rosters, delete students/classes, and export class rosters directly to CSV.
- **Dynamic Teacher Dashboard**: Teacher class detail pages show aggregated progress across all 24 lessons, per-student completed lesson counts, event counts, last active timestamps, assignments tracking, and comprehensive per-student progress pages.
- **Student Workbook Connection**: Alumnos can join instantly with a class join code and their personal student code. Browser sessions are persistent across refreshes and tabs.
- **Shared Progress Event Pipeline**: Student lesson completions, exercise attempts (score/total), study time, badges, and level-up events are recorded in real-time.
- **Curriculum Assignments**: Teachers can assign specific lessons, due dates, and time limits. Students see these assignments prominently at the top of their active lesson page, and progress updates dynamically.

---

## Local Demo Mode (Hardened)

When Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) are missing, the CRM runs in a robust, hardened Local Demo Mode:

- **Auth Fallbacks**: Teacher login instantly matches standard built-in accounts (`leonore@cartilla.demo` or `emilio@cartilla.demo`).
- **Reactive Local Storage State**: Classes, students, assignments, and progress events are stored under the demo CRM namespace. Changes trigger reactive events across open browser components.
- **Isolated Progress Scopes**: Lesson completions are cleanly scoped by `classId` and `studentId` in local storage, preventing different demo students from overwriting each other's work in the same browser.
- **Data Management Console**: We built a teacher-facing local data panel to:
  - **Export State**: Download the entire local CRM database (classes, students, events, assignments) as a portable JSON file.
  - **Import State**: Restore/upload a previously exported JSON state to reconstruct the roster/progress.
  - **Reset State**: Wipe local storage changes and reset the state back to the original initial seed data (containing pre-seeded classes and progress events).

---

## Supabase Mode

When configured:

- **Secure Auth**: Uses Supabase GoTrue Auth.
- **Persisted CRM Tables**: Queries and updates live records inside `classes` and `students`.
- **RPC Event Loggers**: Joins and progress submissions trigger pg-RPCs (`join_class`, `log_student_progress`, `get_student_progress`).
- **Assignment Progress sync**: RPCs automatically populate progress summaries showing started/completed ratios, average completion time, and exercise accuracy.

---

## Hardened User Flows

### Student Flow
1. Open `/cartilla/unirse`.
2. Under Local Demo Mode, select a pre-configured student or enter a custom join/student code.
3. Persistent session is established.
4. Work through the student workbook at `/cartilla/lecciones`. Completed lessons and exercise scores are auto-recorded via `recordEvent()`.
5. Open `/cartilla/mi-progreso` to review personal stats (time spent, lessons completed, accuracy chart) and export private CSV.

### Teacher Flow
1. Open `/login`.
2. Sign in with standard teacher account or demo credentials.
3. Open `/cartilla/teacher`.
4. Create class cohorts, add students, and copy class join codes.
5. Create, track, or delete assignments.
6. Manage local demo states (Export/Import/Reset) cleanly from the dashboard console.

---

## Reliability States Added

- Student progress save now emits a visible state: saving, synced, saved locally, or sync unavailable.
- Local demo mode explicitly says progress is browser-local and cannot sync without Supabase.
- Student progress view exits loading with a clear message if the student session disappears.
- Teacher dashboard surfaces class load failures instead of leaving the page ambiguous.
- Teacher class pages show progress-summary, assignment-load, empty-assignment, and no-students states.
- Teacher student detail pages show a clear error state if progress cannot be loaded.
