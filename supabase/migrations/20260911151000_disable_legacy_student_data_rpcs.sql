-- Production hardening for the public/local review release.
-- The current public student/teacher experience uses browser-local sample/progress data.
-- These legacy cloud student RPCs are not needed by that release and expose child data
-- when called anonymously. Disable them until the scoped-session flow is deliberately
-- reintroduced end-to-end.

begin;

revoke execute on function public.list_class_students(text) from public, anon, authenticated;
revoke execute on function public.enter_class_as_student(text, uuid) from public, anon, authenticated;

commit;
