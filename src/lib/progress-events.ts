/**
 * progress-events.ts
 *
 * Unified workbook answer and completion tracking with offline support.
 * Queues progress locally when offline and synchronizes after reconnection.
 * Includes memory storage fallback for SSR/tests/private browsing.
 */

import { markPageCompleted, markPageStarted } from "@/lib/page-progress";

export interface WorkbookAnswerEvent {
  id: string;
  pageNumber: number;
  lessonNumber: number;
  interactionId: string;
  interactionType: string;
  userAnswer: string;
  correctAnswer?: string;
  isCorrect: boolean;
  timestamp: number;
  synced: boolean;
}

export interface PageCompletionEvent {
  id: string;
  pageNumber: number;
  lessonNumber: number;
  score: number;
  totalInteractions: number;
  correctInteractions: number;
  timestamp: number;
  synced: boolean;
}

const STORAGE_KEY_ANSWERS = "cartilla.workbook.answers.v1";
const STORAGE_KEY_COMPLETIONS = "cartilla.workbook.completions.v1";
const STORAGE_KEY_OFFLINE_QUEUE = "cartilla.workbook.offline.queue.v1";

export type OfflineQueueItem =
  | { type: "answer"; payload: WorkbookAnswerEvent }
  | { type: "completion"; payload: PageCompletionEvent };

const memoryStorage: Record<string, string> = {};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage?.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore storage errors */
    }
  }
  const mem = memoryStorage[key];
  return mem ? (JSON.parse(mem) as T) : fallback;
}

function writeJson<T>(key: string, value: T): void {
  const str = JSON.stringify(value);
  memoryStorage[key] = str;
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(key, str);
    } catch {
      /* ignore storage errors */
    }
  }
}

/**
 * Record a student's answer for an interaction on a workbook page.
 */
export function recordWorkbookAnswer(
  pageNumber: number,
  lessonNumber: number,
  interactionId: string,
  interactionType: string,
  userAnswer: string,
  isCorrect: boolean,
  correctAnswer?: string,
): WorkbookAnswerEvent {
  const event: WorkbookAnswerEvent = {
    id: `${pageNumber}_${interactionId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    pageNumber,
    lessonNumber,
    interactionId,
    interactionType,
    userAnswer,
    correctAnswer,
    isCorrect,
    timestamp: Date.now(),
    synced: typeof navigator !== "undefined" ? navigator.onLine : true,
  };

  markPageStarted(pageNumber);

  const answers = readJson<WorkbookAnswerEvent[]>(STORAGE_KEY_ANSWERS, []);
  answers.push(event);
  writeJson(STORAGE_KEY_ANSWERS, answers);

  if (!event.synced) {
    enqueueOfflineItem({ type: "answer", payload: event });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cartilla:workbook-answer", { detail: event }),
    );
  }

  return event;
}

/**
 * Record that a student has completed a workbook page.
 */
export function recordPageCompletion(
  pageNumber: number,
  lessonNumber: number,
  correctInteractions = 1,
  totalInteractions = 1,
): PageCompletionEvent {
  const score =
    totalInteractions > 0 ? (correctInteractions / totalInteractions) * 100 : 100;

  const event: PageCompletionEvent = {
    id: `completion_${pageNumber}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    pageNumber,
    lessonNumber,
    score,
    correctInteractions,
    totalInteractions,
    timestamp: Date.now(),
    synced: typeof navigator !== "undefined" ? navigator.onLine : true,
  };

  markPageCompleted(pageNumber);

  const completions = readJson<PageCompletionEvent[]>(STORAGE_KEY_COMPLETIONS, []);
  completions.push(event);
  writeJson(STORAGE_KEY_COMPLETIONS, completions);

  if (!event.synced) {
    enqueueOfflineItem({ type: "completion", payload: event });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cartilla:page-completed", { detail: event }),
    );
  }

  return event;
}

/**
 * Unified logger for progress events compatible with both old and new API.
 */
export async function logProgressEvent(payload: {
  type: "page_started" | "answer_submitted" | "exercise_completed" | "page_completed";
  pageNumber: number;
  lessonNumber: number;
  exerciseId?: string;
  interactionKind?: string;
  answer?: string | Record<string, unknown>;
  isCorrect?: boolean;
  score?: number;
  synced?: boolean;
}): Promise<void> {
  if (payload.type === "page_started") {
    markPageStarted(payload.pageNumber);
  } else if (payload.type === "answer_submitted") {
    recordWorkbookAnswer(
      payload.pageNumber,
      payload.lessonNumber,
      payload.exerciseId || "ex_unknown",
      payload.interactionKind || "unknown",
      typeof payload.answer === "string" ? payload.answer : JSON.stringify(payload.answer || ""),
      Boolean(payload.isCorrect),
    );
  } else if (payload.type === "page_completed") {
    recordPageCompletion(
      payload.pageNumber,
      payload.lessonNumber,
      payload.score ? Math.round(payload.score) : 1,
      1,
    );
  }
}

/**
 * Enqueues an item locally when offline.
 */
export function enqueueOfflineItem(item: OfflineQueueItem): void {
  const queue = readJson<OfflineQueueItem[]>(STORAGE_KEY_OFFLINE_QUEUE, []);
  queue.push(item);
  writeJson(STORAGE_KEY_OFFLINE_QUEUE, queue);
}

/**
 * Get all queued offline items.
 */
export function getOfflineQueue(): OfflineQueueItem[] {
  return readJson<OfflineQueueItem[]>(STORAGE_KEY_OFFLINE_QUEUE, []);
}

/**
 * Synchronize offline queue upon reconnection.
 */
export async function syncOfflineProgressEvents(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return 0;
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  const answers = readJson<WorkbookAnswerEvent[]>(STORAGE_KEY_ANSWERS, []);
  const completions = readJson<PageCompletionEvent[]>(
    STORAGE_KEY_COMPLETIONS,
    [],
  );

  let syncedCount = 0;
  for (const item of queue) {
    if (item.type === "answer") {
      const match = answers.find((a) => a.id === item.payload.id);
      if (match) match.synced = true;
      syncedCount++;
    } else if (item.type === "completion") {
      const match = completions.find((c) => c.id === item.payload.id);
      if (match) match.synced = true;
      syncedCount++;
    }
  }

  writeJson(STORAGE_KEY_ANSWERS, answers);
  writeJson(STORAGE_KEY_COMPLETIONS, completions);
  writeJson(STORAGE_KEY_OFFLINE_QUEUE, []);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cartilla:progress-synced", {
        detail: { count: syncedCount },
      }),
    );
  }

  return syncedCount;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void syncOfflineProgressEvents();
  });
}

/**
 * Retrieve all recorded answers for a specific page.
 */
export function getAnswersForPage(pageNumber: number): WorkbookAnswerEvent[] {
  const answers = readJson<WorkbookAnswerEvent[]>(STORAGE_KEY_ANSWERS, []);
  return answers.filter((a) => a.pageNumber === pageNumber);
}

/**
 * Retrieve completions for a specific page.
 */
export function getCompletionsForPage(pageNumber: number): PageCompletionEvent[] {
  const completions = readJson<PageCompletionEvent[]>(
    STORAGE_KEY_COMPLETIONS,
    [],
  );
  return completions.filter((c) => c.pageNumber === pageNumber);
}

/**
 * Clear all progress events (useful for testing or reset).
 */
export function clearAllProgressEvents(): void {
  writeJson(STORAGE_KEY_ANSWERS, []);
  writeJson(STORAGE_KEY_COMPLETIONS, []);
  writeJson(STORAGE_KEY_OFFLINE_QUEUE, []);
}
