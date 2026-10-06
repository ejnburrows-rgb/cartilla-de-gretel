/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { InteractiveVowelPickOne } from "../InteractivePageExercises";
import type { PageRegion } from "@/lib/book-faithful";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));
vi.mock("@/lib/gretel-tts", () => ({
  speakGretelPhrase: vi.fn(),
}));

import { playCorrectChord } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";

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

describe("InteractiveVowelPickOne — direct tap grading with Student Interaction Kernel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses lowercase vowel as label and lets child tap the matching picture directly", () => {
    const { getAllByRole, getByText } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    expect(getByText("o")).toBeTruthy();

    fireEvent.click(getAllByRole("button", { name: "oso" })[0]);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
  });

  it("erases wrong placement via Pencil Retry: Gretel wrong, row stays open to retry", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    const alaCell = getAllByRole("button", { name: "ala" })[0];
    fireEvent.click(alaCell); // wrong picture for "o"

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");

    // Row stays open — tap correct picture next
    const osoCell = getAllByRole("button", { name: "oso" })[0];
    fireEvent.click(osoCell);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
  });

  it("completes and records the exercise only once every row is correctly matched", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    fireEvent.click(getAllByRole("button", { name: "oso" })[0]);
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    fireEvent.click(getAllByRole("button", { name: "avión" })[0]);
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(gretelEvent).toHaveBeenCalledWith("activity:complete");
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "2",
        kind: "exercise",
        score: 2,
        total: 2,
        meta: expect.objectContaining({ exercise: "vowel_pick_one_p2-pick", completed: true }),
      }),
    );
  });
});
