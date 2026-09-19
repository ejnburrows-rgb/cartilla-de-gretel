export const HAPTIC_PATTERNS = {
  tap: [15],
  success: [40, 40, 60],
  error: [80, 50, 70],
  "drag-pick": [20],
  "drag-drop": [30],
  "page-flip": [15, 10, 15],
  "streak-celebration": [50, 40, 50, 40, 20],
};

export type HapticKind = keyof typeof HAPTIC_PATTERNS;

export function triggerHaptic(kind: HapticKind) {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  const isEnabled = localStorage.getItem("cartilla:haptics:enabled") !== "false";
  if (!isEnabled) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const pattern = HAPTIC_PATTERNS[kind];
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
