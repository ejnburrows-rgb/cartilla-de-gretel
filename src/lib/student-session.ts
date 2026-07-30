import { useEffect, useState } from "react";
import {
  isSessionActive,
  logProgressWithSession,
  type ScopedStudentSession,
} from "@/lib/secure-student-access";
import { recordExerciseStat } from "@/lib/exercise-stats";

/** A scoped, expiring session — never a reusable student_code. See secure-student-access.ts. */
export type StudentSession = ScopedStudentSession;

const KEY = "cartilla.student-session.v1";

/** Returns the stored session, or null if there is none or it has expired. */
export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StudentSession;
    if (!isSessionActive(session)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setStudentSession(s: StudentSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cartilla:student-session"));
}

export function useStudentSession() {
  const [session, setSession] = useState<StudentSession | null>(null);
  useEffect(() => {
    setSession(getStudentSession());
    const h = () => setSession(getStudentSession());
    window.addEventListener("storage", h);
    window.addEventListener("cartilla:student-session", h);
    return () => {
      window.removeEventListener("storage", h);
      window.removeEventListener("cartilla:student-session", h);
    };
  }, []);
  return session;
}

type LogInput = {
  lessonId: string;
  kind: "lesson_completed" | "exercise" | "time" | "badge" | "level";
  score?: number;
  total?: number;
  timeSeconds?: number;
  meta?: Record<string, unknown>;
};

/** Fire-and-forget: only logs if a student session exists. */
export function recordEvent(input: LogInput) {
  // Always mirror exercise results to local stats (works for anonymous users too).
  if (input.kind === "exercise" && input.lessonId && typeof input.total === "number") {
    const meta = (input.meta ?? {}) as { exercise?: string; completed?: boolean };
    if (meta.exercise) {
      recordExerciseStat({
        lessonId: input.lessonId,
        exercise: meta.exercise,
        score: input.score ?? 0,
        total: input.total,
        completed: meta.completed,
      });
    }
  }
  const s = getStudentSession();
  if (!s) return;
  logProgressWithSession(s, {
    studentId: s.studentId,
    ...input,
  }).catch((err) => console.warn("recordEvent failed", err));
}
