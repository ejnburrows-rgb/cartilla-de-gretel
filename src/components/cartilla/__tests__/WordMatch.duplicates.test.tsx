import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WordMatch } from "../Ejercicios";
import { gretelEvent } from "@/lib/gretel-bus";
import { useAudio } from "@/lib/audio-engine";

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));

vi.mock("@/lib/audio-engine", () => ({
  useAudio: vi.fn(() => ({ play: vi.fn(), playingText: null })),
}));

describe("WordMatch with duplicate words", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows matching duplicate words (e.g. clicking 1st 'oso' word and 2nd 'oso' picture)", () => {
    const words = [
      { word: "oso", wordId: "w1", illustrations: [], illustrationSrc: "/oso1.png" },
      { word: "ojo", wordId: "w2", illustrations: [], illustrationSrc: "/ojo.png" },
      { word: "oso", wordId: "w3", illustrations: [], illustrationSrc: "/oso2.png" },
    ];

    render(<WordMatch words={words as any} color="#000000" />);

    // Get the word buttons (left side). They just have text.
    const wordButtons = screen.getAllByRole("button", { name: (text) => text === "oso" || text === "ojo" });
    const osoWordButtons = wordButtons.filter((btn) => btn.textContent === "oso");
    expect(osoWordButtons.length).toBe(2);

    // Get the picture buttons (right side). They have aria-label like "Dibujo de oso".
    const pictureButtons = screen.getAllByRole("button", { name: /^Dibujo de/ });
    const osoPictureButtons = pictureButtons.filter((btn) => btn.getAttribute("aria-label")?.includes("oso"));
    expect(osoPictureButtons.length).toBe(2);

    // Let's click the FIRST 'oso' word
    fireEvent.click(osoWordButtons[0]);

    // Now, let's click the SECOND 'oso' picture.
    // They are shuffled in the UI, but it doesn't matter which one is which,
    // since both strings are "oso" and the fix allows cross-matching.
    // However, the test specifically asks to "select occurrence 1, click the target of occurrence 2".
    // Since we don't know the shuffle order, we just click ANY oso picture. Both should work.
    // If it works, gretelEvent("answer:correct") will be called.

    // To specifically test occurrence 2, we can look at the images if needed, or just click the first one we find.
    // Wait, let's verify it works with the picture that has the illustrationSrc "/oso2.png"
    // The button contains the img.
    const targetOsoPictureBtn = osoPictureButtons.find(btn => btn.innerHTML.includes("oso2.png"));

    expect(targetOsoPictureBtn).toBeDefined();

    fireEvent.click(targetOsoPictureBtn!);

    // It should have recorded answer:correct and NOT answer:wrong
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(gretelEvent).not.toHaveBeenCalledWith("answer:wrong");

    // Also, the first 'oso' word button and the target picture button should be disabled
    expect((osoWordButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect((targetOsoPictureBtn as HTMLButtonElement).disabled).toBe(true);
  });
});
