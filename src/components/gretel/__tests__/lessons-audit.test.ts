import { describe, it, expect } from "vitest";
import { lesson01 } from "@/data/lesson-exercises/lesson-01";
import { lesson02 } from "@/data/lesson-exercises/lesson-02";
import { lesson03 } from "@/data/lesson-exercises/lesson-03";
import { lesson04 } from "@/data/lesson-exercises/lesson-04";
import { lesson05 } from "@/data/lesson-exercises/lesson-05";
import { lesson06 } from "@/data/lesson-exercises/lesson-06";
import { lesson07 } from "@/data/lesson-exercises/lesson-07";
import { lesson08 } from "@/data/lesson-exercises/lesson-08";
import { lesson09 } from "@/data/lesson-exercises/lesson-09";
import { lesson10 } from "@/data/lesson-exercises/lesson-10";
import { lesson11 } from "@/data/lesson-exercises/lesson-11";
import { lesson12 } from "@/data/lesson-exercises/lesson-12";
import { lesson13 } from "@/data/lesson-exercises/lesson-13";
import { lesson14 } from "@/data/lesson-exercises/lesson-14";
import { lesson15 } from "@/data/lesson-exercises/lesson-15";
import { lesson16 } from "@/data/lesson-exercises/lesson-16";
import { lesson17 } from "@/data/lesson-exercises/lesson-17";
import { lesson18 } from "@/data/lesson-exercises/lesson-18";
import { lesson19 } from "@/data/lesson-exercises/lesson-19";
import { lesson20 } from "@/data/lesson-exercises/lesson-20";
import { lesson21 } from "@/data/lesson-exercises/lesson-21";
import { lesson22 } from "@/data/lesson-exercises/lesson-22";
import { lesson23 } from "@/data/lesson-exercises/lesson-23";
import { lesson24 } from "@/data/lesson-exercises/lesson-24";
import { getBookPageImage } from "@/lib/bookImages";

const lessons = {
  1: lesson01,
  2: lesson02,
  3: lesson03,
  4: lesson04,
  5: lesson05,
  6: lesson06,
  7: lesson07,
  8: lesson08,
  9: lesson09,
  10: lesson10,
  11: lesson11,
  12: lesson12,
  13: lesson13,
  14: lesson14,
  15: lesson15,
  16: lesson16,
  17: lesson17,
  18: lesson18,
  19: lesson19,
  20: lesson20,
  21: lesson21,
  22: lesson22,
  23: lesson23,
  24: lesson24,
};

describe("Lessons Data Structural Hardening", () => {
  Object.entries(lessons).forEach(([numStr, lessonArray]) => {
    const lessonNum = parseInt(numStr, 10);

    describe(`Lesson ${lessonNum}`, () => {
      it("should be a valid array", () => {
        expect(Array.isArray(lessonArray)).toBe(true);
        expect(lessonArray.length).toBeGreaterThan(0);
      });

      lessonArray.forEach((item: Record<string, unknown>, idx: number) => {
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
