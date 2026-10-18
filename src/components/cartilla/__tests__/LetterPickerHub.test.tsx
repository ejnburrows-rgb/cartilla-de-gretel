/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LetterPickerHub, cartillaLetters } from "@/components/cartilla/LetterPickerHub";
import { markLessonCompleted } from "@/lib/lesson-progress";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));
vi.mock("@/lib/piano-audio", () => ({
  playUiTick: vi.fn(),
}));
vi.mock("@/lib/lesson-fullscreen", () => ({
  requestLessonFullscreen: vi.fn(),
}));

/**
 * Locked tiles render as disabled buttons, which are excluded from the
 * accessibility tree — so query tiles by their stable data-letter hook
 * instead of by role.
 */
const TILE = (letter: string): HTMLButtonElement => {
  const tile = document.querySelector(`button[data-letter="${letter}"]`);
  expect(tile).not.toBeNull();
  return tile as HTMLButtonElement;
};

describe("LetterPickerHub — shared letter entrance", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("offers the Cartilla letters in book order with Mm first", () => {
    render(<LetterPickerHub onPickLetter={() => {}} />);
    const tiles = Array.from(document.querySelectorAll("button[data-letter]"));
    expect(tiles.map((tile) => tile.getAttribute("data-letter"))).toEqual([
      "m",
      "p",
      "s",
      "t",
      "d",
      "l",
      "n",
      "ñ",
      "b",
      "v",
      "r",
      "rr",
      "g",
      "f",
      "j",
      "c",
      "y",
      "z",
    ]);
  });

  it("fresh learner: only Mm is unlocked; the other letters stay visible but locked", () => {
    render(<LetterPickerHub onPickLetter={() => {}} />);
    expect(TILE("m").disabled).toBe(false);
    expect(TILE("p").disabled).toBe(true);
    expect(TILE("s").disabled).toBe(true);
    expect(TILE("z").disabled).toBe(true);
    // Locked letters remain visible with a lock marker, not hidden.
    expect(document.querySelectorAll(".lc-letras__tile.is-locked")).toHaveLength(17);
  });

  it("completing the previous letter's lesson unlocks the next letter", () => {
    markLessonCompleted(7); // Mm lesson done → Pp unlocks
    render(<LetterPickerHub onPickLetter={() => {}} />);
    expect(TILE("m").disabled).toBe(false);
    expect(TILE("p").disabled).toBe(false);
    expect(TILE("s").disabled).toBe(true);
  });

  it("reports the picked letter to the host activity", () => {
    const onPickLetter = vi.fn();
    render(<LetterPickerHub onPickLetter={onPickLetter} />);
    fireEvent.click(TILE("m"));
    expect(onPickLetter).toHaveBeenCalledWith(
      expect.objectContaining({ letter: "m", lessonNumber: 7, label: "Mm" }),
    );
  });

  it("hosts can pass their own letters and unlocked set", () => {
    render(
      <LetterPickerHub
        letters={[
          { letter: "o", label: "Oo", lessonNumber: 2, color: "#E76F51", syllables: ["o"] },
          { letter: "a", label: "Aa", lessonNumber: 3, color: "#2A9D8F", syllables: ["a"] },
        ]}
        unlockedLetters={["o"]}
        onPickLetter={() => {}}
      />,
    );
    expect(TILE("o").disabled).toBe(false);
    expect(TILE("a").disabled).toBe(true);
  });

  it("cartillaLetters keeps the book letter path with rr shown lowercase", () => {
    const letters = cartillaLetters();
    expect(letters.map((l) => l.letter)).toEqual([
      "m",
      "p",
      "s",
      "t",
      "d",
      "l",
      "n",
      "ñ",
      "b",
      "v",
      "r",
      "rr",
      "g",
      "f",
      "j",
      "c",
      "y",
      "z",
    ]);
    expect(letters.find((l) => l.letter === "rr")?.label).toBe("rr");
  });
});
