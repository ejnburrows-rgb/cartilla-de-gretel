/**
 * Central image resolver for student workbook pages.
 *
 * Source-faithful sequence:
 *   1. Accepted restored page scan, when committed.
 *   2. Exact raw student-workbook source scan.
 *   3. Clean transparent lineart only as a last-resort rendering fallback.
 *
 * HARD RULE: Never use automatically colorized/hash-palette workbook pages.
 * Color is allowed only when it comes from an accepted faithful restoration or
 * an explicitly source-backed illustration mapping elsewhere in the app.
 */
import { getFullWorkbookPages } from "./book-faithful";

/**
 * Pages whose restored (pixel-cleaned, acceptance-tested) art is committed
 * under /cartilla/art/restored/workbook/. Restoration CLEANS, never INVENTS —
 * every file here passed the overlay/edge-drift acceptance test (see AGENTS.md).
 */
const RESTORED_PAGE_EXT: ReadonlyMap<number, "png" | "jpg"> = new Map(
  Array.from({ length: 90 }, (_, i) => {
    const page = i + 1;
    // Restored output mirrors each source slot's format: pages 1-44 have png
    // sources, 45+ exist only as jpg.
    return [page, page <= 44 ? "png" : "jpg"] as const;
  }),
);

function zeroPad(n: number): string {
  return String(n).padStart(3, "0");
}

function getSourceScan(pageNumber: number): string | null {
  const found = getFullWorkbookPages().find((page) => page.page === pageNumber);
  const source = found?.imageScanReference;
  if (!source) return null;
  return source.startsWith("/") ? source : `/${source}`;
}

/** Returns the accepted restored page path, or null when none is committed. */
export function getRestoredPageImage(pageNumber: number): string | null {
  const ext = RESTORED_PAGE_EXT.get(pageNumber);
  if (!ext) return null;
  return `/cartilla/art/restored/workbook/page-${zeroPad(pageNumber)}.${ext}`;
}

/**
 * Returns the safest primary image for a workbook page.
 * This intentionally never returns /art/hd/workbook or /art/color/workbook.
 */
export function getBookPageImage(pageNumber: number): string | null {
  const safePage = Math.max(1, Math.min(pageNumber, 95));
  return getRestoredPageImage(safePage) ?? getSourceScan(safePage);
}

/** Derives the clean transparent lineart path from a source scan reference. */
export function getLineartPathFromSource(sourcePath?: string | null): string | null {
  if (!sourcePath) return null;
  const clean = sourcePath.replace(/^\//, "");
  if (clean.startsWith("cartilla/art/hd/lineart/")) {
    return `/${clean}`;
  }
  const parts = clean.split("/");
  const filename = parts[parts.length - 1];
  if (!filename) return null;
  const base = filename.replace(/\.[^/.]+$/, "");
  return `/cartilla/art/hd/lineart/${base}.png`;
}

/**
 * Returns the source-faithful fallback chain for a student workbook page:
 * accepted restored scan -> exact raw source -> lineart fallback.
 */
export function getWorkbookPageFallbackChain(
  pageNumber: number,
  sourceScanPath?: string | null,
): string[] {
  const safePage = Math.max(1, Math.min(pageNumber, 95));
  const chain: string[] = [];

  const restored = getRestoredPageImage(safePage);
  if (restored) chain.push(restored);

  const resolvedSource = sourceScanPath
    ? sourceScanPath.startsWith("/")
      ? sourceScanPath
      : `/${sourceScanPath}`
    : getSourceScan(safePage);

  if (resolvedSource) chain.push(resolvedSource);

  const lineartPath = getLineartPathFromSource(resolvedSource);
  if (lineartPath) chain.push(lineartPath);

  return Array.from(new Set(chain));
}
