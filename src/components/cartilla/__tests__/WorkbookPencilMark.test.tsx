/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLOSE_UP_MAX,
  CLOSE_UP_ZOOM_MS,
  ClassicWoodenPencil,
  WORKBOOK_MARK_TIMING,
  WorkbookPencilMark,
} from "../WorkbookPencilMark";

const { drawMs, holdMs, eraseMs } = WORKBOOK_MARK_TIMING;
import { gretelEvent } from "@/lib/gretel-bus";
import { useReducedMotion } from "@/hooks/useReducedMotion";

vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn(() => false) }));

describe("WorkbookPencilMark shared feedback kernel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("keeps the mark neutral for the full semantic hold before success", () => {
    const { container } = render(<WorkbookPencilMark isCorrect itemId="p1-0" />);

    expect(
      document.querySelector(
        ".workbook-pencil-flight[data-mark-status='drawing'] .workbook-pencil",
      ),
    ).toBeTruthy();
    act(() => vi.advanceTimersByTime(drawMs));
    expect(container.querySelector("[data-mark-status='holding']")).toBeTruthy();

    act(() => vi.advanceTimersByTime(holdMs - 1));
    expect(gretelEvent).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(gretelEvent).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "p1-0" });
    expect(container.querySelector("[data-mark-status='correct']")).toBeTruthy();
  });

  it("preserves the neutral hold under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<WorkbookPencilMark isCorrect itemId="p1-0" />);
    expect(document.querySelector(".workbook-pencil")).toBeNull();
    expect(container.querySelector("animate, animateMotion")).toBeNull();

    act(() => vi.advanceTimersByTime(holdMs - 1));
    expect(gretelEvent).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "p1-0" });
  });

  it("emits only completion for the final correct item", () => {
    render(<WorkbookPencilMark isCorrect completeOnSuccess itemId="p1-final" />);

    act(() => vi.advanceTimersByTime(drawMs + holdMs));

    expect(gretelEvent).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("activity:complete", { itemId: "p1-final" });
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct", expect.anything());
  });

  it("emits retry before the eraser removes a wrong mark", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <WorkbookPencilMark isCorrect={false} itemId="p1-wrong" onRetry={onRetry} />,
    );

    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "p1-wrong" });
    expect(container.querySelector("[data-mark-status='erasing']")).toBeTruthy();
    expect(document.querySelector(".workbook-pencil--eraser")).toBeTruthy();
    expect(onRetry).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(eraseMs));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".workbook-pencil-mark-container")).toBeNull();
  });

  it("draws a visible mark that fills the picture cell", () => {
    const { container } = render(<WorkbookPencilMark isCorrect itemId="p1-0" />);
    const root = container.querySelector(".workbook-pencil-mark");
    expect(
      root
        ?.querySelector("svg.workbook-pencil-mark__svg path.workbook-pencil-mark__stroke")
        ?.getAttribute("d"),
    ).toMatch(/^M [\d.-]+ [\d.-]+ C /);
    expect(root?.querySelector("animate[attributeName='stroke-dashoffset']")).toBeTruthy();
    // The pencil flies in its own screen-wide layer (owner 2026-10-08), not inside the page.
    expect(document.querySelector(".workbook-pencil-flight animateMotion")).toBeTruthy();
  });

  it("renders a validated mark statically without replaying the pencil", () => {
    const { container } = render(<WorkbookPencilMark isCorrect status="correct" itemId="p1-0" />);
    expect(
      container.querySelector("[data-mark-status='correct'] path.workbook-pencil-mark__stroke"),
    ).toBeTruthy();
    expect(container.querySelector(".workbook-pencil")).toBeNull();
    expect(container.querySelector("animate")).toBeNull();
  });
  it("moves slowly enough for a child to see the pencil and the eraser (owner 2026-10-05)", () => {
    expect(WORKBOOK_MARK_TIMING.drawMs).toBeGreaterThanOrEqual(2400);
    expect(WORKBOOK_MARK_TIMING.eraseMs).toBeGreaterThanOrEqual(3000);
    render(<WorkbookPencilMark isCorrect={false} itemId="p1-1" />);
    const pencil = document.querySelector(
      ".workbook-pencil-flight .workbook-pencil .workbook-pencil__shape",
    );
    // A classic wooden pencil: lacquered body, cedar cone, graphite point, metal ferrule, eraser.
    for (const part of ["lacq", "wood", "lead", "metal", "eraser"]) {
      expect(pencil?.querySelector(`linearGradient[id$='-${part}']`)).toBeTruthy();
    }
  });

  it("has no HB stamp on the pencil (#720 F03)", () => {
    const { container } = render(<ClassicWoodenPencil />);
    expect(container.querySelector("svg text")).toBeNull();
    expect(container.textContent).not.toContain("HB");
  });

  it("drops few small realistic eraser crumbs (#720 F05)", () => {
    const { container } = render(
      <WorkbookPencilMark isCorrect={false} itemId="p1-crumbs" />,
    );
    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    const crumbs = container.querySelectorAll(".workbook-pencil__crumbs > g");
    expect(crumbs.length).toBeGreaterThanOrEqual(5);
    expect(crumbs.length).toBeLessThanOrEqual(8);
    const ellipses = container.querySelectorAll(".workbook-pencil__crumbs ellipse");
    expect(ellipses.length).toBe(crumbs.length);
    for (const el of ellipses) {
      expect(Number(el.getAttribute("rx"))).toBeLessThanOrEqual(3.1);
    }
  });

  it("uses the gentle close-up zoom (#720 F04)", () => {
    expect(CLOSE_UP_MAX).toBe(1.5);
    expect(CLOSE_UP_ZOOM_MS).toBe(1000);
    // Draw (~2 s) and erase (~3.5 s) timings stay untouched.
    expect(WORKBOOK_MARK_TIMING.drawMs).toBe(2800);
    expect(WORKBOOK_MARK_TIMING.eraseMs).toBe(4000);
  });
});
