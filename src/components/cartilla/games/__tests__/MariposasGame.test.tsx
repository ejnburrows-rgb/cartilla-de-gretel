import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MariposasGame } from "../MariposasGame";
import { MARIPOSAS_P } from "@/content/games/core-games";

afterEach(() => {
  vi.useRealTimers();
});

describe("Mariposas Mm — owner mockup game", () => {
  it("keeps the mockup's exact sign words, syllable bank, and eight instructions", () => {
    expect(MARIPOSAS_P.letter).toBe("m");
    expect(MARIPOSAS_P.instructions).toHaveLength(8);
    expect(MARIPOSAS_P.instructions[0]).toBe("Escucha la palabra.");
    expect(MARIPOSAS_P.instructions[2]).toBe(
      "Presiona la otra sílaba o las otras sílabas que forman la palabra.",
    );
    expect(MARIPOSAS_P.instructions[7]).toBe(
      "Presiona la regadera para escuchar la próxima palabra.",
    );
    expect(MARIPOSAS_P.tiles).toEqual(["ma", "mo", "mi", "Mu", "pa", "po", "me", "Pe", "pi", "Pu"]);
    expect(MARIPOSAS_P.words.map(({ word }) => word)).toEqual([
      "mapa",
      "pomo",
      "Mupi",
      "Pepe",
      "puma",
      "Pupi",
    ]);
  });

  it("shows the labeled Audio pendiente state and never synthesizes audio", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    expect(screen.getByText(/^Audio pendiente$/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Sol: escuchar/i }));
    expect(screen.getByRole("status").textContent).toMatch(/Audio pendiente/i);
  });

  it("flies the tapped butterfly down and places its syllable in the next slot", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Mariposa ma" }));
    expect(screen.getByTestId("mariposas-answer").textContent).not.toContain("ma");
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByTestId("mariposas-answer").textContent).toContain("ma");
    fireEvent.click(screen.getByRole("button", { name: "Mariposa pa" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByTestId("mariposas-answer").textContent).toContain("pa");
  });

  it("checks ash first, then marks the correct word green slowly", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Mariposa ma" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Mariposa pa" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: /Mariposa: comprobar/i }));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("ash");
    act(() => {
      vi.advanceTimersByTime(520);
    });
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("green");
    expect(screen.getByRole("status").textContent).toBe("¡Palabra completa!");
  });

  it("marks a wrong word red, erases it, and shows Inténtalo otra vez.", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Mariposa po" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Mariposa mo" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: /Mariposa: comprobar/i }));
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("ash");
    act(() => {
      vi.advanceTimersByTime(520);
    });
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("red");
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("erasing");
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByTestId("mariposas-answer").textContent).not.toContain("po");
    expect(screen.getByRole("status").textContent).toBe("Inténtalo otra vez.");
  });

  it("accepts the mockup plaque casing for puma and advances words with the watering can", () => {
    vi.useFakeTimers();
    render(<MariposasGame content={MARIPOSAS_P} />);
    for (let n = 0; n < 4; n += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Regadera: próxima/i }));
    }
    expect(screen.getByTestId("mariposas-cue").textContent).toContain("puma");
    fireEvent.click(screen.getByRole("button", { name: "Mariposa Pu" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Mariposa ma" }));
    act(() => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: /Mariposa: comprobar/i }));
    act(() => {
      vi.advanceTimersByTime(520);
    });
    expect(screen.getByTestId("mariposas-answer").dataset.mark).toBe("green");
  });
});
