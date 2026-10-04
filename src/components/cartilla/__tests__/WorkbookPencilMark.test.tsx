import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkbookPencilMark } from "../WorkbookPencilMark";
import { InteractivePictureGrid, InteractiveVowelPickOne } from "../InteractivePageExercises";

vi.mock("@/lib/gretel-voice", () => ({
  speakAsGretel: vi.fn(() => Promise.resolve()),
}));

describe("WorkbookPencilMark component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders drawing mark and transitions to correct state", async () => {
    const onCorrectComplete = vi.fn();
    const { container } = render(
      <WorkbookPencilMark
        markType="circle"
        isCorrect={true}
        onCorrectComplete={onCorrectComplete}
        silent={true}
      />
    );

    expect(container.querySelector(".workbook-pencil-mark-container")).toBeTruthy();

    // Step 1: Draw phase (400ms)
    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    // Step 2: Hold phase (2800ms)
    await act(async () => {
      vi.advanceTimersByTime(2900);
    });

    expect(onCorrectComplete).toHaveBeenCalled();
  });

  it("renders drawing mark and triggers erasing retry state on wrong answer", async () => {
    const onRetryComplete = vi.fn();
    const { container } = render(
      <WorkbookPencilMark
        markType="circle"
        isCorrect={false}
        onRetryComplete={onRetryComplete}
        silent={true}
      />
    );

    expect(container.querySelector(".workbook-pencil-mark-container")).toBeTruthy();

    // Step 1: Draw phase (400ms)
    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    // Step 2: Hold phase (2800ms)
    await act(async () => {
      vi.advanceTimersByTime(2900);
    });

    // Step 3: Erase phase (900ms)
    await act(async () => {
      vi.advanceTimersByTime(950);
    });

    expect(onRetryComplete).toHaveBeenCalled();
  });
});

describe("Page 1 (p1) InteractivePictureGrid pencil mode", () => {
  const p1Region = {
    id: "p1-grid",
    regionType: "picture-grid" as const,
    order: 1,
    fontRole: "body" as const,
    columns: 4,
    cells: [
      { caption: "abrigo", correct: true, illustrationSrc: "/cartilla/art/faithful/leccion-1/abrigo.webp" },
      { caption: "imán", correct: false, illustrationSrc: "/cartilla/art/faithful/vocal-i/iman.webp" },
      { caption: "abanico", correct: true, illustrationSrc: "/cartilla/art/faithful/vocal-a/abanico.webp" },
      { caption: "oso", correct: false, illustrationSrc: "/cartilla/art/faithful/vocal-o/oso.webp" },
    ],
  };

  it("does not render Comprobar button on p1 and allows direct tap marking", () => {
    render(<InteractivePictureGrid region={p1Region} accent="#008b82" />);
    expect(screen.queryByText("Comprobar")).toBeNull();

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
  });
});

describe("Page 2 (p2) InteractiveVowelPickOne pencil mode", () => {
  const p2Region = {
    id: "p2-rows",
    regionType: "vowel-pick-one" as const,
    order: 1,
    fontRole: "body" as const,
    vowelRows: [
      {
        letter: "a",
        cells: [
          { caption: "anillo", correct: true, illustrationSrc: "/cartilla/art/faithful/vocal-a/anillo.webp" },
          { caption: "manzana", correct: false, illustrationSrc: "/cartilla/art/faithful/leccion-1/manzana.webp" },
          { caption: "libro", correct: false, illustrationSrc: "/cartilla/art/faithful/leccion-1/libro.webp" },
        ],
      },
    ],
  };

  it("renders lowercase vowel labels and picture cells", () => {
    render(<InteractiveVowelPickOne region={p2Region} accent="#008b82" />);
    expect(screen.getByText("a")).toBeTruthy();
    const cellButtons = screen.getAllByRole("button");
    expect(cellButtons.length).toBe(3);
  });
});
