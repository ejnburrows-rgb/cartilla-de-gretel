/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORKBOOK_MARK_TIMING, WorkbookPencilMark } from "../WorkbookPencilMark";

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

    expect(container.querySelector("[data-mark-status='drawing'] .workbook-pencil")).toBeTruthy();
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
    expect(container.querySelector(".workbook-pencil")).toBeNull();
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
    expect(container.querySelector(".workbook-pencil--eraser")).toBeTruthy();
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
    expect(root?.querySelector("animateMotion")).toBeTruthy();
  });

  it("renders a validated mark statically without replaying the pencil", () => {
    const { container } = render(<WorkbookPencilMark isCorrect status="correct" itemId="p1-0" />);
    expect(
      container.querySelector("[data-mark-status='correct'] path.workbook-pencil-mark__stroke"),
    ).toBeTruthy();
    expect(container.querySelector(".workbook-pencil")).toBeNull();
    expect(container.querySelector("animate")).toBeNull();
  });
});
