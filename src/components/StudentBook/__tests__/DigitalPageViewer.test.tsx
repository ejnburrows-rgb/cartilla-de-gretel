/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DigitalPageViewer } from "../DigitalPageViewer";
import type { WorkbookPageEntry } from "../SimplePageViewer";
import * as gretelBus from "@/lib/gretel-bus";

// Mock gretelEvent
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

const mockPages: WorkbookPageEntry[] = [
  {
    id: "page-1",
    pageNumber: 1,
    content: <div data-testid="page-1-content">Content 1</div>,
    gretelLine: "Line 1",
  },
  {
    id: "page-2",
    pageNumber: 2,
    content: <div data-testid="page-2-content">Content 2</div>,
    gretelLine: "Line 2",
  },
  {
    id: "page-3",
    pageNumber: 3,
    content: <div data-testid="page-3-content">Content 3</div>,
  },
];

describe("DigitalPageViewer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the first page initially", () => {
    render(<DigitalPageViewer pages={mockPages} />);
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
    expect(screen.queryByTestId("page-2-content")).not.toBeInTheDocument();
  });

  it("can navigate to next and previous pages using buttons", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    const nextButton = screen.getByRole("button", { name: "Página siguiente" });
    const prevButton = screen.getByRole("button", { name: "Página anterior" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(screen.getByTestId("page-2-content")).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(screen.getByTestId("page-3-content")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.click(prevButton);
    expect(screen.getByTestId("page-2-content")).toBeInTheDocument();
  });

  it("can navigate using keyboard arrows", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("page-2-content")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
  });

  it("ignores keyboard navigation if modifier keys are pressed", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    fireEvent.keyDown(window, { key: "ArrowRight", altKey: true });
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true });
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowRight", metaKey: true });
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
  });

  it("ignores keyboard navigation if inside an input", () => {
    render(
      <div>
        <input data-testid="input" />
        <DigitalPageViewer pages={mockPages} />
      </div>,
    );

    const input = screen.getByTestId("input");
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
  });

  it("can navigate using the page list navigator", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    const navToggle = screen.getByRole("button", { name: /páginas/i });
    fireEvent.click(navToggle);

    const page2Button = screen.getByRole("button", { name: "Página 2" });
    fireEvent.click(page2Button);

    expect(screen.getByTestId("page-2-content")).toBeInTheDocument();

    // The navigator should close after selecting a page
    expect(
      screen.queryByRole("navigation", { name: "Navegación vertical de páginas" }),
    ).not.toBeInTheDocument();
  });

  it("can navigate using touch swipes", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    // The touchable area is .digital-reader__page-slot
    // We need to find an element within the reader that will trigger touch events,
    // which in this case is the container.
    // RTL's fireEvent doesn't perfectly simulate the actual DOM nodes but we can target the stage/slot
    const pageSlot = screen.getByTestId("page-1-content").parentElement?.parentElement;
    expect(pageSlot).toBeDefined();

    // Swipe left (next page)
    fireEvent.touchStart(pageSlot!, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(pageSlot!, { changedTouches: [{ clientX: 100 }] }); // -100 distance

    expect(screen.getByTestId("page-2-content")).toBeInTheDocument();

    // Swipe right (prev page)
    fireEvent.touchStart(pageSlot!, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(pageSlot!, { changedTouches: [{ clientX: 200 }] }); // +100 distance

    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
  });

  it("ignores touch swipes on interactive elements", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    const pageSlot = screen.getByTestId("page-1-content").parentElement?.parentElement;

    // Add a button inside page content
    const page1Content = screen.getByTestId("page-1-content");
    page1Content.innerHTML = '<button data-testid="interactive-btn">Btn</button>';
    const btn = screen.getByTestId("interactive-btn");

    fireEvent.touchStart(btn, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(btn, { changedTouches: [{ clientX: 100 }] }); // -100 distance

    // Should still be on page 1
    expect(screen.getByTestId("page-1-content")).toBeInTheDocument();
  });

  it("dispatches gretelEvent on page turn start and reveal", () => {
    render(<DigitalPageViewer pages={mockPages} />);

    // Initial reveal event is fired after delay
    expect(gretelBus.gretelEvent).not.toHaveBeenCalledWith("page:revealed", expect.any(Object));
    act(() => {
      vi.advanceTimersByTime(180); // firstReveal delay
    });
    expect(gretelBus.gretelEvent).toHaveBeenCalledWith("page:revealed", {
      pageNumber: 1,
      text: "Line 1",
    });
    expect(gretelBus.gretelEvent).toHaveBeenCalledWith("page-flip");

    vi.clearAllMocks();

    const nextButton = screen.getByRole("button", { name: "Página siguiente" });
    fireEvent.click(nextButton);

    expect(gretelBus.gretelEvent).toHaveBeenCalledWith("page-turn:start");

    act(() => {
      vi.advanceTimersByTime(740); // TURN_MS delay
    });

    expect(gretelBus.gretelEvent).toHaveBeenCalledWith("page:revealed", {
      pageNumber: 2,
      text: "Line 2",
    });
    expect(gretelBus.gretelEvent).toHaveBeenCalledWith("page-flip");
  });

  it("renders bookCompanion if provided", () => {
    render(
      <DigitalPageViewer
        pages={mockPages}
        bookCompanion={<div data-testid="companion">Companion Content</div>}
      />,
    );

    expect(screen.getByTestId("companion")).toBeInTheDocument();
  });

  it("computes correct page label when pageNumber and index + 1 differ", () => {
    const customPages = [
      { ...mockPages[0], pageNumber: 5 }, // index 0, pageNumber 5
    ];
    render(<DigitalPageViewer pages={customPages} />);

    // Should contain "Página 5 · hoja 1 de 1"
    expect(screen.getAllByText("Página 5 · hoja 1 de 1").length).toBeGreaterThan(0);
  });
});
