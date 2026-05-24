# Classroom CRM Status

Date: 2026-05-24

## What Works

- Teachers can sign in, create classes, add students, copy class join codes, view class rosters, delete students/classes, and export class CSVs.
- Students can join with a class code and personal student code, keep a browser session, open the workbook, complete lessons, and view their own progress.
- Lesson completion, exercise attempts, study time, badges, and level events are recorded through the shared progress event pipeline.
- Teacher class pages show class progress across all 24 lessons, per-student completed lesson counts, event counts, last activity, assignments, and per-student detail pages.
- Assignments can be created/deleted by teachers and shown to joined students when Supabase is configured. In local demo mode, assignments persist in localStorage.

## Local Demo Mode

When Supabase environment variables are missing, the app runs in local demo mode:

- Teacher demo login uses the built-in demo teacher accounts.
- Classes, students, assignments, and progress events are stored in `localStorage` under the demo CRM state.
- Student sessions are stored in `localStorage`.
- Lesson completion is scoped by `classId` and `studentId` so two demo students do not overwrite each other's completed lessons in the same browser.
- UI surfaces say "Modo demo local" instead of pretending cloud persistence is active.

Local demo mode is browser-local only. Clearing site data clears demo classes, assignments, sessions, and progress.

## Supabase Mode

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured:

- Teacher auth uses Supabase Auth.
- Class and student management uses Supabase tables.
- Student join and progress logging use the student RPCs.
- Teacher progress summaries use `classes`, `students`, `progress_events`, `assignments`, and `assignment_progress`.
- Assignment status is updated by the Supabase progress RPCs when students start work, complete lessons, or submit exercise/time events.

## Teacher Flow

1. Teacher opens `/login`.
2. Teacher signs in with Supabase credentials or a demo teacher account.
3. Teacher opens `/cartilla/teacher`.
4. Teacher creates or selects a class.
5. Teacher adds students and shares the class join code plus each student's personal code.
6. Teacher monitors class progress, assignment status, and per-student details from the class page.

## Student Flow

1. Student opens `/cartilla/unirse`.
2. Student enters class code and personal code.
3. App stores a student session.
4. Student opens `/cartilla/lecciones` and works through the workbook.
5. Completion, time, and exercise events are saved to Supabase or local demo storage.
6. Student opens `/cartilla/mi-progreso` to see personal completion and exercise results.

## Known Follow-Ups

- Add automated tests around local demo assignment persistence.
- Add a teacher-facing reset/export control for local demo data.
- Add explicit assignment progress rows in local mode if the UI later needs started/late state parity with Supabase.
- Keep workbook scan mapping, source art, and student interaction mapping separate from this CRM lane.
