/**
 * Central image resolver and fallback chain for workbook pages.
 *
 * Fallback sequence:
 *   1. HD colorized art (/cartilla/art/hd/workbook/page-NNN.{png,jpg})
 *   2. Clean transparent lineart (/cartilla/art/hd/lineart/<page>.png)
 *   3. Raw source scan (/cartilla/images/source/<page>.jpg)
 *
 * HARD RULE: Never replace or alter source images. Always degrade gracefully.
 */
import { getFullWorkbookPages } from "./book-faithful";

const COLOR_SCAN_COUNT = 92;

function zeroPad(n: number): string {
  return String(n).padStart(3, "0");
}

/**
 * Returns the primary HD workbook page image path.
 */
export function getBookPageImage(pageNumber: number): string | null {
  if (pageNumber >= 1 && pageNumber <= COLOR_SCAN_COUNT) {
    return `/cartilla/art/hd/workbook/page-${zeroPad(pageNumber)}.png`;
  }
  return null;
}

/**
 * Derives the clean transparent lineart path from a source scan reference.
 */
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
 * Returns an ordered fallback chain of asset paths for a student workbook page:
 *   1. HD colorized art
 *   2. Clean transparent lineart
 *   3. Raw source scan
 */
export function getWorkbookPageFallbackChain(
  pageNumber: number,
  sourceScanPath?: string | null,
): string[] {
  const chain: string[] = [];
  const safePage = Math.max(1, Math.min(pageNumber, 95));
  const padded = zeroPad(safePage);

  // 1. HD colorized art
  chain.push(`/cartilla/art/hd/workbook/page-${padded}.png`);
  chain.push(`/cartilla/art/hd/workbook/page-${padded}.jpg`);
  chain.push(`/cartilla/art/color/workbook/page-${padded}.png`);

  // Resolve source scan reference if not explicitly passed
  let resolvedSource = sourceScanPath;
  if (!resolvedSource) {
    const found = getFullWorkbookPages().find((p) => p.page === safePage);
    resolvedSource = found?.imageScanReference ?? null;
  }

  // 2. Clean transparent lineart
  const lineartPath = getLineartPathFromSource(resolvedSource);
  if (lineartPath) {
    chain.push(lineartPath);
  }

  // 3. Raw source scan
  if (resolvedSource) {
    const rawPath = resolvedSource.startsWith("/")
      ? resolvedSource
      : `/${resolvedSource}`;
    chain.push(rawPath);
  }

  return Array.from(new Set(chain));
}

