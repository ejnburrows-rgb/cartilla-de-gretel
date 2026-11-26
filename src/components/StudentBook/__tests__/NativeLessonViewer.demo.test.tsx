import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NativeLessonViewer } from "../NativeLessonViewer";
import { getCompletedPageActivities, resetProgress } from "@/lib/lesson-progress";
import type { WorkbookPageEntry } from "../SimplePageViewer";
import { LESSON_PAGE_TURN_TOTAL_MS } from "@/lib/living-motion";

const PAGES: WorkbookPageEntry[] = [23, 24, 25].map((pageNumber, i) => ({
  id: `lesson-8-page-${i + 1}`,
  pageNumber,
  gretelLine: `Página ${pageNumber}`,
  content: <div data-testid={`content-${pageNumber}`}>Página {pageNumber}</div>,
}));

const current = () =>
  Number(document.querySelector("[data-native-page]")?.getAttribute("data-native-page"));
const finishTurn = () => act(() => vi.advanceTimersByTime(LESSON_PAGE_TURN_TOTAL_MS + 200));

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

describe("NativeLessonViewer demonstration mode", () => {
  it("turns forward and backward over unfinished pages without marking them complete", () => {
    const onDemoSkip = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES}
        chapterLabel="Lección 8"
        lessonNumber={8}
        demoUnlocked
        onDemoSkip={onDemoSkip}
      />,
    );
    const viewer = document.querySelector(".native-lesson-viewer")!;
    expect(viewer.getAttribute("data-page-complete")).toBe("false");
    expect(screen.getByTestId("corner-next").getAttribute("data-locked")).toBeNull();
    expect(screen.getByTestId("button-next").getAttribute("aria-disabled")).toBeNull();

    fireEvent.click(screen.getByTestId("button-next"));
    finishTurn();
    expect(current()).toBe(24);
    expect(onDemoSkip).toHaveBeenCalledTimes(1);
    expect(getCompletedPageActivities(23)).toEqual([]);
    expect(
      document.querySelector(".native-lesson-viewer")!.getAttribute("data-page-complete"),
    ).toBe("false");

    fireEvent.click(screen.getByTestId("button-prev"));
    finishTurn();
    expect(current()).toBe(23);
    expect(onDemoSkip).toHaveBeenCalledTimes(1);
  });

  it("reports a demonstration skip when finishing from an unfinished last page", () => {
    const onDemoSkip = vi.fn();
    const onFinish = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES.slice(0, 1)}
        chapterLabel="Lección 8"
        lessonNumber={8}
        demoUnlocked
        onDemoSkip={onDemoSkip}
        onFinish={onFinish}
      />,
    );
    fireEvent.click(screen.getByTestId("button-next"));
    expect(onDemoSkip).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("keeps normal gating when demonstration mode is off", () => {
    const onDemoSkip = vi.fn();
    render(
      <NativeLessonViewer
        pages={PAGES}
        chapterLabel="Lección 8"
        lessonNumber={8}
        onDemoSkip={onDemoSkip}
      />,
    );
    expect(screen.getByTestId("corner-next").getAttribute("data-locked")).toBe("true");
    fireEvent.click(screen.getByTestId("button-next"));
    finishTurn();
    expect(current()).toBe(23);
    expect(onDemoSkip).not.toHaveBeenCalled();
  });
});
