/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WorkbookLetterTrace } from "../WorkbookLetterTrace";
import { ActivityContext } from "@/lib/activity-events";
import { gretelEvent } from "@/lib/gretel-bus";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: vi.fn(() => () => {}),
  focusGretelActivity: vi.fn(),
  releaseGretelActivity: vi.fn(),
}));
vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

describe("WorkbookLetterTrace interaction and persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("completes tap mode when tapping checkpoints in order and supports reset", () => {
    // Force fine pointer (mouse -> tap mode)
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q === "(pointer: fine)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const onEvent = vi.fn();
    const { container } = render(
      <ActivityContext.Provider
        value={{
          activityId: "test-trace-o",
          isolated: true,
          isCurrent: () => true,
          onEvent,
        }}
      >
        <WorkbookLetterTrace modelText="O" />
      </ActivityContext.Provider>,
    );

    const root = container.querySelector(".fp-trace");
    expect(root?.getAttribute("data-mode")).toBe("tap");
    expect(root?.getAttribute("data-status")).toBe("idle");

    // Tapping wrong dot emits answer:wrong
    const inactiveDots = container.querySelectorAll('.fp-trace__dot:not(.fp-trace__dot--active)');
    expect(inactiveDots.length).toBeGreaterThan(0);
    fireEvent.click(inactiveDots[0]);
    expect(onEvent).toHaveBeenCalledWith("answer:wrong", undefined);

    // Tapping active dots sequentially through the entire letter O (9 points)
    for (let i = 0; i < 9; i++) {
      const active = container.querySelector('.fp-trace__dot--active');
      expect(active).toBeTruthy();
      fireEvent.click(active!);
    }

    // Now completed
    expect(root?.getAttribute("data-status")).toBe("done");
    expect(onEvent).toHaveBeenCalledWith("activity:complete", undefined);

    // Reset button is visible
    const resetBtn = screen.getByRole("button", { name: /Reiniciar el trazo/i });
    expect(resetBtn).toBeTruthy();
    fireEvent.click(resetBtn);

    expect(onEvent).toHaveBeenCalledWith("activity:retry", { reason: "work-cleared" });
    expect(root?.getAttribute("data-status")).toBe("idle");
    expect(screen.queryByRole("button", { name: /Reiniciar el trazo/i })).toBeNull();
  });

  it("handles multi-stroke drag mode without wrong penalty between strokes and allows mid-letter reset", () => {
    // Force coarse pointer (touch -> drag mode)
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q === "(pointer: coarse)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const onEvent = vi.fn();
    const { container } = render(
      <ActivityContext.Provider
        value={{
          activityId: "test-trace-a",
          isolated: true,
          isCurrent: () => true,
          onEvent,
        }}
      >
        <WorkbookLetterTrace modelText="A" />
      </ActivityContext.Provider>,
    );

    const svg = container.querySelector(".fp-trace__svg") as SVGSVGElement;
    expect(svg).toBeTruthy();

    // Mock getBoundingClientRect for SVG: 100x120 viewport mapped to 200x240 box
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 120,
      right: 100,
      bottom: 120,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    // SVG setPointerCapture stub
    (svg as any).setPointerCapture = vi.fn();

    // Stroke 0 of A is: {x: 50, y: 20} -> {x: 35, y: 60} -> {x: 20, y: 100}
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 35, clientY: 60, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 20, clientY: 100, pointerId: 1 });

    // Stroke 0 finished. Pointer moves slightly at the bottom (e.g. clientX: 20, clientY: 105)
    // before pointerUp. It must NOT penalise against stroke 1 (which starts at {80, 100}).
    fireEvent.pointerMove(svg, { clientX: 20, clientY: 105, pointerId: 1 });
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:wrong");

    fireEvent.pointerUp(svg, { pointerId: 1 });

    // Between strokes, reset button MUST be available
    const resetBtn = screen.getByRole("button", { name: /Reiniciar el trazo/i });
    expect(resetBtn).toBeTruthy();

    // Resetting clears progress
    fireEvent.click(resetBtn);
    expect(onEvent).toHaveBeenCalledWith("activity:retry", { reason: "work-cleared" });
    expect(screen.queryByRole("button", { name: /Reiniciar el trazo/i })).toBeNull();
  });

  it("persists and restores mode toggle override across remounts", () => {
    // Default to drag
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q === "(pointer: coarse)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { container, unmount } = render(
      <ActivityContext.Provider
        value={{
          activityId: "test-override",
          isCurrent: () => true,
        }}
      >
        <WorkbookLetterTrace modelText="A" />
      </ActivityContext.Provider>,
    );

    expect(container.querySelector(".fp-trace")?.getAttribute("data-mode")).toBe("drag");

    // Click mode toggle to switch to tap mode
    const toggle = screen.getByRole("button", { name: /Cambiar a modo puntos/i });
    fireEvent.click(toggle);

    expect(container.querySelector(".fp-trace")?.getAttribute("data-mode")).toBe("tap");
    unmount();

    // Remount: mode should be restored as "tap" from localStorage
    const { container: remounted } = render(
      <ActivityContext.Provider
        value={{
          activityId: "test-override",
          isCurrent: () => true,
        }}
      >
        <WorkbookLetterTrace modelText="A" />
      </ActivityContext.Provider>,
    );

    expect(remounted.querySelector(".fp-trace")?.getAttribute("data-mode")).toBe("tap");
  });
});
