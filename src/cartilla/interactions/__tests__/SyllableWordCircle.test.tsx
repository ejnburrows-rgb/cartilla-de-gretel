/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SyllableWordCircle } from "../SyllableWordCircle";
import type { PageRegion } from "@/lib/book-faithful";

vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: () => true }));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";

const region = {
  id: "test-sa",
  regionType: "syllable-match",
  order: 1,
  fontRole: "body",
  syllable: "sa",
  matchRows: [[
    { word: "semana", correct: false },
    { word: "sala", correct: true },
    { word: "sapo", correct: true },
  ], [
    { word: "sano", correct: true },
    { word: "sube", correct: false },
    { word: "suyo", correct: false },
  ]],
} as PageRegion;

function mockWordRect(button: HTMLElement, width = 400) {
  vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: 64,
    width,
    height: 64,
    toJSON: () => ({}),
  } as DOMRect);
}

describe("SyllableWordCircle", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("uses one word hit target and gently erases an incorrect attempt", () => {
    render(<SyllableWordCircle region={region} lessonId="9" />);

    const wrong = screen.getByRole("button", { name: "semana" });
    mockWordRect(wrong);
    fireEvent.pointerUp(wrong, { clientX: 30, pointerId: 1 });

    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(wrong.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("status").textContent).toContain("Inténtalo otra vez");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", { itemId: "test-sa-0" });
    expect(screen.getByRole("status").textContent).toContain("0 de 3");
  });

  it("completes only after all correct syllable words are circled", () => {
    render(<SyllableWordCircle region={region} lessonId="9" />);

    for (const word of ["sala", "sapo", "sano"]) {
      fireEvent.click(screen.getByRole("button", { name: word }), { detail: 0 });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
    }

    expect(screen.getByRole("status").textContent).toContain("3 de 3");
    expect(gretelEvent).toHaveBeenCalledWith("activity:complete");
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      lessonId: "9",
      kind: "exercise",
      score: 1,
      total: 1,
    }));
  });

  it("lets pointer position select either repeated occurrence in the same word", () => {
    const repeat = {
      id: "repeat-pa",
      regionType: "syllable-match",
      order: 1,
      fontRole: "body",
      syllable: "pa",
      matchRows: [[{ word: "papá", correct: true }]],
    } as PageRegion;
    const { container } = render(<SyllableWordCircle region={repeat} />);
    const word = screen.getByRole("button", { name: "papá" });
    mockWordRect(word);

    fireEvent.pointerUp(word, { clientX: 20, pointerId: 1 });
    act(() => vi.advanceTimersByTime(3000));
    expect(word.getAttribute("aria-pressed")).toBe("true");

    fireEvent.pointerUp(word, { clientX: 20, pointerId: 2 });
    expect(word.getAttribute("aria-pressed")).toBe("false");

    fireEvent.pointerUp(word, { clientX: 260, pointerId: 3 });
    act(() => vi.advanceTimersByTime(3000));

    expect(word.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("1 de 1");
    expect(container.querySelector(".native-syllable__mark")).toBeTruthy();
  });
});
