import { getDemoStudentSession } from "./demo-student-session";
import { useSyncExternalStore } from "react";

/** Anonymous history remains anonymous; never adopt it into a student account. */
export function learnerScope(): string {
  if (typeof window === "undefined") return "anonymous";
  const demo = getDemoStudentSession();
  if (demo) return `demo:${encodeURIComponent(demo.classId)}:${encodeURIComponent(demo.studentId)}`;
  if (import.meta.env.VITE_CRM_REVIEW === "true" && import.meta.env.MODE !== "test") return "anonymous";
  try {
    const session = JSON.parse(localStorage.getItem("cartilla.student-session.v1") ?? "null");
    if (typeof session?.studentId === "string" && typeof session?.classId === "string") {
      return `student:${encodeURIComponent(session.classId)}:${encodeURIComponent(session.studentId)}`;
    }
  } catch { /* unavailable or invalid identity stays anonymous */ }
  return "anonymous";
}
export function learnerStorageKey(key: string): string {
  const scope = learnerScope();
  return scope === "anonymous" ? key : `${key}:${scope}`;
}
function subscribe(refresh: () => void) {
  window.addEventListener("cartilla:student-session", refresh);
  window.addEventListener("storage", refresh);
  return () => {
    window.removeEventListener("cartilla:student-session", refresh);
    window.removeEventListener("storage", refresh);
  };
}
export function useLearnerScope(): string {
  return useSyncExternalStore(subscribe, learnerScope, () => "anonymous");
}
