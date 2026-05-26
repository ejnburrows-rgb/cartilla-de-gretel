import { useEffect, useState } from "react";
import { logProgress } from "@/lib/student.functions";
import { recordExerciseStat, resetStats } from "@/lib/exercise-stats";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export type StudentSession = {
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
};

const KEY = "cartilla.student-session.v1";
const SESSION_EVENTS_KEY = "cartilla.student-events.v1";
const SESSION_EVENTS_EVENT = "cartilla:student-events";
const PROGRESS_SYNC_EVENT = "cartilla:progress-sync";

export type ProgressSyncStatus = {
  state: "idle" | "saving" | "saved" | "local" | "error";
  message: string;
  at: number | null;
};

export type PracticeEventType =
  | "practica:start"
  | "practica:item-complete"
  | "practica:complete";

export type StudentActivityEvent = {
  id: string;
  type: PracticeEventType;
  lessonN: number;
  item?: number;
  createdAt: string;
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

type ProgressLogInput = {
  lessonId: string;
  kind: "lesson_completed" | "exercise" | "time" | "badge" | "level";
  score?: number;
  total?: number;
  timeSeconds?: number;
  meta?: Record<string, unknown>;
};

type PracticeLogInput = {
  type: PracticeEventType;
  lessonN: number;
  item?: number;
};

type LogInput = ProgressLogInput | PracticeLogInput;

function readSessionEvents(): StudentActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSION_EVENTS_KEY);
    return raw ? (JSON.parse(raw) as StudentActivityEvent[]) : [];
  } catch {
    return [];
  }
}

function writeSessionEvents(events: StudentActivityEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_EVENTS_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(SESSION_EVENTS_EVENT));
}

function makeEventId(input: PracticeLogInput) {
  return `${input.type}:${input.lessonN}:${input.item ?? "session"}:${Date.now()}`;
}

function recordLocalActivity(input: PracticeLogInput) {
  const nextEvent: StudentActivityEvent = {
    id: makeEventId(input),
    type: input.type,
    lessonN: input.lessonN,
    item: input.item,
    createdAt: new Date().toISOString(),
  };
  writeSessionEvents([...readSessionEvents(), nextEvent].slice(-400));
}

export function getSessionEvents() {
  return readSessionEvents();
}

export function useSessionEvents() {
  const [events, setEvents] = useState<StudentActivityEvent[]>([]);
  useEffect(() => {
    const sync = () => setEvents(readSessionEvents());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SESSION_EVENTS_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SESSION_EVENTS_EVENT, sync);
    };
  }, []);
  return events;
}

export function getLessonStatus(n: number): "no-visitada" | "en-progreso" | "completa" {
  const events = readSessionEvents().filter((event) => event.lessonN === n);
  if (events.some((event) => event.type === "practica:complete")) return "completa";
  if (events.some((event) => event.type === "practica:start")) return "en-progreso";
  return "no-visitada";
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getStreakDays(): number {
  const activeDays = new Set(readSessionEvents().map((event) => dayKey(new Date(event.createdAt))));
  let streak = 0;
  const cursor = new Date();
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function resetSession() {
  writeSessionEvents([]);
  resetStats();
}

/** Fire-and-forget progress recording. Public workbook browsing never requires a student session. */
export function recordEvent(input: LogInput) {
  if ("type" in input) {
    recordLocalActivity(input);
    return;
  }
  // Always mirror exercise results to local stats (works for anonymous/public users too).
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
      state: "local",
      message:
        "Explorando sin clase: el cuaderno abre libremente. Únete a una clase solo si quieres sincronizar progreso de aula.",
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
          : "Progreso guardado en este dispositivo. Sincronización en la nube no disponible sin Supabase.",
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
