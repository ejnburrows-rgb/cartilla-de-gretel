import { describe, it, expect } from "vitest";
import { lessonExercisesFor } from "@/data/lesson-exercises";
import { workbookPagesForLesson } from "@/lib/workbook-pages";
import { getBookPageImage } from "@/lib/bookImages";

const lessons = Object.fromEntries(
  Array.from({ length: 24 }, (_, i) => [i + 1, lessonExercisesFor(i + 1)]),
);

describe("Lessons Data Structural Hardening", () => {
  Object.entries(lessons).forEach(([numStr, lessonArray]) => {
    const lessonNum = parseInt(numStr, 10);

    describe(`Lesson ${lessonNum}`, () => {
      it("should be a valid array", () => {
        expect(Array.isArray(lessonArray)).toBe(true);
        expect(lessonArray.length).toBeGreaterThan(0);
      });

      it("covers exactly the printed Workbook pages of the lesson", () => {
        const { start, end } = workbookPagesForLesson(lessonNum);
        expect(lessonArray.map((item) => item.pageNumber)).toEqual(
          Array.from({ length: end - start + 1 }, (_, i) => start + i),
        );
      });

      (lessonArray as unknown as Record<string, unknown>[]).forEach((item, idx) => {
        const prefix = `Item ${idx} (id: ${item?.id})`;

        it(`${prefix} should have all required fields and valid page references`, () => {
          // Check required fields
          const required = [
            "id",
            "lessonNumber",
            "pageNumber",
            "kind",
            "title",
            "prompt",
            "items",
            "targets",
            "sourceStatus",
            "transcriptionStatus",
            "studentFacingStatus",
            "teacherNotes",
            "sourcePage",
          ];

          required.forEach((field) => {
            expect(item, `${prefix} is missing field: ${field}`).toHaveProperty(field);
          });

          // Check lesson number
          expect(item.lessonNumber, `${prefix} lessonNumber mismatch`).toBe(lessonNum);

          // Check page number validity
          expect(item.pageNumber, `${prefix} invalid pageNumber`).toBeGreaterThanOrEqual(1);
          expect(item.pageNumber, `${prefix} invalid pageNumber`).toBeLessThanOrEqual(94);

          // Check sourcePage matches getBookPageImage(pageNumber)
          const expectedSourcePage = getBookPageImage(item.pageNumber as number);
          expect(item.sourcePage, `${prefix} sourcePage mismatch`).toBe(expectedSourcePage);
        });
      });
    });
  });
});
