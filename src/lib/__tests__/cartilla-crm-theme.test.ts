import { describe, expect, it } from "vitest";
import {
  getBookSectionForLesson,
  getLessonPageNumbers,
  getCartillaCrmTheme,
  getCartillaCrmCssVars,
} from "@/lib/cartilla-crm-theme";

describe("Cartilla CRM Theme and Range Helpers", () => {
  describe("getBookSectionForLesson", () => {
    it("identifies section 'intro' for lessons <= 1", () => {
      expect(getBookSectionForLesson(0)).toBe("intro");
      expect(getBookSectionForLesson(1)).toBe("intro");
    });

    it("identifies section 'vowels' for lessons between 2 and 6", () => {
      expect(getBookSectionForLesson(2)).toBe("vowels");
      expect(getBookSectionForLesson(4)).toBe("vowels");
      expect(getBookSectionForLesson(6)).toBe("vowels");
    });

    it("identifies section 'consonants' for lessons > 6", () => {
      expect(getBookSectionForLesson(7)).toBe("consonants");
      expect(getBookSectionForLesson(15)).toBe("consonants");
      expect(getBookSectionForLesson(24)).toBe("consonants");
    });
  });

  describe("getLessonPageNumbers", () => {
    it("returns empty array for empty or whitespace-only inputs", () => {
      expect(getLessonPageNumbers("")).toEqual([]);
      expect(getLessonPageNumbers("   ")).toEqual([]);
    });

    it("parses single range strings correctly", () => {
      expect(getLessonPageNumbers("4-6")).toEqual([4, 5, 6]);
      expect(getLessonPageNumbers("  10  -  12  ")).toEqual([10, 11, 12]);
    });

    it("parses comma- or semicolon-separated values correctly", () => {
      expect(getLessonPageNumbers("4, 5, 6")).toEqual([4, 5, 6]);
      expect(getLessonPageNumbers("4; 7; 11")).toEqual([4, 7, 11]);
    });

    it("handles a single page number correctly", () => {
      expect(getLessonPageNumbers("12")).toEqual([12]);
    });

    it("filters out invalid/non-numeric characters", () => {
      expect(getLessonPageNumbers("4, abc, 5")).toEqual([4, 5]);
    });
  });

  describe("getCartillaCrmTheme", () => {
    it("returns theme properties for a given lesson number", () => {
      const themeIntro = getCartillaCrmTheme(1);
      expect(themeIntro.lessonNumber).toBe(1);
      expect(themeIntro.section).toBe("intro");
      expect(themeIntro.pagePaper).toBe("#fff8e7");
      expect(themeIntro.titleInk).toBe("#17313b");

      const themeVowel = getCartillaCrmTheme(3);
      expect(themeVowel.lessonNumber).toBe(3);
      expect(themeVowel.section).toBe("vowels");
      expect(themeVowel.accent).toBe("#e63946"); // Specific VOWEL_ACCENTS override for lesson 3
      expect(themeVowel.accentDark).toBeDefined();
      expect(themeVowel.accentSoft).toBeDefined();

      const themeConsonant = getCartillaCrmTheme(8);
      expect(themeConsonant.lessonNumber).toBe(8);
      expect(themeConsonant.section).toBe("consonants");
    });
  });

  describe("getCartillaCrmCssVars", () => {
    it("generates correct CSSProperties with expected keys", () => {
      const cssVars = getCartillaCrmCssVars(3);
      expect(cssVars).toHaveProperty("--cartilla-accent");
      expect(cssVars).toHaveProperty("--cartilla-accent-dark");
      expect(cssVars).toHaveProperty("--cartilla-accent-soft");
      expect(cssVars).toHaveProperty("--cartilla-page-paper");
      expect(cssVars).toHaveProperty("--cartilla-title-ink");
      expect(cssVars).toHaveProperty("--cartilla-bg-radial");
      expect(cssVars).toHaveProperty("--cartilla-student-backdrop");
      expect(cssVars).toHaveProperty("--cartilla-teacher-backdrop");
    });
  });
});
