-- Private teacher notes per student. Visible only to the teacher who owns the
-- student's class, never to students or other teachers.

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists student_notes_student_idx on public.student_notes(student_id);
create index if not exists student_notes_teacher_idx on public.student_notes(teacher_id);

alter table public.student_notes enable row level security;

drop policy if exists "student notes teacher select" on public.student_notes;
create policy "student notes teacher select" on public.student_notes for select
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = student_notes.student_id and c.teacher_id = auth.uid()
));

drop policy if exists "student notes teacher insert" on public.student_notes;
create policy "student notes teacher insert" on public.student_notes for insert
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = student_notes.student_id and c.teacher_id = auth.uid()
  )
);

drop policy if exists "student notes teacher delete" on public.student_notes;
create policy "student notes teacher delete" on public.student_notes for delete
using (exists (
  select 1 from public.students s
  join public.classes c on c.id = s.class_id
  where s.id = student_notes.student_id and c.teacher_id = auth.uid()
));
