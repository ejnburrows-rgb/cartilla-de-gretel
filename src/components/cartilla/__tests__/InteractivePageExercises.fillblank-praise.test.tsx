/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractiveFillInBlank } from "../InteractivePageExercises";
import type { PageRegion } from "@/lib/book-faithful";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";
import { recordEvent } from "@/lib/student-session";
import { feelBus } from "@/lib/feel-bus";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/lib/feel-bus", () => ({ feelBus: { emit: vi.fn() } }));

const PRAISE = "Bien. Sigue con la siguiente palabra.";
const RETRY = "Revisa la opción marcada e inténtalo otra vez.";

// p22-style: two fill-in-blank items (mirrors the real p22 wordBox/blank shape).
const regionP22Style: PageRegion = {
  id: "p22-fill",
  regionType: "fill-in-blank",
  order: 0,
  fontRole: "body",
  fillItems: [
    {
      wordBox: "mamá",
      blank: "ma ___",
      choices: [
        { text: "má", correct: true },
        { text: "mo", correct: false },
        { text: "mi", correct: false },
      ],
    },
    {
      wordBox: "mapa",
      blank: "___ pa",
      choices: [
        { text: "ma", correct: true },
        { text: "me", correct: false },
      ],
    },
  ],
};

// Another page in the same fill-in-blank family: two items, different words.
const regionOtherPage: PageRegion = {
  id: "p24-fill",
  regionType: "fill-in-blank",
  order: 0,
  fontRole: "body",
  fillItems: [
    {
      wordBox: "mesa",
      blank: "me ___",
      choices: [
        { text: "sa", correct: true },
        { text: "so", correct: false },
      ],
    },
    {
      wordBox: "sopa",
      blank: "so ___",
      choices: [
        { text: "pa", correct: true },
        { text: "pe", correct: false },
      ],
    },
  ],
};

/**
 * Wrong pick -> retry feedback and NEVER praise (even after the 900ms
 * gentle reset clears the wrong pick); then right pick -> praise.
 */
function checkWrongThenRight(region: PageRegion, wrongText: string, rightText: string) {
  const view = render(<InteractiveFillInBlank region={region} accent="#000" />);

  // 1. Wrong pick: retry feedback appears, praise must not.
  // (Note: dnd-kit renders its own role="status" live region, so assert on text.)
  fireEvent.click(view.getByRole("button", { name: wrongText }));
  expect(view.getByText(RETRY)).toBeTruthy();
  expect(view.queryByText(PRAISE)).toBeNull();

  // 2. The 900ms gentle reset clears the wrong pick: praise must STILL not appear.
  act(() => {
    vi.advanceTimersByTime(900);
  });
  expect(view.queryByText(RETRY)).toBeNull();
  expect(view.queryByText(PRAISE)).toBeNull();

  // 3. Right pick: praise appears (and the success chord plays).
  fireEvent.click(view.getByRole("button", { name: rightText }));
  expect(view.getByText(PRAISE)).toBeTruthy();
  expect(playCorrectChord).toHaveBeenCalled();

  view.unmount();
}

describe("InteractiveFillInBlank praise gating (#722)", () => {
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

  it("never praises a wrong pick on the p22-style region", () => {
    checkWrongThenRight(regionP22Style, "mo", "má");
  });

  it("never praises a wrong pick on another fill-in-blank page", () => {
    checkWrongThenRight(regionOtherPage, "so", "sa");
  });

  it("shows completion praise only when the page is actually solved", () => {
    const view = render(<InteractiveFillInBlank region={regionP22Style} accent="#000" />);
    // Solve both items correctly.
    fireEvent.click(view.getByRole("button", { name: "má" }));
    expect(view.queryByText(PRAISE)).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "ma" }));
    expect(view.getByText("Completado")).toBeTruthy();
    expect(view.queryByText(PRAISE)).toBeNull();
    view.unmount();
  });
});
