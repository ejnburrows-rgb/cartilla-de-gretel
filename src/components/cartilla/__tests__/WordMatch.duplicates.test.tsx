import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WordMatch } from "../Ejercicios";
import { recordEvent } from "@/lib/student-session";

vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ play: vi.fn(), playingText: "" }),
}));

vi.mock("@/lib/student-session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/student-session")>();
  return {
    ...actual,
    recordEvent: vi.fn(),
  };
});

describe("WordMatch duplicate resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks completion securely via index allowing duplicates to complete identically", async () => {
    const words = [
      { word: "oso", illustrationSrc: "fake-art.webp" },
      { word: "ojo", illustrationSrc: "fake-art.webp" },
      { word: "oso", illustrationSrc: "fake-art.webp" },
    ];

    render(<WordMatch words={words} color="#123456" lessonId="synthetic-lesson" />);

    let pairs = [0, 1, 2];
    let matchedPictureIndices = new Set<number>();

    for (let textIdx of pairs) {
      // Find the text button using our deterministic order (0, 1, 2 mapping to items)
      // The text column buttons are rendered sequentially over `items` and have no aria-label
      const tButton = screen.getAllByRole("button").filter(b => b.textContent && ["oso", "ojo"].includes(b.textContent) && !b.getAttribute('aria-label'))[textIdx];

      // Click text button
      await act(async () => {
        fireEvent.click(tButton);
      });

      // Try picture buttons until one matches
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        if (matchedPictureIndices.has(pIdx)) continue;

        const pButton = screen.getAllByRole("button").filter(b => b.getAttribute('aria-label') && b.getAttribute('aria-label')!.includes('Dibujo de'))[pIdx];

        await act(async () => {
          fireEvent.click(pButton);
        });

        // Check if the text button became disabled (meaning a match occurred)
        if (tButton.hasAttribute('disabled')) {
          matchedPictureIndices.add(pIdx);
          break;
        }

        // Wait, if it didn't match, we have to re-click the text button because clicking a wrong picture resets `picked`
        if (!tButton.hasAttribute('disabled')) {
          await act(async () => {
            fireEvent.click(tButton);
          });
        }
      }
    }

    // Check if they are disabled now
    const remainingTextButtons = screen.queryAllByRole("button").filter(b => b.textContent && ["oso", "ojo"].includes(b.textContent) && !b.hasAttribute('disabled') && !b.getAttribute('aria-label'));
    expect(remainingTextButtons.length).toBe(0);

    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({ score: 3 }));
  });
});
