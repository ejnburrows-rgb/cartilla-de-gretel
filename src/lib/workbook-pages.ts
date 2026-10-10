/**
 * Printed Student Workbook page map (Libro del alumno, printed pages 1–90).
 *
 *   Lección 1 (introducción)  → pages 1–3
 *   Lecciones 2–6 (vocales)   → 3 pages each, pages 4–18
 *   Lecciones 7–24 (consonantes) → 4 pages each, from page 19;
 *     for N ≥ 8: start = 23 + 4 × (N − 8), end = start + 3
 *
 * Verified against the printed "Lección N" footer of every scan in
 * public/cartilla/art/source/workbook and against the book-fidelity fixtures.
 */
export const WORKBOOK_PAGE_COUNT = 90;

/** Printed pages whose source scan is absent from every available source
 * (the owner's Rescan PDF has the documented 86–87 gap). Never invent them. */
export const SOURCE_BLOCKED_WORKBOOK_PAGES: readonly number[] = [86, 87];

export function workbookPagesForLesson(lesson: number): { start: number; end: number } {
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 24) throw new RangeError(`lesson ${lesson}`);
  if (lesson === 1) return { start: 1, end: 3 };
  if (lesson <= 6) {
    const start = 4 + 3 * (lesson - 2);
    return { start, end: start + 2 };
  }
  if (lesson === 7) return { start: 19, end: 22 };
  const start = 23 + 4 * (lesson - 8);
  return { start, end: start + 3 };
}

export function lessonForWorkbookPage(page: number): number {
  if (!Number.isInteger(page) || page < 1 || page > WORKBOOK_PAGE_COUNT) throw new RangeError(`page ${page}`);
  if (page <= 3) return 1;
  if (page <= 18) return 2 + Math.floor((page - 4) / 3);
  return 7 + Math.floor((page - 19) / 4);
}
