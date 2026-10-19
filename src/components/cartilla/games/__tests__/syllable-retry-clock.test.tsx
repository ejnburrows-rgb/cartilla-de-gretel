import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameContent } from "@/lib/games/gameContent";
import { SyllableBuilder } from "../SyllableBuilder";
import { PICK_ERASE_MS } from "../PickMark";

vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

const content: GameContent = {
  id: "retry-clock",
  type: "lectura-silabas",
  letter: "m",
  instructions: [],
  words: [{ word: "mamá", syllables: ["ma", "má"] }],
};
const place = (syllable: string) =>
  fireEvent.click(screen.getByRole("button", { name: `Sílaba ${syllable}` }), { detail: 0 });
const clear = (index: number) =>
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^Casilla ${index}:`) }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("syllable retry clock", () => {
  it("preserves a corrected successful answer after the old wrong-attempt deadline", () => {
    render(<SyllableBuilder content={content} />);
    place("má");
    place("ma");
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    act(() => vi.advanceTimersByTime(1000));
    clear(1);
    clear(2);
    place("ma");
    place("má");
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    act(() => vi.advanceTimersByTime(PICK_ERASE_MS));
    expect(screen.getByRole("button", { name: "Terminar" })).toBeDefined();
    expect(document.querySelectorAll('[data-slot-index][data-pick-mark="right"]')).toHaveLength(2);
  });

  it("gives a new wrong attempt its full erase interval", () => {
    render(<SyllableBuilder content={content} />);
    place("má");
    place("ma");
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    act(() => vi.advanceTimersByTime(1000));
    clear(1);
    place("má");
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    act(() => vi.advanceTimersByTime(PICK_ERASE_MS - 1));
    expect(document.querySelectorAll('[data-slot-index][data-pick-mark="wrong"]')).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("button", { name: "Casilla 1: vacía" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Casilla 2: vacía" })).toBeDefined();
  });
});
