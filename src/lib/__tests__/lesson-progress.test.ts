/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isLessonCompleted,
  isLessonUnlocked,
  isDemoNavigationEnabled,
  hydrateLessonProgress,
  markLessonCompleted,
  resetProgress,
  markPageActivityCompleted,
  unmarkPageActivityCompleted,
  getCompletedPageActivities,
} from "../lesson-progress";
import { learnerStorageKey } from "../learner-storage";

beforeEach(() => {
  localStorage.clear();
});

describe("lesson-progress", () => {
  it("marks a lesson completed and reads it back", () => {
    expect(isLessonCompleted(3)).toBe(false);
    markLessonCompleted(3);
    expect(isLessonCompleted(3)).toBe(true);
  });

  describe("isLessonUnlocked — sequential unlock", () => {
    it("always unlocks lesson 1", () => {
      expect(isLessonUnlocked(1)).toBe(true);
    });

    it("locks lesson N until N-1 is completed", () => {
      expect(isLessonUnlocked(2)).toBe(false);
      markLessonCompleted(1);
      expect(isLessonUnlocked(2)).toBe(true);
    });

    it("does not unlock N from a non-adjacent completion", () => {
      markLessonCompleted(1); // unlocks 2, not 5
      expect(isLessonUnlocked(5)).toBe(false);
      markLessonCompleted(4);
      expect(isLessonUnlocked(5)).toBe(true);
    });
  });

  describe("hydrateLessonProgress", () => {
    it("replaces local progress with the given completed lessons, filtering invalid entries", () => {
      markLessonCompleted(9); // pre-existing, should be replaced
      hydrateLessonProgress([1, 2, 3, 0, -4, Number.NaN]);
      expect(isLessonCompleted(1)).toBe(true);
      expect(isLessonCompleted(3)).toBe(true);
      expect(isLessonCompleted(9)).toBe(false); // replaced
      expect(isLessonCompleted(0)).toBe(false); // filtered (n > 0)
    });
  });

  it("resetProgress clears everything", () => {
    markLessonCompleted(1);
    markLessonCompleted(2);
    resetProgress();
    expect(isLessonCompleted(1)).toBe(false);
    expect(isLessonUnlocked(2)).toBe(false);
  });

  describe("page activity completion with malformed data", () => {
    it("handles malformed objects gracefully during mark and unmark, while preserving valid data", () => {
      // Seed malformed data for page 23 and valid data for page 24
      localStorage.setItem(
        learnerStorageKey("cartilla.page-completion.v1"),
        JSON.stringify({ "23": {}, "24": ["b"] })
      );

      // markPageActivityCompleted should not throw
      expect(() => markPageActivityCompleted(23, "a")).not.toThrow();
      expect(getCompletedPageActivities(23)).toEqual(["a"]);
      expect(getCompletedPageActivities(24)).toEqual(["b"]); // Preserves valid entries

      // Seed malformed data again to test unmark
      localStorage.setItem(
        learnerStorageKey("cartilla.page-completion.v1"),
        JSON.stringify({ "23": {}, "24": ["b"] })
      );

      // unmarkPageActivityCompleted should not throw
      expect(() => unmarkPageActivityCompleted(23, "a")).not.toThrow();
      expect(getCompletedPageActivities(23)).toEqual([]);
      expect(getCompletedPageActivities(24)).toEqual(["b"]); // Preserves valid entries
    });
  });
});

describe("demonstration navigation", () => {
  it("is off under test mode so sequential progression stays the default contract", () => {
    expect(isDemoNavigationEnabled()).toBe(false);
  });

  it("opens every lesson in demonstration mode without completing any lesson", async () => {
    vi.resetModules();
    vi.stubEnv("MODE", "development");
    vi.stubEnv("VITE_CRM_REVIEW", "false");
    try {
      const mod = await import("../lesson-progress");
      expect(mod.isDemoNavigationEnabled()).toBe(true);
      expect(mod.isLessonUnlocked(24)).toBe(true);
      expect(mod.isLessonCompleted(23)).toBe(false);
      localStorage.setItem("cartilla.demo.skip-lessons", "false");
      expect(mod.isDemoNavigationEnabled()).toBe(false);
      expect(mod.isLessonUnlocked(24)).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
