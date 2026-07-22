/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  isLessonCompleted,
  isLessonUnlocked,
  hydrateLessonProgress,
  markLessonCompleted,
  resetProgress,
} from "../lesson-progress";

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
});
