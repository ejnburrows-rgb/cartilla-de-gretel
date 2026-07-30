import { describe, it, expect } from "vitest";
import {
  TEACHER_NOTES_MAX_LENGTH,
  validateProgressMeta,
  validateTeacherNotes,
} from "../student-progress-meta";

describe("validateProgressMeta", () => {
  it("accepts the explicit allowlisted fields", () => {
    expect(
      validateProgressMeta({
        exercise: "picture_grid_p1",
        page: 4,
        attempt: 2,
        inputMode: "touch",
        durationMs: 1200,
        completed: true,
      }),
    ).toEqual({
      exercise: "picture_grid_p1",
      page: 4,
      attempt: 2,
      inputMode: "touch",
      durationMs: 1200,
      completed: true,
    });
  });

  it("returns null for empty metadata", () => {
    expect(validateProgressMeta(null)).toBeNull();
    expect(validateProgressMeta(undefined)).toBeNull();
    expect(validateProgressMeta({})).toBeNull();
  });

  it("rejects unknown fields rather than dropping them silently", () => {
    expect(() => validateProgressMeta({ notes: "free text about a child" })).toThrow(
      /Unknown progress metadata/,
    );
  });

  it("rejects wrong types on known fields", () => {
    expect(() => validateProgressMeta({ attempt: "many" })).toThrow();
    expect(() => validateProgressMeta({ inputMode: "telepathy" })).toThrow();
    expect(() => validateProgressMeta({ completed: "yes" })).toThrow();
  });

  it("rejects arrays and non-objects", () => {
    expect(() => validateProgressMeta([1, 2, 3])).toThrow();
    expect(() => validateProgressMeta("meta")).toThrow();
  });
});

describe("validateTeacherNotes", () => {
  it("trims and keeps a short note", () => {
    expect(validateTeacherNotes("  Necesita repasar la m.  ")).toBe("Necesita repasar la m.");
  });

  it("treats an empty note as no note", () => {
    expect(validateTeacherNotes("   ")).toBeNull();
    expect(validateTeacherNotes(null)).toBeNull();
  });

  it("rejects a note past the limit", () => {
    expect(() => validateTeacherNotes("a".repeat(TEACHER_NOTES_MAX_LENGTH + 1))).toThrow();
  });
});
