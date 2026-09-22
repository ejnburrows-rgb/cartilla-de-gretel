import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

describe("GretelPresence page-by-page guidance", () => {
  it("shows and speaks the revealed page instruction through the live avatar", async () => {
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
    });

    expect(
      (await screen.findByRole("status", {}, { timeout: 1200 })).textContent,
    ).toBe("Encierra en un círculo la vocal O.");
  });
});
