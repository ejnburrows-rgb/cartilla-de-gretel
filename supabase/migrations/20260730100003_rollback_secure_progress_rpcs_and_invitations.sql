-- Rollback for 20260730100002_secure_progress_rpcs_and_invitations.sql.
-- Prepared only. Do not run against production without owner approval.

begin;

drop function if exists public.accept_teacher_invitation(text);
drop function if exists public.save_last_page_secure(uuid, uuid, text, text, integer);
drop function if exists public.get_student_progress_secure(uuid, uuid, text);
drop function if exists public.log_student_progress_secure(uuid, uuid, text, text, text, integer, integer, integer, jsonb);

drop table if exists public.data_retention_settings;

commit;
