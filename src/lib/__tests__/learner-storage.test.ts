/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { learnerScope } from "../learner-storage";
import * as demoSession from "../demo-student-session";

describe("learnerScope", () => {
  let originalMode: string;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    originalMode = import.meta.env.MODE;
  });

  afterEach(() => {
    // @ts-ignore
    import.meta.env.MODE = originalMode;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns 'anonymous' when window is undefined", () => {
    const originalWindow = globalThis.window;
    vi.stubGlobal("window", undefined);
    expect(learnerScope()).toBe("anonymous");
    vi.stubGlobal("window", originalWindow);
  });

  it("returns demo scope when demo session exists", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue({
      classId: "class 1",
      studentId: "student 1",
      studentName: "Test",
      studentCode: "T1",
      className: "Class Test"
    });
    expect(learnerScope()).toBe("demo:class%201:student%201");
  });

  it("returns 'anonymous' when VITE_CRM_REVIEW is true and MODE is not test", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue(null);
    vi.stubEnv("VITE_CRM_REVIEW", "true");
    // @ts-ignore
    import.meta.env.MODE = "production";

    expect(learnerScope()).toBe("anonymous");
  });

  it("returns student scope when valid session exists in localStorage", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue(null);
    localStorage.setItem("cartilla.student-session.v1", JSON.stringify({
      classId: "class 2",
      studentId: "student 2"
    }));

    expect(learnerScope()).toBe("student:class%202:student%202");
  });

  it("returns 'anonymous' when session in localStorage is missing fields", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue(null);
    localStorage.setItem("cartilla.student-session.v1", JSON.stringify({
      classId: "class 2"
    }));

    expect(learnerScope()).toBe("anonymous");
  });

  it("returns 'anonymous' when localStorage has invalid JSON", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue(null);
    localStorage.setItem("cartilla.student-session.v1", "{invalid-json");

    expect(learnerScope()).toBe("anonymous");
  });

  it("returns 'anonymous' as default fallback", () => {
    vi.spyOn(demoSession, "getDemoStudentSession").mockReturnValue(null);
    expect(learnerScope()).toBe("anonymous");
  });
});
