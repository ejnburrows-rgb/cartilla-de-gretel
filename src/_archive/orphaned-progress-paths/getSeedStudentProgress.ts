// Archived 2026-07-30: dead code — no caller anywhere in src/. Also diverged
// from getSeedTeacherStudentProgress's completion rule (this one dropped any
// lesson without a "lesson_completed" event entirely, instead of reporting it
// "started"), which is exactly the kind of local-only progress path item 3 of
// the security/data-guardrails work asked to archive rather than leave lying
// around as a second opinion nobody was using but someone could wire in later.
// See src/lib/seed-data.ts's getSeedTeacherStudentProgress for the live one.

import type { SeedState } from "@/lib/seed-data";

export function getSeedStudentProgress(state: SeedState, studentId: string) {
  const student = state.students.find((s) => s.id === studentId);
  if (!student) throw new Error("Alumno no encontrado.");
  const cls = state.classes.find((c) => c.id === student.class_id) ?? null;
  const events = state.events.filter((e) => e.student_id === studentId);
  return {
    student: { display_name: student.display_name, student_code: student.student_code },
    class: cls ? { name: cls.name } : null,
    events,
    lessonProgress: Array.from(
      new Set(events.filter((e) => e.event_kind === "lesson_completed").map((e) => e.lesson_id)),
    ).map((lesson_id) => ({ lesson_id, status: "completed" })),
  };
}
