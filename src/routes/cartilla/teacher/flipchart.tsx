import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStudentSession } from "@/lib/student-session";

// Teacher-only gate. The flip book is a teacher presentation tool: the teacher
// drives it and projects it to the class while students only watch. They never
// navigate here themselves, so if an active student session is detected, bounce
// back to the student lessons. Mirrors the parent /cartilla/teacher guard so the
// whole teacher lane stays teacher-only.
export const Route = createFileRoute("/cartilla/teacher/flipchart")({
  beforeLoad: () => {
    const session = getStudentSession();
    if (session) {
      throw redirect({ to: "/cartilla/student/lecciones" });
    }
  },
  component: FlipchartLayout,
});

function FlipchartLayout() {
  return <Outlet />;
}
