import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SoundSearch } from "../SoundSearch";
import "@testing-library/jest-dom";

vi.mock("@/lib/gretel-voice", () => ({
  speakAsGretel: vi.fn(),
}));

vi.mock("@/components/living/LivingIllustration", () => ({
  LivingIllustration: ({ alt }: { alt: string }) => <span>img_{alt}</span>,
}));

describe("SoundSearch reset behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const words1 = [
    { word: "manzana", illustrationSrc: "/img1.jpg" },
    { word: "mesa", illustrationSrc: "/img2.jpg" },
    { word: "sol", illustrationSrc: "/img3.jpg" },
  ];

  const words2 = [
    { word: "perro", illustrationSrc: "/img4.jpg" },
    { word: "pato", illustrationSrc: "/img5.jpg" },
    { word: "luna", illustrationSrc: "/img6.jpg" },
  ];

  it("resets selections and completion state when content changes", async () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <SoundSearch targetSound="m" words={words1} color="#000" onComplete={onComplete} />,
    );

    // Complete the first search ("m")
    fireEvent.click(screen.getByText("manzana"));
    fireEvent.click(screen.getByText("mesa"));

    expect(onComplete).toHaveBeenCalledTimes(1);

    // Change the content to "p"
    rerender(<SoundSearch targetSound="p" words={words2} color="#000" onComplete={onComplete} />);

    // We expect state to reset, meaning onComplete shouldn't have been called a second time yet
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Check that we can complete the second search ("p")
    fireEvent.click(screen.getByText("perro"));
    fireEvent.click(screen.getByText("pato"));

    // Expected: onComplete called again (total 2 times)
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
