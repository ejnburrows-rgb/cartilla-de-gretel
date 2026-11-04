import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isStudentPath, STUDENT_CURSOR_CLASS } from "@/lib/student-cursor";

/**
 * StudentCursor — turns the pencil cursor on while a student screen is open.
 *
 * Mounted once in the root route. It only toggles a class on <html> (the same
 * place the accessibility toolbar puts its `a11y-*` classes), so the actual
 * cursor lives in CSS next to those rules and there is one obvious place to
 * look. Renders nothing.
 */
export function StudentCursor() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(STUDENT_CURSOR_CLASS, isStudentPath(pathname));
    return () => root.classList.remove(STUDENT_CURSOR_CLASS);
  }, [pathname]);

  return null;
}
