import { getDemoStudentSession } from "./demo-student-session";
import { logSeedProgress } from "./seed-data";
import { evidenceFor, isUngradedProduction } from "@/lib/progress-semantics";
import { hasGretelDemonstration, isGretelAssistedAttempt } from "@/lib/gretel-bus";
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

function openStudentAccessActive(): boolean {
  return (
    import.meta.env.VITE_CRM_REVIEW === "true" &&
    import.meta.env.MODE !== "test"
  );
}

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  if (getDemoStudentSession()) return null;
  if (openStudentAccessActive()) {
    // Open mode never activates a cloud identity. Retain an older real session
    // untouched so trying the isolated demo cannot erase its identity.
    return null;
  }
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
  if (openStudentAccessActive()) {
    localStorage.removeItem(KEY);
  } else if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cartilla:student-session"));
}

export function useStudentSession() {
  const [session, setSession] = useState<StudentSession | null>(() => getStudentSession());
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
  if (input.kind === "exercise") {
    const activityId = typeof input.meta?.activityId === "string" ? input.meta.activityId : undefined;
    input = { ...input, meta: evidenceFor(input, { assisted: isGretelAssistedAttempt(activityId), demonstration: hasGretelDemonstration(activityId) }) };
    if (isUngradedProduction(input.meta)) input = { ...input, score: undefined, total: undefined };
  }
  // Always mirror exercise results to local stats (works for anonymous users too).
  if (
    input.kind === "exercise" &&
    input.lessonId &&
    (typeof input.total === "number" || isUngradedProduction(input.meta))
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
        total: input.total ?? 0,
        meta: input.meta,
        completed: meta.completed,
      });
    }
  }
  const demo = getDemoStudentSession();
  if (demo) {
    logSeedProgress({ ...input, studentId: demo.studentId, meta: { ...input.meta, demo: true } });
    return;
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
