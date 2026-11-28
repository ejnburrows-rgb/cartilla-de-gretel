import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChanoScene } from "../ChanoScene";
import { CHANO_WORDS } from "../words";
import { PAYASO_CHANO_SS } from "@/content/games/payaso-chano-ss";
import { recordEvent } from "@/lib/student-session";
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/lib/audio-engine", () => ({ audioEngine: { isMuted: () => true } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal("getComputedStyle", () => ({
    paddingLeft: "0",
    paddingRight: "0",
    paddingTop: "0",
    paddingBottom: "0",
    rowGap: "0",
    getPropertyValue: () => "",
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const next = () => fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
const solve = (i: number) => {
  for (const raw of CHANO_WORDS[i].syllables) {
    const syllable = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    fireEvent.click(screen.getByRole("button", { name: syllable }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
  expect(screen.getByRole("status").textContent).toBe("¡Muy bien!");
};
describe("mounted Chano completion", () => {
  it("does not finish a round by skipping every word", () => {
    render(<ChanoScene content={PAYASO_CHANO_SS} />);
    for (let i = 0; i < CHANO_WORDS.length; i++) next();
    expect(recordEvent).not.toHaveBeenCalled();
    expect(screen.queryByText("¡Terminaste!")).toBeNull();
    expect(screen.getByText("Palabra 1 de 5")).toBeTruthy();
  });
  it("returns to unfinished words instead of completing after only the final answer", () => {
    render(<ChanoScene content={PAYASO_CHANO_SS} />);
    for (let i = 1; i < CHANO_WORDS.length; i++) next();
    solve(CHANO_WORDS.length - 1);
    next();
    expect(recordEvent).not.toHaveBeenCalled();
    expect(screen.getByText("Palabra 1 de 5")).toBeTruthy();
    for (let i = 0; i < CHANO_WORDS.length - 1; i++) {
      solve(i);
      next();
    }
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 5,
        total: 5,
        meta: expect.objectContaining({ completed: true }),
      }),
    );
  });
  it("awards one complete round, then resets earned words on replay", () => {
    render(<ChanoScene content={PAYASO_CHANO_SS} />);
    for (let i = 0; i < CHANO_WORDS.length; i++) {
      solve(i);
      next();
    }
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText("¡Terminaste!")).toBeTruthy();
    next();
    for (let i = 0; i < CHANO_WORDS.length; i++) next();
    expect(recordEvent).toHaveBeenCalledTimes(1);
    for (let i = 0; i < CHANO_WORDS.length; i++) {
      solve(i);
      next();
    }
    expect(recordEvent).toHaveBeenCalledTimes(2);
  });
  it("does not award a wrong answer or a cleared board", () => {
    render(<ChanoScene content={PAYASO_CHANO_SS} />);
    fireEvent.click(screen.getByRole("button", { name: "ma" }));
    fireEvent.click(screen.getByRole("button", { name: "mi" }));
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByRole("status").textContent).toBe("Intenta otra vez.");
    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));
    for (let i = 0; i < CHANO_WORDS.length; i++) next();
    expect(recordEvent).not.toHaveBeenCalled();
  });
});
