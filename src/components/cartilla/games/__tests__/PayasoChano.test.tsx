import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PayasoChano } from "../PayasoChano";

// Mock the Audio API since JSDOM doesn't support play() returning a promise
beforeEach(() => {
  class MockAudio {
    src = "";
    play = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    constructor(src?: string) {
      if (src) this.src = src;
    }
  }
  window.Audio = MockAudio as unknown as typeof Audio;
});
// Mock matchMedia for DndKit
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

const mockContent = {
  id: "test-content",
  type: "payaso-chano" as const,
  letter: "g",
  instructions: ["Escucha y arma la palabra."],
  words: [
    { word: "gato", syllables: ["ga", "to"], audioUrl: "/audio/ga.mp3" },
    { word: "perro", syllables: ["pe", "rro"], audioUrl: "/audio/pe.mp3" },
    { word: "vaca", syllables: ["va", "ca"], audioUrl: "/audio/va.mp3" },
  ],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe("PayasoChano completion logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const solveWord = async (syllables: string[]) => {
    for (let slotIdx = 0; slotIdx < syllables.length; slotIdx++) {
      const syllable = syllables[slotIdx];
      // Find the tray item matching the syllable. It has role "button" and text of the syllable.
      // DndKit renders tray items, we simulate pressing enter to select and enter on the slot.
      const trayItems = screen.getAllByRole("button");
      const trayItem = trayItems.find((t) => t.textContent === syllable && t.getAttribute("aria-disabled") !== "true");
      if (!trayItem) {
        throw new Error(`Syllable ${syllable} not found in tray`);
      }
      
      fireEvent.keyDown(trayItem, { key: "Enter", code: "Enter" });
      
      // Select the slot
      const slots = screen.getAllByRole("generic").filter(el => el.getAttribute("aria-label")?.startsWith("Casilla "));
      // Slot index matches slotIdx
      fireEvent.keyDown(slots[slotIdx], { key: "Enter", code: "Enter" });
    }
    
    // Check
    const checkBtn = screen.getByRole("button", { name: /Sombrilla: comprobar la palabra/i });
    fireEvent.click(checkBtn);
  };

  it("does not earn completion by skipping to the final word", async () => {
    const onComplete = vi.fn();
    render(<PayasoChano content={mockContent} onComplete={onComplete} />, { wrapper });

    // Skip to the final word
    const nextBtn = screen.getByRole("button", { name: /Chano: escuchar la próxima palabra/i });
    fireEvent.click(nextBtn); // Word 2
    fireEvent.click(nextBtn); // Word 3 (final)

    // Solve final word
    await solveWord(mockContent.words[2].syllables);

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("earns completion exactly once when all words are completed", async () => {
    const onComplete = vi.fn();
    render(<PayasoChano content={mockContent} onComplete={onComplete} />, { wrapper });

    // Solve Word 1
    await solveWord(mockContent.words[0].syllables);

    const nextBtn = screen.getByRole("button", { name: /Chano: escuchar la próxima palabra/i });
    fireEvent.click(nextBtn);

    // Solve Word 2
    await solveWord(mockContent.words[1].syllables);
    
    fireEvent.click(nextBtn);

    // Solve Word 3
    await solveWord(mockContent.words[2].syllables);

    // Assert completed
    expect(onComplete).toHaveBeenCalledTimes(1);
    
    // Even if we go next and do it again (or it just re-evaluates), onComplete shouldn't fire again.
    // The game allows "nextWord" to loop back to start.
    fireEvent.click(nextBtn);
    
    // It shouldn't fire again
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not allow repeated checking while incorrect answer feedback is active", async () => {
    vi.useFakeTimers();

    const onComplete = vi.fn();
    render(<PayasoChano content={mockContent} onComplete={onComplete} />, { wrapper });

    // Word 1: "gato", syllables: ["ga", "to"]
    // Fill incorrectly (swap them: "to", "ga")
    const incorrectSyllables = ["to", "ga"];

    for (let slotIdx = 0; slotIdx < incorrectSyllables.length; slotIdx++) {
      const syllable = incorrectSyllables[slotIdx];
      const trayItems = screen.getAllByRole("button");
      const trayItem = trayItems.find((t) => t.textContent === syllable && t.getAttribute("aria-disabled") !== "true");
      if (!trayItem) throw new Error(`Syllable ${syllable} not found in tray`);
      
      fireEvent.keyDown(trayItem, { key: "Enter", code: "Enter" });
      const slots = screen.getAllByRole("generic").filter(el => el.getAttribute("aria-label")?.startsWith("Casilla "));
      fireEvent.keyDown(slots[slotIdx], { key: "Enter", code: "Enter" });
    }

    const checkBtn = screen.getByRole("button", { name: /Sombrilla: comprobar la palabra/i });
    
    // First press - grades as wrong and disables the button during feedback
    fireEvent.click(checkBtn);
    expect(checkBtn.hasAttribute("disabled")).toBe(true);

    // Second press during feedback window (should not do anything, button is disabled)
    fireEvent.click(checkBtn);
    
    // Check that we are still in feedback window
    expect(checkBtn.hasAttribute("disabled")).toBe(true);

    // Fast-forward feedback time
    act(() => {
      vi.advanceTimersByTime(3600);
    });

    // Wrong attempt has been erased; checking stays disabled until refilled.
    expect(checkBtn.hasAttribute("disabled")).toBe(true);

    // Reset tiles
    const resetBtn = screen.getByRole("button", { name: /Resorte: colocar las sílabas en su lugar otra vez/i });
    fireEvent.click(resetBtn);

    // Now solve correctly to make sure the attempt count and completion are in a valid state
    await solveWord(mockContent.words[0].syllables);

    const nextBtn = screen.getByRole("button", { name: /Chano: escuchar la próxima palabra/i });
    fireEvent.click(nextBtn);

    // Solve Word 2
    await solveWord(mockContent.words[1].syllables);
    fireEvent.click(nextBtn);

    // Solve Word 3
    await solveWord(mockContent.words[2].syllables);

    // Verify completion logic fired exactly once, confirming the extra clicks didn't trigger phantom completions
    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
