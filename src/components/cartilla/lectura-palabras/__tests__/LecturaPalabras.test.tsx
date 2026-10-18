// LecturaPalabras.test.tsx — focused verification for the "Lectura de palabras"
// activity (Task 11, letter Mm). Guards the two hard source-fidelity rules:
//   1. No invented syllables: the section title ends at "con las sílabas:" and
//      the UI shows labeled placeholders where the source list is missing.
//   2. Verbatim content: instructions, word labels, the drawings' source
//      arrangement, and the per-minute grid come from the teacher DOCX files
//      word-for-word, in order, casing included.
// Plus the interaction contract from the source page: tap drawing → labeled
// "Audio pendiente" (no synthesis), place on the right word → "muy bien" and
// the drawing stays, wrong word → "trátalo de nuevo" and it can be retried.
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LecturaPalabras } from "../LecturaPalabras";
import { LECTURA_M, LECTURA_LETTERS } from "@/content/lectura-palabras/lectura-letras";

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/games/wordAudio", () => ({
  playWord: vi.fn(),
}));

const recordEvent = await import("@/lib/student-session").then((m) => m.recordEvent);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("lectura-letras content (source fidelity)", () => {
  it("keeps the source title verbatim and marks the syllable list missing", () => {
    expect(LECTURA_M.syllablesSection.title).toBe("Vamos a leer palabras con las sílabas:");
    expect(LECTURA_M.syllablesSection.missingSyllables).toBe(true);
    expect(LECTURA_M.syllablesSection.placeholderCount).toBe(4);
  });

  it("carries the teacher file's three instructions verbatim", () => {
    const lines = LECTURA_M.syllablesSection.instructions;
    expect(lines[0]).toBe("Haz click en el dibujo, escucha la palabra");
    expect(lines[1]).toBe("Arrastra el dibujo hasta la palabra que representa el dibujo");
    expect(lines[2]).toContain("muy bien");
    expect(lines[2]).toContain("trátalo de nuevo");
  });

  it("uses the source page's word order and drawing arrangement", () => {
    expect(LECTURA_M.syllablesSection.words.map((w) => w.word)).toEqual([
      "Mumi",
      "mamá",
      "Meme",
      "amo",
      "mima",
    ]);
    expect(LECTURA_M.syllablesSection.drawingOrder).toEqual([
      "mamá",
      "amo",
      "mima",
      "Meme",
      "Mumi",
    ]);
  });

  it("carries the per-minute title, instruction, and all 18 words verbatim in order", () => {
    const m = LECTURA_M.perMinuteSection;
    expect(m.title).toBe("¿Cuántas palabras puedo leer por minuto?");
    expect(m.instruction).toBe("Lee cada palabra. Antes de comenzar ajusta el cronómetro.");
    expect(m.words).toEqual([
      "mamá",
      "mami",
      "Mimo",
      "mío",
      "me",
      "mímame",
      "Momi",
      "Meme",
      "mi",
      "Meme",
      "ama",
      "mía",
      "Mumi",
      "Memo",
      "mima",
      "amo",
      "Mimí",
      "ámame",
    ]);
    expect(m.words.length).toBe(18);
  });

  it("offers only Mm and never invents letter content", () => {
    expect(LECTURA_LETTERS[0]).toEqual({ letter: "Mm", available: true });
    expect(LECTURA_LETTERS.filter((l) => l.available)).toHaveLength(1);
  });
});

describe("LecturaPalabras activity (letter Mm)", () => {
  it("renders the source title and syllable placeholders, never invented syllables", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    expect(screen.getByText("Vamos a leer palabras con las sílabas:")).toBeInTheDocument();
    const placeholders = screen.getAllByText("Pendiente");
    expect(placeholders).toHaveLength(4);
    // No invented syllable tray: the missing list is never filled in with
    // guesses like "ma / mo / mu" tiles. ("me" and "mi" do appear, but only
    // as real words inside the per-minute grid from the teacher file.)
    expect(screen.queryByText("ma")).toBeNull();
    expect(screen.queryByText("mo")).toBeNull();
    expect(screen.queryByText("mu")).toBeNull();
  });

  it("shows the labeled audio-pending state when a drawing is tapped", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Dibujo de mamá" }));
    expect(
      screen.getByText("Audio pendiente — la voz de Gretel se graba después."),
    ).toBeInTheDocument();
  });

  it("keeps the drawing with the word and shows 'muy bien' on a correct match", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Dibujo de mamá" }));
    fireEvent.click(screen.getByRole("button", { name: "Palabra mamá" }));
    expect(screen.getByText("muy bien")).toBeInTheDocument();
    // The drawing stays with its word.
    expect(screen.getByRole("button", { name: "Palabra mamá (completa)" })).toBeInTheDocument();
  });

  it("returns the drawing with 'trátalo de nuevo' on a wrong match, and allows retry", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Dibujo de mamá" }));
    fireEvent.click(screen.getByRole("button", { name: "Palabra Mumi" }));
    expect(screen.getByText("trátalo de nuevo")).toBeInTheDocument();
    // Retry unlimited: the same drawing can be matched to the right word after failing.
    fireEvent.click(screen.getByRole("button", { name: "Dibujo de mamá" }));
    fireEvent.click(screen.getByRole("button", { name: "Palabra mamá" }));
    expect(screen.getByText("muy bien")).toBeInTheDocument();
  });

  it("completes all five words and records the exercise once", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    for (const word of LECTURA_M.syllablesSection.words.map((w) => w.word)) {
      fireEvent.click(screen.getByRole("button", { name: `Dibujo de ${word}` }));
      fireEvent.click(screen.getByRole("button", { name: `Palabra ${word}` }));
    }
    expect(screen.getByText("¡Todas las palabras tienen su dibujo!")).toBeInTheDocument();
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "lectura-de-palabras:Mm",
        kind: "exercise",
        score: 5,
        total: 5,
      }),
    );
  });

  it("supports drag-and-drop placement like the source instructs", () => {
    const { container } = render(<LecturaPalabras activity={LECTURA_M} />);
    const drawing = screen.getByRole("button", { name: "Dibujo de amo" });
    expect(drawing).toHaveAttribute("draggable", "true");
    const dropzone = screen.getByRole("button", { name: "Palabra amo" });
    // Simulate the HTML5 drop contract used by the component.
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    fireEvent(drawing, new Event("dragStart", { bubbles: true }));
    (dropEvent as unknown as { dataTransfer: { getData: () => string } }).dataTransfer = {
      getData: () => "amo",
    };
    act(() => {
      dropzone.dispatchEvent(dropEvent);
    });
    expect(screen.getByText("muy bien")).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it("renders the per-minute section with the source's adjustable chronometer", () => {
    render(<LecturaPalabras activity={LECTURA_M} />);
    expect(screen.getByText("¿Cuántas palabras puedo leer por minuto?")).toBeInTheDocument();
    expect(
      screen.getByText("Lee cada palabra. Antes de comenzar ajusta el cronómetro."),
    ).toBeInTheDocument();
    expect(screen.getByText("60s")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir 10 segundos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar 10 segundos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Empezar" })).toBeInTheDocument();
    // The source's 18-word grid, all visible.
    expect(screen.getAllByText("Meme").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("ámame")).toBeInTheDocument();
  });
});
