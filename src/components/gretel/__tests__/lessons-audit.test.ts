import { describe, it, expect } from "vitest";
import { lesson09 } from "@/data/lessons/lesson-09";
import { lesson10 } from "@/data/lessons/lesson-10";
import { lesson11 } from "@/data/lessons/lesson-11";
import { lesson12 } from "@/data/lessons/lesson-12";
import { lesson13 } from "@/data/lessons/lesson-13";
import { lesson14 } from "@/data/lessons/lesson-14";
import { lesson15 } from "@/data/lessons/lesson-15";
import { lesson16 } from "@/data/lessons/lesson-16";
import { getBookPageImage } from "@/lib/bookImages";

const lessons = {
  9: lesson09,
  10: lesson10,
  11: lesson11,
  12: lesson12,
  13: lesson13,
  14: lesson14,
  15: lesson15,
  16: lesson16,
};

describe("Lessons Data Structural Hardening", () => {
  Object.entries(lessons).forEach(([numStr, lessonArray]) => {
    const lessonNum = parseInt(numStr, 10);
    
    describe(`Lesson ${lessonNum}`, () => {
      it("should be a valid array", () => {
        expect(Array.isArray(lessonArray)).toBe(true);
        expect(lessonArray.length).toBeGreaterThan(0);
      });

      lessonArray.forEach((item: any, idx) => {
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
          expect(item.pageNumber, `${prefix} invalid pageNumber`).toBeLessThanOrEqual(92);

          // Check sourcePage matches getBookPageImage(pageNumber)
          const expectedSourcePage = getBookPageImage(item.pageNumber);
          expect(item.sourcePage, `${prefix} sourcePage mismatch`).toBe(expectedSourcePage);
        });
      });
    });
  });
});
