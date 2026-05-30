/**
 * src/lib/flipchart-hd.ts
 *
 * Utilities for accessing the HD colour flipchart artwork.
 * Source-of-truth data is src/data/teacher-flipchart.json.
 * HD images live in public/cartilla/art/hd/flipchart/.
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
export const FLIPCHART_PAGES: FlipchartPage[] = (
  flipchartData.pages as FlipchartPage[]
).sort((a, b) => a.flipchartPage - b.flipchartPage);

/** Return the absolute URL path for a flipchart page (leading slash). */
export function getFlipchartPageSrc(page: FlipchartPage): string {
  return `/${page.path}`;
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
