-- Lesson verification table: teacher sign-off per student per lesson (L7-24).
-- Referenced by src/lib/lesson-verification.functions.ts (direct client
-- upsert/select, not an RPC) since it was written, but no migration ever
-- defined the table -- every call has been failing at runtime with
-- "relation does not exist". This adds the table and matching RLS.

create table if not exists public.lesson_verifications (
  id uuid primary key default gen_random_uuid(),
  lesson_number integer not null check (lesson_number between 7 and 24),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  verified boolean not null default false,
  "timestamp" timestamptz not null default now(),
  unique (lesson_number, student_id)
);

create index if not exists lesson_verifications_student_idx on public.lesson_verifications(student_id);
create index if not exists lesson_verifications_teacher_idx on public.lesson_verifications(teacher_id);

alter table public.lesson_verifications enable row level security;

-- Teachers can read/write only verification rows for their own students.
-- Double-checked both ways, matching this codebase's existing pattern
-- (see 20260515215000_platform_hardening_and_progress_tables.sql): the
-- direct teacher_id column the client already sets on every write, plus
-- an independent join through students/classes so a stray/incorrect
-- teacher_id on an insert can't grant access to another teacher's student.

drop policy if exists "lesson verifications teacher select" on public.lesson_verifications;
create policy "lesson verifications teacher select" on public.lesson_verifications for select
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = lesson_verifications.student_id and c.teacher_id = auth.uid()
  )
);

drop policy if exists "lesson verifications teacher insert" on public.lesson_verifications;
create policy "lesson verifications teacher insert" on public.lesson_verifications for insert
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = lesson_verifications.student_id and c.teacher_id = auth.uid()
  )
);

drop policy if exists "lesson verifications teacher update" on public.lesson_verifications;
create policy "lesson verifications teacher update" on public.lesson_verifications for update
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = lesson_verifications.student_id and c.teacher_id = auth.uid()
  )
)
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = lesson_verifications.student_id and c.teacher_id = auth.uid()
  )
);

drop policy if exists "lesson verifications teacher delete" on public.lesson_verifications;
create policy "lesson verifications teacher delete" on public.lesson_verifications for delete
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = lesson_verifications.student_id and c.teacher_id = auth.uid()
  )
);
