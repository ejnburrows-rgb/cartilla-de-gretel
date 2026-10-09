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
import { allLessonExercises, lessonExercisesFor } from "@/data/lesson-exercises";
import transcription from "@/data/book-transcription/lessons-08-24.json";
import { getPageLayout } from "@/lib/book-faithful";
import { pageCompletionState, requiredActivitiesForPage } from "@/lib/page-completion";

describe("native workbook coverage", () => {
  it("has structured native coverage for all 90 instructional pages", () => {
    const layoutPages = Object.keys(pageLayouts.pages)
      .map(Number)
      .sort((a, b) => a - b);
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

  it("SOURCE_BLOCKED pages 86–87 render no inferred regions and require no completion", () => {
    for (const page of SOURCE_BLOCKED_WORKBOOK_PAGES) {
      expect(getPageLayout(page)).toEqual([]);
      expect(requiredActivitiesForPage(page)).toEqual([]);
      expect(pageCompletionState(page, undefined, []).complete).toBe(true);
      const exercise = allLessonExercises.find((e) => e.pageNumber === page);
      expect(exercise).toMatchObject({
        transcriptionStatus: "source-blocked",
        items: [],
        kind: "reading",
      });
    }
  });

  it("lessons 8–24 run in authoritative book order with book-verified page content", () => {
    const fixtureLessons = (
      transcription as unknown as {
        lessons: Record<
          string,
          { pages: Record<"write" | "circle" | "letter" | "complete", number> }
        >;
      }
    ).lessons;
    const rawPages = (pageLayouts as unknown as { pages: Record<string, { regions: unknown[] }> })
      .pages;
    for (let lesson = 8; lesson <= 24; lesson++) {
      const { write, circle, letter, complete } = fixtureLessons[String(lesson)]!.pages;
      const bookOrder = [write, circle, letter, complete];
      expect(lessonExercisesFor(lesson).map((e) => e.pageNumber)).toEqual(bookOrder);
      expect(buildPageArray(lesson).map((e) => e.pageNumber)).toEqual(bookOrder);
      for (const page of bookOrder) {
        if (isWorkbookPageSourceBlocked(page)) continue;
        // Runtime content is exactly the data the book-fidelity gate verifies.
        expect(getPageLayout(page)).toEqual(rawPages[String(page)]!.regions);
        expect(allLessonExercises.find((e) => e.pageNumber === page)?.transcriptionStatus).toBe(
          "verified-against-scan",
        );
      }
    }
  });
});
