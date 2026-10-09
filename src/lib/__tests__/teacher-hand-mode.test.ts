import { describe, it, expect, beforeEach } from "vitest";
import { getTeacherHandMode, setTeacherHandMode } from "../teacher-hand-mode";

describe("teacher-hand-mode persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to left-hand mode", () => {
    expect(getTeacherHandMode()).toBe("left");
  });

  it("persists right-hand mode in localStorage", () => {
    setTeacherHandMode("right");
    expect(getTeacherHandMode()).toBe("right");
    expect(localStorage.getItem("cartilla:teacher:hand-mode")).toBe("right");
  });

  it("can switch back to left-hand mode", () => {
    setTeacherHandMode("right");
    setTeacherHandMode("left");
    expect(getTeacherHandMode()).toBe("left");
    expect(localStorage.getItem("cartilla:teacher:hand-mode")).toBe("left");
  });
});
