-- Complete the production hardening for the browser-local public release.
-- These legacy cloud student RPCs are no longer used by the public experience.
-- Keep them server-only until a scoped cloud student-session flow is intentionally
-- restored end-to-end.

begin;

revoke execute on function public.get_student_assignments(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.get_student_folder_assignments(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.get_student_progress(uuid, text) from public, anon, authenticated;
revoke execute on function public.join_class(text, text) from public, anon, authenticated;
revoke execute on function public.log_student_progress(uuid, text, text, text, integer, integer, integer, jsonb) from public, anon, authenticated;
revoke execute on function public.save_last_page(uuid, text, text, integer) from public, anon, authenticated;

commit;
