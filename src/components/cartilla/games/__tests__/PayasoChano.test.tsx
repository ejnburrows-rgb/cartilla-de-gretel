import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  type: "payaso_chano" as const,
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
});
