/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractiveVowelPickOne } from "../InteractivePageExercises";
import { WORKBOOK_MARK_TIMING } from "../WorkbookPencilMark";

const RESULT_MS = WORKBOOK_MARK_TIMING.drawMs + WORKBOOK_MARK_TIMING.holdMs;
import type { PageRegion } from "@/lib/book-faithful";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

const region: PageRegion = {
  id: "p2-pick",
  regionType: "vowel-pick-one",
  order: 0,
  fontRole: "body",
  vowelRows: [
    {
      letter: "o",
      cells: [
        { caption: "oso", correct: true },
        { caption: "ala", correct: false },
        { caption: "isla", correct: false },
      ],
    },
    {
      letter: "a",
      cells: [
        { caption: "ojo", correct: false },
        { caption: "avión", correct: true },
        { caption: "uva", correct: false },
      ],
    },
  ],
};

describe("InteractiveVowelPickOne shared pencil adapter", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("waits through the neutral hold before accepting a correct picture", () => {
    const view = render(<InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />);
    const oso = view.getByRole("button", { name: "oso" });
    fireEvent.click(oso);

    expect(oso.querySelector(".workbook-pencil-mark-container")).toBeTruthy();
    expect(playCorrectChord).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(RESULT_MS - 1));
    expect(playCorrectChord).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct", {
      itemId: "p2-pick-0-0",
    });
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("erases a wrong mark and leaves the row open to retry", () => {
    const view = render(<InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />);
    const ala = view.getByRole("button", { name: "ala" });
    fireEvent.click(ala);

    act(() => vi.advanceTimersByTime(RESULT_MS));
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong", {
      itemId: "p2-pick-0-1",
    });
    expect(playWrongBuzz).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(WORKBOOK_MARK_TIMING.eraseMs));
    expect(playWrongBuzz).not.toHaveBeenCalled();
    expect(recordEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        lessonId: "2",
        kind: "exercise",
        meta: expect.objectContaining({ completed: false, attemptCorrect: false }),
      }),
    );

    const oso = view.getByRole("button", { name: "oso" });
    expect(oso).toHaveProperty("disabled", false);
  });

  it("records completion once and emits no separate final success event", () => {
    const view = render(<InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />);

    fireEvent.click(view.getByRole("button", { name: "oso" }));
    act(() => vi.advanceTimersByTime(RESULT_MS));

    fireEvent.click(view.getByRole("button", { name: "avión" }));
    act(() => vi.advanceTimersByTime(RESULT_MS));

    expect(gretelEvent).toHaveBeenCalledWith("activity:complete", {
      itemId: "p2-pick-1-1",
    });
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:correct", {
      itemId: "p2-pick-1-1",
    });
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "2",
        kind: "exercise",
        score: 2,
        total: 2,
        meta: expect.objectContaining({
          exercise: "vowel_pick_one_p2-pick",
          completed: true,
        }),
      }),
    );
  });
});
