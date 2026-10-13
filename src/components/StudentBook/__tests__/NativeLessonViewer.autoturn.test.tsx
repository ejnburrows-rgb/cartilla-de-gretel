import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { AUTO_TURN_IDLE_MS, NativeLessonViewer } from "../NativeLessonViewer";
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

function completePage(pageNumber: number) {
  for (const a of requiredActivitiesForPage(pageNumber)) {
    act(() => {
      focusGretelActivity({ activityId: a.id });
      gretelEvent("activity:complete");
    });
  }
}

const current = () =>
  Number(document.querySelector("[data-native-page]")?.getAttribute("data-native-page"));
const viewer = () => document.querySelector<HTMLElement>(".native-lesson-viewer")!;
const finishTurn = () => act(() => vi.advanceTimersByTime(2500));

function swipe(target: Element, dx: number, dy = 0) {
  fireEvent.pointerDown(target, { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: 300, clientY: 400 });
  fireEvent.pointerUp(target, { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: 300 + dx, clientY: 400 + dy });
}

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

describe("NativeLessonViewer auto page turn and swipe (owner decision 2026-10-12)", () => {
  it("turns the page by itself after the page is finished and the child stops touching it", () => {
    const onPageChange = vi.fn();
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} onPageChange={onPageChange} autoTurn />);
    expect(current()).toBe(23);
    completePage(23);
    act(() => vi.advanceTimersByTime(AUTO_TURN_IDLE_MS - 200));
    // Still touching the page restarts the quiet time.
    fireEvent.pointerDown(viewer());
    act(() => vi.advanceTimersByTime(AUTO_TURN_IDLE_MS - 200));
    expect(current()).toBe(23);
    act(() => vi.advanceTimersByTime(400));
    finishTurn();
    expect(current()).toBe(24);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("never turns an unfinished page and is off unless asked for", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} />);
    completePage(23);
    act(() => vi.advanceTimersByTime(AUTO_TURN_IDLE_MS * 3));
    expect(current()).toBe(23);
    cleanup();
    resetProgress();
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} autoTurn />);
    act(() => vi.advanceTimersByTime(AUTO_TURN_IDLE_MS * 3));
    expect(current()).toBe(23);
  });

  it("swipe left turns forward only when finished; swipe right goes back", () => {
    render(<NativeLessonViewer pages={PAGES} chapterLabel="Lección 8" lessonNumber={8} swipe />);
    const page = document.querySelector('[data-testid="content-23"]')!;
    swipe(page, -160);
    finishTurn();
    expect(current()).toBe(23);
    completePage(23);
    swipe(page, 30); // too short: not a swipe
    swipe(page, -160, 140); // mostly vertical: not a swipe
    finishTurn();
    expect(current()).toBe(23);
    swipe(page, -160);
    finishTurn();
    expect(current()).toBe(24);
    swipe(document.querySelector('[data-testid="content-24"]')!, 160);
    finishTurn();
    expect(current()).toBe(23);
  });
});
