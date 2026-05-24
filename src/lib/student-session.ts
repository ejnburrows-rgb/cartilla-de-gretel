import { useEffect, useState } from "react";
import { logProgress } from "@/lib/student.functions";
import { recordExerciseStat } from "@/lib/exercise-stats";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export type StudentSession = {
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
};

const KEY = "cartilla.student-session.v1";
const PROGRESS_SYNC_EVENT = "cartilla:progress-sync";

export type ProgressSyncStatus = {
  state: "idle" | "saving" | "saved" | "local" | "error";
  message: string;
  at: number | null;
};

let progressSyncStatus: ProgressSyncStatus = {
  state: "idle",
  message: "",
  at: null,
};

function setProgressSyncStatus(next: ProgressSyncStatus) {
  progressSyncStatus = next;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_SYNC_EVENT));
  }
}

export function getProgressSyncStatus() {
  return progressSyncStatus;
}

export function useProgressSyncStatus() {
  const [status, setStatus] = useState(progressSyncStatus);
  useEffect(() => {
    const h = () => setStatus(getProgressSyncStatus());
    window.addEventListener(PROGRESS_SYNC_EVENT, h);
    return () => window.removeEventListener(PROGRESS_SYNC_EVENT, h);
  }, []);
  return status;
}

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
  if (!s) {
    setProgressSyncStatus({
      state: "error",
      message: "Sin sesion de alumno: la sincronizacion de progreso no esta disponible.",
      at: Date.now(),
    });
    return;
  }
  setProgressSyncStatus({
    state: "saving",
    message: isSupabaseConfigured ? "Guardando progreso..." : "Guardando progreso local...",
    at: Date.now(),
  });
  logProgress({
    data: {
      studentId: s.studentId,
      studentCode: s.studentCode,
      ...input,
    },
  })
    .then(() =>
      setProgressSyncStatus({
        state: isSupabaseConfigured ? "saved" : "local",
        message: isSupabaseConfigured
          ? "Progreso sincronizado."
          : "Progreso guardado localmente. Sync no disponible sin Supabase.",
        at: Date.now(),
      }),
    )
    .catch((err) => {
      console.warn("recordEvent failed", err);
      setProgressSyncStatus({
        state: "error",
        message: "No se pudo sincronizar el progreso. Revisa la conexion o la sesion.",
        at: Date.now(),
      });
    });
}
