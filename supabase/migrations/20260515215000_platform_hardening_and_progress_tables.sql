-- Platform hardening + normalized progress tables.
-- Keeps the book/content untouched; this only adds safer classroom data tracking.

-- Remove broad public read policies. Student access continues through validated server functions.
drop policy if exists "classes public read" on public.classes;
drop policy if exists "students public read" on public.students;
drop policy if exists "assignments public read" on public.assignments;

-- One authoritative row per student and lesson.
create table if not exists public.student_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'started' check (status in ('not_started','started','completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_active_at timestamptz not null default now(),
  best_score integer,
  best_total integer,
  total_attempts integer not null default 0,
  time_seconds integer not null default 0,
  unique(student_id, lesson_id)
);
create index if not exists student_lesson_progress_student_idx on public.student_lesson_progress(student_id);
create index if not exists student_lesson_progress_lesson_idx on public.student_lesson_progress(lesson_id);

-- One authoritative row per assignment and student.
create table if not exists public.assignment_progress (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned','started','completed','late')),
  started_at timestamptz,
  completed_at timestamptz,
  time_seconds integer not null default 0,
  score integer,
  total integer,
  unique(assignment_id, student_id)
);
create index if not exists assignment_progress_assignment_idx on public.assignment_progress(assignment_id);
create index if not exists assignment_progress_student_idx on public.assignment_progress(student_id);

-- One authoritative row per exercise. This prevents cumulative progress_events from inflating accuracy.
create table if not exists public.exercise_attempt_summary (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_id text not null,
  exercise text not null,
  attempts integer not null default 0,
  hits integer not null default 0,
  completed_rounds integer not null default 0,
  last_updated timestamptz not null default now(),
  unique(student_id, lesson_id, exercise)
);
create index if not exists exercise_attempt_summary_student_idx on public.exercise_attempt_summary(student_id);
create index if not exists exercise_attempt_summary_lesson_idx on public.exercise_attempt_summary(lesson_id);

alter table public.student_lesson_progress enable row level security;
alter table public.assignment_progress enable row level security;
alter table public.exercise_attempt_summary enable row level security;

-- Teachers can read/manage only data for their own classes.
drop policy if exists "student progress teacher read" on public.student_lesson_progress;
create policy "student progress teacher read" on public.student_lesson_progress for select
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = student_lesson_progress.student_id and c.teacher_id = auth.uid()
));

drop policy if exists "student progress teacher delete" on public.student_lesson_progress;
create policy "student progress teacher delete" on public.student_lesson_progress for delete
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = student_lesson_progress.student_id and c.teacher_id = auth.uid()
));

drop policy if exists "assignment progress teacher read" on public.assignment_progress;
create policy "assignment progress teacher read" on public.assignment_progress for select
using (exists (
  select 1 from public.assignments a
  join public.classes c on c.id = a.class_id
  where a.id = assignment_progress.assignment_id and c.teacher_id = auth.uid()
));

drop policy if exists "assignment progress teacher delete" on public.assignment_progress;
create policy "assignment progress teacher delete" on public.assignment_progress for delete
using (exists (
  select 1 from public.assignments a
  join public.classes c on c.id = a.class_id
  where a.id = assignment_progress.assignment_id and c.teacher_id = auth.uid()
));

drop policy if exists "exercise summary teacher read" on public.exercise_attempt_summary;
create policy "exercise summary teacher read" on public.exercise_attempt_summary for select
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = exercise_attempt_summary.student_id and c.teacher_id = auth.uid()
));

drop policy if exists "exercise summary teacher delete" on public.exercise_attempt_summary;
create policy "exercise summary teacher delete" on public.exercise_attempt_summary for delete
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = exercise_attempt_summary.student_id and c.teacher_id = auth.uid()
));
