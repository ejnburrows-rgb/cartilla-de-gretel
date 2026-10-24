/**
 * Locks tutor content derivation to the GRETEL-TUTOR-BUILD-SPEC §7 table
 * exactly: counts and order for Lecciones 1–3, derived from the verbatim
 * book transcription with nothing hand-typed in the derivation.
 */
import { describe, expect, it } from "vitest";
import { deriveTutorItems, findTutorItem, itemsForLesson, tutorItems } from "../tutor-content";

type Expected = { lesson: number; text: string; kind: "vowel" | "word"; printedPage: number };

// §7 table, verbatim. Lesson 1: 5 vowels (p.2 printed order) + 19 words = 24.
// Lesson 2 (pp. 4–6): 8. Lesson 3 (pp. 7–9): 9.
const EXPECTED: Expected[] = [
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

describe("tutor content derivation (spec §7)", () => {
  it("locks every derived item to the §7 table, in exact order", () => {
    expect(
      tutorItems.map(({ lesson, text, kind, printedPage }) => ({ lesson, text, kind, printedPage })),
    ).toEqual(EXPECTED);
  });

  it("derives fresh (not cached) items equal to the locked table", () => {
    expect(
      deriveTutorItems().map(({ lesson, text, kind, printedPage }) => ({ lesson, text, kind, printedPage })),
    ).toEqual(EXPECTED);
  });

  it("locks the per-lesson counts: 24, 8, 9", () => {
    expect(itemsForLesson(1)).toHaveLength(24);
    expect(itemsForLesson(2)).toHaveLength(8);
    expect(itemsForLesson(3)).toHaveLength(9);
    expect(itemsForLesson(4)).toHaveLength(0);
    expect(tutorItems).toHaveLength(24 + 8 + 9);
  });

  it("puts the five vowels first in Lección 1, in printed order a e i o u", () => {
    const vowels = itemsForLesson(1).filter((item) => item.kind === "vowel");
    expect(vowels.map((v) => v.text)).toEqual(["a", "e", "i", "o", "u"]);
    expect(itemsForLesson(1)[0].text).toBe("a");
  });

  it("has unique ids and no duplicate text within a lesson", () => {
    const ids = new Set(tutorItems.map((item) => item.id));
    expect(ids.size).toBe(tutorItems.length);
    for (const lesson of [1, 2, 3]) {
      const texts = new Set(itemsForLesson(lesson).map((item) => item.text));
      expect(texts.size).toBe(itemsForLesson(lesson).length);
    }
  });

  it("gives every item a stable l{lesson}-{kind}-{slug} id", () => {
    for (const item of tutorItems) {
      expect(item.id).toMatch(new RegExp(`^l${item.lesson}-(vowel|word)-[a-zñ0-9-]+$`));
    }
    // ñ survives in the slug so uña can never collide with a hypothetical "una".
    expect(findTutorItem(1, "uña").id).toBe("l1-word-uña");
  });

  it("throws when asked for a non-existent item", () => {
    expect(() => findTutorItem(1, "oveja")).toThrow(/No tutor item/);
  });
});