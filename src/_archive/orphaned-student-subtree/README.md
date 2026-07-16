# Archived: unreachable parallel student-screen subtree

Moved here 2026-07-16, out of `src/routes/` / `src/components/` so they no
longer register as live routes or get bundled. Not deleted — per repo
policy, files are moved/archived, never deleted.

Why: the entire `/cartilla/student/*` subtree (`lecciones`, `practica`,
`repaso`, `mi-progreso`, `libro`, `libro-vivo`, `route`,
`_components/LessonSkeleton`) duplicated the real, live student path
(`/` → `/cartilla/unirse` → `/cartilla/lecciones` → `/cartilla/leccion/$n`)
but nothing links to it — confirmed via repo-wide grep for `<Link>`/
`navigate()`/`redirect()` targets pointing at `/cartilla/student/*`; the
only references were the cluster's own files linking to each other.
`/cartilla/libro` (root-level) was a pure redirect stub pointing only into
this subtree (`/cartilla/student/libro`), also unreferenced from
anywhere else — archived alongside it as `libro-redirect-stub.tsx`.
`BookReader.tsx` and `FlipErrorBoundary.tsx` were used only by
`student/libro.tsx` (confirmed via grep — no other importers) — archived
with the subtree rather than left behind as now-dead shared components.

**Verified the real live path first, per the "cleanup only after the live
flow it duplicates is verified working" rule**, before archiving anything
here: unlocked progress via the app's own `cartilla.lesson-progress.v1`
localStorage key and checked lessons 6, 8, 10, 17, and 24 live in-browser
on `/cartilla/leccion/$n` — all render real, faithful content with zero
console errors (see the "Blocked/Pending Findings" correction and Task 5.2
entry in `PLAN.md` for the detail; screenshots weren't saved for that pass
since it was pure verification, no code changed there).

**Not archived, left in place because it's genuinely shared elsewhere:**
`LivingWorkbookPage.tsx` (used by `student/libro-vivo.tsx`, which *is*
archived here, but also by two `DEV`-only sandbox routes and its own test
file — confirmed via grep, so the component itself stays).

If any feature here is ever wanted for the real student path, port it
into `/cartilla/leccion/$n` deliberately — don't just move these files
back to `src/routes/`.
