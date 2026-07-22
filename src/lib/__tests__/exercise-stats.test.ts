/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  recordExerciseStat,
  getStats,
  resetStats,
  isLessonWeak,
  lessonAccuracy,
} from "../exercise-stats";

beforeEach(() => {
  localStorage.clear();
});

describe("exercise-stats", () => {
  describe("recordExerciseStat / getStats", () => {
    it("records an exercise stat and reads it back", () => {
      recordExerciseStat({ lessonId: "1", exercise: "picture_grid", score: 4, total: 5 });
      const stats = getStats();
      expect(stats["1"]?.picture_grid).toMatchObject({ hits: 4, attempts: 5, completedRounds: 0 });
    });

    it("is a no-op when lessonId or exercise is missing", () => {
      recordExerciseStat({ lessonId: "", exercise: "picture_grid", score: 4, total: 5 });
      recordExerciseStat({ lessonId: "1", exercise: "", score: 4, total: 5 });
      expect(getStats()).toEqual({});
    });

    it("keeps the best snapshot (Math.max), so a weaker later round never lowers it", () => {
      recordExerciseStat({ lessonId: "1", exercise: "syllable_match", score: 8, total: 10 });
      recordExerciseStat({ lessonId: "1", exercise: "syllable_match", score: 3, total: 4 });
      const cell = getStats()["1"]?.syllable_match;
      expect(cell?.hits).toBe(8);
      expect(cell?.attempts).toBe(10);
    });

    it("increments completedRounds only when completed is true", () => {
      recordExerciseStat({ lessonId: "1", exercise: "e", score: 1, total: 2, completed: true });
      recordExerciseStat({ lessonId: "1", exercise: "e", score: 1, total: 2 });
      recordExerciseStat({ lessonId: "1", exercise: "e", score: 1, total: 2, completed: true });
      expect(getStats()["1"]?.e.completedRounds).toBe(2);
    });
  });

  describe("isLessonWeak — weak if any exercise has accuracy < 0.7 with >= 3 attempts", () => {
    it("is true when an exercise is below 70% with enough attempts", () => {
      recordExerciseStat({ lessonId: "1", exercise: "picture_grid", score: 2, total: 5 }); // 40%
      expect(isLessonWeak("1")).toBe(true);
    });

    it("is false when accuracy is low but there are fewer than 3 attempts", () => {
      recordExerciseStat({ lessonId: "1", exercise: "picture_grid", score: 0, total: 2 }); // 0% but 2 attempts
      expect(isLessonWeak("1")).toBe(false);
    });

    it("is false when accuracy is at or above 70%", () => {
      recordExerciseStat({ lessonId: "1", exercise: "picture_grid", score: 7, total: 10 }); // exactly 70%
      expect(isLessonWeak("1")).toBe(false);
    });

    it("is false for an unknown lesson", () => {
      expect(isLessonWeak("999")).toBe(false);
    });
  });

  describe("lessonAccuracy — sum of hits over sum of attempts across exercises", () => {
    it("aggregates across multiple exercises in a lesson", () => {
      recordExerciseStat({ lessonId: "1", exercise: "a", score: 3, total: 5 });
      recordExerciseStat({ lessonId: "1", exercise: "b", score: 2, total: 5 });
      expect(lessonAccuracy("1")).toBeCloseTo(0.5, 5); // (3+2)/(5+5)
    });

    it("returns null for an unknown lesson", () => {
      expect(lessonAccuracy("999")).toBeNull();
    });
  });

  describe("resetStats", () => {
    it("clears all recorded stats", () => {
      recordExerciseStat({ lessonId: "1", exercise: "a", score: 3, total: 5 });
      resetStats();
      expect(getStats()).toEqual({});
    });
  });
});
