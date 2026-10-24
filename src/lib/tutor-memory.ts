/**
 * Tutor memory and adaptation (GRETEL-TUTOR-BUILD-SPEC §18.4).
 *
 * Local-only, on the device (owner decision 2026-10-21). One localStorage
 * key, `cartilla.tutor.memory.v1`, stores per session_id (class code +
 * slot — anonymous, not secret): sessions count, last lesson, missed item
 * ids, best streak.
 *
 * NO names, NO audio, NO transcripts — ever. The stored shape only ever
 * contains counts and opaque item ids; a test locks that in.
 *
 * Storage access is injectable so tests never touch a real localStorage.
 */

export const TUTOR_MEMORY_KEY = "cartilla.tutor.memory.v1";

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
  /** Item ids missed in the current session (reset at each session start). */
  missedItemIds: string[];
  /** Best first-try correct streak ever seen for this session_id. */
  bestStreak: number;
}

interface StoredSession {
  sessions: number;
  lastLesson: number | null;
  missedItemIds: string[];
  bestStreak: number;
}

type StoredShape = Record<string, StoredSession>;

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

function readShape(store: TutorMemoryStorage): StoredShape {
  try {
    const raw = store.getItem(TUTOR_MEMORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean: StoredShape = Object.create(null);
    for (const [id, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      const record = value as StoredSession;
      if (
        !Number.isInteger(record.sessions) ||
        record.sessions < 0 ||
        !Number.isInteger(record.bestStreak) ||
        record.bestStreak < 0 ||
        !Array.isArray(record.missedItemIds) ||
        !record.missedItemIds.every((id) => typeof id === "string") ||
        (record.lastLesson !== null && ![1, 2, 3].includes(record.lastLesson))
      )
        continue;
      clean[id] = record;
    }
    return clean;
  } catch {
    return {};
  }
}

function writeShape(store: TutorMemoryStorage, shape: StoredShape): void {
  try {
    store.setItem(TUTOR_MEMORY_KEY, JSON.stringify(shape));
  } catch {
    /* private mode/quota: lesson remains usable */
  }
}

function emptyRecord(sessionId: string): StoredSession {
  return { sessions: 0, lastLesson: null, missedItemIds: [], bestStreak: 0 };
}

/** Read one session's record without writing. */
export function getTutorMemory(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
): TutorMemoryRecord {
  const stored = readShape(store)[sessionId] ?? emptyRecord(sessionId);
  return { sessionId, ...stored };
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
 * Start a session: bump the sessions count, note the lesson, snapshot the
 * previous misses, and reset the per-session miss list. Detects a returning
 * child (any earlier session for this session_id).
 */
export function beginSession(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  lesson: number,
): BeginSessionResult {
  const shape = readShape(store);
  const prior = shape[sessionId] ?? emptyRecord(sessionId);
  const returning = prior.sessions >= 1;
  const previousMissedItemIds = [...prior.missedItemIds];
  const updated: StoredSession = {
    sessions: prior.sessions + 1,
    lastLesson: lesson,
    missedItemIds: [],
    bestStreak: prior.bestStreak,
  };
  shape[sessionId] = updated;
  writeShape(store, shape);
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

/** Record one missed item id for the current session (deduped). */
export function noteMissedItem(
  store: TutorMemoryStorage = defaultStore(),
  sessionId: string,
  itemId: string,
): TutorMemoryRecord {
  const shape = readShape(store);
  const stored = shape[sessionId] ?? emptyRecord(sessionId);
  if (!stored.missedItemIds.includes(itemId)) {
    stored.missedItemIds = [...stored.missedItemIds, itemId];
    shape[sessionId] = stored;
    writeShape(store, shape);
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
  const stored = shape[sessionId] ?? emptyRecord(sessionId);
  if (streak > stored.bestStreak) {
    stored.bestStreak = streak;
    shape[sessionId] = stored;
    writeShape(store, shape);
  }
  return { sessionId, ...stored };
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

/** "Borrar memoria" — clear all tutor memory for every session_id. */
export function clearAllTutorMemory(store: TutorMemoryStorage = defaultStore()): void {
  store.removeItem(TUTOR_MEMORY_KEY);
}
