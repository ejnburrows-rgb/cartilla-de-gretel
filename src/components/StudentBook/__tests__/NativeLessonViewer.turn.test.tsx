import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NativeLessonViewer } from "../NativeLessonViewer";
import { focusGretelActivity, gretelEvent } from "@/lib/gretel-bus";
import { requiredActivitiesForPage } from "@/lib/page-completion";
import { resetProgress } from "@/lib/lesson-progress";
import type { WorkbookPageEntry } from "../SimplePageViewer";

const PAGES: WorkbookPageEntry[] = [23, 24, 25].map((pageNumber, i) => ({
  id: `lesson-8-page-${i + 1}`,
  pageNumber,
  gretelLine: `Página ${pageNumber}`,
  content: <div data-testid={`content-${pageNumber}`}>Página {pageNumber}</div>,
}));

function complete(activityId: string) {
  act(() => {
    focusGretelActivity({ activityId });
    gretelEvent("activity:complete");
  });
}

function completePage(pageNumber: number) {
  for (const a of requiredActivitiesForPage(pageNumber)) complete(a.id);
}

const current = () =>
  Number(document.querySelector("[data-native-page]")?.getAttribute("data-native-page"));

beforeEach(() => {
  vi.useFakeTimers();
  window.scrollTo = vi.fn() as never;
  localStorage.clear();
  resetProgress();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("NativeLessonViewer real-paper page turn contracts", () => {
  it("corner forward turn is blocked while incomplete and allowed after completion", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    expect(current()).toBe(23);

    const cornerNext = screen.getByTestId("corner-next");
    expect(cornerNext.getAttribute("data-locked")).toBe("true");

    // Click corner-next when incomplete
    fireEvent.click(cornerNext);
    expect(current()).toBe(23);
    expect(screen.getByRole("status").textContent).toMatch(/termina/i);

    // Complete page 23
    completePage(23);
    expect(cornerNext.getAttribute("data-locked")).toBeNull();

    // Click corner-next when complete
    fireEvent.click(cornerNext);
    expect(current()).toBe(24);
  });

  it("back turn is always allowed via corner or button even when current page is incomplete", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);

    // Go to page 24
    fireEvent.click(screen.getByTestId("corner-next"));
    expect(current()).toBe(24);

    // Page 24 is incomplete
    const cornerPrev = screen.getByTestId("corner-prev");
    expect(cornerPrev).toBeDefined();

    // Corner back works immediately
    fireEvent.click(cornerPrev);
    expect(current()).toBe(23);
  });

  it("keyboard ArrowRight advances when complete / shows hint when incomplete; ArrowLeft goes back", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    expect(current()).toBe(23);

    // ArrowRight on incomplete page
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(current()).toBe(23);
    expect(screen.getByRole("status").textContent).toMatch(/termina/i);

    // Complete page 23
    completePage(23);

    // ArrowRight on complete page
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(current()).toBe(24);

    // ArrowLeft goes back
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(current()).toBe(23);
  });

  it("corner drag physics completes turn if dragged past halfway and springs back if under halfway", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);

    const cornerNext = screen.getByTestId("corner-next");

    // Mock getBoundingClientRect
    const stage = document.querySelector(".native-lesson-viewer");
    if (stage) {
      stage.getBoundingClientRect = () =>
        ({ width: 600, left: 0, top: 0, right: 600, bottom: 800, height: 800, x: 0, y: 0, toJSON: () => {} });
    }

    // Drag 1: less than halfway (drag 100px left on a 600px stage = ~20%)
    fireEvent.pointerDown(cornerNext, { clientX: 500, clientY: 700 });
    fireEvent.pointerMove(cornerNext, { clientX: 400, clientY: 700 });
    fireEvent.pointerUp(cornerNext, { clientX: 400, clientY: 700 });

    // Springs back: stays on page 23
    expect(current()).toBe(23);

    // Drag 2: past halfway (drag 400px left on 600px stage = ~76%)
    fireEvent.pointerDown(cornerNext, { clientX: 500, clientY: 700 });
    fireEvent.pointerMove(cornerNext, { clientX: 100, clientY: 700 });
    fireEvent.pointerUp(cornerNext, { clientX: 100, clientY: 700 });

    // Advance timers for curling completion
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(current()).toBe(24);
  });

  it("cancelling a long corner drag never turns the page, even if a click follows", () => {
    const onPageChange = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES}
        chapterLabel="Lección 8"
        lessonNumber={8}
        onPageChange={onPageChange}
      />,
    );
    completePage(23);
    const viewer = document.querySelector(".native-lesson-viewer")!;
    vi.spyOn(viewer, "getBoundingClientRect").mockReturnValue({
      width: 600, height: 800, left: 0, top: 0, right: 600, bottom: 800,
      x: 0, y: 0, toJSON: () => {},
    });
    const next = screen.getByTestId("corner-next");
    fireEvent.pointerDown(next, { pointerId: 1, clientX: 500, clientY: 700 });
    fireEvent.pointerMove(next, { pointerId: 1, clientX: 100, clientY: 700 });
    fireEvent.pointerCancel(next, { pointerId: 1, clientX: 100, clientY: 700 });
    fireEvent.click(next);
    act(() => vi.advanceTimersByTime(3000));
    expect(current()).toBe(23);
    expect(onPageChange).not.toHaveBeenCalled();
    expect(viewer.getAttribute("data-turn-phase")).toBe("idle");
    expect(document.querySelector(".native-page-underside")).toBeNull();

    // A fresh intentional tap still advances after cancellation.
    fireEvent.click(next);
    act(() => vi.advanceTimersByTime(3000));
    expect(current()).toBe(24);
    expect(onPageChange).toHaveBeenCalledTimes(1);

    // Cancellation must also protect backward turns from an incomplete page.
    const prev = screen.getByTestId("corner-prev");
    fireEvent.pointerDown(prev, { pointerId: 2, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(prev, { pointerId: 2, clientX: 500, clientY: 700 });
    fireEvent.pointerCancel(prev, { pointerId: 2, clientX: 500, clientY: 700 });
    fireEvent.click(prev);
    act(() => vi.advanceTimersByTime(3000));
    expect(current()).toBe(24);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it("reduced-motion corner dragging has no 3D layer and commits without a timed animation", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);
    const viewer = document.querySelector(".native-lesson-viewer")!;
    vi.spyOn(viewer, "getBoundingClientRect").mockReturnValue({
      width: 600, height: 800, left: 0, top: 0, right: 600, bottom: 800,
      x: 0, y: 0, toJSON: () => {},
    });
    const next = screen.getByTestId("corner-next");
    fireEvent.pointerDown(next, { pointerId: 1, clientX: 500, clientY: 700 });
    fireEvent.pointerMove(next, { pointerId: 1, clientX: 100, clientY: 700 });
    expect(viewer.getAttribute("data-turn-phase")).toBe("idle");
    expect(document.querySelector(".native-page-underside")).toBeNull();
    expect(document.querySelector(".native-page-shadow")).toBeNull();

    fireEvent.pointerUp(next, { pointerId: 1, clientX: 100, clientY: 700 });
    expect(current()).toBe(24);
    expect(viewer.getAttribute("data-turn-phase")).toBe("idle");
    fireEvent.click(next); // no duplicate turn after release
    expect(current()).toBe(24);

    const prev = screen.getByTestId("corner-prev");
    fireEvent.pointerDown(prev, { pointerId: 2, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(prev, { pointerId: 2, clientX: 150, clientY: 700 });
    expect(document.querySelector(".native-page-underside")).toBeNull();
    fireEvent.pointerUp(prev, { pointerId: 2, clientX: 150, clientY: 700 });
    expect(current()).toBe(24); // below 50% must spring back
  });

  it("respects prefers-reduced-motion for immediate non-3D transition", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);

    fireEvent.click(screen.getByTestId("button-next"));
    // Immediate transition
    expect(current()).toBe(24);
  });
});
