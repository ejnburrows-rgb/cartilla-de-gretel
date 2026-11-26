import "@testing-library/jest-dom";
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { StudentCursor } from "../StudentCursor";
import { STUDENT_CURSOR_CLASS } from "@/lib/student-cursor";
import { useRouterState } from "@tanstack/react-router";

vi.mock("@tanstack/react-router", () => ({
  useRouterState: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove(STUDENT_CURSOR_CLASS);
});

describe("StudentCursor", () => {
  it("adds the cursor class to document.documentElement when on a student path", () => {
    vi.mocked(useRouterState).mockImplementation(({ select }: any) =>
      select({ location: { pathname: "/cartilla/lecciones" } })
    );

    render(<StudentCursor />);

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);
  });

  it("does not add the cursor class when on a non-student path", () => {
    vi.mocked(useRouterState).mockImplementation(({ select }: any) =>
      select({ location: { pathname: "/cartilla/teacher" } })
    );

    render(<StudentCursor />);

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });

  it("removes the cursor class on unmount", () => {
    vi.mocked(useRouterState).mockImplementation(({ select }: any) =>
      select({ location: { pathname: "/cartilla/lecciones" } })
    );

    const { unmount } = render(<StudentCursor />);

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);

    unmount();

    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });

  it("toggles the class when the path changes", () => {
    let currentPath = "/cartilla/lecciones";
    vi.mocked(useRouterState).mockImplementation(({ select }: any) =>
      select({ location: { pathname: currentPath } })
    );

    const { rerender } = render(<StudentCursor />);
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(true);

    currentPath = "/cartilla/teacher";
    rerender(<StudentCursor />);
    expect(document.documentElement.classList.contains(STUDENT_CURSOR_CLASS)).toBe(false);
  });
});
