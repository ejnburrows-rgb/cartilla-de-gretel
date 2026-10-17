import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DragMatchPairs, Pair } from "../DragMatchPairs";

vi.mock("@/lib/piano-audio", () => ({
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

describe("DragMatchPairs Stability", () => {
  it("maintains state when pairs array reference changes but content is the same", async () => {
    const pairs1: Pair[] = [
      { word: "Oso", emoji: "🐻", illustrationSrc: "oso.png" },
      { word: "Sol", emoji: "🌞", illustrationSrc: "sol.png" },
    ];

    const onComplete = vi.fn();

    const { rerender } = render(<DragMatchPairs pairs={pairs1} onComplete={onComplete} />);

    // Make a match
    const osoWord = screen.getByText("Oso", { selector: "div" });
    const osoImg = screen.getByLabelText("Dibujo: Oso");

    await act(async () => {
      // Tap word then tap image (using simulated tap selection)
      osoWord.parentElement?.click();
    });

    await act(async () => {
      osoImg.click();
    });

    // Check if match was successful (Oso should be in the drop zone)
    expect(screen.getAllByText("Oso", { selector: "div.bg-emerald-500" }).length).toBeGreaterThan(
      0,
    );

    // Now re-render with a NEW array reference but same content
    const pairs2: Pair[] = [
      { word: "Oso", emoji: "🐻", illustrationSrc: "oso.png" },
      { word: "Sol", emoji: "🌞", illustrationSrc: "sol.png" },
    ];

    rerender(<DragMatchPairs pairs={pairs2} onComplete={onComplete} />);

    // Match should still exist!
    expect(screen.getAllByText("Oso", { selector: "div.bg-emerald-500" }).length).toBeGreaterThan(
      0,
    );

    // Test onComplete not triggered unnecessarily
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("resets state when pairs content actually changes", () => {
    const pairs1: Pair[] = [{ word: "Oso", emoji: "🐻", illustrationSrc: "oso.png" }];

    const { rerender } = render(<DragMatchPairs pairs={pairs1} />);
    expect(screen.getByText("Oso", { selector: "div" })).not.toBeNull();

    const pairs2: Pair[] = [{ word: "Luna", emoji: "🌙", illustrationSrc: "luna.png" }];

    rerender(<DragMatchPairs pairs={pairs2} />);
    expect(screen.queryByText("Oso", { selector: "div" })).toBeNull();
    expect(screen.getByText("Luna", { selector: "div" })).not.toBeNull();
  });
});
