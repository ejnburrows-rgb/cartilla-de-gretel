/**
 * Local-first persistence for freehand paint / draw strokes and lasso progress.
 * Same localStorage convention as page-progress / student-session — never Supabase.
 */

const PREFIX = "cartilla.activity.canvas.v1:";

export type CanvasSnapshot = {
  /** PNG data URL of the paint/draw layer only (not the base illustration). */
  dataUrl: string;
  updatedAt: number;
};

export type LassoProgressSnapshot = {
  /** Completed target / pair ids */
  completedIds: string[];
  updatedAt: number;
};

function key(scope: string, pageKey: string): string {
  return `${PREFIX}${scope}:${pageKey}`;
}

export function loadCanvasSnapshot(pageKey: string): CanvasSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key("paint", pageKey));
    if (!raw) return null;
    return JSON.parse(raw) as CanvasSnapshot;
  } catch {
    return null;
  }
}

export function saveCanvasSnapshot(pageKey: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    const snap: CanvasSnapshot = { dataUrl, updatedAt: Date.now() };
    window.localStorage.setItem(key("paint", pageKey), JSON.stringify(snap));
  } catch {
    /* quota */
  }
}

export function clearCanvasSnapshot(pageKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key("paint", pageKey));
  } catch {
    /* ignore */
  }
}

export function loadLassoProgress(pageKey: string): LassoProgressSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key("lasso", pageKey));
    if (!raw) return null;
    return JSON.parse(raw) as LassoProgressSnapshot;
  } catch {
    return null;
  }
}

export function saveLassoProgress(pageKey: string, completedIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const snap: LassoProgressSnapshot = { completedIds, updatedAt: Date.now() };
    window.localStorage.setItem(key("lasso", pageKey), JSON.stringify(snap));
  } catch {
    /* quota */
  }
}

/** Book-sampled palette — warm pastels + saturated primaries (no neon chrome). */
export const BOOK_PAINT_SWATCHES = [
  "#E85D4C", // book coral-red
  "#F4A261", // warm orange
  "#E9C46A", // soft yellow
  "#2A9D8F", // teal-green
  "#457B9D", // book blue
  "#9B5DE5", // soft violet
  "#F2CC8F", // cream paper accent
  "#E76F51", // terracotta
  "#90BE6D", // leaf green
  "#F8EDEB", // pale blush
] as const;

export const BOOK_DRAW_SWATCHES = [
  "#1f2937", // soft charcoal pencil
  "#E85D4C",
  "#457B9D",
  "#2A9D8F",
  "#E9C46A",
  "#9B5DE5",
] as const;
