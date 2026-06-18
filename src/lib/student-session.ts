import { useEffect, useState } from "react";
import { enqueueProgress } from "@/lib/progress-queue";
import { recordExerciseStat } from "@/lib/exercise-stats";

export type StudentSession = {
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
};

const KEY = "cartilla.student-session.v1";

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentSession;
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

/**
 * Records a progress event. Always mirrors exercise results to local stats
 * (works offline and for anonymous users), then — if a student session exists —
 * enqueues the event for durable, offline-tolerant sync to Supabase. The
 * enqueue persists immediately and retries on its own, so this stays a
 * non-blocking call from the UI's perspective.
 */
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
  // Queued, not fired-and-forgotten: survives offline / transient failures and
  // drains on reconnect (see src/lib/progress-queue.ts).
  void enqueueProgress({
    studentId: s.studentId,
    studentCode: s.studentCode,
    ...input,
  });
}
