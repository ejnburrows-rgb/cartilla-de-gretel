/**
 * student-cursor — decides which screens get the classic pencil cursor.
 *
 * Owner decision 2026-07-25 (docs/DECISIONS.md item 5, issue #346): the
 * student side of the app uses a pencil cursor so working in the workbook
 * feels like writing in the real book. This is app iconography (UI chrome),
 * not book art, so the never-invent-art rule does not apply to it.
 *
 * Teacher and admin screens keep the normal arrow — a teacher is running a
 * class, not drawing — and the accessibility modes keep the standard system
 * cursor too (a custom cursor is exactly the kind of thing that hurts when
 * someone needs a predictable, high-visibility pointer).
 *
 * Kept as a pure function so the routing rule is unit-testable on its own,
 * without mounting the router.
 */

/** Teacher/admin surfaces — these keep the normal cursor. */
const TEACHER_PREFIXES = [
  "/cartilla/teacher",
  // The classroom flipchart is projector/teacher-run, not a student screen.
  "/cartilla/presentar",
  "/login",
];

/**
 * True when `pathname` is a student-facing screen.
 *
 * The student product lives under `/cartilla/…`; everything under it counts
 * except the teacher-run surfaces listed above. Marketing/landing screens
 * (`/`, `/entrar`) deliberately keep the normal cursor — a parent or teacher
 * is just as likely to be the one clicking there.
 */
export function isStudentPath(pathname: string): boolean {
  // Normalize a trailing slash so "/cartilla/teacher/" matches too.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  // Must be the `/cartilla` section itself or a segment under it — a bare
  // `startsWith` would also match an unrelated route like `/cartillas-x`.
  if (path !== "/cartilla" && !path.startsWith("/cartilla/")) return false;

  return !TEACHER_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** The class the pencil cursor CSS hangs off (applied to <html>). */
export const STUDENT_CURSOR_CLASS = "student-pencil";
