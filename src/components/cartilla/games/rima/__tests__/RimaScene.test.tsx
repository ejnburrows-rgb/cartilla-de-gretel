import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RimaScene, rhymePairs } from "../RimaScene";
import { RIMA_P } from "@/content/games/core-games";
vi.mock("@/lib/piano-audio", () => ({
  playUiTick: vi.fn(),
  playNote: vi.fn(),
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: false }),
  });
  Element.prototype.animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  })) as unknown as typeof Element.prototype.animate;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});
afterEach(() => {
  vi.useRealTimers();
});
describe("approved Rima scene", () => {
  it("keeps main's exact syllable-pair algorithm", () => {
    expect(rhymePairs(RIMA_P.words).map((p) => p.map((w) => w.word))).toEqual([
      ["papi", "Pepi"],
      ["Pipo", "mapo"],
    ]);
  });
  it("shows the exact four approved word cards with a fullscreen portal", () => {
    const view = render(<RimaScene content={RIMA_P} />);
    for (const word of ["Mami", "mímame", "amo", "ámame"])
      expect(screen.getByRole("button", { name: `Palabra ${word}` })).toBeInTheDocument();
    expect(document.querySelector("[data-rima-scene]")?.parentElement).toBe(document.body);
    view.unmount();
  });
  it("rejects wrong placements, accepts the poem, retains P rounds, resets", async () => {
    vi.useFakeTimers();
    const view = render(<RimaScene content={RIMA_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Palabra amo" }));
    fireEvent.click(screen.getByRole("button", { name: /Espacio 1:/ }));
    await act(async () => {});
    expect(screen.getByRole("status")).toHaveTextContent("Intenta otra vez");
    act(() => vi.advanceTimersByTime(700));
    for (const [i, word] of ["Mami", "amo", "mímame", "ámame"].entries()) {
      fireEvent.click(screen.getByRole("button", { name: `Palabra ${word}` }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`Espacio ${i + 1}:`) }));
      await act(async () => {});
      act(() => vi.advanceTimersByTime(700));
    }
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/ }));
    expect(screen.getByText("papi")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Palabra Pipo" }));
    expect(screen.getByRole("status")).toHaveTextContent("Busca la misma sílaba final");
    act(() => vi.advanceTimersByTime(700));
    fireEvent.click(screen.getByRole("button", { name: "Palabra Pepi" }));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Pipo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Palabra mapo" }));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("2 de 2 rimas encontradas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Repetir la rima" }));
    expect(screen.getByRole("button", { name: /Espacio 1: vacío/ })).toBeInTheDocument();
    view.unmount();
  });
  it("never invokes speech or substitutes unapproved audio", () => {
    const view = render(<RimaScene content={RIMA_P} />);
    fireEvent.click(screen.getByRole("button", { name: "Escuchar la rima" }));
    expect(screen.getByRole("status")).toHaveTextContent("Audio pendiente");
    expect(document.querySelector("audio")).toBeNull();
    view.unmount();
  });
});
