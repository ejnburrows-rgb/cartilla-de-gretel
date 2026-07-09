-- Class-code + tap-your-name student login (no passwords, no typed student code).
-- The student types only the class join code, then taps their own name from
-- the real roster of that class. join_class (join_code + student_code) is
-- kept for backward compatibility; these two new RPCs are the new entry
-- point used by the reworked /cartilla/unirse flow.

-- Step 1: list the real students in a class by join code only. Exposes
-- nothing sensitive (no student_code) — just enough to render a tap-to-pick
-- list scoped to that one class.
create or replace function public.list_class_students(
  p_join_code text
)
returns table (
  student_id uuid,
  display_name text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id as student_id,
    s.display_name
  from public.classes c
  join public.students s on s.class_id = c.id
  where upper(c.join_code) = upper(trim(p_join_code))
  order by s.display_name asc;
$$;

-- Step 2: the student taps a name from the list returned above; this
-- validates that the tapped student_id genuinely belongs to the class
-- matching that same join code, then returns the same session shape
-- join_class already returns (student_code is still returned internally so
-- the existing progress/assignment RPCs, which take it as an authorization
-- credential, keep working unchanged — the student never sees or types it).
create or replace function public.enter_class_as_student(
  p_join_code text,
  p_student_id uuid
)
returns table (
  student_id uuid,
  student_name text,
  student_code text,
  class_id uuid,
  class_name text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id as student_id,
    s.display_name as student_name,
    s.student_code,
    c.id as class_id,
    c.name as class_name
  from public.classes c
  join public.students s on s.class_id = c.id
  where upper(c.join_code) = upper(trim(p_join_code))
    and s.id = p_student_id
  limit 1;
$$;

grant execute on function public.list_class_students(text) to anon, authenticated;
grant execute on function public.enter_class_as_student(text, uuid) to anon, authenticated;
