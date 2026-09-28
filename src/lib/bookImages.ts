/**
 * Central resolver for the repository-controlled workbook source pages.
 *
 * The public release no longer points at deleted external HD/restored hosts.
 * Native lesson pages are the primary product surface; these images are
 * source/provenance and a graceful fallback for legacy/dev readers.
 */
import { getFullWorkbookPages } from "./book-faithful";

const WORKBOOK_PAGE_COUNT = 90;

function zeroPad(n: number): string {
  return String(n).padStart(3, "0");
}

/** Legacy API retained for callers; restored external-host paths are retired. */
export function getRestoredPageImage(_pageNumber: number): string | null {
  return null;
}

/** Stable repository-controlled source page path. */
export function getBookPageImage(pageNumber: number): string | null {
  if (pageNumber >= 1 && pageNumber <= WORKBOOK_PAGE_COUNT) {
    return `/cartilla/art/source/workbook/page-${zeroPad(pageNumber)}.jpg`;
  }
  return null;
}

export function getLineartPathFromSource(sourcePath?: string | null): string | null {
  if (!sourcePath) return null;
  const clean = sourcePath.replace(/^\//, "");
  if (clean.startsWith("cartilla/art/hd/lineart/")) return `/${clean}`;
  return null;
}

/**
 * Ordered fallback chain for a workbook source page.
 * Native structured content renders before this path is needed.
 */
export function getWorkbookPageFallbackChain(
  pageNumber: number,
  sourceScanPath?: string | null,
): string[] {
  const safePage = Math.max(1, Math.min(pageNumber, WORKBOOK_PAGE_COUNT));
  const chain: string[] = [];

  const repositorySource = getBookPageImage(safePage);
  if (repositorySource) chain.push(repositorySource);

  let resolvedSource = sourceScanPath;
  if (!resolvedSource) {
    const found = getFullWorkbookPages().find((page) => page.page === safePage);
    resolvedSource = found?.imageScanReference ?? null;
  }

  const lineartPath = getLineartPathFromSource(resolvedSource);
  if (lineartPath) chain.push(lineartPath);

  if (resolvedSource) {
    const rawPath = resolvedSource.startsWith("/") ? resolvedSource : `/${resolvedSource}`;
    chain.push(rawPath);
  }

  return Array.from(new Set(chain));
}
