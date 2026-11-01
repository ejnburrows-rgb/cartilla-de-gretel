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

    expect(container.querySelector(".workbook-pencil-mark__stroke")).toBeTruthy();
    expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
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
    expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
  });

  it("renders a validated mark statically without replaying the pencil", () => {
    const { container } = render(<WorkbookPencilMark isCorrect status="correct" itemId="p1-0" />);
    expect(
      container.querySelector("[data-mark-status='correct'] path.workbook-pencil-mark__stroke"),
    ).toBeTruthy();
    expect(container.querySelector(".workbook-pencil")).toBeNull();
    expect(container.querySelector("animate")).toBeNull();
  });
  it("keeps the mark and eraser wipe visible long enough for a child (owner 2026-10-05)", () => {
    expect(WORKBOOK_MARK_TIMING.drawMs).toBeGreaterThanOrEqual(2400);
    expect(WORKBOOK_MARK_TIMING.eraseMs).toBeGreaterThanOrEqual(3000);
    render(<WorkbookPencilMark isCorrect={false} itemId="p1-1" />);
    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    expect(document.querySelector(".workbook-pencil-flight .workbook-pencil__eraser-only")).toBeTruthy();
    expect(document.querySelector(".workbook-pencil-flight .workbook-pencil__shape")).toBeNull();
  });


  it("draws an X without spawning an autonomous pencil actor", () => {
    const { container } = render(<WorkbookPencilMark markType="x" isCorrect itemId="p0-one-x" />);
    expect(container.querySelectorAll(".workbook-pencil-mark__svg .workbook-pencil-mark__stroke")).toHaveLength(2);
    expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
  });

  it("draws circles without an autonomous actor and keeps restored marks static", () => {
    const { unmount } = render(<WorkbookPencilMark markType="circle" isCorrect itemId="p0-one-circle" />);
    expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
    unmount();
    render(<WorkbookPencilMark markType="x" status="correct" itemId="p0-restored" />);
    expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(0);
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

  it("keeps answer focus within the accepted 1.02× in-place lift", () => {
    expect(CLOSE_UP_MAX).toBe(1.02);
    expect(CLOSE_UP_ZOOM_MS).toBe(1000);
    // Draw (~2 s) and erase (~3.5 s) timings stay untouched.
    expect(WORKBOOK_MARK_TIMING.drawMs).toBe(2800);
    expect(WORKBOOK_MARK_TIMING.eraseMs).toBe(4000);
  });
  it("never creates an autonomous pencil during an X mark", () => {
    const { container } = render(<WorkbookPencilMark markType="x" isCorrect itemId="x-overlap" />);
    expect(container.querySelectorAll(".workbook-pencil-mark__stroke")).toHaveLength(2);
    expect(document.querySelector(".workbook-pencil-flight")).toBeNull();
  });

  it("queues independent marks without grading or drawing the waiting answer early", () => {
    const first = vi.fn();
    const second = vi.fn();
    render(<>
      <WorkbookPencilMark markType="x" isCorrect itemId="first" onSuccess={first} />
      <WorkbookPencilMark isCorrect={false} itemId="second" onRetry={second} />
    </>);
    expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(0);
    expect(document.querySelectorAll("[data-pencil-waiting='true']")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    expect(first).toHaveBeenCalledTimes(1);
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:wrong", expect.anything());
    expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(0);
    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "second" });
    expect(document.querySelectorAll(".workbook-pencil__shape")).toHaveLength(0);
    act(() => vi.advanceTimersByTime(eraseMs));
    expect(second).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll(".workbook-pencil-flight")).toHaveLength(0);
    expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
  });

  it("releases pencil ownership and restores the cursor on cancellation", () => {
    const result = render(<WorkbookPencilMark isCorrect itemId="cancelled" />);
    expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(true);
    result.unmount();
    expect(document.documentElement.hasAttribute("data-workbook-pencil-active")).toBe(false);
    render(<WorkbookPencilMark isCorrect itemId="next" />);
    expect(document.querySelectorAll(".workbook-pencil-flight .workbook-pencil__shape")).toHaveLength(0);
    act(() => vi.advanceTimersByTime(drawMs + holdMs));
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", { itemId: "next" });
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct", { itemId: "cancelled" });
  });

});
