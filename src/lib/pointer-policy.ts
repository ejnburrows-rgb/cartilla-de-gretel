/**
 * Touch-first device policy for DibujaHost and other dual-mode activities.
 * - coarse pointer / touch-capable → freehand draw is the honest default
 * - fine pointer only (classic mouse desktop) → pick-picture is the default
 */

export type InputModeDefault = "draw" | "pick";

export function detectTouchCapable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof window.matchMedia === "function") {
      if (window.matchMedia("(pointer: coarse)").matches) return true;
      if (window.matchMedia("(any-pointer: coarse)").matches) return true;
    }
    if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
  } catch {
    /* matchMedia unavailable in some test envs */
    if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
  }
  return false;
}

export function defaultDibujaMode(): InputModeDefault {
  return detectTouchCapable() ? "draw" : "pick";
}
