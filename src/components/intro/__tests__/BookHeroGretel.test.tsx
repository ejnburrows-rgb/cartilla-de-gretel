/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { BookHeroGretel, GRETEL_HERO_SCENE } from "../BookHeroGretel";

vi.mock("@/lib/gretel-voice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gretel-voice")>();
  return {
    ...actual,
    speakAsGretel: vi.fn(() => Promise.resolve()),
    cancelGretelSpeech: vi.fn(),
    isGretelVoiceMuted: () => true,
  };
});

vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
  onGretelEvent: () => () => {},
}));

afterEach(() => cleanup());

describe("BookHeroGretel — real GretelPresence (not static swap)", () => {
  it("embeds GretelPresence system with data-sticker=false", () => {
    render(<BookHeroGretel size="md" autoIntro={false} />);
    const frame = screen.getByTestId("book-hero-gretel-frame");
    expect(frame.getAttribute("data-sticker")).toBe("false");
    expect(frame.getAttribute("data-gretel-system")).toBe("presence");

    const scene = frame.querySelector(".book-hero-gretel__scene");
    expect(scene?.getAttribute("src")).toBe(GRETEL_HERO_SCENE);

    // Real presence host (not a mislabeled garden-only frame)
    const host = screen.getByTestId("book-hero-gretel");
    expect(host.getAttribute("data-gretel-system")).toBe("presence");
    expect(host.getAttribute("data-sticker")).toBe("false");
    expect(screen.getByTestId("gretel-live-avatar")).toBeTruthy();
  });

  it("grounds the figure with frame matte + vignette", () => {
    const { container } = render(<BookHeroGretel size="lg" autoIntro={false} />);
    expect(container.querySelector(".book-hero-gretel__frame")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__ground")).toBeTruthy();
    expect(container.querySelector(".book-hero-gretel__vignette")).toBeTruthy();
  });
});
