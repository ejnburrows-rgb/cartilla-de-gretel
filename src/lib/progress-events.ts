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

function readQueue(): ProgressEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as ProgressEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: ProgressEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
  } catch {
    /* storage full/unavailable — drop silently, matches recordEvent's existing fire-and-forget convention */
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
  if (!session) return; // stays queued until a real session exists

  const remaining: ProgressEvent[] = [];
  for (const event of queue) {
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
          },
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
