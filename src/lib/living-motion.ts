/**
 * living-motion — shared motion policy for ambient character life,
 * page turns, and flipchart flips. No invented art; transforms only.
 */

/** Soft cubic used for elegant page / flipchart turns (not linear, not springy). */
export const ELEGANT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Physical student-workbook curl: deliberate enough to read as paper, never sluggish. */
export const STUDENT_PAGE_TURN_MS = 620;

/** Teacher flipchart vertical flip duration (ms). */
export const FLIPCHART_FLIP_MS = 820;

/** Blink hold while lids are closed (ms). */
export const BLINK_HOLD_MS = 110;

/** Random delay until next blink (ms), inclusive range. */
export function nextBlinkDelayMs(rng: () => number = Math.random): number {
  return Math.floor(3000 + rng() * 4000);
}

/** Breathing amplitude in CSS pixels (1–3px). */
export const BREATH_AMPLITUDE_PX = 2;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function prefersSimplePageTransition(): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return true;
  try {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    const cores =
      typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency
        : 8;
    if (cores > 0 && cores < 4) return true;
    if (coarse && noHover && cores <= 4) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export type TurnDirection = "next" | "prev";

export function studentFlipTransforms(direction: TurnDirection): { start: string; end: string } {
  if (direction === "next") return { start: "rotateY(0deg)", end: "rotateY(-180deg)" };
  return { start: "rotateY(-180deg)", end: "rotateY(0deg)" };
}

export function flipchartFlipTransforms(direction: TurnDirection): { start: string; end: string } {
  if (direction === "next") return { start: "rotateX(0deg)", end: "rotateX(-180deg)" };
  return { start: "rotateX(-180deg)", end: "rotateX(0deg)" };
}
