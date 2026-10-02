/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { BookHeroGretel } from "../BookHeroGretel";

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

describe("BookHeroGretel — approved Gretel only", () => {
  it("embeds the shared Gretel presence system", () => {
    render(<BookHeroGretel size="md" autoIntro={false} />);
    const frame = screen.getByTestId("book-hero-gretel-frame");
    expect(frame.getAttribute("data-sticker")).toBe("false");
    expect(frame.getAttribute("data-gretel-system")).toBe("presence");
    expect(screen.getByTestId("book-hero-gretel")).toBeTruthy();
    expect(screen.getByTestId("gretel-live-avatar")).toBeTruthy();
  });

  it("does not render a garden or generated scene plate", () => {
    const { container } = render(<BookHeroGretel size="lg" autoIntro={false} />);
    expect(container.querySelector(".book-hero-gretel__scene")).toBeNull();
    expect(container.innerHTML).not.toContain("/art/hd/garden/");
    expect(container.innerHTML).not.toContain("/art/generated/");
  });
});
