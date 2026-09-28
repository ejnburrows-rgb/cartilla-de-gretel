/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SyllableWordCircle } from "../SyllableWordCircle";
import type { PageRegion } from "@/lib/book-faithful";

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

describe("SyllableWordCircle", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("rejects distractors instead of counting every word as correct", () => {
    render(<SyllableWordCircle region={region} lessonId="9" />);

    const wrong = screen.getByRole("button", { name: "semana" });
    fireEvent.click(wrong);
    expect(wrong).toHaveAttribute("aria-pressed", "false");
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    expect(screen.getByRole("status").textContent).toContain("0 de 3");
  });

  it("completes only after all correct syllable words are selected", () => {
    render(<SyllableWordCircle region={region} lessonId="9" />);

    for (const word of ["sala", "sapo", "sano"]) {
      fireEvent.click(screen.getByRole("button", { name: word }));
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
});
