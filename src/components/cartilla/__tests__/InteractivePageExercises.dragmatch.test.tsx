/**
 * @vitest-environment jsdom
 */
// Real drag interaction regression test for InteractiveVowelPickOne — the
// book's "arrastra/presiona la vocal sobre el dibujo correcto" exercise.
// dnd-kit's pointer sensor can't be reliably driven through jsdom's
// synthetic events, so this exercises the grading logic through the
// identical tap-to-select-then-tap-to-place path a keyboard/touch user
// takes — both paths call the exact same attempt() grading function a
// real drop calls, so this proves the same thing: correct placement
// grades correct (chime + Gretel cheer), wrong placement bounces back
// (buzz + Gretel wrong, row stays open to retry), and the exercise only
// completes once every row is correctly matched.
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

describe("InteractiveVowelPickOne — real drag/tap grading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("grades a correct placement immediately: chime + Gretel correct, not yet complete", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    const letters = getAllByRole("button", { name: /^Vocal/ });
    fireEvent.click(letters[0]); // select row 0's "o"
    const osoCell = getAllByRole("button", { name: "oso" })[0];
    fireEvent.click(osoCell); // place on the correct picture

    expect(playCorrectChord).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(recordEvent).not.toHaveBeenCalled(); // only row 0 done, row 1 still open
  });

  it("bounces back a wrong placement: buzz + Gretel wrong, row stays open to retry", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    const letters = getAllByRole("button", { name: /^Vocal/ });
    fireEvent.click(letters[0]); // select row 0's "o"
    const alaCell = getAllByRole("button", { name: "ala" })[0];
    fireEvent.click(alaCell); // wrong picture for "o"

    expect(playWrongBuzz).toHaveBeenCalledTimes(1);
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");
    expect(playCorrectChord).not.toHaveBeenCalled();

    // Row wasn't locked and stays selected — tapping the correct picture
    // next still grades it (no need to re-select the letter).
    const osoCell = getAllByRole("button", { name: "oso" })[0];
    fireEvent.click(osoCell);
    expect(playCorrectChord).toHaveBeenCalledTimes(1);
  });

  it("completes and records the exercise only once every row is correctly matched", () => {
    const { getAllByRole } = render(
      <InteractiveVowelPickOne region={region} accent="#000" lessonId="2" />,
    );
    let letters = getAllByRole("button", { name: /^Vocal/ });
    fireEvent.click(letters[0]);
    fireEvent.click(getAllByRole("button", { name: "oso" })[0]);
    expect(recordEvent).not.toHaveBeenCalled();

    letters = getAllByRole("button", { name: /^Vocal/ });
    fireEvent.click(letters[1]);
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
