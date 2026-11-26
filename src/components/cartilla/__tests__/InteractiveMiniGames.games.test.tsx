import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { MemoryMatch, RapidFire, SyllableTrain, WordPuzzle } from "../InteractiveMiniGames";

const wordLesson = CATALOG.find((entry): entry is Extract<CatalogEntry, { kind: "consonant" }> => entry.kind === "consonant" && entry.data.vocab.length > 1)!;
const firstWord = wordLesson.data.vocab[0]!.word;

describe("canonical silent mini-games", () => {
  it("trains the intro vowels and completes once without sound output", () => {
    const onComplete = vi.fn();
    render(<SyllableTrain lessonNumber={1} onComplete={onComplete} />);
    expect(screen.getByText("Encuentra esta sílaba:")).toBeInTheDocument();
    expect(screen.getByLabelText("Sílaba a")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Elegir sílaba a" }));
    expect(screen.getByText("¡Correcto!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByLabelText("Sílaba e")).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("builds words from the current consonant lesson's canonical word list", () => {
    const onComplete = vi.fn();
    render(<WordPuzzle lessonNumber={wordLesson.n} onComplete={onComplete} />);
    expect(screen.getByText("Forma la palabra con sus letras:")).toBeInTheDocument();
    for (const letter of Array.from(firstWord)) {
      const available = document.querySelectorAll<HTMLButtonElement>(`button[aria-label="Añadir letra ${letter}"]:not(:disabled)`);
      expect(available.length).toBeGreaterThan(0);
      fireEvent.click(available[0]!);
    }
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText("¡Palabra completa!")).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("matches memory cards by source-backed word and illustration pair", () => {
    const onComplete = vi.fn();
    render(<MemoryMatch lessonNumber={wordLesson.n} onComplete={onComplete} />);
    vi.useFakeTimers();
    const cards = screen.getAllByRole("button", { name: "Carta oculta" });
    const firstCard = cards[0]!;
    fireEvent.click(firstCard);
    let matched = false;
    for (const card of cards.slice(1)) {
      if (card.getAttribute("aria-label") === "Carta oculta") {
        if (!firstCard.getAttribute("aria-pressed") || firstCard.getAttribute("aria-pressed") === "false") fireEvent.click(firstCard);
        fireEvent.click(card);
        matched = /Parejas: 1 de \d+/.test(screen.getByRole("status").textContent ?? "");
        if (matched) break;
        act(() => vi.advanceTimersByTime(701));
      }
    }
    expect(matched).toBe(true);
    expect(screen.getByText(/Parejas: 1 de \d+/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("runs ten rapid syllable rounds and emits a single completion", () => {
    const onComplete = vi.fn();
    render(<RapidFire lessonNumber={1} onComplete={onComplete} />);
    for (let round = 0; round < 10; round += 1) {
      const target = screen.getByLabelText(/^Sílaba /).textContent!;
      fireEvent.click(screen.getByRole("button", { name: `Elegir ${target}` }));
      if (round < 9) fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    }
    expect(screen.getByText("Aciertos: 10 · 10 de 10")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows a source-backed empty state instead of inventing words", () => {
    render(<WordPuzzle lessonNumber={1} />);
    expect(screen.getByText("No hay palabras de esta lección para armar.")).toBeInTheDocument();
  });
});
