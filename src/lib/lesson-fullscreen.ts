/**
 * Full-screen lessons on laptops (owner decision 2026-10-12): opening a
 * lesson on a laptop or desktop screen fills the whole screen so the page
 * gets the full height. Esc exits; the page layout adapts by itself.
 * Tablets and phones are left as they are (their browsers handle this
 * differently and the page already fits).
 */
const LAPTOP_QUERY = "(pointer: fine) and (orientation: landscape) and (min-width: 1024px)";

export function canUseLessonFullscreen(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  if (!document.fullscreenEnabled || document.fullscreenElement) return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(LAPTOP_QUERY).matches;
}

/** Call from a user tap/click (browsers only allow it during a gesture). */
export function requestLessonFullscreen(): void {
  if (!canUseLessonFullscreen()) return;
  try {
    void document.documentElement.requestFullscreen?.({ navigationUI: "hide" })?.catch(() => undefined);
  } catch {
    /* Full screen is a convenience; the lesson works without it. */
  }
}

export function exitLessonFullscreen(): void {
  if (typeof document === "undefined" || !document.fullscreenElement) return;
  try {
    void document.exitFullscreen?.()?.catch(() => undefined);
  } catch {
    /* ignore */
  }
}
