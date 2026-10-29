import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import React, { useState } from "react";
import { CurlPageViewer } from "../CurlPageViewer";
import { NativeLessonViewer } from "../NativeLessonViewer";

vi.mock("@/lib/living-motion", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    prefersReducedMotion: () => true,
  };
});

// Setup react-pageflip mock
vi.mock("react-pageflip", () => {
  const React = require("react");
  return {
    default: React.forwardRef(function FlipBook(
      {
        children,
        onChangeState,
      }: { children: React.ReactNode; onChangeState: (e: { data: string }) => void },
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        pageFlip: () => ({
          flip: () => setTimeout(() => onChangeState({ data: "read" }), 20),
          flipNext: () => setTimeout(() => onChangeState({ data: "read" }), 20),
          flipPrev: () => setTimeout(() => onChangeState({ data: "read" }), 20),
          getCurrentPageIndex: () => 0,
          turnToPage: vi.fn(),
        }),
      }));
      return <div data-testid="pageflip-mock">{children}</div>;
    }),
  };
});

// Create a component that reads/writes from localStorage, similar to an activity
function TestActivity({ pageNumber }: { pageNumber: number }) {
  const [val, setVal] = useState(() => localStorage.getItem(`test-act-${pageNumber}`) || "");
  return (
    <input
      data-testid={`input-${pageNumber}`}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        localStorage.setItem(`test-act-${pageNumber}`, e.target.value);
      }}
    />
  );
}

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
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

const pages = [
  { id: "84", pageNumber: 84, content: <TestActivity pageNumber={84} /> },
  { id: "85", pageNumber: 85, content: <TestActivity pageNumber={85} /> },
  { id: "88", pageNumber: 88, content: <TestActivity pageNumber={88} /> },
  { id: "89", pageNumber: 89, content: <TestActivity pageNumber={89} /> },
];

describe("Storage Round Trip", () => {
  it("persists and restores work across page gaps without DOM state reuse", async () => {
    // Testing NativeLessonViewer (or CurlPageViewer single page mode)
    render(<NativeLessonViewer pages={pages} initialPage={1} chapterLabel="test" gated={false} />);

    // Type in 85
    const input85 = screen.getByTestId("input-85");
    fireEvent.change(input85, { target: { value: "hello 85" } });

    // Turn to 88
    fireEvent.click(screen.getByTestId("button-next"));
    act(() => vi.advanceTimersByTime(2000));

    // Check we are on 88
    const input88 = screen.getByTestId("input-88");
    fireEvent.change(input88, { target: { value: "hello 88" } });

    // Turn back to 85
    fireEvent.click(screen.getByTestId("button-prev"));
    act(() => vi.advanceTimersByTime(2000));

    // Check 85 value is intact and restored from storage (DOM node was destroyed and recreated)
    const input85Again = screen.getByTestId("input-85");
    expect(input85Again).toHaveValue("hello 85");
  });
});
