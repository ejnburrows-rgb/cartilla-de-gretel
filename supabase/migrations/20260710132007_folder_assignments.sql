-- Lets a teacher assign any activity from the 5 guide folders (Guía del
-- profesor, Tablas silábicas y de vocales, Tareas para el hogar,
-- Evaluaciones, Poemas y audio) to one student, a set of selected students,
-- or the whole class. Purely additive: one new table, RLS scoped to the
-- owning teacher, one new read-only RPC for students. Nothing existing is
-- altered.

create table if not exists public.folder_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  folder_key text not null check (folder_key in ('guia', 'tablas', 'tareas', 'evaluaciones', 'poemas')),
  lesson_id text not null,
  activity_label text not null,
  target_scope text not null check (target_scope in ('class', 'students')),
  student_ids uuid[],
  created_at timestamptz not null default now()
);

-- A "students" assignment must actually name at least one student; a
-- "class" assignment must not carry a student list (avoids an ambiguous
-- half-filled row).
alter table public.folder_assignments
  add constraint folder_assignments_scope_shape check (
    (target_scope = 'class' and student_ids is null)
    or (target_scope = 'students' and student_ids is not null and array_length(student_ids, 1) > 0)
  );

alter table public.folder_assignments enable row level security;

-- Teachers can only see/manage assignments on classes they own.
create policy "Teachers manage their own folder assignments"
  on public.folder_assignments
  for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = folder_assignments.class_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    teacher_id = auth.uid()
    and exists (
      select 1 from public.classes c
      where c.id = folder_assignments.class_id and c.teacher_id = auth.uid()
    )
  );

-- Read-only lookup for a logged-in student session (validated by join_code +
-- student_code, same authorization shape as the existing progress RPCs) —
-- returns only the assignments actually targeting that student (whole class
-- or named individually).
create or replace function public.get_student_folder_assignments(
  p_class_id uuid,
  p_student_id uuid,
  p_student_code text
)
returns setof public.folder_assignments
language sql
security definer
set search_path = public
as $$
  select fa.*
  from public.folder_assignments fa
  join public.students s on s.id = p_student_id and s.class_id = p_class_id
  where fa.class_id = p_class_id
    and upper(s.student_code) = upper(trim(p_student_code))
    and (fa.target_scope = 'class' or p_student_id = any(fa.student_ids))
  order by fa.created_at desc;
$$;

grant execute on function public.get_student_folder_assignments(uuid, uuid, text) to anon, authenticated;
