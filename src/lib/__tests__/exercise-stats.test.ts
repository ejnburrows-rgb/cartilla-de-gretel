// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  recordExerciseStat,
  getStats,
  resetStats,
  isLessonWeak,
  lessonAccuracy,
} from "@/lib/exercise-stats";

describe("exercise-stats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("records a stat and reads it back", () => {
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 4, total: 5, completed: true });
    const stats = getStats();
    expect(stats["3"].build).toMatchObject({ attempts: 5, hits: 4, completedRounds: 1 });
  });

  it("treats repeated snapshots as cumulative maxima, not additive", () => {
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 2, total: 3 });
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 2, total: 5 });
    expect(getStats()["3"].build).toMatchObject({ attempts: 5, hits: 2 });
  });

  it("counts completed rounds only when completed is set", () => {
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 1, total: 1, completed: true });
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 1, total: 1 });
    recordExerciseStat({ lessonId: "3", exercise: "build", score: 1, total: 1, completed: true });
    expect(getStats()["3"].build.completedRounds).toBe(2);
  });

  it("ignores records missing a lessonId or exercise", () => {
    recordExerciseStat({ lessonId: "", exercise: "build", score: 1, total: 1 });
    recordExerciseStat({ lessonId: "3", exercise: "", score: 1, total: 1 });
    expect(getStats()).toEqual({});
  });

  it("flags a lesson as weak below 70% accuracy with enough attempts", () => {
    recordExerciseStat({ lessonId: "9", exercise: "tap", score: 2, total: 5 });
    expect(isLessonWeak("9")).toBe(true);
  });

  it("does not flag a lesson with too few attempts", () => {
    recordExerciseStat({ lessonId: "9", exercise: "tap", score: 0, total: 2 });
    expect(isLessonWeak("9")).toBe(false);
  });

  it("does not flag a strong lesson, or an unknown one", () => {
    recordExerciseStat({ lessonId: "9", exercise: "tap", score: 9, total: 10 });
    expect(isLessonWeak("9")).toBe(false);
    expect(isLessonWeak("does-not-exist")).toBe(false);
  });

  it("computes lesson accuracy across exercises, or null when unknown", () => {
    recordExerciseStat({ lessonId: "9", exercise: "tap", score: 3, total: 4 });
    recordExerciseStat({ lessonId: "9", exercise: "build", score: 1, total: 4 });
    expect(lessonAccuracy("9")).toBeCloseTo(0.5, 5);
    expect(lessonAccuracy("nope")).toBeNull();
  });

  it("clears everything on reset", () => {
    recordExerciseStat({ lessonId: "9", exercise: "tap", score: 1, total: 1 });
    resetStats();
    expect(getStats()).toEqual({});
  });
});
