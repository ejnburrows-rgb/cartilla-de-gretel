/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { StudentCursor } from "../StudentCursor";
import { STUDENT_CURSOR_CLASS } from "@/lib/student-cursor";
import * as router from "@tanstack/react-router";

vi.mock("@tanstack/react-router", () => ({
  useRouterState: vi.fn(),
}));

describe("StudentCursor", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("adds the student cursor class when the path is a student path", () => {
    vi.mocked(router.useRouterState).mockReturnValue("/cartilla/leccion/1");

    render(<StudentCursor />);

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);
  });

  it("does not add the student cursor class when the path is not a student path", () => {
    vi.mocked(router.useRouterState).mockReturnValue("/cartilla/teacher");

    render(<StudentCursor />);

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });

  it("removes the student cursor class on unmount", () => {
    vi.mocked(router.useRouterState).mockReturnValue("/cartilla/leccion/1");

    const { unmount } = render(<StudentCursor />);
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);

    unmount();
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });

  it("updates the class when the path changes", () => {
    vi.mocked(router.useRouterState).mockReturnValue("/cartilla/leccion/1");
    const { rerender } = render(<StudentCursor />);
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);

    vi.mocked(router.useRouterState).mockReturnValue("/cartilla/teacher");
    rerender(<StudentCursor />);
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });
});
