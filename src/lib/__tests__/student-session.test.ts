/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { getStudentSession, setStudentSession, recordEvent } from "../student-session";
import { getStats } from "../exercise-stats";

const SAMPLE = {
  studentId: "s1",
  studentName: "Sofía",
  studentCode: "SOFIA",
  classId: "c1",
  className: "Clase Demo",
};

beforeEach(() => {
  localStorage.clear();
});

describe("student-session", () => {
  it("returns null when there is no session", () => {
    expect(getStudentSession()).toBeNull();
  });

  it("round-trips a session through set/get", () => {
    setStudentSession(SAMPLE);
    expect(getStudentSession()).toEqual(SAMPLE);
  });

  it("clears the session when set to null", () => {
    setStudentSession(SAMPLE);
    setStudentSession(null);
    expect(getStudentSession()).toBeNull();
  });

  it("returns null for corrupt stored JSON", () => {
    localStorage.setItem("cartilla.student-session.v1", "{not json");
    expect(getStudentSession()).toBeNull();
  });

  describe("recordEvent", () => {
    it("mirrors an exercise result to local stats even with no session (anonymous student)", () => {
      expect(getStudentSession()).toBeNull();
      recordEvent({
        lessonId: "1",
        kind: "exercise",
        score: 4,
        total: 5,
        meta: { exercise: "picture_grid" },
      });
      expect(getStats()["1"]?.picture_grid).toMatchObject({ hits: 4, attempts: 5 });
    });

    it("does not record local stats for non-exercise events, and never throws without a session", () => {
      expect(() => recordEvent({ lessonId: "1", kind: "lesson_completed" })).not.toThrow();
      expect(getStats()).toEqual({});
    });

    it("ignores exercise events with no meta.exercise name", () => {
      recordEvent({ lessonId: "1", kind: "exercise", score: 1, total: 2 });
      expect(getStats()).toEqual({});
    });
  });
});
