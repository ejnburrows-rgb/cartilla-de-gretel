import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MariposasGame } from "../MariposasGame";
import { MARIPOSAS_P } from "@/content/games/core-games";

afterEach(() => {
  vi.useRealTimers();
});

describe("Mariposas Mm — original teacher document", () => {
  it("keeps the teacher's eight instructions and exact case/accent-sensitive syllable bank", () => {
    expect(MARIPOSAS_P.letter).toBe("m");
    expect(MARIPOSAS_P.instructions).toHaveLength(8);
    expect(MARIPOSAS_P.instructions[7]).toBe("Presiona la regadera para escuchar la próxima palabra.");
    expect(MARIPOSAS_P.tiles).toEqual(["mi", "ma", "me", "má", "mu", "mo", "Mu", "Me"]);
    expect(MARIPOSAS_P.words.map(({ word }) => word)).toEqual(["mi", "ma", "me", "má", "mu", "mo", "Mu", "Me"]);
  });

  it("shows the missing-recording state without synthesizing any audio", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    expect(screen.getByText(/audio pendiente/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Sol: escuchar/i }));
    expect(screen.getByRole("status").textContent).toMatch(/Audio pendiente/i);
  });

  it("requires the flower to place a syllable, and the butterfly to check it", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Elegir sílaba mi" }));
    expect(screen.getByTestId("mariposas-answer").textContent).not.toContain("mi");
    fireEvent.click(screen.getByRole("button", { name: "Colocar sílaba en la florecita" }));
    expect(screen.getByTestId("mariposas-answer").textContent).toContain("mi");
    fireEvent.click(screen.getByRole("button", { name: /Mariposa: comprobar/i }));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("ash");
    act(() => vi.advanceTimersByTime(420));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("green");
    fireEvent.click(screen.getByRole("button", { name: /Red: regresar/i }));
    expect(screen.getByTestId("mariposas-answer").textContent).not.toContain("mi");
  });

  it("marks a wrong answer gray, then red, erases it, and invites another try", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Elegir sílaba ma" }));
    fireEvent.click(screen.getByRole("button", { name: "Colocar sílaba en la florecita" }));
    fireEvent.click(screen.getByRole("button", { name: /Mariposa: comprobar/i }));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("ash");
    act(() => vi.advanceTimersByTime(420));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("red");
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.getByTestId("mariposas-answer").textContent).not.toContain("ma");
    expect(screen.getByRole("status").textContent).toBe("Inténtalo otra vez.");
  });

  it("advances only with the watering can, keeping the original source's order", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    expect(screen.getByTestId("mariposas-cue").textContent).toContain("mi");
    fireEvent.click(screen.getByRole("button", { name: /Regadera: próxima/i }));
    expect(screen.getByTestId("mariposas-cue").textContent).toContain("ma");
  });
});
