import { describe, expect, it } from "vitest";
import {
  ALL_CURRICULUM_LESSONS,
  TUTOR_LESSONS,
  deriveTutorItems,
  findTutorItem,
  itemsForLesson,
  lessonGraphFor,
  tutorItems,
  tutorLessonGraphs,
} from "../tutor-content";

type Expected = { lesson: number; text: string; kind: "vowel" | "word"; printedPage: number };

// §7 table, verbatim. Lesson 1: 5 vowels (p.2 printed order) + 19 words = 24.
// Lesson 2 (pp. 4–6): 8. Lesson 3 (pp. 7–9): 9.
const EXPECTED_L1_TO_L3: Expected[] = [
  { lesson: 1, text: "a", kind: "vowel", printedPage: 2 },
  { lesson: 1, text: "e", kind: "vowel", printedPage: 2 },
  { lesson: 1, text: "i", kind: "vowel", printedPage: 2 },
  { lesson: 1, text: "o", kind: "vowel", printedPage: 2 },
  { lesson: 1, text: "u", kind: "vowel", printedPage: 2 },
  { lesson: 1, text: "abrigo", kind: "word", printedPage: 1 },
  { lesson: 1, text: "abanico", kind: "word", printedPage: 1 },
  { lesson: 1, text: "isla", kind: "word", printedPage: 1 },
  { lesson: 1, text: "imán", kind: "word", printedPage: 1 },
  { lesson: 1, text: "escalera", kind: "word", printedPage: 1 },
  { lesson: 1, text: "escuela", kind: "word", printedPage: 1 },
  { lesson: 1, text: "uniforme", kind: "word", printedPage: 1 },
  { lesson: 1, text: "uña", kind: "word", printedPage: 1 },
  { lesson: 1, text: "ojos", kind: "word", printedPage: 1 },
  { lesson: 1, text: "olla", kind: "word", printedPage: 1 },
  { lesson: 1, text: "anillo", kind: "word", printedPage: 2 },
  { lesson: 1, text: "estrella", kind: "word", printedPage: 2 },
  { lesson: 1, text: "indio", kind: "word", printedPage: 2 },
  { lesson: 1, text: "oso", kind: "word", printedPage: 2 },
  { lesson: 1, text: "ocho", kind: "word", printedPage: 3 },
  { lesson: 1, text: "araña", kind: "word", printedPage: 3 },
  { lesson: 1, text: "iglesia", kind: "word", printedPage: 3 },
  { lesson: 1, text: "escoba", kind: "word", printedPage: 3 },
  { lesson: 1, text: "uno", kind: "word", printedPage: 3 },
  { lesson: 2, text: "o", kind: "vowel", printedPage: 5 },
  { lesson: 2, text: "ola", kind: "word", printedPage: 4 },
  { lesson: 2, text: "oso", kind: "word", printedPage: 4 },
  { lesson: 2, text: "oveja", kind: "word", printedPage: 4 },
  { lesson: 2, text: "oreja", kind: "word", printedPage: 4 },
  { lesson: 2, text: "olla", kind: "word", printedPage: 4 },
  { lesson: 2, text: "ocho", kind: "word", printedPage: 4 },
  { lesson: 2, text: "ojos", kind: "word", printedPage: 4 },
  { lesson: 3, text: "a", kind: "vowel", printedPage: 8 },
  { lesson: 3, text: "abanico", kind: "word", printedPage: 7 },
  { lesson: 3, text: "aro", kind: "word", printedPage: 7 },
  { lesson: 3, text: "abeja", kind: "word", printedPage: 7 },
  { lesson: 3, text: "árbol", kind: "word", printedPage: 7 },
  { lesson: 3, text: "alas", kind: "word", printedPage: 7 },
  { lesson: 3, text: "ardilla", kind: "word", printedPage: 7 },
  { lesson: 3, text: "avión", kind: "word", printedPage: 7 },
  { lesson: 3, text: "aguja", kind: "word", printedPage: 7 },
];

describe("tutor content derivation (spec §7 + 24-lesson generalization)", () => {
  it("locks every L1–3 derived item to the §7 table, in exact order", () => {
    const l1To3 = [...itemsForLesson(1), ...itemsForLesson(2), ...itemsForLesson(3)];
    expect(
      l1To3.map(({ lesson, text, kind, printedPage }) => ({ lesson, text, kind, printedPage })),
    ).toEqual(EXPECTED_L1_TO_L3);
  });

  it("derives fresh L1–3 items equal to the locked table", () => {
    expect(
      deriveTutorItems(TUTOR_LESSONS).map(({ lesson, text, kind, printedPage }) => ({
        lesson,
        text,
        kind,
        printedPage,
      })),
    ).toEqual(EXPECTED_L1_TO_L3);
  });

  it("preserves the locked L1–3 per-lesson counts: 24 + 8 + 9 = 41", () => {
    expect(TUTOR_LESSONS).toEqual([1, 2, 3]);
    expect(itemsForLesson(1)).toHaveLength(24);
    expect(itemsForLesson(2)).toHaveLength(8);
    expect(itemsForLesson(3)).toHaveLength(9);
    expect(deriveTutorItems([1, 2, 3])).toHaveLength(24 + 8 + 9);
    expect(itemsForLesson(25)).toHaveLength(0);
  });

  it("puts the five vowels first in Lección 1, in printed order a e i o u", () => {
    const vowels = itemsForLesson(1).filter((item) => item.kind === "vowel");
    expect(vowels.map((v) => v.text)).toEqual(["a", "e", "i", "o", "u"]);
    expect(itemsForLesson(1)[0].text).toBe("a");
  });

  it("generalizes cleanly across all 24 lessons with unique canonical IDs", () => {
    expect(ALL_CURRICULUM_LESSONS).toHaveLength(24);
    const ids = new Set(tutorItems.map((item) => item.id));
    expect(ids.size).toBe(tutorItems.length);

    for (const lesson of ALL_CURRICULUM_LESSONS) {
      const lessonItems = itemsForLesson(lesson);
      expect(lessonItems.length).toBeGreaterThan(0);
      for (const item of lessonItems) {
        expect(item.id).toMatch(
          new RegExp(`^l${item.lesson}-(vowel|syllable|word|sight|sentence)-[a-zñ0-9-]+$`),
        );
      }
    }
    // ñ survives in the slug so uña can never collide with a hypothetical "una".
    expect(findTutorItem(1, "uña").id).toBe("l1-word-uña");
    expect(findTutorItem(7, "mamá").id).toBe("l7-word-mama");
    expect(findTutorItem(24, "zapato").id).toBe("l24-word-zapato");
  });

  it("matches the 24-lesson instructional graph files and respects absent-in-source pages 86–87", () => {
    expect(tutorLessonGraphs).toHaveLength(24);
    for (const lesson of ALL_CURRICULUM_LESSONS) {
      const graph = lessonGraphFor(lesson);
      expect(graph).toBeDefined();
      expect(graph!.lessonId).toBe(`lesson-${String(lesson).padStart(2, "0")}`);
      expect(
        graph!.items.map(({ id, lesson: l, text, kind, printedPage }) => ({
          id,
          lesson: l,
          text,
          kind,
          printedPage,
        })),
      ).toEqual(itemsForLesson(lesson));
    }

    const l23 = lessonGraphFor(23)!;
    expect(l23.sourceStatus).toBe("partial-absent-in-source");
    expect(l23.printedWorkbookPages.absentInSourcePages).toEqual([86]);
    expect(l23.pages.find((p) => p.printedPage === 86)).toMatchObject({
      printedPage: 86,
      pdfSheet: null,
      status: "absent-in-source",
    });
    expect(l23.items.some((item) => item.printedPage === 86)).toBe(false);

    const l24 = lessonGraphFor(24)!;
    expect(l24.sourceStatus).toBe("partial-absent-in-source");
    expect(l24.printedWorkbookPages.absentInSourcePages).toEqual([87]);
    expect(l24.pages.find((p) => p.printedPage === 87)).toMatchObject({
      printedPage: 87,
      pdfSheet: null,
      status: "absent-in-source",
    });
    expect(l24.items.some((item) => item.printedPage === 87)).toBe(false);
  });

  it("throws when asked for a non-existent item", () => {
    expect(() => findTutorItem(1, "oveja")).toThrow(/No tutor item/);
  });
});
