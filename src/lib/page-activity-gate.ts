import { getPageLayout, hasPageLayout, type PageRegionType } from "./book-faithful";

/**
 * Page completion gate (owner rule: a student cannot press Siguiente until
 * the required activity on the current page is finished).
 *
 * This hooks into the EXISTING activity/progress system — it does not invent
 * a new one:
 * - Completion signal: the `activity:complete` event on the gretel bus
 *   (src/lib/gretel-bus.ts), which every interactive exercise already fires
 *   when the student solves it.
 * - Persistence: localStorage, following the same per-lesson key pattern as
 *   StudentExercisePane (`cartilla.exercise-done.v1.<lessonId>`).
 * - Lesson-level progress stays in src/lib/lesson-progress.ts, untouched.
 *
 * Region types that gate: only the interactive exercises that actually fire
 * `activity:complete`. Open-ended writing (writing-line / writing-response)
 * has no grading and never fires it, so it must NOT gate — otherwise the
 * student would deadlock. Reading/instruction pages are view-complete.
 */
const ACTIVITY_REGION_TYPES: ReadonlySet<PageRegionType> = new Set([
  "picture-grid", // InteractivePictureGrid
  "syllable-match", // InteractiveSyllableMatch (Encierra)
  "fill-in-blank", // InteractiveFillInBlank (Completa)
  "vowel-line-match", // InteractiveVowelLineMatch (Une)
  "vowel-pick-one", // InteractiveVowelPickOne
  "vowel-match-all", // InteractiveVowelMatchAll
  "tracing-line", // WorkbookLetterTrace (fires on pass)
  "draw-box", // DibujaHost
  "paint-box", // PaintCanvas
  "syllable-bubble", // SyllableWordCircle (interactive + native)
]);

/** True when the book page has at least one gradable interactive exercise. */
export function pageRequiresActivity(pageNumber: number): boolean {
  if (!hasPageLayout(pageNumber)) return false;
  const regions = getPageLayout(pageNumber);
  return (regions ?? []).some((r) => ACTIVITY_REGION_TYPES.has(r.regionType));
}

const keyFor = (lessonId: number) => `cartilla.page-activity-done.v1.${lessonId}`;

function readDone(lessonId: number): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(keyFor(lessonId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr.filter((n) => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

/** Book page numbers (not viewer indices) whose activity is done. */
export function readDonePageNumbers(lessonId: number): Set<number> {
  return readDone(lessonId);
}

export function isPageActivityDone(lessonId: number, pageNumber: number): boolean {
  return readDone(lessonId).has(pageNumber);
}

export function markPageActivityDone(lessonId: number, pageNumber: number): void {
  if (typeof window === "undefined") return;
  try {
    const next = readDone(lessonId);
    next.add(pageNumber);
    window.localStorage.setItem(keyFor(lessonId), JSON.stringify([...next].sort((a, b) => a - b)));
  } catch {
    /* private mode: the gate still works for the session, just not persisted */
  }
}
