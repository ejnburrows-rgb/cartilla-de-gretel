/**
 * src/lib/flipchart-hd.ts
 *
 * Utilities for accessing the HD colour flipchart artwork.
 * Source-of-truth data is src/data/teacher-flipchart.json.
 */
import flipchartData from "@/data/teacher-flipchart.json";

export type FlipchartPage = {
  /** 1-based sequential flipchart page number */
  flipchartPage: number;
  /** Lesson number this page belongs to (1-24) */
  lesson: number;
  /** Relative path from public root, e.g. "cartilla/art/hd/flipchart/page-001.jpg" */
  path: string;
  type: string;
  status: string;
  remasterStatus: string;
};

/** All 62 HD flipchart pages, sorted by flipchartPage ascending. */
export const FLIPCHART_PAGES: FlipchartPage[] = (flipchartData.pages as FlipchartPage[]).sort(
  (a, b) => a.flipchartPage - b.flipchartPage,
);

/**
 * Return the absolute URL path for a flipchart page (leading slash).
 *
 * All 62 HD plates have a pixel-cleaned, acceptance-tested restored mirror
 * committed under /cartilla/art/restored/flipchart/ (B7, same filenames,
 * strict 1:1 — cleanup only, never recolored or reinterpreted), so restored
 * is served first and the hd/ originals remain untouched on disk.
 */
export function getFlipchartPageSrc(page: FlipchartPage): string {
  const restored = page.path.replace(/^cartilla\/art\/hd\/flipchart\//, "cartilla/art/restored/flipchart/");
  return `/${restored}`;
}

/**
 * True when the path points at an HD flipchart plate directory — the original
 * (public/cartilla/art/hd/flipchart/) or its restored mirror
 * (public/cartilla/art/restored/flipchart/). Source/raw scans must never be
 * preferred when an HD plate exists in teacher-flipchart.json.
 */
export function isHdFlipchartPath(src: string): boolean {
  const clean = src.replace(/^\//, "").toLowerCase();
  return (
    clean.startsWith("cartilla/art/hd/flipchart/") ||
    clean.includes("/art/hd/flipchart/") ||
    clean.startsWith("cartilla/art/restored/flipchart/") ||
    clean.includes("/art/restored/flipchart/")
  );
}

/** Prefer HD path for a lesson's first plate; null if none authored. */
export function getPreferredFlipchartSrcForLesson(lessonNumber: number): string | null {
  const pages = getFlipchartPagesForLesson(lessonNumber);
  if (pages.length === 0) return null;
  const src = getFlipchartPageSrc(pages[0]!);
  return isHdFlipchartPath(src) ? src : src;
}

/** Return all flipchart pages that belong to the given lesson. */
export function getFlipchartPagesForLesson(lessonNumber: number): FlipchartPage[] {
  return FLIPCHART_PAGES.filter((p) => p.lesson === lessonNumber);
}

/** Return the first flipchartPage number for a given lesson (useful for linking). */
export function getFirstFlipchartPageForLesson(lessonNumber: number): number | null {
  const pages = getFlipchartPagesForLesson(lessonNumber);
  return pages.length > 0 ? (pages[0]?.flipchartPage ?? null) : null;
}
