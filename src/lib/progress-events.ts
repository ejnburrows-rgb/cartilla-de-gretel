import { getStudentSession } from "./student-session";
import { isSessionActive, logProgressWithSession } from "./secure-student-access";
import type { InteractionKind } from "@/content/workbook/types";

/**
 * CRM plumbing for the living-workbook-page engine's interactions. Reuses
 * the existing student_progress store exactly as-is (log_student_progress_secure
 * RPC via logProgressWithSession — see src/lib/secure-student-access.ts) rather
 * than redesigning any tables: every manifest-specific field (physicalPage,
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

function readQueue(): ProgressEvent[] {
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
  } catch {
    /* storage full/unavailable — memory queue still holds events for this session */
  }
}

/**
 * Queues a progress event locally (so it survives being offline or the
 * student session not having loaded yet), then attempts an immediate
 * flush. Never throws.
 */
export function emitProgressEvent(input: Omit<ProgressEvent, "timestamp" | "studentId">): void {
  const session = getStudentSession();
  const event: ProgressEvent = {
    ...input,
    studentId: session?.studentId,
    timestamp: new Date().toISOString(),
  };
  writeQueue([...readQueue(), event]);
  void flushProgressEvents();
}

/**
 * Sends every queued event through the real log_student_progress RPC.
 * Events that fail (no session yet, or a real network/RPC error) stay
 * queued for the next flush attempt — this is genuine retry, not just
 * fire-and-forget, since logProgress's real promise rejection is used to
 * decide what to keep.
 */
export async function flushProgressEvents(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  // Offline: fail fast, no wasted request — the queue already holds these
  // events, so the next flush (browser 'online' listener below, the next
  // emitProgressEvent call, or a manual retry) picks up right where this
  // left off.
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  const session = getStudentSession();
  if (!session || !isSessionActive(session)) return; // stays queued until a real, active session exists

  const remaining: ProgressEvent[] = [];
  for (const event of queue) {
    try {
      await logProgressWithSession(session, {
        studentId: session.studentId,
        lessonId: event.lesson !== null ? String(event.lesson) : "0",
        kind: "exercise",
        meta: {
          exercise: `workbook_manifest_${event.type}`,
          physicalPage: event.physicalPage,
          mechanic: event.mechanic,
          attempt: event.attempt,
          progressEventType: event.type,
        },
      });
    } catch (err) {
      console.warn("flushProgressEvents: one event failed, kept queued", err);
      remaining.push(event);
    }
  }
  writeQueue(remaining);
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
  window.addEventListener("online", () => {
    void flushProgressEvents();
  });
}
