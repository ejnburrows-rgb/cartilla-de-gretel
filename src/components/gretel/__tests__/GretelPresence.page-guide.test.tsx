import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GretelPresence } from "../GretelPresence";
import { gretelEvent } from "@/lib/gretel-bus";

vi.mock("@/lib/gretel-voice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gretel-voice")>();
  return {
    ...actual,
    speakAsGretel: vi.fn(() => Promise.resolve()),
    cancelGretelSpeech: vi.fn(),
    isGretelVoiceMuted: () => false,
  };
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GretelPresence page-by-page guidance", () => {
  it("shows and speaks the revealed page instruction through the live avatar", async () => {
    vi.useFakeTimers();
    render(
      <GretelPresence
        lesson={{ n: 2, kind: "vowel", title: "La vocal O", vowel: "o" }}
        autoIntro={false}
        bookMode
        hideChrome
      />,
    );

    act(() => {
      gretelEvent("page:revealed", {
        text: "Encierra en un círculo la vocal O.",
        pageNumber: 8,
      });
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByRole("status").textContent).toBe(
      "Encierra en un círculo la vocal O.",
    );
  });
});
