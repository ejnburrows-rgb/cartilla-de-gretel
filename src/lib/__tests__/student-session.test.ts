/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStudentSession,
  setStudentSession,
  recordEvent,
  type StudentSession,
} from "../student-session";
import { getStats } from "../exercise-stats";

vi.mock("../secure-student-access", async () => {
  const actual = await vi.importActual<typeof import("../secure-student-access")>(
    "../secure-student-access",
  );
  return { ...actual, logProgressWithSession: vi.fn() };
});

function futureSession(overrides: Partial<StudentSession> = {}): StudentSession {
  return {
    studentId: "s1",
    studentName: "Sofía",
    classId: "c1",
    className: "Clase Demo",
    sessionToken: "s".repeat(64),
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("student-session", () => {
  it("returns null when there is no session", () => {
    expect(getStudentSession()).toBeNull();
  });

  it("round-trips an active session through set/get", () => {
    const sample = futureSession();
    setStudentSession(sample);
    expect(getStudentSession()).toEqual(sample);
  });

  it("clears the session when set to null", () => {
    setStudentSession(futureSession());
    setStudentSession(null);
    expect(getStudentSession()).toBeNull();
  });

  it("returns null for corrupt stored JSON", () => {
    localStorage.setItem("cartilla.student-session.v1", "{not json");
    expect(getStudentSession()).toBeNull();
  });

  it("treats an expired session as no session and clears storage", () => {
    const expired = futureSession({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    setStudentSession(expired);
    expect(getStudentSession()).toBeNull();
    expect(localStorage.getItem("cartilla.student-session.v1")).toBeNull();
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
