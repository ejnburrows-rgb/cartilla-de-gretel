import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { forwardRef, useImperativeHandle } from "react";
import { CurlPageViewer } from "../CurlPageViewer";

vi.mock("react-pageflip", () => ({
  default: forwardRef(function FlipBook(
    {
      children,
      onChangeState,
    }: { children: React.ReactNode; onChangeState: (e: { data: string }) => void },
    ref,
  ) {
    useImperativeHandle(ref, () => ({
      pageFlip: () => ({
        // PageFlip can emit read before its page index changes (including startup).
        flip: () => setTimeout(() => onChangeState({ data: "read" }), 20),
        getCurrentPageIndex: () => 0,
        turnToPage: vi.fn(),
      }),
    }));
    return <div>{children}</div>;
  }),
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 390,
    height: 500,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 390,
    bottom: 500,
    toJSON() {},
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("an early read event cannot cancel a requested page destination or its resume callback", () => {
  const change = vi.fn();
  render(
    <CurlPageViewer
      pages={[1, 2, 3].map((pageNumber) => ({
        id: String(pageNumber),
        pageNumber,
        content: <p>Page {pageNumber}</p>,
      }))}
      onPageChange={change}
    />,
  );
  act(() => vi.advanceTimersByTime(400));
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByTestId("physical-book-counter")).toHaveTextContent("Página 2 de 3");
  expect(change).toHaveBeenCalledExactlyOnceWith(1);
  expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
});
