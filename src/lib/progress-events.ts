import { getStudentSession } from "./student-session";
import { logProgress } from "./student.functions";
import type { InteractionKind } from "@/content/workbook/types";

/**
 * CRM plumbing for the living-workbook-page engine's interactions. Reuses
 * the existing student_progress store exactly as-is (log_student_progress
 * RPC via logProgress — see src/lib/student.functions.ts) rather than
 * redesigning any tables: every manifest-specific field (physicalPage,
 * mechanic, attempt) rides in that RPC's existing free-form `meta` bag,
 * the same pattern InteractivePageExercises.tsx already uses for its own
 * per-exercise metadata.
 */

export type ProgressEventType =
  | "page_opened"
  | "answer_correct"
  | "answer_incorrect"
  | "activity_completed"
  | "page_completed"
  | "audio_played";

export interface ProgressEvent {
  type: ProgressEventType;
  studentId?: string;
  classId?: string;
  id?: string;
  physicalPage: number;
  lesson: number | null;
  /** The engine's rendered interaction kind (tap-select/drag-place/etc.) —
   * not the census's upstream `mechanic` vocabulary — since this records
   * what actually ran in the browser. */
  mechanic?: InteractionKind;
  attempt?: number;
  timestamp: string;
}

const QUEUE_KEY = "cartilla.progress-events-queue.v1";

/** In-memory fallback when localStorage is unavailable (Node test envs, private mode). */
let memoryQueue: ProgressEvent[] = [];
let sending: Promise<void> | null = null;
let storageUnavailable = false;

function readQueue(): ProgressEvent[] {
  if (storageUnavailable) return [...memoryQueue];
  if (typeof window === "undefined") return [...memoryQueue];
  try {
    if (typeof localStorage === "undefined") return [...memoryQueue];
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw == null) return [...memoryQueue];
    return JSON.parse(raw) as ProgressEvent[];
  } catch {
    return [...memoryQueue];
  }
}

function writeQueue(events: ProgressEvent[]) {
  memoryQueue = [...events];
  if (typeof window === "undefined") return;
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
}

/**
 * Queues a progress event locally (so it survives being offline or the
 * student session not having loaded yet), then attempts an immediate
 * flush. Never throws.
 */
export function emitProgressEvent(
  input: Omit<ProgressEvent, "timestamp" | "studentId" | "classId" | "id">,
): void {
  const session = getStudentSession();
  const event: ProgressEvent = {
    ...input,
    studentId: session?.studentId,
    classId: session?.classId,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  writeQueue([...readQueue(), event]);
  void flushProgressEvents();
}

/** Sends only the current student's queued events, preserving failed and newly added work. */
export function flushProgressEvents(): Promise<void> {
  if (sending) return sending;
  sending = Promise.resolve()
    .then(async () => {
      while (typeof navigator === "undefined" || navigator.onLine !== false) {
        const session = getStudentSession();
        if (!session) return;
        // Anonymous and other students' work must never become this child's record.
        const event = readQueue().find(
          (e) =>
            e.studentId === session.studentId &&
            (!e.classId || e.classId === session.classId),
        );
        if (!event) return;
        try {
          await logProgress({
            data: {
              studentId: session.studentId,
              studentCode: session.studentCode,
              lessonId: event.lesson !== null ? String(event.lesson) : "0",
              kind: "exercise",
              meta: {
                exercise: `workbook_manifest_${event.type}`,
                physicalPage: event.physicalPage,
                mechanic: event.mechanic,
                attempt: event.attempt,
                progressEventType: event.type,
                clientEventId: event.id,
                recordedAt: event.timestamp,
              },
            },
          });
        } catch {
          console.warn(
            "No se pudo sincronizar el ejercicio; se conserva para reintentar.",
          );
          return;
        }
        // Preserve events appended while the request was running, including old queue entries.
        let removed = false;
        writeQueue(
          readQueue().filter((e) => {
            const same = event.id
              ? e.id === event.id
              : e.studentId === event.studentId &&
                e.timestamp === event.timestamp &&
                e.type === event.type &&
                e.physicalPage === event.physicalPage;
            if (!removed && same) {
              removed = true;
              return false;
            }
            return true;
          }),
        );
      }
    })
    .finally(() => {
      sending = null;
    });
  return sending;
}

export function getQueuedProgressEvents(): ProgressEvent[] {
  return readQueue();
}

export function clearProgressEventsQueue(): void {
  writeQueue([]);
}

// Reconnection sync: the moment the browser regains connectivity, retry
// whatever stayed queued while offline instead of waiting for the next
// student action to trigger a flush attempt.
if (typeof window !== "undefined") {
  window.addEventListener("cartilla:student-session", () => {
    void flushProgressEvents();
  });
  window.addEventListener("online", () => {
    void flushProgressEvents();
  });
}
