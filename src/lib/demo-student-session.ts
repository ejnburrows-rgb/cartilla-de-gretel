import { getSeedClass, isSeedSessionActive, resetSeedStateRaw, startTeacherReview } from "./seed-data";

const KEY = "cartilla.demo-student-session.v1";
export type DemoStudentSession = { classId: string; studentId: string; studentName: string; studentCode: string; className: string };

/** Explicit synthetic identity, local to this tab. Never reuses a real session. */
export function getDemoStudentSession(): DemoStudentSession | null {
  if (typeof window === "undefined" || import.meta.env.VITE_CRM_REVIEW !== "true" || !isSeedSessionActive()) return null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (!saved || typeof saved.classId !== "string" || typeof saved.studentId !== "string") return null;
    const data = getSeedClass(saved.classId);
    const student = data.students.find(row => row.id === saved.studentId);
    if (!student) return null;
    return { classId: data.class.id, className: data.class.name, studentId: student.id, studentName: student.display_name, studentCode: student.student_code };
  } catch { return null; }
}
export function startDemoStudentSession(classId: string, studentId: string) {
  if (import.meta.env.VITE_CRM_REVIEW !== "true" || !isSeedSessionActive()) throw new Error("Abre primero la clase de ejemplo.");
  const data = getSeedClass(classId);
  if (!data.students.some(row => row.id === studentId)) throw new Error("Alumno de ejemplo no encontrado.");
  sessionStorage.setItem(KEY, JSON.stringify({ classId, studentId }));
  window.dispatchEvent(new Event("cartilla:student-session"));
}
export function endDemoStudentSession() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cartilla:student-session"));
}

/** Explicit reset clears synthetic demo work only, after UI confirmation. */
export function resetDemoClassroom() {
  if (import.meta.env.VITE_CRM_REVIEW !== "true" || !isSeedSessionActive()) throw new Error("Abre primero la clase de ejemplo.");
  endDemoStudentSession();
  const demoKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string => Boolean(key?.includes(":demo:")));
  for (const key of demoKeys) localStorage.removeItem(key);
  resetSeedStateRaw();
  startTeacherReview();
}
