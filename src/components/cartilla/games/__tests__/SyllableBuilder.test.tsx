import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SyllableBuilder } from "../SyllableBuilder";
import { recordEvent } from "@/lib/student-session";
import type { GameContent } from "@/lib/games/gameContent";

// Mock matchMedia to prevent errors from usePrefersReducedMotion
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
  getStudentSession: vi.fn(() => null),
}));

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

const mockContent = {
  id: "test-lesson",
  type: "payaso-chano" as const,
  letter: "m",
  instructions: ["Forma la palabra."],
  tiles: ["ma", "me", "mi"],
  words: [
    { word: "mama", syllables: ["ma", "ma"] }
  ]
} as GameContent;

describe("SyllableBuilder completion logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits exercise completion, not lesson_completed, when the last word is completed", async () => {
    render(<SyllableBuilder content={mockContent} />);

    // To solve the word: The target syllables are ["ma", "ma"].
    // The component provides tray buttons and slot buttons.
    // Tap the tray buttons to fill the slots.
    
    // Find the tray buttons for "ma"
    const trayButtons = screen.getAllByRole("button").filter(btn => btn.getAttribute("aria-label")?.startsWith("Sílaba ma"));
    
    // Tap twice to fill the two slots
    fireEvent.pointerDown(trayButtons[0]);
    fireEvent.pointerUp(trayButtons[0]);
    
    // Since one was taken, we might need to find the remaining one
    const trayButtonsAfterFirst = screen.getAllByRole("button").filter(btn => btn.getAttribute("aria-label")?.startsWith("Sílaba ma"));
    fireEvent.pointerDown(trayButtonsAfterFirst[0]);
    fireEvent.pointerUp(trayButtonsAfterFirst[0]);

    // Now click 'Comprobar'
    const checkBtn = screen.getByRole("button", { name: /comprobar/i });
    fireEvent.click(checkBtn);

    // After 'Comprobar', the next button ('Terminar' because it's the last word) appears
    const terminarBtn = await screen.findByRole("button", { name: /terminar/i });
    
    // Clear recordEvent mock to cleanly track the onNext logic
    vi.mocked(recordEvent).mockClear();
    
    // Click 'Terminar'
    fireEvent.click(terminarBtn);

    // verify that recordEvent was called correctly
    expect(recordEvent).toHaveBeenCalledWith({
      lessonId: "test-lesson",
      kind: "exercise",
      meta: {
        exercise: "syllable-builder",
        completed: true
      }
    });
    
    // verify that recordEvent was not called with lesson_completed
    expect(recordEvent).not.toHaveBeenCalledWith(expect.objectContaining({ kind: "lesson_completed" }));
  });
});
