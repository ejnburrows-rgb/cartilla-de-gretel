/**
 * Tutor memory and adaptation (GRETEL-TUTOR-BUILD-SPEC §18.4, Milestone 10).
 *
 * Local-only, on the device (owner decision 2026-10-21).
 *
 * Storage separation:
 * - `cartilla.tutor.memory.v1` (`TUTOR_MEMORY_KEY`): per-learner session counters,
 *   last lesson (1–24), bounded missed item IDs, and best streak.
 * - `cartilla.tutor.conversation-memory.v1` (`TUTOR_CONVERSATION_MEMORY_KEY`):
 *   bounded per-learner structured turn memory (counts/item IDs/outcomes/hints only).
 * - Kept strictly separate from `cartilla.tutor.progress.v1` (progress log) and
 *   `cartilla.tutor.pack.v1` / Cache Storage (offline packs).
 *
 * Privacy invariants:
 * - NO names, NO raw audio, NO images/photos, NO full transcripts stored by default.
 * - Strict isolation between learners (`sessionId` / `learnerId`).
 * - Bounded per-learner and total-learner caps so storage cannot grow unbounded.
 * - Authorized clearing (`clearLearnerTutorMemory` / `clearAllTutorMemory`) leaves
 *   offline packs and progress logs intact.
 *
 * Storage access is injectable so tests never touch a real localStorage.
 */

export const TUTOR_MEMORY_KEY = "cartilla.tutor.memory.v1";
export const TUTOR_CONVERSATION_MEMORY_KEY = "cartilla.tutor.conversation-memory.v1";

/** Hard bounds to keep per-learner memory compact and predictable. */
export const TUTOR_MEMORY_MAX_LEARNERS = 100;
export const TUTOR_MEMORY_MAX_MISSED_ITEMS = 50;
export const TUTOR_CONVERSATION_MAX_TURNS = 20;
export const TUTOR_MIN_LESSON = 1;
export const TUTOR_MAX_LESSON = 24;

/** Minimal storage surface (subset of DOM Storage); injectable for tests. */
export interface TutorMemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TutorMemoryRecord {
  sessionId: string;
  /** Sessions started, including the current one. */
  sessions: number;
  lastLesson: number | null;
  /** Item ids missed in the current session/lesson (reset at each session start, bounded). */
  missedItemIds: string[];
  /** Missed item ids isolated by lesson (1–24); starting a lesson clears only that lesson. */
  missesByLesson: Record<number, string[]>;
  /** Best first-try correct streak ever seen for this session_id. */
  bestStreak: number;
}

interface StoredSession {
  sessions: number;
  lastLesson: number | null;
  missedItemIds: string[];
  missesByLesson: Record<number, string[]>;
  bestStreak: number;
}

type StoredShape = Record<string, StoredSession>;

/**
 * Bounded structured conversation turn summary for one learner.
 * Intentionally excludes raw audio, images, photos, names, and full transcripts.
 */
export type TutorMemoryTurnOutcome =
  | "correct"
  | "correct_after_retry"
  | "missed"
  | "hint_given"
  | "skipped"
  | "prompted";

export interface TutorConversationTurn {
  lesson: number;
  itemId: string;
  outcome: TutorMemoryTurnOutcome;
  hintUsed: boolean;
  attempts: number;
  at: string;
}

type StoredConversationShape = Record<string, TutorConversationTurn[]>;

const VALID_TURN_OUTCOMES: ReadonlySet<string> = new Set([
  "correct",
  "correct_after_retry",
  "missed",
  "hint_given",
  "skipped",
  "prompted",
]);

/** Default storage: the browser's localStorage, resolved lazily. */
function defaultStore(): TutorMemoryStorage {
  try {
    const ls = (globalThis as { localStorage?: TutorMemoryStorage }).localStorage;
    if (ls) return ls;
  } catch {
    /* blocked browser storage */
  }
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

function isValidLesson(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= TUTOR_MIN_LESSON &&
    value <= TUTOR_MAX_LESSON
  );
}

function isSafeItemId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

function boundLearners<T>(shape: Record<string, T>, activeId?: string): Record<string, T> {
  const keys = Object.keys(shape);
  if (keys.length <= TUTOR_MEMORY_MAX_LEARNERS) return shape;
  const trimmed: Record<string, T> = Object.create(null);
  const keepKeys = keys.filter((k) => k !== activeId).slice(-(TUTOR_MEMORY_MAX_LEARNERS - (activeId ? 1 : 0)));
  for (const key of keepKeys) {
    trimmed[key] = shape[key];
  }
  if (activeId && activeId in shape) {
    trimmed[activeId] = shape[activeId];
  }
  return trimmed;
}

function sanitizeMissesByLesson(
  raw: unknown,
  fallbackLesson: number | null,
  fallbackMissedItemIds: string[],
): Record<number, string[]> {
  const byLesson: Record<number, string[]> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, list] of Object.entries(raw as Record<string, unknown>)) {
      const lessonNum = Number(key);
      if (!isValidLesson(lessonNum) || !Array.isArray(list)) continue;
      const validIds = list.filter((id): id is string => isSafeItemId(id));
      if (validIds.length > 0) {
        byLesson[lessonNum] = [...new Set(validIds)].slice(-TUTOR_MEMORY_MAX_MISSED_ITEMS);
      }
    }
  } else if (isValidLesson(fallbackLesson) && fallbackMissedItemIds.length > 0) {
    // Backward-compatible migration for legacy records without missesByLesson.
    byLesson[fallbackLesson] = [...new Set(fallbackMissedItemIds)].slice(
      -TUTOR_MEMORY_MAX_MISSED_ITEMS,
    );
  }
  return byLesson;
}

function readShape(store: TutorMemoryStorage): StoredShape {
  try {
    const raw = store.getItem(TUTOR_MEMORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean: StoredShape = Object.create(null);
    for (const [id, value] of Object.entries(parsed)) {
      if (!id || !value || typeof value !== "object" || Array.isArray(value)) continue;
      const record = value as Record<string, unknown>;
      if (
        typeof record.sessions !== "number" ||
        !Number.isInteger(record.sessions) ||
        record.sessions < 0 ||
        typeof record.bestStreak !== "number" ||
        !Number.isInteger(record.bestStreak) ||
        record.bestStreak < 0 ||
        !Array.isArray(record.missedItemIds) ||
        !record.missedItemIds.every((itemId) => typeof itemId === "string") ||
        (record.lastLesson !== null && !isValidLesson(record.lastLesson))
      ) {
        continue;
      }
      const lastLesson = record.lastLesson as number | null;
      const missedItemIds = (record.missedItemIds as string[]).slice(
        -TUTOR_MEMORY_MAX_MISSED_ITEMS,
      );
      const missesByLesson = sanitizeMissesByLesson(
        record.missesByLesson,
        lastLesson,
        missedItemIds,
      );
      // Strip any unknown/hostile keys so only the canonical fields survive.
      clean[id] = {
        sessions: record.sessions,
        lastLesson,
        missedItemIds,
        missesByLesson,
        bestStreak: record.bestStreak,
      };
    }
    return clean;
  } catch {
    return {};
  }
}

function writeShape(store: TutorMemoryStorage, shape: StoredShape, activeId?: string): void {
  const bounded = boundLearners(shape, activeId);
  try {
    store.setItem(TUTOR_MEMORY_KEY, JSON.stringify(bounded));
  } catch {
    /* private mode/quota: lesson remains usable */
  }
}

function emptyRecord(): StoredSession {
  return { sessions: 0, lastLesson: null, missedItemIds: [], missesByLesson: {}, bestStreak: 0 };
}

/** Read one session's record without writing. */
export function getTutorMemory(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
): TutorMemoryRecord {
  const stored = readShape(store)[sessionId] ?? emptyRecord();
  return { sessionId, ...stored };
}

/** List all learner/session IDs currently stored in tutor memory. */
export function listTutorMemoryLearners(
  store: TutorMemoryStorage = defaultStore(),
): string[] {
  return Object.keys(readShape(store));
}

export interface BeginSessionResult {
  /** The updated record, already persisted. */
  record: TutorMemoryRecord;
  /** True when this child (session_id) has played before → greeting-return. */
  returning: boolean;
  /** Missed item ids carried over from previous sessions (for the review round). */
  previousMissedItemIds: string[];
}

/**
 * Start a session: bump the sessions count, note the lesson (1–24), snapshot
 * the previous misses for ONLY this lesson, and reset ONLY this lesson's miss
 * list while preserving misses from all other lessons. Detects a returning
 * child (any earlier session for this session_id).
 */
export function beginSession(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  lesson: number,
): BeginSessionResult {
  const shape = readShape(store);
  const prior = shape[sessionId] ?? emptyRecord();
  const returning = prior.sessions >= 1;
  const validLesson = isValidLesson(lesson) ? lesson : prior.lastLesson;
  const nextMissesByLesson: Record<number, string[]> = {};
  for (const [k, list] of Object.entries(prior.missesByLesson)) {
    const lessonNum = Number(k);
    if (isValidLesson(lessonNum) && list.length > 0) {
      nextMissesByLesson[lessonNum] = [...list];
    }
  }
  const previousMissedItemIds =
    validLesson !== null ? [...(nextMissesByLesson[validLesson] ?? [])] : [];
  if (validLesson !== null) {
    delete nextMissesByLesson[validLesson];
  }
  const updated: StoredSession = {
    sessions: prior.sessions + 1,
    lastLesson: validLesson,
    missedItemIds: [],
    missesByLesson: nextMissesByLesson,
    bestStreak: prior.bestStreak,
  };
  shape[sessionId] = updated;
  writeShape(store, shape, sessionId);
  return {
    record: { sessionId, ...updated },
    returning,
    previousMissedItemIds,
  };
}

/** Greeting role for this child: returning children hear the return greeting. */
export function greetingRole(returning: boolean): "greeting-return" | "greeting-first" {
  return returning ? "greeting-return" : "greeting-first";
}

/** Record one missed item id for the current session/lesson (deduped & bounded). */
export function noteMissedItem(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  itemId: string,
  lesson?: number,
): TutorMemoryRecord {
  const shape = readShape(store);
  const stored = shape[sessionId] ?? emptyRecord();
  if (!isSafeItemId(itemId)) {
    return { sessionId, ...stored };
  }
  const targetLesson = isValidLesson(lesson) ? lesson : stored.lastLesson;
  let changed = false;

  if (targetLesson !== null) {
    const existingLessonMisses = stored.missesByLesson[targetLesson] ?? [];
    if (!existingLessonMisses.includes(itemId)) {
      const nextLessonMisses = [...existingLessonMisses, itemId].slice(
        -TUTOR_MEMORY_MAX_MISSED_ITEMS,
      );
      stored.missesByLesson = {
        ...stored.missesByLesson,
        [targetLesson]: nextLessonMisses,
      };
      changed = true;
    }
    if (targetLesson === stored.lastLesson && !stored.missedItemIds.includes(itemId)) {
      stored.missedItemIds = [...stored.missedItemIds, itemId].slice(
        -TUTOR_MEMORY_MAX_MISSED_ITEMS,
      );
      changed = true;
    }
  } else if (!stored.missedItemIds.includes(itemId)) {
    stored.missedItemIds = [...stored.missedItemIds, itemId].slice(-TUTOR_MEMORY_MAX_MISSED_ITEMS);
    changed = true;
  }

  if (changed) {
    shape[sessionId] = stored;
    writeShape(store, shape, sessionId);
  }
  return { sessionId, ...stored };
}

/** Update the best streak: only ever grows. Returns the stored best. */
export function recordStreak(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  streak: number,
): TutorMemoryRecord {
  const shape = readShape(store);
  const stored = shape[sessionId] ?? emptyRecord();
  if (Number.isInteger(streak) && streak > stored.bestStreak) {
    stored.bestStreak = streak;
    shape[sessionId] = stored;
    writeShape(store, shape, sessionId);
  }
  return { sessionId, ...stored };
}

// ---------------------------------------------------------------------------
// Bounded per-learner conversation turn memory (strictly no raw audio/images/transcripts)
// ---------------------------------------------------------------------------

function readConversationShape(store: TutorMemoryStorage): StoredConversationShape {
  try {
    const raw = store.getItem(TUTOR_CONVERSATION_MEMORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean: StoredConversationShape = Object.create(null);
    for (const [id, value] of Object.entries(parsed)) {
      if (!id || !Array.isArray(value)) continue;
      const turns: TutorConversationTurn[] = [];
      for (const entry of value) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
        const turn = entry as Record<string, unknown>;
        if (
          !isValidLesson(turn.lesson) ||
          !isSafeItemId(turn.itemId) ||
          typeof turn.outcome !== "string" ||
          !VALID_TURN_OUTCOMES.has(turn.outcome) ||
          typeof turn.hintUsed !== "boolean" ||
          typeof turn.attempts !== "number" ||
          !Number.isInteger(turn.attempts) ||
          turn.attempts < 0 ||
          typeof turn.at !== "string"
        ) {
          continue;
        }
        turns.push({
          lesson: turn.lesson,
          itemId: turn.itemId,
          outcome: turn.outcome as TutorMemoryTurnOutcome,
          hintUsed: turn.hintUsed,
          attempts: turn.attempts,
          at: turn.at,
        });
      }
      clean[id] = turns.slice(-TUTOR_CONVERSATION_MAX_TURNS);
    }
    return clean;
  } catch {
    return {};
  }
}

function writeConversationShape(
  store: TutorMemoryStorage,
  shape: StoredConversationShape,
  activeId?: string,
): void {
  const bounded = boundLearners(shape, activeId);
  try {
    store.setItem(TUTOR_CONVERSATION_MEMORY_KEY, JSON.stringify(bounded));
  } catch {
    /* private mode/quota: lesson remains usable */
  }
}

/**
 * Append one bounded structured turn to a learner's conversation memory.
 * Any unknown fields (raw audio, images, photos, full transcripts, names) are
 * stripped before persistence. Strictly isolated per learnerId/sessionId.
 */
export function recordConversationTurn(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  turn: Omit<TutorConversationTurn, "at"> & { at?: string },
): TutorConversationTurn[] {
  if (!sessionId || !isValidLesson(turn.lesson) || !isSafeItemId(turn.itemId)) {
    return getConversationMemory(store, sessionId);
  }
  if (!VALID_TURN_OUTCOMES.has(turn.outcome)) {
    return getConversationMemory(store, sessionId);
  }
  const cleanTurn: TutorConversationTurn = {
    lesson: turn.lesson,
    itemId: turn.itemId,
    outcome: turn.outcome,
    hintUsed: Boolean(turn.hintUsed),
    attempts: Number.isInteger(turn.attempts) && turn.attempts >= 0 ? turn.attempts : 0,
    at: typeof turn.at === "string" && turn.at.length > 0 ? turn.at : new Date().toISOString(),
  };
  const shape = readConversationShape(store);
  const existing = shape[sessionId] ?? [];
  const next = [...existing, cleanTurn].slice(-TUTOR_CONVERSATION_MAX_TURNS);
  shape[sessionId] = next;
  writeConversationShape(store, shape, sessionId);
  return next;
}

/** Read one learner's bounded structured conversation turns. */
export function getConversationMemory(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
): TutorConversationTurn[] {
  return [...(readConversationShape(store)[sessionId] ?? [])];
}

/**
 * Review-round set (spec §18.4): items missed this session plus up to 3
 * missed from last time, deduped, session misses first.
 */
export function reviewRoundSet(
  sessionMissedItemIds: readonly string[],
  previousMissedItemIds: readonly string[],
): string[] {
  const previous = previousMissedItemIds.slice(0, 3);
  return [...new Set([...sessionMissedItemIds, ...previous])];
}

/** Default pause between Gretel lines (ms). */
export const DEFAULT_PAUSE_MS = 400;
/** Longer pause once the child is struggling (2 misses in a row). */
export const SLOW_PACE_PAUSE_MS = 1200;

export interface PacingHint {
  pauseMs: number;
  /** Replay the model line slowly (the model-before-listen step always stays). */
  slowModel: boolean;
}

/**
 * Pacing for consecutive counted misses: 2 in a row → longer pause + slow
 * model; otherwise the default pace. The model-before-listen step always
 * stays (the book's method) — this only stretches it.
 */
export function pacingFor(missesInARow: number): PacingHint {
  return missesInARow >= 2
    ? { pauseMs: SLOW_PACE_PAUSE_MS, slowModel: true }
    : { pauseMs: DEFAULT_PAUSE_MS, slowModel: false };
}

/** A streak of 3 first-try corrects earns the streak praise line. */
export function streakPraiseDue(streak: number): boolean {
  return streak >= 3;
}

/**
 * Clear tutor memory for ONE specific learner (session_id) only.
 * Leaves other learners, progress logs, and offline packs completely intact.
 */
export function clearLearnerTutorMemory(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
): void {
  const shape = readShape(store);
  if (sessionId in shape) {
    delete shape[sessionId];
    if (Object.keys(shape).length === 0) {
      store.removeItem(TUTOR_MEMORY_KEY);
    } else {
      writeShape(store, shape);
    }
  }
  const convShape = readConversationShape(store);
  if (sessionId in convShape) {
    delete convShape[sessionId];
    if (Object.keys(convShape).length === 0) {
      store.removeItem(TUTOR_CONVERSATION_MEMORY_KEY);
    } else {
      writeConversationShape(store, convShape);
    }
  }
}

/**
 * "Borrar memoria" — clear all tutor memory (session counters + bounded
 * conversation memory) for every session_id.
 * Intentionally leaves progress logs (`cartilla.tutor.progress.v1`) and
 * offline packs (`cartilla.tutor.pack.v1` + Cache Storage) intact.
 */
export function clearAllTutorMemory(store: TutorMemoryStorage = defaultStore()): void {
  store.removeItem(TUTOR_MEMORY_KEY);
  store.removeItem(TUTOR_CONVERSATION_MEMORY_KEY);
}
