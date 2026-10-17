/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  recordExerciseStat,
  getStats,
  resetStats,
  isLessonWeak,
  lessonAccuracy,
  useExerciseStats,
} from "../exercise-stats";

beforeEach(() => {
  localStorage.clear();
});

describe("exercise-stats", () => {
  describe("learner isolation", () => {
    it("isolates stats between two learners A and B, falling back to bare key for anonymous", () => {
      // 1) Setup Learner A
      localStorage.setItem(
        "cartilla.student-session.v1",
        JSON.stringify({ classId: "class-X", studentId: "learner-A" }),
      );
      recordExerciseStat({ lessonId: "test-lesson", exercise: "a-exercise", score: 2, total: 5 });

      const statsA = getStats();
      expect(statsA["test-lesson"]?.["a-exercise"].hits).toBe(2);

      // 2) Switch to Learner B
      localStorage.setItem(
        "cartilla.student-session.v1",
        JSON.stringify({ classId: "class-X", studentId: "learner-B" }),
      );
      const statsB = getStats();
      expect(statsB).toEqual({}); // None of A's results should be here

      // 3) Switch back to Learner A
      localStorage.setItem(
        "cartilla.student-session.v1",
        JSON.stringify({ classId: "class-X", studentId: "learner-A" }),
      );
      const statsARecovered = getStats();
      expect(statsARecovered["test-lesson"]?.["a-exercise"].hits).toBe(2); // A's results recovered

      // 4) Check anonymous scope behavior
      localStorage.removeItem("cartilla.student-session.v1");
      recordExerciseStat({
        lessonId: "anon-lesson",
        exercise: "anon-exercise",
        score: 1,
        total: 1,
      });
      const statsAnon = getStats();
      expect(statsAnon["anon-lesson"]?.["anon-exercise"].hits).toBe(1);
      // The bare key should have been used
      const rawBare = JSON.parse(localStorage.getItem("cartilla.exercise-stats.v1") || "{}");
      expect(rawBare["anon-lesson"]?.["anon-exercise"].hits).toBe(1);
    });
  });

  describe("useExerciseStats session changes", () => {
    it("refreshes the mounted Modo Repaso stats when the active learner changes", () => {
      const sessionKey = "cartilla.student-session.v1";
      const session = (studentId: string) => JSON.stringify({ classId: "class-X", studentId });

      localStorage.setItem(sessionKey, session("learner-A"));
      recordExerciseStat({ lessonId: "7", exercise: "picture_grid", score: 1, total: 5 });

      const { result } = renderHook(() => useExerciseStats());
      expect(result.current["7"]?.picture_grid.hits).toBe(1);

      // Switching students in the same tab sends the session event, not a
      // browser storage event. The mounted Repaso screen must clear A's data.
      act(() => {
        localStorage.setItem(sessionKey, session("learner-B"));
        window.dispatchEvent(new Event("cartilla:student-session"));
      });
      expect(result.current).toEqual({});

      act(() => {
        localStorage.setItem(sessionKey, session("learner-A"));
        window.dispatchEvent(new Event("cartilla:student-session"));
      });
      expect(result.current["7"]?.picture_grid.hits).toBe(1);
    });
  });

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

    it("keeps one coherent latest snapshot instead of mixing best scores", () => {
      recordExerciseStat({ lessonId: "1", exercise: "syllable_match", score: 8, total: 10 });
      recordExerciseStat({ lessonId: "1", exercise: "syllable_match", score: 3, total: 4 });
      const cell = getStats()["1"]?.syllable_match;
      expect(cell?.hits).toBe(3);
      expect(cell?.attempts).toBe(4);
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

  describe("corruption recovery", () => {
    it("recovers gracefully if storage contains literal 'null'", () => {
      localStorage.setItem("cartilla.exercise-stats.v1", "null");
      expect(() => {
        recordExerciseStat({ lessonId: "1", exercise: "a", score: 3, total: 5 });
      }).not.toThrow();
      const stats = getStats();
      expect(stats["1"]?.a).toMatchObject({ hits: 3, attempts: 5 });
    });

    it("recovers gracefully if storage contains a primitive like '5'", () => {
      localStorage.setItem("cartilla.exercise-stats.v1", "5");
      expect(() => {
        recordExerciseStat({ lessonId: "2", exercise: "b", score: 2, total: 2 });
      }).not.toThrow();
      const stats = getStats();
      expect(stats["2"]?.b).toMatchObject({ hits: 2, attempts: 2 });
    });

    it("recovers gracefully if storage contains an array", () => {
      localStorage.setItem("cartilla.exercise-stats.v1", '["some", "data"]');
      expect(() => {
        recordExerciseStat({ lessonId: "3", exercise: "c", score: 1, total: 3 });
      }).not.toThrow();
      const stats = getStats();
      expect(stats["3"]?.c).toMatchObject({ hits: 1, attempts: 3 });
    });
  });
});
