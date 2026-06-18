// Offline progress sync queue.
//
// Student progress (lesson completions, exercise scores, time, badges, levels)
// is generated locally as a child works — frequently with no connection at all
// (the workbook and exercises run fully offline). Previously recordEvent() did a
// fire-and-forget logProgress().catch(console.warn), so any event produced while
// offline — or during a transient blip — was lost forever.
//
// This module makes those writes durable: every event is appended to a
// localStorage-backed FIFO queue and we attempt to drain it to Supabase. If a
// send fails because we're offline or the server is unreachable, the event stays
// queued and is retried the next time we enqueue, the browser fires "online", or
// flushProgressQueue() is called explicitly. Permanently-invalid events (schema
// rejections) are dropped so one bad entry can't wedge the whole queue.

import { read, write } from "@/lib/storage-keys";
import { logProgress } from "@/lib/student.functions";

export type QueuedProgress = {
  studentId: string;
  studentCode: string;
  lessonId: string;
  kind: "lesson_completed" | "exercise" | "time" | "badge" | "level";
  score?: number;
  total?: number;
  timeSeconds?: number;
  meta?: Record<string, unknown>;
};

type QueueEntry = {
  id: string;
  enqueuedAt: number;
  attempts: number;
  payload: QueuedProgress;
};

// After this many failed sends we assume the event is unsendable (e.g. the
// server keeps rejecting it) and drop it rather than retry forever.
const MAX_ATTEMPTS = 20;

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadQueue(): QueueEntry[] {
  const entries = read<QueueEntry[]>("progressQueue");
  return Array.isArray(entries) ? entries : [];
}

function saveQueue(entries: QueueEntry[]): void {
  write("progressQueue", entries);
}

/** A ZodError (or other validation failure) means the payload is structurally
 *  bad — retrying will never help, so we drop it instead of looping. */
function isPermanentFailure(err: unknown): boolean {
  return err instanceof Error && err.name === "ZodError";
}

let flushing = false;

/** Number of events still waiting to sync (for UI/diagnostics/tests). */
export function getQueuedCount(): number {
  return loadQueue().length;
}

/**
 * Append a progress event to the durable queue and kick off a best-effort
 * flush. The returned promise resolves once the flush attempt settles; callers
 * that don't care (the common case) can ignore it — the event is already
 * persisted, so it will sync eventually regardless.
 */
export function enqueueProgress(payload: QueuedProgress): Promise<void> {
  const entries = loadQueue();
  entries.push({ id: newId(), enqueuedAt: Date.now(), attempts: 0, payload });
  saveQueue(entries);
  return flushProgressQueue();
}

/**
 * Drain the queue to Supabase in FIFO order. Stops at the first transient
 * failure (offline / unreachable) leaving the rest queued; drops entries that
 * are permanently invalid or have exhausted their retries. Safe to call any
 * time; concurrent calls are coalesced.
 */
export async function flushProgressQueue(): Promise<void> {
  if (flushing) return;
  // Skip entirely when the browser knows it's offline — no point burning
  // attempts on calls that can't succeed. The "online" listener re-triggers us.
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  if (loadQueue().length === 0) return;

  flushing = true;
  try {
    // Re-read the head each iteration so events enqueued mid-flush are included
    // and our index never goes stale.
    while (loadQueue().length > 0) {
      const head = loadQueue()[0]!;
      try {
        await logProgress({ data: head.payload });
      } catch (err) {
        const exhausted = head.attempts + 1 >= MAX_ATTEMPTS;
        if (isPermanentFailure(err) || exhausted) {
          console.warn("progress-queue: dropping unsendable event", err);
          dropHead(head.id);
          continue; // move on to the next event
        }
        // Transient failure: bump the attempt counter and stop. We'll retry the
        // whole queue later (next enqueue / "online" event / explicit flush).
        bumpHeadAttempts(head.id);
        return;
      }
      // Sent successfully — remove it and continue draining.
      dropHead(head.id);
    }
  } finally {
    flushing = false;
  }
}

function dropHead(id: string): void {
  const entries = loadQueue();
  if (entries[0] && entries[0].id === id) {
    entries.shift();
    saveQueue(entries);
  }
}

function bumpHeadAttempts(id: string): void {
  const entries = loadQueue();
  if (entries[0] && entries[0].id === id) {
    entries[0].attempts += 1;
    saveQueue(entries);
  }
}

// Retry automatically the moment connectivity returns.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void flushProgressQueue();
  });
}
