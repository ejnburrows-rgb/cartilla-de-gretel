-- Rollback for 20260730100000_secure_student_sessions_and_teacher_approval.sql.
-- Prepared only. Do not run against production without owner approval.

begin;

drop function if exists public.rotate_class_join_code(uuid);
drop function if exists public.validate_student_session(uuid, uuid, text);
drop function if exists public.validate_progress_meta(jsonb);

drop table if exists public.student_data_requests;
drop table if exists public.class_code_history;
drop table if exists public.teacher_invitations;
drop table if exists public.student_sessions;

alter table if exists public.students
  alter column teacher_notes type text,
  drop column if exists deletion_requested_at,
  drop column if exists permanently_deleted_at;

-- Restore the historical handle_new_user behavior only if the owner explicitly
-- rolls back the approval gate. This reopens public self-registration as teacher.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'teacher')
  on conflict do nothing;

  return new;
end;
$$;

commit;
