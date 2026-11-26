import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VowelGame, PhonicsCompleteGame, RhymeGame, DrawingsGame } from "../CoreGames";
import { CompletarPalabras } from "../CompletarPalabras";
import { VOCAL_A, FONETICA_P, RIMA_P, DIBUJOS_O } from "@/content/games/core-games";
import { COMPLETAR_PALABRAS_M } from "@/content/games/completar-palabras";

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
  getStudentSession: vi.fn(() => null),
}));

vi.mock("@/lib/games/wordAudio", () => ({
  playWord: vi.fn(),
  playInstruction: vi.fn(),
}));

describe("CoreGames and CompletarPalabras", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("VowelGame marks correct answers and shows star feedback", () => {
    render(<VowelGame content={VOCAL_A} />);
    const yesButtons = screen.getAllByRole("button", { name: "Sí" });
    fireEvent.click(yesButtons[0]);
    expect((yesButtons[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("PhonicsCompleteGame accepts the missing syllable", () => {
    render(<PhonicsCompleteGame content={FONETICA_P} />);
    fireEvent.click(screen.getByRole("button", { name: "pa" }));
    expect(screen.getByRole("status").textContent).toContain("¡Correcto!");
  });

  it("RhymeGame accepts the rhyming word without purple styling", () => {
    const { container } = render(<RhymeGame content={RIMA_P} />);
    expect(container.innerHTML).not.toContain("purple");
    fireEvent.click(screen.getByRole("button", { name: "Pepi" }));
    expect(screen.getByRole("status").textContent).toContain("¡Riman!");
  });

  it("DrawingsGame accepts the matching illustration", () => {
    render(<DrawingsGame content={DIBUJOS_O} />);
    fireEvent.click(screen.getByRole("button", { name: "Dibujo de oso" }));
    expect(screen.getByRole("status").textContent).toContain("¡Ese es el dibujo!");
  });

  it("CompletarPalabras keeps null answers as pendiente", () => {
    render(<CompletarPalabras content={COMPLETAR_PALABRAS_M} />);
    fireEvent.click(screen.getByRole("button", { name: /Jugar Completar palabras con Mm/i }));
    expect(screen.getAllByText(/pendiente/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Letras/i }));
    expect(screen.getByText("Elige una letra")).toBeTruthy();
  });
});
