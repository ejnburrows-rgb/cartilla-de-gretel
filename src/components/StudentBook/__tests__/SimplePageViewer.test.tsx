/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SimplePageViewer } from "../SimplePageViewer";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

const originalPrefersReducedMotion = vi.fn(() => false);
const originalPrefersSimplePageTransition = vi.fn(() => false);

vi.mock("@/lib/living-motion", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    prefersReducedMotion: () => originalPrefersReducedMotion(),
    prefersSimplePageTransition: () => originalPrefersSimplePageTransition(),
    STUDENT_PAGE_TURN_MS: 800,
    studentFlipTransforms: vi.fn(() => ({ start: "", end: "" })),
  };
});

const pages = [
  { id: "p1", content: <div data-testid="page-1">Page 1</div> },
  { id: "p2", content: <div data-testid="page-2">Page 2</div> },
  { id: "p3", content: <div data-testid="page-3">Page 3</div> },
];

describe("SimplePageViewer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    originalPrefersReducedMotion.mockReturnValue(false);
    originalPrefersSimplePageTransition.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders the initial page content", () => {
    render(<SimplePageViewer pages={pages} />);
    expect(screen.getByTestId("page-1")).toBeInTheDocument();
    expect(screen.queryByTestId("page-2")).not.toBeInTheDocument();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
  });

  it("respects initialPage prop", () => {
    render(<SimplePageViewer pages={pages} initialPage={1} />);
    expect(screen.queryByTestId("page-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("page-2")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("disables Anterior button on first page and Siguiente on last page", () => {
    const { unmount } = render(<SimplePageViewer pages={pages} />);

    const prevButton1 = screen.getByRole("button", { name: /anterior/i });
    const nextButton1 = screen.getByRole("button", { name: /siguiente/i });

    expect(prevButton1).toBeDisabled();
    expect(nextButton1).not.toBeDisabled();
    unmount();

    render(<SimplePageViewer pages={pages} initialPage={2} />);

    const prevButton2 = screen.getByRole("button", { name: /anterior/i });
    const nextButton2 = screen.getByRole("button", { name: /siguiente/i });

    expect(prevButton2).not.toBeDisabled();
    expect(nextButton2).toBeDisabled();
  });

  it("navigates forward and backward with 3D flip animation", () => {
    const onPageChange = vi.fn();
    render(<SimplePageViewer pages={pages} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole("button", { name: /siguiente/i });

    // Click next
    fireEvent.click(nextButton);

    // Check flipping state
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();

    // Advance timers for animation (STUDENT_PAGE_TURN_MS is 800)
    act(() => vi.advanceTimersByTime(800));

    expect(screen.getByTestId("page-2")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(1);

    // Click prev
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    fireEvent.click(prevButton);

    act(() => vi.advanceTimersByTime(800));

    expect(screen.getByTestId("page-1")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it("uses crossfade animation in simple mode (reduced motion)", () => {
    originalPrefersReducedMotion.mockReturnValue(true);

    const onPageChange = vi.fn();
    render(<SimplePageViewer pages={pages} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole("button", { name: /siguiente/i });

    fireEvent.click(nextButton);

    // In simple mode, it uses a crossfade and a 420ms timeout
    act(() => vi.advanceTimersByTime(420));

    expect(screen.getByTestId("page-2")).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("ignores out of bounds navigation", () => {
    render(<SimplePageViewer pages={pages} initialPage={0} />);
    const prevButton = screen.getByRole("button", { name: /anterior/i });

    fireEvent.click(prevButton);
    act(() => vi.advanceTimersByTime(800));

    expect(screen.getByTestId("page-1")).toBeInTheDocument();
  });
});
