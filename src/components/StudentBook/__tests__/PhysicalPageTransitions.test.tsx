import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CurlPageViewer } from "../CurlPageViewer";
import { FlipchartHdPanel } from "@/components/cartilla/FlipchartHdPanel";
import { STUDENT_PAGE_TURN_MS, FLIPCHART_FLIP_MS } from "@/lib/living-motion";

// Mock react-pageflip as a simple container for DOM testing
vi.mock("react-pageflip", () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-flipbook">{children}</div>
    ),
  };
});

// Polyfill ResizeObserver for JSDOM test environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe("Physical Page Transition System", () => {
  it("enforces target timing bounds for Workbook (~0.75-0.85s) and Flip Chart (~0.9-1.05s)", () => {
    expect(STUDENT_PAGE_TURN_MS).toBeGreaterThanOrEqual(750);
    expect(STUDENT_PAGE_TURN_MS).toBeLessThanOrEqual(850);
    expect(FLIPCHART_FLIP_MS).toBeGreaterThanOrEqual(900);
    expect(FLIPCHART_FLIP_MS).toBeLessThanOrEqual(1050);
  });

  it("locks navigation and saves state on Workbook forward/reverse turns", () => {
    const onPageChange = vi.fn();
    const mockPages = [
      { id: "p1", pageNumber: 1, content: <div>Page 1</div> },
      { id: "p2", pageNumber: 2, content: <div>Page 2</div> },
      { id: "p3", pageNumber: 3, content: <div>Page 3</div> },
    ];

    render(
      <CurlPageViewer
        pages={mockPages}
        initialPage={0}
        onPageChange={onPageChange}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: /Siguiente/i });
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // First tap
    fireEvent.click(nextBtn);

    // State change saved before turn starts
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    // Button should now be disabled during turn
    expect(nextBtn.hasAttribute("disabled")).toBe(true);

    // Rapid second tap during turn must be ignored
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it("locks Flipchart navigation during active vertical turn and ignores rapid taps", async () => {
    vi.useFakeTimers();

    render(<FlipchartHdPanel lessonNumber={7} />);

    // Allow mount effects to settle
    act(() => {
      vi.advanceTimersByTime(50);
    });

    const nextBtn = screen.getByRole("button", { name: /Siguiente/i });
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // First click triggers flip
    act(() => {
      fireEvent.click(nextBtn);
    });

    expect(screen.queryByTestId("vertical-flip-layer")).not.toBeNull();
    expect(nextBtn.hasAttribute("disabled")).toBe(true);

    // Rapid double click during flip
    act(() => {
      fireEvent.click(nextBtn);
    });

    // Advance time past transition
    act(() => {
      vi.advanceTimersByTime(FLIPCHART_FLIP_MS + 50);
    });

    // Settles on sheet 2 (index 1), not skipping ahead to sheet 3
    const counter = screen.getByTestId("flipchart-counter");
    expect(counter.textContent).toContain("Hoja 2");

    vi.useRealTimers();
  });
});
