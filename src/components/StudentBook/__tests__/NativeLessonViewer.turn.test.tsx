/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { NativeLessonViewer } from "../NativeLessonViewer";
import type { WorkbookPageEntry } from "../SimplePageViewer";
import { markLessonCompleted } from "@/lib/lesson-progress";

const PAGES: WorkbookPageEntry[] = [
  { id: "page-1", pageNumber: 1, gretelLine: "Página 1", content: <div data-testid="p1">Página 1 Content</div> },
  { id: "page-2", pageNumber: 2, gretelLine: "Página 2", content: <div data-testid="p2">Página 2 Content</div> },
  { id: "page-3", pageNumber: 3, gretelLine: "Página 3", content: <div data-testid="p3">Página 3 Content</div> },
];

beforeEach(() => {
  cleanup();
  vi.useFakeTimers();
  window.scrollTo = vi.fn() as never;
  markLessonCompleted(1);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("NativeLessonViewer physical page turn transition system", () => {
  it("prevents double-navigation while a turn transition is active", () => {
    const onPageChange = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES}
        chapterLabel="Lección 1"
        lessonNumber={1}
        initialPage={0}
        onPageChange={onPageChange}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /Siguiente/i });
    expect(screen.getByTestId("p1")).toBeTruthy();

    // First click initiates turn
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    // Rapid second click during active turn transition is ignored
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledTimes(1);

    // Complete the turn animation
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("p2")).toBeTruthy();
  });

  it("handles reverse navigation with state persistence callback before turn", () => {
    const onPageChange = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES}
        chapterLabel="Lección 1"
        lessonNumber={1}
        initialPage={1}
        onPageChange={onPageChange}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /Anterior/i });
    expect(screen.getByTestId("p2")).toBeTruthy();

    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("p1")).toBeTruthy();
  });
});
