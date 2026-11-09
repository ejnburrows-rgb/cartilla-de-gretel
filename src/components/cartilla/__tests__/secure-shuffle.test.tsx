import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { AudioMultipleChoice } from "../InteractiveMiniGames";
import { SyllableTapGame } from "../SyllableTapGame";

const audioAvailable = vi.hoisted(() => vi.fn(() => true));
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ play: vi.fn(), playingText: null, isAvailable: audioAvailable }),
}));
vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

// With getRandomValues fixed at 0, the shuffle swaps each item with index 0:
// [a,b,c,d] -> [b,c,d,a]. A Math.random based shuffle could not produce this.
const input = ["a", "b", "c", "d"];
const expected = ["b", "c", "d", "a"];

function stubRandom() {
  const mathRandom = vi.spyOn(Math, "random").mockImplementation(() => {
    throw new Error("Math.random must not be used for shuffling");
  });
  const getRandomValues = vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(((
    arr: Uint32Array,
  ) => {
    arr[0] = 0;
    return arr;
  }) as typeof crypto.getRandomValues);
  return { mathRandom, getRandomValues };
}

describe("secure shuffles", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    audioAvailable.mockReturnValue(true);
  });

  it("SyllableTapGame orders choices with crypto.getRandomValues, not Math.random", () => {
    const { getRandomValues } = stubRandom();
    render(<SyllableTapGame syllables={input} color="#000" />);
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"))
      .filter((l): l is string => input.includes(l ?? ""));
    expect(labels).toEqual(expected);
    expect(getRandomValues).toHaveBeenCalled();
  });

  it("AudioMultipleChoice orders options with crypto.getRandomValues, keeping every option once", () => {
    const { getRandomValues } = stubRandom();
    render(
      <AudioMultipleChoice targetWord="a" color="#000" options={input.map((word) => ({ word }))} />,
    );
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((l) => l.startsWith("Seleccionar "))
      .map((l) => l.replace("Seleccionar ", ""));
    expect(labels).toEqual(expected);
    expect(getRandomValues).toHaveBeenCalled();
  });

  it("omits the sound control when a verified recording is missing", () => {
    audioAvailable.mockReturnValue(false);
    render(
      <AudioMultipleChoice targetWord="missing-word" color="#000" options={[{ word: "a" }]} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("falta una grabación aprobada");
    expect(screen.queryByRole("button", { name: "Escuchar palabra" })).not.toBeInTheDocument();
  });
});
