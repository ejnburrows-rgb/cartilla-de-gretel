-- Admin cross-teacher read access (D7 live lane, issue #343).
--
-- WHY THIS EXISTS
-- The admin dashboard at /cartilla/teacher/admin has only ever worked in the
-- demo lane. Wiring it live turned up the real blocker: there is no admin read
-- path in the database at all. Every policy on the teaching tables is scoped
-- strictly to `teacher_id = auth.uid()`, so a user holding the 'admin' role
-- sees exactly what a teacher sees — their own rows and nothing else.
--
-- This migration adds SELECT-only policies for admins, so the cross-teacher
-- roll-up can read what it needs.
--
-- SAFETY NOTES (read before applying)
--   * READ ONLY. Admins get SELECT and nothing else. No admin INSERT, UPDATE
--     or DELETE policy is added here — an admin can look at every class, but
--     cannot modify another teacher's data.
--   * ADDITIVE. Existing teacher policies are untouched. Postgres combines
--     permissive policies with OR, so a teacher's own access is unchanged and
--     nothing a teacher could already do is taken away.
--   * NARROW. `public.has_role(auth.uid(), 'admin')` is the only new
--     condition, reusing the existing security-definer helper rather than
--     querying user_roles inline (which would recurse through RLS).
--   * REVERSIBLE. Every policy is dropped by name first, so re-running is
--     safe, and dropping the five policies below fully reverts this change.
--
-- The 'admin' role is granted manually by the owner in the database; nothing
-- in the app can promote an account to admin.

-- classes ------------------------------------------------------------------
drop policy if exists "classes admin read" on public.classes;
create policy "classes admin read" on public.classes for select
  using (public.has_role(auth.uid(), 'admin'));

-- students -----------------------------------------------------------------
drop policy if exists "students admin read" on public.students;
create policy "students admin read" on public.students for select
  using (public.has_role(auth.uid(), 'admin'));

-- progress_events ----------------------------------------------------------
drop policy if exists "progress admin read" on public.progress_events;
create policy "progress admin read" on public.progress_events for select
  using (public.has_role(auth.uid(), 'admin'));

-- student_lesson_progress --------------------------------------------------
drop policy if exists "student progress admin read" on public.student_lesson_progress;
create policy "student progress admin read" on public.student_lesson_progress for select
  using (public.has_role(auth.uid(), 'admin'));

-- exercise_attempt_summary -------------------------------------------------
drop policy if exists "exercise summary admin read" on public.exercise_attempt_summary;
create policy "exercise summary admin read" on public.exercise_attempt_summary for select
  using (public.has_role(auth.uid(), 'admin'));
