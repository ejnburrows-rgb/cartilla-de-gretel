/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SyllableTapGame } from "../SyllableTapGame";

vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ play: vi.fn(), isAvailable: () => false }),
}));
vi.mock("@/lib/piano-audio", () => ({ playCorrectChord: vi.fn(), playWrongBuzz: vi.fn() }));

describe("SyllableTapGame audio policy", () => {
  it("switches to a reading activity without showing a fake sound control", () => {
    render(<SyllableTapGame syllables={["ma", "me"]} color="#123456" />);

    expect(screen.getByRole("heading", { name: "Lee y elige" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /escuchar/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ma" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "me" })).toBeEnabled();
  });
});
