-- Restore the optional cloud student lane with the personal two-code credential.
-- The roster-by-class-code/tap-name RPCs remain revoked: a class join code alone
-- must never enumerate children's names or create a student session.
--
-- These SECURITY DEFINER functions validate BOTH the student UUID/code pair
-- (and class id where applicable) before reading/writing child data.

begin;

-- Keep the privacy-sensitive roster lane disabled.
revoke execute on function public.list_class_students(text) from public, anon, authenticated;
revoke execute on function public.enter_class_as_student(text, uuid) from public, anon, authenticated;

-- Two-code join returns only the one matching student.
grant execute on function public.join_class(text, text) to anon, authenticated;

-- Student-scoped operations all validate p_student_code inside the function.
grant execute on function public.get_student_assignments(uuid, uuid, text) to anon, authenticated;
grant execute on function public.get_student_progress(uuid, text) to anon, authenticated;
grant execute on function public.log_student_progress(uuid, text, text, text, integer, integer, integer, jsonb) to anon, authenticated;
grant execute on function public.save_last_page(uuid, text, text, integer) to anon, authenticated;

commit;
