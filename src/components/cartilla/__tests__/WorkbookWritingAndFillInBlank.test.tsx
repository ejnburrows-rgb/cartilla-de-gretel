/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { InteractiveFillInBlank } from "../InteractivePageExercises";
import { WorkbookWritingResponse } from "../WorkbookWritingResponse";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: vi.fn(() => () => {}),
}));

vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

describe("Workbook Archetype 8 — Complete-word + Sentence Handwriting", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("InteractiveFillInBlank — Draggable & Tappable Syllable Placement", () => {
    const region = {
      id: "p22-fill",
      regionType: "fill-in-blank" as const,
      order: 1,
      fontRole: "body" as const,
      fillItems: [
        {
          wordBox: "amo",
          blank: "a ___",
          choices: [{ text: "mo", correct: true }, { text: "mu" }],
        },
      ],
    };

    it("renders choices and blank template correctly", () => {
      render(<InteractiveFillInBlank region={region} accent="#0f766e" />);
      expect(screen.getByText("amo")).toBeTruthy();
      expect(screen.getByText("a ___")).toBeTruthy();
      expect(screen.getByRole("button", { name: "mo" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "mu" })).toBeTruthy();
    });

    it("snaps correct syllable into blank on click/tap and marks item correct", () => {
      render(<InteractiveFillInBlank region={region} accent="#0f766e" />);
      const correctChoice = screen.getByRole("button", { name: "mo" });
      fireEvent.click(correctChoice);

      expect(correctChoice.className).toContain("graded-correct");
      expect(screen.getByText("a mo")).toBeTruthy();
      expect(screen.getByText("Completado")).toBeTruthy();
    });

    it("provides gentle wrong feedback on incorrect syllable pick", () => {
      render(<InteractiveFillInBlank region={region} accent="#0f766e" />);
      const wrongChoice = screen.getByRole("button", { name: "mu" });
      fireEvent.click(wrongChoice);

      expect(wrongChoice.className).toContain("is-retry");
    });
  });

  describe("WorkbookWritingResponse — Typed Handwriting Lines + Optional Freehand", () => {
    it("defaults to typed mode on digital handwriting lines with explicit Listo button", () => {
      render(<WorkbookWritingResponse pageNumber={22} interactive prompt="Mis oraciones" />);

      expect(screen.getByText("Mis oraciones")).toBeTruthy();
      expect(screen.getByRole("button", { name: /Teclado/i }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: /Mano alzada/i }).getAttribute("aria-pressed")).toBe("false");
      expect(screen.getByRole("textbox", { name: "Escribe tus oraciones" })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Listo/i })).toBeTruthy();
    });

    it("allows typing on digital lines and completes explicitly via Listo button", () => {
      render(<WorkbookWritingResponse pageNumber={22} interactive />);
      const textarea = screen.getByRole("textbox", { name: "Escribe tus oraciones" }) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Mi oración." } });
      expect(textarea.value).toBe("Mi oración.");

      const listoBtn = screen.getByRole("button", { name: /Listo/i });
      fireEvent.click(listoBtn);

      expect(screen.getByRole("button", { name: /Completado/i })).toBeTruthy();
    });

    it("switches to optional freehand mode and preserves typed text in storage", () => {
      const { unmount } = render(<WorkbookWritingResponse pageNumber={22} interactive />);
      const textarea = screen.getByRole("textbox", { name: "Escribe tus oraciones" }) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Mi oracion escrita." } });

      const freehandBtn = screen.getByRole("button", { name: /Mano alzada/i });
      fireEvent.click(freehandBtn);

      expect(screen.getByLabelText("Área para escribir a mano alzada")).toBeTruthy();

      // Switch back to typed mode
      const typedBtn = screen.getByRole("button", { name: /Teclado/i });
      fireEvent.click(typedBtn);

      const restoredTextarea = screen.getByRole("textbox", { name: "Escribe tus oraciones" }) as HTMLTextAreaElement;
      expect(restoredTextarea.value).toBe("Mi oracion escrita.");

      unmount();
    });
  });
});
