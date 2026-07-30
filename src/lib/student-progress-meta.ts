// Explicit, validated progress metadata for a child's progress row.
//
// Before this file, `progress_events.meta` accepted arbitrary client JSON on a
// row attached to a named child. That is the opposite of data minimisation: any
// caller (or any future bug) could attach anything at all to a child's record.
//
// The rule here is simple and deliberately boring: an allowlist of known fields
// with known types. Unknown keys are rejected, not silently dropped, so a caller
// that starts sending something new fails loudly in tests instead of quietly
// widening what we store about children.

export const ALLOWED_PROGRESS_META_KEYS = [
  "exercise",
  "page",
  "physicalPage",
  "attempt",
  "inputMode",
  "durationMs",
  "mechanic",
  "progressEventType",
  "completed",
] as const;

export type AllowedProgressMetaKey = (typeof ALLOWED_PROGRESS_META_KEYS)[number];

export type ValidatedProgressMeta = Partial<{
  exercise: string;
  page: number;
  physicalPage: number;
  attempt: number;
  inputMode: "touch" | "mouse" | "keyboard";
  durationMs: number;
  mechanic: string;
  progressEventType: string;
  completed: boolean;
}>;

/** Raised when a caller tries to store metadata we do not explicitly allow. */
export class InvalidProgressMetaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProgressMetaError";
  }
}

const MAX_TEXT_LENGTH = 80;
const MAX_ATTEMPT = 100;
const MAX_PAGE = 1000;
const MAX_DURATION_MS = 3_600_000;

function requireShortText(key: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidProgressMetaError(`Progress metadata field "${key}" must be short text.`);
  }
  if (value.length > MAX_TEXT_LENGTH) {
    throw new InvalidProgressMetaError(
      `Progress metadata field "${key}" must be ${MAX_TEXT_LENGTH} characters or fewer.`,
    );
  }
  return value;
}

function requireBoundedInteger(key: string, value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) {
    throw new InvalidProgressMetaError(
      `Progress metadata field "${key}" must be a whole number between 0 and ${max}.`,
    );
  }
  return value;
}

/**
 * Validates client-supplied progress metadata against the allowlist.
 * Returns `null` for empty metadata so callers can pass it straight through.
 */
export function validateProgressMeta(meta: unknown): ValidatedProgressMeta | null {
  if (meta === null || meta === undefined) return null;
  if (typeof meta !== "object" || Array.isArray(meta)) {
    throw new InvalidProgressMetaError("Progress metadata must be a plain object.");
  }

  const input = meta as Record<string, unknown>;
  const unknownKeys = Object.keys(input).filter(
    (key) => !(ALLOWED_PROGRESS_META_KEYS as readonly string[]).includes(key),
  );
  if (unknownKeys.length > 0) {
    throw new InvalidProgressMetaError(
      `Unknown progress metadata field(s): ${unknownKeys.sort().join(", ")}.`,
    );
  }

  const out: ValidatedProgressMeta = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    switch (key as AllowedProgressMetaKey) {
      case "exercise":
        out.exercise = requireShortText(key, value);
        break;
      case "mechanic":
        out.mechanic = requireShortText(key, value);
        break;
      case "progressEventType":
        out.progressEventType = requireShortText(key, value);
        break;
      case "page":
        out.page = requireBoundedInteger(key, value, MAX_PAGE);
        break;
      case "physicalPage":
        out.physicalPage = requireBoundedInteger(key, value, MAX_PAGE);
        break;
      case "attempt":
        out.attempt = requireBoundedInteger(key, value, MAX_ATTEMPT);
        break;
      case "durationMs":
        out.durationMs = requireBoundedInteger(key, value, MAX_DURATION_MS);
        break;
      case "inputMode":
        if (value !== "touch" && value !== "mouse" && value !== "keyboard") {
          throw new InvalidProgressMetaError(
            'Progress metadata field "inputMode" must be touch, mouse or keyboard.',
          );
        }
        out.inputMode = value;
        break;
      case "completed":
        if (typeof value !== "boolean") {
          throw new InvalidProgressMetaError(
            'Progress metadata field "completed" must be true or false.',
          );
        }
        out.completed = value;
        break;
    }
  }

  return Object.keys(out).length > 0 ? out : null;
}

/** Maximum length for a teacher's free-text note about a named child. */
export const TEACHER_NOTES_MAX_LENGTH = 1000;

/**
 * Plain-Spanish warning shown next to the teacher notes field. Teachers write
 * quick pedagogical observations here; diagnoses, medical information, family
 * circumstances and other sensitive detail do not belong in a classroom app.
 */
export const TEACHER_NOTES_WARNING =
  "Escribe solo observaciones pedagógicas breves. No incluyas diagnósticos, información médica, circunstancias familiares ni datos sensibles innecesarios.";

export function validateTeacherNotes(notes: string | null | undefined): string | null {
  if (notes === null || notes === undefined) return null;
  const trimmed = notes.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > TEACHER_NOTES_MAX_LENGTH) {
    throw new InvalidProgressMetaError(
      `Las notas del docente no pueden pasar de ${TEACHER_NOTES_MAX_LENGTH} caracteres.`,
    );
  }
  return trimmed;
}
