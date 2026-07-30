-- Secure read path for a student's own assignments, matching the pattern in
-- 20260730100002_secure_progress_rpcs_and_invitations.sql: the existing
-- get_student_assignments() authorizes with the reusable student_code, so a
-- leaked code (from the #385 flow) could also be replayed here forever.
-- get_student_assignments_secure() authorizes with the same short-lived,
-- single-child session token instead.
--
-- Prepared only — do not apply to production until the owner approves the
-- authentication/permissions migration gate.
-- Depends on 20260730100000_secure_student_sessions_and_teacher_approval.sql.

begin;

create or replace function public.get_student_assignments_secure(
  p_class_id uuid,
  p_student_id uuid,
  p_session_token text
)
returns table (
  id uuid,
  lesson_id text,
  title text,
  due_at timestamptz,
  time_limit_seconds integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.validate_student_session(p_student_id, p_class_id, p_session_token) then
    raise exception 'No se pudieron cargar las tareas.';
  end if;

  return query
    select
      a.id,
      a.lesson_id,
      a.title,
      a.due_at,
      a.time_limit_seconds,
      a.created_at
    from public.assignments a
    join public.students s on s.class_id = a.class_id
    where a.class_id = p_class_id
      and s.id = p_student_id
      and s.class_id = p_class_id
    order by a.due_at asc nulls last, a.created_at desc;
end;
$$;

grant execute on function public.get_student_assignments_secure(uuid, uuid, text) to anon, authenticated;

commit;
