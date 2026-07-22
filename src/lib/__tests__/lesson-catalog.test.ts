import { describe, it, expect } from "vitest";
import { CATALOG, TOTAL_LESSONS, DEFAULT_ACTIVITIES } from "../lesson-catalog";

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

  it("lesson 1 is the vowel intro with the lighter two-activity set", () => {
    const l1 = CATALOG.find((e) => e.n === 1);
    expect(l1?.kind).toBe("intro");
    expect(l1?.activities).toEqual(["silabas", "palabras"]);
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

  it("exposes the default 5-activity ordering", () => {
    expect(DEFAULT_ACTIVITIES).toEqual(["silabas", "palabras", "armar", "trazar", "piano"]);
  });
});
