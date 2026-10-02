/**
 * @vitest-environment jsdom
 */
// Digital adaptation rule: preserve the printed learning objective, not the
// paper gesture. On-screen the child taps the matching picture directly;
// there is no drag affordance or "select the vowel first" step.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
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

import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
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

describe("InteractiveVowelPickOne — direct tap grading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("uses the vowel as a label and lets the child tap the matching picture directly", () => {
    const { getAllByRole, queryAllByRole, getByText } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    expect(queryAllByRole("button", { name: /^Vocal/ })).toHaveLength(0);
    expect(getByText("Oo")).toBeTruthy();

    fireEvent.click(getAllByRole("button", { name: "oso" })[0]);

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("bounces back a wrong placement: buzz + Gretel wrong, row stays open to retry", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    const alaCell = getAllByRole("button", { name: "ala" })[0];
    fireEvent.click(alaCell); // wrong picture for "o"

    expect(playWrongBuzz).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    expect(playCorrectChord).not.toHaveBeenCalled();

    // Row stays open — the child simply taps the correct picture next.
    const osoCell = getAllByRole("button", { name: "oso" })[0];
    fireEvent.click(osoCell);
    expect(playCorrectChord).toHaveBeenCalledTimes(1);
  });

  it("completes and records the exercise only once every row is correctly matched", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    fireEvent.click(getAllByRole("button", { name: "oso" })[0]);
    expect(recordEvent).not.toHaveBeenCalled();

    fireEvent.click(getAllByRole("button", { name: "avión" })[0]);

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
