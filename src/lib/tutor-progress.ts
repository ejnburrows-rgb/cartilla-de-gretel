/**
 * Tutor progress log — on the device only (spec §10, milestone 6 + milestone 10).
 *
 * Owner decision (EJN, 2026-10-21): progress is stored on-device ONLY.
 * No Supabase writer is built; the migration file
 * `supabase/migrations/20261021_tutor_progress.sql` ships for later and is
 * NOT applied anywhere.
 *
 * Progress is strictly separate from conversation memory (`tutor-memory.ts`)
 * and from offline packs (`tutor-offline-pack.ts`). Clearing progress never
 * removes offline packs or conversation memory.
 *
 * Event shape (one event per finished item — never audio, images, names, or
 * transcripts):
 *   { session_id, lesson_id, item_id, result, attempts, created_at }
 *
 * - `session_id` = UUIDv5(namespace, `${classCode}:${slot}`), built with Web
 *   Crypto (SHA-1 per RFC 4122 v5). Class code + slot (1–40) come from a
 *   tutor-only picker and contain no names. The id is anonymous, not secret:
 *   anyone who knows the class code can compute it.
 * - `lesson_id`: "1".."24" (supports all 24 Cartilla lessons).
 * - Storage: localStorage key `cartilla.tutor.progress.v1`, bounded to 500
 *   events, FIFO (oldest dropped), with quota-exceeded fallback.
 */

export type TutorProgressResult = "correct" | "correct_after_retry" | "missed";

export interface TutorProgressEvent {
  session_id: string;
  /** "1".."24" — canonical Cartilla lesson number */
  lesson_id: string;
  /** ≤ 64 chars */
  item_id: string;
  result: TutorProgressResult;
  /** 1–3 */
  attempts: number;
  /** ISO-8601 timestamp */
  created_at: string;
}

/** localStorage key for the on-device progress log. */
export const TUTOR_PROGRESS_KEY = "cartilla.tutor.progress.v1";
/** Hard FIFO bound on stored events. */
export const TUTOR_PROGRESS_MAX_EVENTS = 500;
export const TUTOR_PROGRESS_MIN_LESSON = 1;
export const TUTOR_PROGRESS_MAX_LESSON = 24;

/**
 * Fixed Cartilla namespace for tutor session UUIDv5 ids. Arbitrary but
 * pinned, so session ids stay reproducible across releases.
 */
export const TUTOR_SESSION_NAMESPACE = "9d8f1c2a-4b6e-4f7a-8c3d-2e5b9a1f7c40";

const RESULTS: ReadonlySet<string> = new Set(["correct", "correct_after_retry", "missed"]);

// ---------------------------------------------------------------------------
// UUIDv5 (RFC 4122, SHA-1) via Web Crypto
// ---------------------------------------------------------------------------

const hexByte = (value: number): string => value.toString(16).padStart(2, "0");

function uuidBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new TypeError(`uuidV5: invalid namespace UUID "${uuid}"`);
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * RFC 4122 version-5 UUID (SHA-1 name hashing, Web Crypto).
 * Known-answer check: with the DNS namespace
 * 6ba7b810-9dad-11d1-80b4-00c04fd430c8, name "python.org" yields
 * 886313e1-3b8a-5372-9b90-0c9aee199e5d.
 */
export async function uuidV5(namespace: string, name: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("uuidV5 requires Web Crypto (crypto.subtle), unavailable here");
  }
  const nameBytes = new TextEncoder().encode(name);
  const input = new Uint8Array(16 + nameBytes.byteLength);
  input.set(uuidBytes(namespace), 0);
  input.set(nameBytes, 16);
  const digest = new Uint8Array(await subtle.digest("SHA-1", input));
  digest[6] = (digest[6] & 0x0f) | 0x50; // version 5
  digest[8] = (digest[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(digest.slice(0, 16), hexByte).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/**
 * Deterministic anonymous session id for one class slot:
 * UUIDv5(TUTOR_SESSION_NAMESPACE, `${classCode}:${slot}`).
 */
export async function makeSessionId(classCode: string, slot: number): Promise<string> {
  const code = (classCode ?? "").trim();
  if (!code) {
    throw new TypeError("makeSessionId: classCode must not be empty");
  }
  if (!Number.isInteger(slot) || slot < 1 || slot > 40) {
    throw new TypeError("makeSessionId: slot must be an integer between 1 and 40");
  }
  return uuidV5(TUTOR_SESSION_NAMESPACE, `${code}:${slot}`);
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** Input accepted by logTutorProgressEvent/appendTutorProgress. */
export interface NewTutorProgressEvent {
  session_id: string;
  lesson_id: number | string;
  item_id: string;
  result: TutorProgressResult;
  attempts: number;
  created_at?: string;
}

/** Events buffered since the last flush (survives nothing; flush often). */
let pending: TutorProgressEvent[] = [];

/** Keep only the newest TUTOR_PROGRESS_MAX_EVENTS events (FIFO). */
function boundFifo(events: TutorProgressEvent[]): TutorProgressEvent[] {
  if (events.length <= TUTOR_PROGRESS_MAX_EVENTS) return events;
  return events.slice(events.length - TUTOR_PROGRESS_MAX_EVENTS);
}

function isValidLessonId(raw: number | string): boolean {
  const str = String(raw).trim();
  if (!/^\d+$/.test(str)) return false;
  const num = Number(str);
  return (
    Number.isInteger(num) &&
    num >= TUTOR_PROGRESS_MIN_LESSON &&
    num <= TUTOR_PROGRESS_MAX_LESSON
  );
}

function readRaw(): TutorProgressEvent[] {
  try {
    const raw = globalThis.localStorage?.getItem(TUTOR_PROGRESS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: TutorProgressEvent[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const e = entry as Record<string, unknown>;
      if (
        typeof e.session_id === "string" &&
        e.session_id.length > 0 &&
        (typeof e.lesson_id === "string" || typeof e.lesson_id === "number") &&
        isValidLessonId(e.lesson_id) &&
        typeof e.item_id === "string" &&
        e.item_id.length > 0 &&
        e.item_id.length <= 64 &&
        typeof e.result === "string" &&
        RESULTS.has(e.result) &&
        typeof e.attempts === "number" &&
        Number.isInteger(e.attempts) &&
        e.attempts >= 1 &&
        e.attempts <= 3 &&
        typeof e.created_at === "string"
      ) {
        valid.push({
          session_id: e.session_id,
          lesson_id: String(e.lesson_id),
          item_id: e.item_id,
          result: e.result as TutorProgressResult,
          attempts: e.attempts,
          created_at: e.created_at,
        });
      }
    }
    return valid;
  } catch {
    return [];
  }
}

function writeRaw(events: TutorProgressEvent[]): void {
  let slice = boundFifo(events);
  try {
    globalThis.localStorage?.setItem(TUTOR_PROGRESS_KEY, JSON.stringify(slice));
  } catch {
    // QuotaExceededError fallback: shrink oldest events until write succeeds or empty.
    while (slice.length > 1) {
      slice = slice.slice(Math.ceil(slice.length / 2));
      try {
        globalThis.localStorage?.setItem(TUTOR_PROGRESS_KEY, JSON.stringify(slice));
        return;
      } catch {
        /* keep shrinking */
      }
    }
  }
}

/**
 * Validate + sanitize one event. Unknown fields (e.g. audio, image, name,
 * transcript) are never carried into the stored shape; invalid core fields
 * throw.
 */
function toStoredEvent(input: NewTutorProgressEvent): TutorProgressEvent {
  if (!input || typeof input !== "object") {
    throw new TypeError("tutor progress event must be an object");
  }
  if (typeof input.session_id !== "string" || !input.session_id) {
    throw new TypeError("tutor progress event: session_id must be a non-empty string");
  }
  if (!isValidLessonId(input.lesson_id)) {
    throw new TypeError("tutor progress event: lesson_id must be an integer between 1 and 24");
  }
  const lessonId = String(Number(String(input.lesson_id).trim()));
  const itemId = String(input.item_id ?? "");
  if (!itemId || itemId.length > 64) {
    throw new TypeError("tutor progress event: item_id must be 1–64 characters");
  }
  if (!RESULTS.has(String(input.result))) {
    throw new TypeError(
      "tutor progress event: result must be correct, correct_after_retry, or missed",
    );
  }
  if (!Number.isInteger(input.attempts) || input.attempts < 1 || input.attempts > 3) {
    throw new TypeError("tutor progress event: attempts must be an integer between 1 and 3");
  }
  return {
    session_id: input.session_id,
    lesson_id: lessonId,
    item_id: itemId,
    result: input.result,
    attempts: input.attempts,
    created_at: typeof input.created_at === "string" ? input.created_at : new Date().toISOString(),
  };
}

/**
 * Buffer one progress event (validated + sanitized). Call
 * flushTutorProgress() to persist; appendTutorProgress does both at once.
 */
export function logTutorProgressEvent(input: NewTutorProgressEvent): void {
  pending.push(toStoredEvent(input));
}

/**
 * Persist all buffered events (oldest first) under the FIFO bound.
 * Returns the total number of stored events after the flush.
 */
export function flushTutorProgress(): number {
  if (pending.length > 0) {
    writeRaw([...readRaw(), ...pending]);
    pending = [];
  }
  return readRaw().length;
}

/** Log + persist one event immediately (safe against a closed tab). */
export function appendTutorProgress(input: NewTutorProgressEvent): void {
  logTutorProgressEvent(input);
  flushTutorProgress();
}

/** Read the stored progress log (does not include unflushed buffer). */
export function readTutorProgress(): TutorProgressEvent[] {
  return readRaw();
}

/** Read progress events strictly isolated to one learner (`session_id`). */
export function readTutorProgressForLearner(sessionId: string): TutorProgressEvent[] {
  return readRaw().filter((event) => event.session_id === sessionId);
}

/**
 * Erase stored and buffered progress for ONE learner only.
 * Leaves other learners, conversation memory, and offline packs intact.
 */
export function clearTutorProgressForLearner(sessionId: string): void {
  pending = pending.filter((event) => event.session_id !== sessionId);
  const remaining = readRaw().filter((event) => event.session_id !== sessionId);
  if (remaining.length === 0) {
    globalThis.localStorage?.removeItem(TUTOR_PROGRESS_KEY);
  } else {
    writeRaw(remaining);
  }
}

/**
 * Erase the stored progress log and any unflushed buffer.
 * Leaves offline packs and conversation memory intact.
 */
export function clearTutorProgress(): void {
  pending = [];
  globalThis.localStorage?.removeItem(TUTOR_PROGRESS_KEY);
}
