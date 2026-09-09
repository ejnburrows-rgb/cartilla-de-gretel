import { useEffect, useState } from "react";
import { logProgress } from "@/lib/student.functions";
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

/** Save immediately, then sync signed-in student events in order. */
export function recordEvent(input: LogInput) {
  // Always mirror exercise results to local stats (works for anonymous users too).
  if (
    input.kind === "exercise" &&
    input.lessonId &&
    typeof input.total === "number"
  ) {
    const meta = (input.meta ?? {}) as {
      exercise?: string;
      completed?: boolean;
    };
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
  const event: PendingStudentEvent = {
    id: crypto.randomUUID(),
    studentId: s.studentId,
    classId: s.classId,
    input,
    recordedAt: new Date().toISOString(),
  };
  writePending([...readPending(), event]);
  void flushStudentEvents();
}

interface PendingStudentEvent {
  id: string;
  studentId: string;
  classId: string;
  input: LogInput;
  recordedAt: string;
}
const PENDING_KEY = "cartilla.student-events.v1";
let memoryPending: PendingStudentEvent[] = [];
let sending: Promise<void> | null = null;
let storageUnavailable = false;

function readPending(): PendingStudentEvent[] {
  if (storageUnavailable) return memoryPending;
  try {
    const stored = localStorage.getItem(PENDING_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed))
        return parsed.filter(
          (e) =>
            e &&
            typeof e.id === "string" &&
            typeof e.studentId === "string" &&
            e.input,
        );
    }
    return memoryPending;
  } catch {
    return memoryPending;
  }
}

function writePending(events: PendingStudentEvent[]) {
  memoryPending = events;
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(events));
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
}

/** One sender per tab. Never attribute another child's pending work to this session. */
export function flushStudentEvents(): Promise<void> {
  if (sending) return sending;
  sending = Promise.resolve()
    .then(async () => {
      while (typeof navigator === "undefined" || navigator.onLine !== false) {
        const session = getStudentSession();
        if (!session) return;
        const event = readPending().find(
          (e) =>
            e.studentId === session.studentId && e.classId === session.classId,
        );
        if (!event) return;
        try {
          await logProgress({
            data: {
              studentId: session.studentId,
              studentCode: session.studentCode,
              ...event.input,
              meta: {
                ...event.input.meta,
                clientEventId: event.id,
                recordedAt: event.recordedAt,
              },
            },
          });
        } catch {
          console.warn(
            "No se pudo sincronizar el progreso; se conserva para reintentar.",
          );
          return;
        }
        // Re-read after the request so answers added during it are preserved.
        writePending(readPending().filter((e) => e.id !== event.id));
      }
    })
    .finally(() => {
      sending = null;
    });
  return sending;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void flushStudentEvents();
  });
  window.addEventListener("cartilla:student-session", () => {
    void flushStudentEvents();
  });
}
