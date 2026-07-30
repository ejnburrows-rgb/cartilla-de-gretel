-- Rollback for 20260730100004_secure_student_assignments_rpc.sql.

begin;

drop function if exists public.get_student_assignments_secure(uuid, uuid, text);

commit;
