/**
 * Structured timestamped tutor session log, local storage (IndexedDB + localStorage fallback),
 * authorized JSON export/import, optional audiovisual recording IndexedDB store, and
 * 8-section Spanish Teacher Review Report generator (Milestone 10).
 *
 * Privacy & truthfulness invariants:
 * - Local-only on device; NEVER writes to Supabase or applies migrations.
 * - Structured replay is explicitly labeled "Repetición estructurada de la sesión" (never video).
 * - Student-device audiovisual recordings are optional, opt-in, stored in local IndexedDB only,
 *   and NEVER automatically transferred to the teacher's device.
 * - No raw audio, images, or full transcripts are stored in the structured event log by default.
 * - Authorized clearing leaves offline packs (`cartilla.tutor.pack.v1` + Cache Storage) intact.
 * - Teacher report strictly separates observed session facts (sections 1–7) from pedagogical
 *   recommendations (section 8).
 */

export const TUTOR_SESSION_LOG_STORAGE_KEY = "cartilla.tutor.session-logs.v1";
export const TUTOR_SESSION_LOG_DB_NAME = "cartilla-tutor-sessions-v1";
export const TUTOR_SESSION_LOG_STORE_NAME = "sessions";
export const TUTOR_AV_RECORDING_STORE_NAME = "av_recordings";
export const TUTOR_SESSION_LOG_MAX_SESSIONS = 100;
export const TUTOR_SESSION_LOG_MAX_EVENTS_PER_SESSION = 1000;
export const TUTOR_SESSION_EXPORT_FORMAT = "gretel-tutor-session-export" as const;
export const TUTOR_SESSION_EXPORT_SCHEMA_VERSION = 1 as const;

export const STRUCTURED_REPLAY_LABEL = "Repetición estructurada de la sesión" as const;

export const STUDENT_DEVICE_RECORDINGS_NOTICE =
  "Las grabaciones audiovisuales guardadas en el dispositivo del estudiante no se transfieren automáticamente al dispositivo del docente. Para revisar sesiones aquí, importa un archivo JSON autorizado exportado desde el dispositivo del estudiante." as const;

export const TEACHER_REPORT_SECTION_TITLES = [
  "Resumen de la sesión",
  "Contenido trabajado",
  "Actividades realizadas",
  "Logros demostrados",
  "Dificultades observadas",
  "Pistas utilizadas",
  "Contenido pendiente",
  "Recomendaciones para continuar",
] as const;

export type TeacherReportSectionTitle = (typeof TEACHER_REPORT_SECTION_TITLES)[number];

export interface TutorSessionResourceVersions {
  curriculumVersion: string;
  dialogueManifestVersion?: string;
  packVersion?: string;
  graphSchemaVersion?: string;
}

export interface TutorSessionSheetRef {
  /** Printed workbook page number (strictly separate from pdfSheet and flipchartSheet). */
  printedPage?: number;
  /** Optional Workbook PDF sheet number (never conflated with printedPage). */
  pdfSheet?: number | null;
  /** Flip Chart sheet/lámina number (strictly separate from Workbook printedPage/pdfSheet). */
  flipchartSheet?: number;
  source?: "workbook" | "flipchart";
}

export interface TutorSessionConsentSnapshot {
  eventLogging: boolean;
  audiovisualRecording: boolean;
  studentMic: boolean;
  studentCamera: boolean;
}

export type TutorSessionEventKind =
  | "session_started"
  | "session_ended"
  | "sheet_opened"
  | "activity_started"
  | "activity_completed"
  | "presentation_action"
  | "answer"
  | "attempt"
  | "hint"
  | "correction"
  | "outcome"
  | "progress_change"
  | "key_moment"
  | "unfinished_work"
  | "recording_started"
  | "recording_paused"
  | "recording_resumed"
  | "recording_stopped";

export type TutorSessionOutcome = "correct" | "correct_after_retry" | "missed" | "skipped";

export type TutorKeyMomentTag = "mistake" | "correction" | "hint" | "breakthrough" | "milestone";

export interface TutorSessionEvent {
  id: string;
  /** ISO-8601 timestamp */
  at: string;
  /** Milliseconds elapsed since session startedAt */
  offsetMs: number;
  kind: TutorSessionEventKind;
  /** Human-readable Spanish summary of the structured event */
  summary: string;
  itemId?: string;
  itemText?: string;
  activityId?: string;
  printedPage?: number;
  pdfSheet?: number | null;
  flipchartSheet?: number;
  sheetSource?: "workbook" | "flipchart";
  presentationAction?: string;
  attemptNumber?: number;
  outcome?: TutorSessionOutcome;
  hintKind?: string;
  correctionDetail?: string;
  progressFrom?: string;
  progressTo?: string;
  keyMomentTag?: TutorKeyMomentTag;
  recordingId?: string;
  /** Optional curriculum/resource version active when this event happened */
  resourceVersion?: string;
}

export interface TutorSessionKeyMoment {
  eventId: string;
  offsetMs: number;
  tag: TutorKeyMomentTag;
  label: string;
  itemId?: string;
}

export interface TutorUnfinishedItem {
  itemId?: string;
  label: string;
  activityId?: string;
  printedPage?: number;
  reason: string;
}

export interface TeacherSessionNote {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  eventId?: string;
  offsetMs?: number;
}

export interface TeacherSessionOverride {
  id: string;
  itemId: string;
  itemLabel?: string;
  originalOutcome: TutorSessionOutcome;
  overriddenOutcome: TutorSessionOutcome;
  reason: string;
  updatedAt: string;
}

export interface TutorSessionLog {
  sessionId: string;
  learnerId: string;
  lesson: number;
  /** Optional pedagogical objective worked during this session. */
  objective?: string;
  /** Explicit marker when the log represents synthetic/demo data (never a real student). */
  isDemo?: boolean;
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  curriculumVersion: string;
  resourceVersions: TutorSessionResourceVersions;
  sheets: TutorSessionSheetRef[];
  activities: string[];
  recordingIds: string[];
  events: TutorSessionEvent[];
  keyMoments: TutorSessionKeyMoment[];
  unfinishedWork: TutorUnfinishedItem[];
  consentSnapshot: TutorSessionConsentSnapshot;
  teacherNotes: TeacherSessionNote[];
  teacherOverrides: TeacherSessionOverride[];
  /** Explicit label guaranteeing structured replay is never presented as video. */
  replayKind: typeof STRUCTURED_REPLAY_LABEL;
}

export interface TutorSessionLogExportEnvelope {
  format: typeof TUTOR_SESSION_EXPORT_FORMAT;
  schemaVersion: typeof TUTOR_SESSION_EXPORT_SCHEMA_VERSION;
  exportedAt: string;
  deviceNotice: typeof STUDENT_DEVICE_RECORDINGS_NOTICE;
  sessions: TutorSessionLog[];
}

export interface SessionLogStorageResult<T> {
  ok: boolean;
  data?: T;
  error?: "quota_exceeded" | "corrupt_data" | "storage_unavailable" | "invalid_input";
  message?: string;
}

/** Minimal synchronous storage surface for localStorage fallback & testing. */
export interface SessionLogKvStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultKvStore(): SessionLogKvStorage {
  try {
    const ls = (globalThis as { localStorage?: SessionLogKvStorage }).localStorage;
    if (ls) return ls;
  } catch {
    /* blocked storage */
  }
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

let idFallbackCounter = 0;

function makeId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(2);
    globalThis.crypto.getRandomValues(buf);
    return `${prefix}-${buf[0].toString(36)}-${buf[1].toString(36)}`;
  }
  idFallbackCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idFallbackCounter.toString(36)}`;
}

/** Disallowed raw media/PII keys stripped from any incoming event or session object. */
const DISALLOWED_RAW_KEYS = new Set([
  "audio",
  "rawAudio",
  "audioBlob",
  "audioBase64",
  "image",
  "rawImage",
  "imageBlob",
  "photo",
  "videoBlob",
  "transcript",
  "rawTranscript",
  "fullTranscript",
]);

function stripDisallowedKeys<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DISALLOWED_RAW_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean as T;
}

// ---------------------------------------------------------------------------
// Session Log Builder
// ---------------------------------------------------------------------------

export interface CreateSessionLogInput {
  sessionId?: string;
  learnerId: string;
  lesson: number;
  objective?: string;
  isDemo?: boolean;
  curriculumVersion?: string;
  resourceVersions?: Partial<TutorSessionResourceVersions>;
  startedAt?: string;
  consentSnapshot?: Partial<TutorSessionConsentSnapshot>;
}

export function createSessionLog(input: CreateSessionLogInput): TutorSessionLog {
  if (!input.learnerId || typeof input.learnerId !== "string") {
    throw new TypeError("createSessionLog: learnerId must be a non-empty string");
  }
  if (!Number.isInteger(input.lesson) || input.lesson < 1 || input.lesson > 24) {
    throw new TypeError("createSessionLog: lesson must be an integer between 1 and 24");
  }
  const startedAt = input.startedAt ?? new Date().toISOString();
  const sessionId = input.sessionId ?? makeId("sess");
  const curriculumVersion = input.curriculumVersion || "cartilla-24-v1";
  const consentSnapshot: TutorSessionConsentSnapshot = {
    eventLogging: Boolean(input.consentSnapshot?.eventLogging ?? true),
    audiovisualRecording: Boolean(input.consentSnapshot?.audiovisualRecording ?? false),
    studentMic: Boolean(input.consentSnapshot?.studentMic ?? false),
    studentCamera: Boolean(input.consentSnapshot?.studentCamera ?? false),
  };

  const session: TutorSessionLog = {
    sessionId,
    learnerId: input.learnerId,
    lesson: input.lesson,
    ...(input.objective?.trim() ? { objective: input.objective.trim() } : {}),
    ...(input.isDemo ? { isDemo: true } : {}),
    startedAt,
    endedAt: null,
    durationMs: 0,
    curriculumVersion,
    resourceVersions: {
      curriculumVersion,
      dialogueManifestVersion: input.resourceVersions?.dialogueManifestVersion,
      packVersion: input.resourceVersions?.packVersion,
      graphSchemaVersion: input.resourceVersions?.graphSchemaVersion,
    },
    sheets: [],
    activities: [],
    recordingIds: [],
    events: [],
    keyMoments: [],
    unfinishedWork: [],
    consentSnapshot,
    teacherNotes: [],
    teacherOverrides: [],
    replayKind: STRUCTURED_REPLAY_LABEL,
  };

  return appendSessionEvent(session, {
    kind: "session_started",
    summary: `Inicio de sesión — Lección ${input.lesson}`,
    at: startedAt,
    resourceVersion: curriculumVersion,
  });
}

export type NewSessionEventInput = Omit<TutorSessionEvent, "id" | "at" | "offsetMs"> & {
  id?: string;
  at?: string;
  offsetMs?: number;
};

/**
 * Append a structured event immutably to a session log, automatically updating
 * duration, sheets, activities, recordingIds, keyMoments, and unfinishedWork.
 * Strips any raw audio/image/transcript fields.
 */
export function appendSessionEvent(
  session: TutorSessionLog,
  rawInput: NewSessionEventInput,
): TutorSessionLog {
  const input = stripDisallowedKeys(rawInput as unknown as Record<string, unknown>) as unknown as NewSessionEventInput;
  const at = typeof input.at === "string" && input.at ? input.at : new Date().toISOString();
  const startedMs = Date.parse(session.startedAt);
  const eventMs = Date.parse(at);
  const computedOffset =
    typeof input.offsetMs === "number" && Number.isFinite(input.offsetMs) && input.offsetMs >= 0
      ? Math.round(input.offsetMs)
      : Number.isFinite(startedMs) && Number.isFinite(eventMs)
        ? Math.max(0, eventMs - startedMs)
        : session.durationMs;

  const isFlipchartEvent =
    input.sheetSource === "flipchart" && typeof input.flipchartSheet === "number";

  const event: TutorSessionEvent = {
    id: input.id ?? makeId("evt"),
    at,
    offsetMs: computedOffset,
    kind: input.kind,
    summary: String(input.summary ?? ""),
    ...(input.itemId ? { itemId: input.itemId } : {}),
    ...(input.itemText ? { itemText: input.itemText } : {}),
    ...(input.activityId ? { activityId: input.activityId } : {}),
    ...(!isFlipchartEvent && typeof input.printedPage === "number"
      ? { printedPage: input.printedPage }
      : {}),
    ...(!isFlipchartEvent && input.pdfSheet !== undefined ? { pdfSheet: input.pdfSheet } : {}),
    ...(typeof input.flipchartSheet === "number" ? { flipchartSheet: input.flipchartSheet } : {}),
    ...(input.sheetSource ? { sheetSource: input.sheetSource } : {}),
    ...(input.presentationAction ? { presentationAction: input.presentationAction } : {}),
    ...(typeof input.attemptNumber === "number" ? { attemptNumber: input.attemptNumber } : {}),
    ...(input.outcome ? { outcome: input.outcome } : {}),
    ...(input.hintKind ? { hintKind: input.hintKind } : {}),
    ...(input.correctionDetail ? { correctionDetail: input.correctionDetail } : {}),
    ...(input.progressFrom ? { progressFrom: input.progressFrom } : {}),
    ...(input.progressTo ? { progressTo: input.progressTo } : {}),
    ...(input.keyMomentTag ? { keyMomentTag: input.keyMomentTag } : {}),
    ...(input.recordingId ? { recordingId: input.recordingId } : {}),
    ...(input.resourceVersion ? { resourceVersion: input.resourceVersion } : {}),
  };

  const events = [...session.events, event].slice(-TUTOR_SESSION_LOG_MAX_EVENTS_PER_SESSION);

  // Track sheets without conflating Flip Chart láminas with Workbook printedPage/pdfSheet
  const sheets = [...session.sheets];
  if (typeof event.flipchartSheet === "number") {
    const existingIdx = sheets.findIndex(
      (s) => s.source === "flipchart" && s.flipchartSheet === event.flipchartSheet,
    );
    if (existingIdx === -1) {
      sheets.push({
        flipchartSheet: event.flipchartSheet,
        source: "flipchart",
      });
    }
  } else if (typeof event.printedPage === "number") {
    const existingIdx = sheets.findIndex(
      (s) =>
        s.source !== "flipchart" &&
        s.printedPage === event.printedPage &&
        ((s.pdfSheet ?? null) === (event.pdfSheet ?? null) || event.pdfSheet == null),
    );
    if (existingIdx === -1) {
      sheets.push({
        printedPage: event.printedPage,
        pdfSheet: event.pdfSheet ?? null,
        ...(event.sheetSource ? { source: event.sheetSource } : {}),
      });
    } else if (event.sheetSource && !sheets[existingIdx].source) {
      sheets[existingIdx] = {
        ...sheets[existingIdx],
        source: event.sheetSource,
        ...(event.pdfSheet != null ? { pdfSheet: event.pdfSheet } : {}),
      };
    }
  }

  // Track activities
  const activities =
    event.activityId && !session.activities.includes(event.activityId)
      ? [...session.activities, event.activityId]
      : session.activities;

  // Track optional local recording IDs
  const recordingIds =
    event.recordingId && !session.recordingIds.includes(event.recordingId)
      ? [...session.recordingIds, event.recordingId]
      : session.recordingIds;

  // Auto-derive key moments for jump-to navigation (mistakes, corrections, hints, explicit key_moment)
  const keyMoments = [...session.keyMoments];
  let derivedTag: TutorKeyMomentTag | null = event.keyMomentTag ?? null;
  if (!derivedTag) {
    if (event.kind === "hint") derivedTag = "hint";
    else if (event.kind === "correction") derivedTag = "correction";
    else if (event.kind === "outcome" && event.outcome === "missed") derivedTag = "mistake";
    else if (event.kind === "attempt" && event.outcome === "missed") derivedTag = "mistake";
  }
  if (derivedTag) {
    keyMoments.push({
      eventId: event.id,
      offsetMs: event.offsetMs,
      tag: derivedTag,
      label: event.summary,
      itemId: event.itemId,
    });
  }

  // Track unfinished work
  const unfinishedWork = [...session.unfinishedWork];
  if (event.kind === "unfinished_work") {
    unfinishedWork.push({
      itemId: event.itemId,
      label: event.itemText ?? event.summary,
      activityId: event.activityId,
      printedPage: event.printedPage,
      reason: event.summary,
    });
  }

  const durationMs = Math.max(session.durationMs, computedOffset);
  const endedAt = event.kind === "session_ended" ? at : session.endedAt;

  return {
    ...session,
    endedAt,
    durationMs,
    sheets,
    activities,
    recordingIds,
    events,
    keyMoments,
    unfinishedWork,
  };
}

export function finalizeSessionLog(
  session: TutorSessionLog,
  endedAt: string = new Date().toISOString(),
  unfinishedWork: TutorUnfinishedItem[] = [],
): TutorSessionLog {
  let next = session;
  for (const item of unfinishedWork) {
    next = appendSessionEvent(next, {
      kind: "unfinished_work",
      summary: item.reason || item.label,
      itemId: item.itemId,
      itemText: item.label,
      activityId: item.activityId,
      printedPage: item.printedPage,
      at: endedAt,
    });
  }
  return appendSessionEvent(next, {
    kind: "session_ended",
    summary: "Fin de sesión",
    at: endedAt,
  });
}

// ---------------------------------------------------------------------------
// Teacher Notes & Overrides (local-only)
// ---------------------------------------------------------------------------

export function addTeacherNote(
  session: TutorSessionLog,
  text: string,
  options?: { eventId?: string; offsetMs?: number },
): TutorSessionLog {
  const trimmed = text.trim();
  if (!trimmed) return session;
  const now = new Date().toISOString();
  const note: TeacherSessionNote = {
    id: makeId("note"),
    text: trimmed,
    createdAt: now,
    updatedAt: now,
    ...(options?.eventId ? { eventId: options.eventId } : {}),
    ...(typeof options?.offsetMs === "number" ? { offsetMs: options.offsetMs } : {}),
  };
  return {
    ...session,
    teacherNotes: [...session.teacherNotes, note],
  };
}

export function removeTeacherNote(session: TutorSessionLog, noteId: string): TutorSessionLog {
  return {
    ...session,
    teacherNotes: session.teacherNotes.filter((n) => n.id !== noteId),
  };
}

export function setTeacherOverride(
  session: TutorSessionLog,
  override: Omit<TeacherSessionOverride, "id" | "updatedAt">,
): TutorSessionLog {
  const now = new Date().toISOString();
  const existingIdx = session.teacherOverrides.findIndex((o) => o.itemId === override.itemId);
  const nextEntry: TeacherSessionOverride = {
    id: existingIdx >= 0 ? session.teacherOverrides[existingIdx].id : makeId("ovr"),
    itemId: override.itemId,
    itemLabel: override.itemLabel,
    originalOutcome: override.originalOutcome,
    overriddenOutcome: override.overriddenOutcome,
    reason: override.reason.trim(),
    updatedAt: now,
  };
  const teacherOverrides =
    existingIdx >= 0
      ? session.teacherOverrides.map((o, idx) => (idx === existingIdx ? nextEntry : o))
      : [...session.teacherOverrides, nextEntry];
  return {
    ...session,
    teacherOverrides,
  };
}

export function removeTeacherOverride(session: TutorSessionLog, itemId: string): TutorSessionLog {
  return {
    ...session,
    teacherOverrides: session.teacherOverrides.filter((o) => o.itemId !== itemId),
  };
}

// ---------------------------------------------------------------------------
// Validation & Sanitization
// ---------------------------------------------------------------------------

export function isValidSessionLog(value: unknown): value is TutorSessionLog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.sessionId === "string" &&
    s.sessionId.length > 0 &&
    typeof s.learnerId === "string" &&
    s.learnerId.length > 0 &&
    typeof s.lesson === "number" &&
    Number.isInteger(s.lesson) &&
    s.lesson >= 1 &&
    s.lesson <= 24 &&
    typeof s.startedAt === "string" &&
    typeof s.durationMs === "number" &&
    s.durationMs >= 0 &&
    typeof s.curriculumVersion === "string" &&
    Array.isArray(s.events)
  );
}

function sanitizeSessionLog(raw: TutorSessionLog): TutorSessionLog {
  const base = stripDisallowedKeys(raw as unknown as Record<string, unknown>) as unknown as TutorSessionLog;
  const cleanEvents = (Array.isArray(base.events) ? base.events : [])
    .filter((e): e is TutorSessionEvent => Boolean(e && typeof e === "object" && typeof e.kind === "string"))
    .map((e) => stripDisallowedKeys(e as unknown as Record<string, unknown>) as unknown as TutorSessionEvent)
    .slice(-TUTOR_SESSION_LOG_MAX_EVENTS_PER_SESSION);

  return {
    sessionId: base.sessionId,
    learnerId: base.learnerId,
    lesson: base.lesson,
    ...(typeof base.objective === "string" && base.objective.trim()
      ? { objective: base.objective.trim() }
      : {}),
    ...(base.isDemo === true ? { isDemo: true } : {}),
    startedAt: base.startedAt,
    endedAt: typeof base.endedAt === "string" ? base.endedAt : null,
    durationMs: typeof base.durationMs === "number" && base.durationMs >= 0 ? base.durationMs : 0,
    curriculumVersion: base.curriculumVersion || "cartilla-24-v1",
    resourceVersions: {
      curriculumVersion: base.resourceVersions?.curriculumVersion ?? base.curriculumVersion ?? "cartilla-24-v1",
      dialogueManifestVersion: base.resourceVersions?.dialogueManifestVersion,
      packVersion: base.resourceVersions?.packVersion,
      graphSchemaVersion: base.resourceVersions?.graphSchemaVersion,
    },
    sheets: Array.isArray(base.sheets) ? base.sheets : [],
    activities: Array.isArray(base.activities) ? base.activities : [],
    recordingIds: Array.isArray(base.recordingIds) ? base.recordingIds : [],
    events: cleanEvents,
    keyMoments: Array.isArray(base.keyMoments) ? base.keyMoments : [],
    unfinishedWork: Array.isArray(base.unfinishedWork) ? base.unfinishedWork : [],
    consentSnapshot: {
      eventLogging: Boolean(base.consentSnapshot?.eventLogging ?? true),
      audiovisualRecording: Boolean(base.consentSnapshot?.audiovisualRecording ?? false),
      studentMic: Boolean(base.consentSnapshot?.studentMic ?? false),
      studentCamera: Boolean(base.consentSnapshot?.studentCamera ?? false),
    },
    teacherNotes: Array.isArray(base.teacherNotes) ? base.teacherNotes : [],
    teacherOverrides: Array.isArray(base.teacherOverrides) ? base.teacherOverrides : [],
    replayKind: STRUCTURED_REPLAY_LABEL,
  };
}

// ---------------------------------------------------------------------------
// Local Storage (localStorage + IndexedDB) with quota & corruption handling
// ---------------------------------------------------------------------------

function readAllFromKv(store: SessionLogKvStorage): { sessions: TutorSessionLog[]; corrupted: boolean } {
  try {
    const raw = store.getItem(TUTOR_SESSION_LOG_STORAGE_KEY);
    if (!raw) return { sessions: [], corrupted: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { sessions: [], corrupted: true };
    const valid: TutorSessionLog[] = [];
    let corrupted = false;
    for (const item of parsed) {
      if (isValidSessionLog(item)) {
        valid.push(sanitizeSessionLog(item));
      } else {
        corrupted = true;
      }
    }
    return { sessions: valid, corrupted };
  } catch {
    return { sessions: [], corrupted: true };
  }
}

function writeAllToKv(
  store: SessionLogKvStorage,
  sessions: TutorSessionLog[],
): SessionLogStorageResult<number> {
  let bounded = sessions.slice(-TUTOR_SESSION_LOG_MAX_SESSIONS);
  try {
    store.setItem(TUTOR_SESSION_LOG_STORAGE_KEY, JSON.stringify(bounded));
    return { ok: true, data: bounded.length };
  } catch (err) {
    // Attempt FIFO eviction under QuotaExceededError
    while (bounded.length > 1) {
      bounded = bounded.slice(Math.ceil(bounded.length / 2));
      try {
        store.setItem(TUTOR_SESSION_LOG_STORAGE_KEY, JSON.stringify(bounded));
        return { ok: true, data: bounded.length };
      } catch {
        /* continue shrinking */
      }
    }
    const name = (err as { name?: string } | null)?.name ?? "";
    return {
      ok: false,
      error: name === "QuotaExceededError" ? "quota_exceeded" : "storage_unavailable",
      message: "Espacio insuficiente o almacenamiento bloqueado para guardar el registro de sesión.",
    };
  }
}

/** Save or update a structured session log locally (sync KV store). */
export function saveSessionLog(
  session: TutorSessionLog,
  store: SessionLogKvStorage = defaultKvStore(),
): SessionLogStorageResult<TutorSessionLog> {
  if (!isValidSessionLog(session)) {
    return { ok: false, error: "invalid_input", message: "Registro de sesión inválido." };
  }
  const clean = sanitizeSessionLog(session);
  const { sessions } = readAllFromKv(store);
  const idx = sessions.findIndex((s) => s.sessionId === clean.sessionId);
  const next = idx >= 0 ? sessions.map((s, i) => (i === idx ? clean : s)) : [...sessions, clean];
  const writeResult = writeAllToKv(store, next);
  if (!writeResult.ok) {
    return { ok: false, error: writeResult.error, message: writeResult.message };
  }
  return { ok: true, data: clean };
}

/** Read all locally stored structured session logs (corrupt entries skipped safely). */
export function loadAllSessionLogs(
  store: SessionLogKvStorage = defaultKvStore(),
): SessionLogStorageResult<TutorSessionLog[]> {
  const { sessions, corrupted } = readAllFromKv(store);
  return {
    ok: !corrupted,
    data: sessions,
    ...(corrupted
      ? {
          error: "corrupt_data" as const,
          message: "Algunos registros locales estaban dañados y fueron omitidos.",
        }
      : {}),
  };
}

/** Read structured session logs strictly isolated to one learner. */
export function listSessionLogsForLearner(
  learnerId: string,
  store: SessionLogKvStorage = defaultKvStore(),
): TutorSessionLog[] {
  const { sessions } = readAllFromKv(store);
  return sessions
    .filter((s) => s.learnerId === learnerId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Clear structured session logs for ONE learner only (leaves offline packs intact). */
export function clearSessionLogsForLearner(
  learnerId: string,
  store: SessionLogKvStorage = defaultKvStore(),
): void {
  const { sessions } = readAllFromKv(store);
  const remaining = sessions.filter((s) => s.learnerId !== learnerId);
  if (remaining.length === 0) {
    store.removeItem(TUTOR_SESSION_LOG_STORAGE_KEY);
  } else {
    writeAllToKv(store, remaining);
  }
}

/** Clear all structured session logs (leaves offline packs, memory, and progress intact). */
export function clearAllSessionLogs(store: SessionLogKvStorage = defaultKvStore()): void {
  store.removeItem(TUTOR_SESSION_LOG_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// IndexedDB Storage for Optional Local Audiovisual Recordings (MediaRecorder Blobs)
// ---------------------------------------------------------------------------

export interface StoredAvRecording {
  id: string;
  sessionId: string;
  learnerId: string;
  mimeType: string;
  durationMs: number;
  createdAt: string;
  blob: Blob;
}

function openSessionDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(TUTOR_SESSION_LOG_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(TUTOR_SESSION_LOG_STORE_NAME)) {
          db.createObjectStore(TUTOR_SESSION_LOG_STORE_NAME, { keyPath: "sessionId" });
        }
        if (!db.objectStoreNames.contains(TUTOR_AV_RECORDING_STORE_NAME)) {
          db.createObjectStore(TUTOR_AV_RECORDING_STORE_NAME, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveAvRecordingToIdb(
  recording: StoredAvRecording,
): Promise<SessionLogStorageResult<string>> {
  const db = await openSessionDb();
  if (!db) {
    return {
      ok: false,
      error: "storage_unavailable",
      message: "IndexedDB no está disponible en este navegador.",
    };
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TUTOR_AV_RECORDING_STORE_NAME, "readwrite");
      tx.objectStore(TUTOR_AV_RECORDING_STORE_NAME).put(recording);
      tx.oncomplete = () => {
        db.close();
        resolve({ ok: true, data: recording.id });
      };
      tx.onerror = () => {
        const errName = tx.error?.name ?? "";
        db.close();
        resolve({
          ok: false,
          error: errName === "QuotaExceededError" ? "quota_exceeded" : "storage_unavailable",
          message:
            errName === "QuotaExceededError"
              ? "Espacio insuficiente para guardar la grabación audiovisual."
              : "No se pudo guardar la grabación audiovisual en IndexedDB.",
        });
      };
    } catch {
      db.close();
      resolve({ ok: false, error: "storage_unavailable" });
    }
  });
}

export async function getAvRecordingFromIdb(id: string): Promise<StoredAvRecording | null> {
  const db = await openSessionDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TUTOR_AV_RECORDING_STORE_NAME, "readonly");
      const req = tx.objectStore(TUTOR_AV_RECORDING_STORE_NAME).get(id);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as StoredAvRecording | undefined) ?? null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export async function deleteAvRecordingFromIdb(id: string): Promise<boolean> {
  const db = await openSessionDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(TUTOR_AV_RECORDING_STORE_NAME, "readwrite");
      tx.objectStore(TUTOR_AV_RECORDING_STORE_NAME).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

// ---------------------------------------------------------------------------
// Authorized Local JSON Export / Import
// ---------------------------------------------------------------------------

export function exportSessionLogsJson(sessions: readonly TutorSessionLog[]): string {
  const envelope: TutorSessionLogExportEnvelope = {
    format: TUTOR_SESSION_EXPORT_FORMAT,
    schemaVersion: TUTOR_SESSION_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    deviceNotice: STUDENT_DEVICE_RECORDINGS_NOTICE,
    sessions: sessions.map(sanitizeSessionLog),
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportSessionLogsResult {
  ok: boolean;
  importedCount: number;
  skippedCount: number;
  sessions: TutorSessionLog[];
  error?: string;
}

export function importSessionLogsJson(
  rawJson: string,
  store: SessionLogKvStorage = defaultKvStore(),
): ImportSessionLogsResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      ok: false,
      importedCount: 0,
      skippedCount: 0,
      sessions: [],
      error: "El archivo JSON no es válido o está dañado.",
    };
  }

  let candidateSessions: unknown[] = [];
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    (parsed as Record<string, unknown>).format === TUTOR_SESSION_EXPORT_FORMAT &&
    Array.isArray((parsed as Record<string, unknown>).sessions)
  ) {
    candidateSessions = (parsed as { sessions: unknown[] }).sessions;
  } else if (isValidSessionLog(parsed)) {
    candidateSessions = [parsed];
  } else {
    return {
      ok: false,
      importedCount: 0,
      skippedCount: 0,
      sessions: [],
      error: "Formato no reconocido. Selecciona un archivo exportado por el Tutor de Gretel.",
    };
  }

  const imported: TutorSessionLog[] = [];
  let skippedCount = 0;
  for (const candidate of candidateSessions) {
    if (!isValidSessionLog(candidate)) {
      skippedCount += 1;
      continue;
    }
    const res = saveSessionLog(candidate, store);
    if (res.ok && res.data) {
      imported.push(res.data);
    } else {
      skippedCount += 1;
    }
  }

  if (imported.length === 0) {
    return {
      ok: false,
      importedCount: 0,
      skippedCount,
      sessions: [],
      error: "No se encontraron sesiones válidas para importar.",
    };
  }

  return {
    ok: true,
    importedCount: imported.length,
    skippedCount,
    sessions: imported,
  };
}

// ---------------------------------------------------------------------------
// Spanish Teacher Review Report (Exact 8 sections, observations != recommendations)
// ---------------------------------------------------------------------------

export interface TeacherReportSection {
  title: TeacherReportSectionTitle;
  category: "observation" | "recommendation";
  lines: string[];
}

export interface TeacherSessionReport {
  sessionId: string;
  learnerId: string;
  lesson: number;
  generatedAt: string;
  replayLabel: typeof STRUCTURED_REPLAY_LABEL;
  deviceNotice: typeof STUDENT_DEVICE_RECORDINGS_NOTICE;
  /** Observed sections (1–7) strictly separate from recommendations (8). */
  observations: TeacherReportSection[];
  recommendations: TeacherReportSection;
  /** All 8 sections in the required canonical order. */
  sections: TeacherReportSection[];
  plainText: string;
}

export function formatDurationEs(durationMs: number): string {
  const totalSec = Math.max(0, Math.round(durationMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins === 0) return `${secs} s`;
  return `${mins} min ${secs.toString().padStart(2, "0")} s`;
}

export function generateTeacherSessionReport(session: TutorSessionLog): TeacherSessionReport {
  const overrideByItem = new Map(session.teacherOverrides.map((o) => [o.itemId, o]));

  // Resolve effective outcomes per item (coalescing by itemId and applying teacher overrides)
  const outcomeByItem = new Map<
    string,
    {
      itemId: string;
      label: string;
      outcome: TutorSessionOutcome;
      attempts: number;
      overridden: boolean;
    }
  >();

  for (const event of session.events) {
    if (event.kind === "outcome" && event.itemId && event.outcome) {
      const override = overrideByItem.get(event.itemId);
      outcomeByItem.set(event.itemId, {
        itemId: event.itemId,
        label: event.itemText ?? event.itemId,
        outcome: override ? override.overriddenOutcome : event.outcome,
        attempts: event.attemptNumber ?? 1,
        overridden: Boolean(override),
      });
    }
  }
  const effectiveOutcomes = [...outcomeByItem.values()];

  const achievements = effectiveOutcomes.filter(
    (o) => o.outcome === "correct" || o.outcome === "correct_after_retry",
  );
  const difficulties = effectiveOutcomes.filter((o) => o.outcome === "missed");
  const hints = session.events.filter((e) => e.kind === "hint");
  const corrections = session.events.filter((e) => e.kind === "correction");

  // Section 1: Resumen de la sesión
  const summaryLines: string[] = [];
  if (session.isDemo) {
    summaryLines.push(
      "Sesión sintética de demostración (datos ficticios, no corresponden a un estudiante real).",
    );
  }
  if (session.objective) {
    summaryLines.push(`Objetivo de la sesión: ${session.objective}.`);
  }
  summaryLines.push(
    `Lección ${session.lesson} · Duración: ${formatDurationEs(session.durationMs)}.`,
    `Versión curricular: ${session.curriculumVersion}.`,
    `Eventos estructurados registrados: ${session.events.length}.`,
    `Resultados registrados: ${achievements.length} logro(s), ${difficulties.length} dificultad(es), ${hints.length} pista(s).`,
  );
  if (session.recordingIds.length > 0) {
    summaryLines.push(
      `Grabaciones locales referenciadas en el dispositivo del estudiante: ${session.recordingIds.length} (no transferidas automáticamente).`,
    );
  }
  if (session.teacherNotes.length > 0) {
    summaryLines.push(`Notas del docente añadidas: ${session.teacherNotes.length}.`);
  }

  // Section 2: Contenido trabajado
  const contentLines: string[] = [];
  if (session.sheets.length > 0) {
    const pagesText = session.sheets
      .map((s) => {
        if (s.source === "flipchart") {
          const flipchartNum = s.flipchartSheet ?? s.pdfSheet ?? s.printedPage;
          return typeof flipchartNum === "number" ? `Rotafolio · lámina ${flipchartNum}` : "";
        }
        if (typeof s.printedPage === "number") {
          const prefix = s.source === "workbook" ? "Cuaderno · " : "";
          return s.pdfSheet != null
            ? `${prefix}pág. impresa ${s.printedPage} (hoja PDF ${s.pdfSheet})`
            : `${prefix}pág. impresa ${s.printedPage}`;
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
    if (pagesText) {
      contentLines.push(`Páginas trabajadas: ${pagesText}.`);
    }
  }
  const uniqueItems = [...new Set(session.events.map((e) => e.itemText ?? e.itemId).filter(Boolean))];
  if (uniqueItems.length > 0) {
    contentLines.push(`Elementos abordados: ${uniqueItems.join(", ")}.`);
  }
  if (contentLines.length === 0) {
    contentLines.push(`Lección ${session.lesson} (sin páginas o elementos específicos registrados).`);
  }

  // Section 3: Actividades realizadas
  const activityLines =
    session.activities.length > 0
      ? session.activities.map((act) => `Actividad: ${act}.`)
      : ["No se registraron actividades específicas completadas en esta sesión."];

  // Section 4: Logros demostrados
  const achievementLines =
    achievements.length > 0
      ? achievements.map((a) => {
          const suffix =
            a.outcome === "correct_after_retry"
              ? ` (logrado tras reintento, ${a.attempts} intentos)`
              : " (primer intento)";
          const overrideTag = a.overridden ? " [ajustado por docente]" : "";
          return `${a.label}${suffix}${overrideTag}.`;
        })
      : ["No se registraron logros confirmados en esta sesión."];

  // Section 5: Dificultades observadas
  const difficultyLines: string[] = [];
  for (const d of difficulties) {
    const overrideTag = d.overridden ? " [ajustado por docente]" : "";
    difficultyLines.push(`${d.label}: requiere refuerzo (${d.attempts} intento(s))${overrideTag}.`);
  }
  for (const c of corrections) {
    difficultyLines.push(`Corrección registrada (${c.itemText ?? c.itemId ?? "elemento"}): ${c.correctionDetail ?? c.summary}.`);
  }
  if (difficultyLines.length === 0) {
    difficultyLines.push("No se observaron dificultades específicas en los eventos registrados.");
  }

  // Section 6: Pistas utilizadas
  const hintLines =
    hints.length > 0
      ? hints.map(
          (h) =>
            `${h.itemText ?? h.itemId ?? "Sesión"} — ${h.hintKind ? `[${h.hintKind}] ` : ""}${h.summary}.`,
        )
      : ["No se utilizaron pistas durante esta sesión."];

  // Section 7: Contenido pendiente
  const unfinishedLines =
    session.unfinishedWork.length > 0
      ? session.unfinishedWork.map(
          (u) =>
            `${u.label}${u.printedPage ? ` (pág. ${u.printedPage})` : ""}: ${u.reason}.`,
        )
      : ["No quedó contenido pendiente registrado al cierre de la sesión."];

  // Section 8: Recomendaciones para continuar (strictly separate from observations!)
  const recommendationLines: string[] = [];
  if (difficulties.length > 0) {
    const labels = [...new Set(difficulties.map((d) => d.label))].slice(0, 4).join(", ");
    recommendationLines.push(
      `Retomar con modelado lento y práctica breve los elementos con dificultad: ${labels}.`,
    );
  }
  if (session.unfinishedWork.length > 0) {
    recommendationLines.push(
      `Continuar en la próxima sesión con el contenido pendiente de la Lección ${session.lesson}.`,
    );
  }
  if (hints.length >= 3) {
    recommendationLines.push(
      "Mantener el apoyo de pistas guiadas antes de pedir lectura independiente en los ítems nuevos.",
    );
  }
  if (recommendationLines.length === 0) {
    recommendationLines.push(
      `Avanzar al siguiente paso de la Lección ${session.lesson} o iniciar una ronda breve de repaso oral.`,
    );
  }

  const observations: TeacherReportSection[] = [
    { title: "Resumen de la sesión", category: "observation", lines: summaryLines },
    { title: "Contenido trabajado", category: "observation", lines: contentLines },
    { title: "Actividades realizadas", category: "observation", lines: activityLines },
    { title: "Logros demostrados", category: "observation", lines: achievementLines },
    { title: "Dificultades observadas", category: "observation", lines: difficultyLines },
    { title: "Pistas utilizadas", category: "observation", lines: hintLines },
    { title: "Contenido pendiente", category: "observation", lines: unfinishedLines },
  ];

  const recommendations: TeacherReportSection = {
    title: "Recomendaciones para continuar",
    category: "recommendation",
    lines: recommendationLines,
  };

  const sections: TeacherReportSection[] = [...observations, recommendations];

  const plainText = [
    `Reporte docente — ${STRUCTURED_REPLAY_LABEL}`,
    `Sesión: ${session.sessionId} · Estudiante: ${session.learnerId} · Lección ${session.lesson}`,
    "",
    "=== OBSERVACIONES REGISTRADAS EN LA SESIÓN ===",
    ...observations.flatMap((section) => [
      `## ${section.title}`,
      ...section.lines.map((line) => `- ${line}`),
      "",
    ]),
    "=== RECOMENDACIONES PARA CONTINUAR (SEPARADAS DE LAS OBSERVACIONES) ===",
    `## ${recommendations.title}`,
    ...recommendations.lines.map((line) => `- ${line}`),
    "",
    `Nota: ${STUDENT_DEVICE_RECORDINGS_NOTICE}`,
  ].join("\n");

  return {
    sessionId: session.sessionId,
    learnerId: session.learnerId,
    lesson: session.lesson,
    generatedAt: new Date().toISOString(),
    replayLabel: STRUCTURED_REPLAY_LABEL,
    deviceNotice: STUDENT_DEVICE_RECORDINGS_NOTICE,
    observations,
    recommendations,
    sections,
    plainText,
  };
}
