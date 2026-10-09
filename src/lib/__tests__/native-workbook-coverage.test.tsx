import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import conversionStatus from "@/data/conversion-status.json";
import pageLayouts from "@/data/page-layouts.json";
import { CATALOG } from "@/lib/lesson-catalog";
import { buildPageArray } from "@/utils/buildPageArray";
import {
  WORKBOOK_PAGE_COUNT,
  workbookPagesForLesson,
  lessonForWorkbookPage,
  isWorkbookPageSourceBlocked,
  SOURCE_BLOCKED_WORKBOOK_PAGES,
} from "@/lib/workbook-pages";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";
import { allLessonExercises } from "@/data/lesson-exercises";

describe("native workbook coverage", () => {
  it("has structured native coverage for all 90 instructional pages", () => {
    const layoutPages = Object.keys(pageLayouts.pages).map(Number).sort((a, b) => a - b);
    expect(layoutPages).toEqual(Array.from({ length: 90 }, (_, index) => index + 1));
    expect(conversionStatus.pages).toHaveLength(90);
    for (const page of conversionStatus.pages) {
      const expected = [86, 87].includes(page.physicalPage) ? "SOURCE_BLOCKED" : "NATIVE_COMPLETE";
      expect(page.status, `page ${page.physicalPage}`).toBe(expected);
    }
  });

  it("routes every lesson page through the native FaithfulPageRenderer", () => {
    expect(CATALOG).toHaveLength(24);
    for (const lesson of CATALOG) {
      const pages = buildPageArray(lesson.n);
      expect(pages.length).toBeGreaterThan(0);
      for (const page of pages) {
        expect(isValidElement(page.content)).toBe(true);
        const element = page.content as ReactElement<{ native?: boolean; interactive?: boolean }>;
        expect(element.props.native).toBe(true);
        expect(element.props.interactive).toBe(true);
      }
    }
  });

  it("verifies lesson and page mapping invariants across all 90 printed pages", () => {
    expect(WORKBOOK_PAGE_COUNT).toBe(90);
    expect(SOURCE_BLOCKED_WORKBOOK_PAGES).toEqual([86, 87]);

    let currentPage = 1;
    for (let lesson = 1; lesson <= 24; lesson++) {
      const { start, end } = workbookPagesForLesson(lesson);
      expect(start).toBe(currentPage);

      if (lesson === 1) expect(end - start + 1).toBe(3);
      else if (lesson <= 6) expect(end - start + 1).toBe(3);
      else expect(end - start + 1).toBe(4);

      for (let page = start; page <= end; page++) {
        expect(lessonForWorkbookPage(page)).toBe(lesson);
      }
      currentPage = end + 1;
    }
    expect(currentPage - 1).toBe(90);
  });

  it("strictly enforces SOURCE_BLOCKED handling for pages 86 and 87 in workbook-source", () => {
    expect(isWorkbookPageSourceBlocked(86)).toBe(true);
    expect(isWorkbookPageSourceBlocked(87)).toBe(true);
    expect(isWorkbookPageSourceBlocked(85)).toBe(false);

    const lesson23Source = getWorkbookPageSourcesForLesson(23, "83-86");
    const page86Source = lesson23Source.pages.find((p) => p.pageNumber === 86);
    expect(page86Source).toBeDefined();
    expect(page86Source?.status).toBe("source-blocked");
    expect(page86Source?.hasVerifiedImage).toBe(false);
    expect(page86Source?.hasVerifiedText).toBe(false);

    const lesson24Source = getWorkbookPageSourcesForLesson(24, "87-90");
    const page87Source = lesson24Source.pages.find((p) => p.pageNumber === 87);
    expect(page87Source).toBeDefined();
    expect(page87Source?.status).toBe("source-blocked");
    expect(page87Source?.hasVerifiedImage).toBe(false);
    expect(page87Source?.hasVerifiedText).toBe(false);
  });

  it("verifies lessons 8–24 source wording and order mappings encoded in data", () => {
    expect(allLessonExercises).toHaveLength(90);
    for (let lesson = 8; lesson <= 24; lesson++) {
      const catalogEntry = CATALOG.find((c) => c.n === lesson);
      expect(catalogEntry).toBeDefined();

      const { start, end } = workbookPagesForLesson(lesson);
      expect(catalogEntry?.pages).toBe(`${start}-${end}`);

      const exercises = allLessonExercises.filter((e) => e.lessonNumber === lesson);
      expect(exercises).toHaveLength(end - start + 1);

      exercises.forEach((ex) => {
        if ([86, 87].includes(ex.pageNumber)) {
          expect(ex.transcriptionStatus).toBe("source-blocked");
          expect(ex.teacherNotes).toContain("86–87");
        } else {
          expect(ex.transcriptionStatus).toBe("verified-against-scan");
        }
      });
    }
  });
});
