/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStudentSession, setStudentSession, recordEvent, flushStudentEvents } from "../student-session";
import { getStats } from "../exercise-stats";
import { logProgress } from "@/lib/student.functions";

vi.mock("@/lib/student.functions", () => ({
  logProgress: vi.fn(),
}));

const SAMPLE = {
  studentId: "s1",
  studentName: "Sofía",
  studentCode: "SOFIA",
  classId: "c1",
  className: "Clase Demo",
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("student-session", () => {
  it("catches errors when localStorage.getItem throws", () => {
    const originalGetItem = window.localStorage.getItem;
    window.localStorage.getItem = vi.fn(() => { throw new Error("Quota exceeded"); });
    expect(getStudentSession()).toBeNull();
    window.localStorage.getItem = originalGetItem;
  });

  describe("flushStudentEvents", () => {
    it("handles storage write errors gracefully, keeping events in memory", async () => {
      setStudentSession(SAMPLE);
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = vi.fn((key) => {
        if (key === "cartilla.student-events.v1") {
          throw new Error("Quota exceeded");
        }
        originalSetItem.call(window.localStorage, key, arguments[1]);
      });

      expect(() => recordEvent({
        lessonId: "1",
        kind: "lesson_completed",
      })).not.toThrow();

      window.localStorage.setItem = originalSetItem;
    });

    it("retains events if logProgress throws an error", async () => {
      setStudentSession(SAMPLE);
      vi.mocked(logProgress).mockRejectedValueOnce(new Error("API Error"));

      recordEvent({
        lessonId: "1",
        kind: "lesson_completed",
      });

      await flushStudentEvents();

      const pendingRaw = localStorage.getItem("cartilla.student-events.v1");
      const pending = JSON.parse(pendingRaw || "[]");
      expect(pending.length).toBeGreaterThan(0);
      expect(pending[0].input.lessonId).toBe("1");
    });

    it("removes events from pending queue if logProgress succeeds", async () => {
      setStudentSession(SAMPLE);
      vi.mocked(logProgress).mockResolvedValueOnce({ ok: true });

      recordEvent({
        lessonId: "2",
        kind: "lesson_completed",
      });

      await flushStudentEvents();

      const pendingRaw = localStorage.getItem("cartilla.student-events.v1");
      const pending = JSON.parse(pendingRaw || "[]");
      expect(pending.length).toBe(0);
    });
  });

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
