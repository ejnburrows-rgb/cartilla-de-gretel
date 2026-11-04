import { describe, it, expect } from "vitest";
import {
  CATALOG,
  TOTAL_LESSONS,
  DEFAULT_ACTIVITIES,
  getCanonicalArtPool,
} from "../lesson-catalog";

describe("lesson-catalog", () => {
  it("has exactly 24 lessons", () => {
    expect(TOTAL_LESSONS).toBe(24);
    expect(CATALOG).toHaveLength(24);
  });

  it("covers lesson numbers 1..24 with no gaps or duplicates", () => {
    const numbers = CATALOG.map((e) => e.n);
    expect(new Set(numbers).size).toBe(numbers.length); // unique
    expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it("is sorted ascending by lesson number", () => {
    const numbers = CATALOG.map((e) => e.n);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("every entry has a title, a color, and a pages range", () => {
    for (const e of CATALOG) {
      expect(e.title, `lesson ${e.n} title`).toBeTruthy();
      expect(e.color, `lesson ${e.n} color`).toBeTruthy();
      expect(typeof e.pages, `lesson ${e.n} pages`).toBe("string");
    }
  });

  it("lesson 1 is the vowel intro with the lighter four-activity set", () => {
    const l1 = CATALOG.find((e) => e.n === 1);
    expect(l1?.kind).toBe("intro");
    expect(l1?.activities).toEqual(["silabas", "palabras", "sonido", "espejo"]);
  });

  it("maps the five vowels to lessons 2-6", () => {
    const vowels = CATALOG.filter((e) => e.kind === "vowel");
    expect(vowels).toHaveLength(5);
    expect(vowels.map((e) => e.n).sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6]);
  });

  it("lessons 7-24 are consonants, each carrying its own data", () => {
    const consonants = CATALOG.filter((e) => e.kind === "consonant");
    expect(consonants).toHaveLength(18);
    for (const c of consonants) {
      expect(c.n).toBeGreaterThanOrEqual(7);
      if (c.kind === "consonant") expect(c.data.letter).toBeTruthy();
    }
  });

  it("exposes the default 7-activity ordering", () => {
    expect(DEFAULT_ACTIVITIES).toEqual(["silabas", "palabras", "armar", "trazar", "piano", "sonido", "espejo"]);
  });
});

describe("getCanonicalArtPool", () => {
  it("never leaks vocabulary from a later lesson", () => {
    for (const lessonNumber of [1, 3, 7, 12, 24]) {
      const allowed = new Set(
        CATALOG.filter((entry) => entry.n <= lessonNumber).flatMap((entry) => {
          if (entry.kind === "vowel") return entry.lesson.vocab.map((w) => w.word);
          if (entry.kind === "consonant") return entry.data.vocab.map((w) => w.word);
          return [];
        }),
      );
      for (const item of getCanonicalArtPool(lessonNumber)) {
        expect(allowed.has(item.word)).toBe(true);
      }
    }
  });

  it("only offers words that already have authentic artwork", () => {
    for (const item of getCanonicalArtPool(24)) {
      expect(item.illustrationSrc).toBeTruthy();
      expect(item.illustrationSrc).toMatch(/^\/cartilla\/art\//);
    }
  });

  it("grows monotonically as lessons are taught", () => {
    const early = getCanonicalArtPool(3).length;
    const late = getCanonicalArtPool(24).length;
    expect(late).toBeGreaterThan(early);
  });
});
