import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameInstructions } from "../GameInstructions";
import { GameShell } from "../GameShell";
import { RecordedGameFrame } from "../RecordedGameFrame";
import { AuthorGameTemplate } from "../AuthorGameTemplate";
import { RhymeGame, MariposasGame } from "../CoreGames";
import { SyllableBuilder } from "../SyllableBuilder";
import { MARIPOSAS_P, RIMA_P } from "@/content/games/core-games";
import { SILABAS_VOCAL_O } from "@/content/games/syllable-builder-pilot";
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
vi.mock("@/lib/games/wordAudio", () => ({
  GAME_INSTRUCTION_RECORDINGS: {},
  playInstruction: vi.fn(),
  playWord: vi.fn(),
  recordedWordUrl: vi.fn(),
  stopGameAudio: vi.fn(),
}));
afterEach(cleanup);
describe("truthful game availability", () => {
  it("collapses instructions and marks unavailable recordings instead of silent play controls", () => {
    render(
      <GameShell content={RIMA_P}>
        <button>Respuesta</button>
      </GameShell>,
    );
    expect(document.querySelector("details")?.open).toBe(false);
    expect(
      screen
        .getAllByRole("button", { name: /Audio pendiente/, hidden: true })
        .every((b) => (b as HTMLButtonElement).disabled),
    ).toBe(true);
    expect(document.querySelector("[data-game-activity]")?.textContent).toContain("Respuesta");
  });
  it("enables an exact supplied instruction recording", () => {
    render(<GameInstructions content={{ ...RIMA_P, instructionAudioUrls: ["/existing.mp3"] }} />);
    expect(
      (
        screen.getByRole("button", {
          name: "Escuchar instrucción 1",
          hidden: true,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("does not celebrate or offer a no-op reset with zero rhymes", () => {
    render(<RhymeGame content={{ ...RIMA_P, words: [] }} />);
    expect(screen.getByRole("status").textContent).toContain("Rimas pendientes");
    expect(screen.queryByText(/0 de 0/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Repetir" })).toBeNull();
  });
  it("offers a next action when the author template has no source-backed rhyme", () => {
    render(<AuthorGameTemplate mechanic="lectura-rima" lesson={2} />);
    expect(screen.getByRole("status").textContent).toContain("Elige otra letra u otro juego");
  });
  it("uses a truthful butterfly placeholder, not a font-dependent glyph", () => {
    render(<MariposasGame content={MARIPOSAS_P} />);
    expect(screen.getByText(/Ilustración de mariposa pendiente/)).toBeDefined();
    expect(document.body.textContent).not.toContain("🦋");
  });
  it("does not render a loadable legacy picture without current owner approval", () => {
    render(<SyllableBuilder content={SILABAS_VOCAL_O} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Ilustración de «oso» pendiente");
  });
  it("preserves excluded Chano shell rather than changing its layout", () => {
    render(
      <GameShell content={{ ...RIMA_P, type: "payaso-chano", id: "payaso-chano-ss" }}>
        <p>Chano</p>
      </GameShell>,
    );
    expect(document.querySelector("details")).toBeNull();
    expect(document.querySelector("main")?.className).toContain("min-h-screen");
    expect(screen.getByLabelText("Instrucciones del juego").tagName).toBe("HEADER");
  });
  it("explains an unavailable word recording without blocking written work", () => {
    render(
      <RecordedGameFrame content={MARIPOSAS_P}>
        <button aria-label="Escuchar papi">▷</button>
        <button>pa</button>
      </RecordedGameFrame>,
    );
    act(() =>
      window.dispatchEvent(
        new CustomEvent("cartilla:recorded-speech-status", {
          detail: { status: "missing-recording", key: "papi", source: "game" },
        }),
      ),
    );
    expect(screen.getByRole("status").textContent).toContain("Audio pendiente para «papi»");
    expect((screen.getByRole("button", { name: "pa" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
