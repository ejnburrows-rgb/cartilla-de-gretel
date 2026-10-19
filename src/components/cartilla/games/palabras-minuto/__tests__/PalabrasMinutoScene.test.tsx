import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PalabrasMinutoScene } from "../PalabrasMinutoScene";
import { PALABRAS_MINUTO_M } from "../palabras-minuto-m";
import { recordEvent } from "@/lib/student-session";
import { MockSpeechRecognition } from "@/test/setup";

vi.mock("@/lib/student-session", () => ({ recordEvent: vi.fn() }));

describe("PalabrasMinutoScene", () => {
  let play: ReturnType<typeof vi.spyOn>;
  let pause: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  it("starts the soft music loop after the first tap and the toggle pauses it", () => {
    render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Apagar la música" }));
    expect(pause).toHaveBeenCalled();
    expect(localStorage.getItem("cartilla:ppm:music")).toBe("off");
  });

  it("stays silent when the app is muted", () => {
    localStorage.setItem("cartilla:audio:muted", "true");
    render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
    expect(play).not.toHaveBeenCalled();
  });

  it("shows the 18 words of the set and no Gretel mascot on the screen", () => {
    render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
    expect(document.querySelectorAll(".ppm-cell")).toHaveLength(18);
    expect(screen.getByText("ámame")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "La Cartilla de Gretel" })).toBeInTheDocument();
  });

  it("marks words in order, flags an out-of-order tap and does not count it", () => {
    render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
    const cells = document.querySelectorAll<HTMLButtonElement>(".ppm-cell");
    fireEvent.click(cells[5]);
    expect(cells[5]).toHaveAttribute("data-wrong", "true");
    expect(cells[0]).toHaveAttribute("data-state", "current");
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveAttribute("data-state", "done");
    expect(cells[1]).toHaveAttribute("data-state", "current");
  });

  it("finishes the list exactly once with the full score", () => {
    render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
    document.querySelectorAll<HTMLButtonElement>(".ppm-cell").forEach((c) => fireEvent.click(c));
    fireEvent.click(screen.getByRole("button", { name: "Terminé la lista" }));
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({ score: 18, total: 18 }));
  });

  describe("microphone", () => {
    beforeEach(() => {
      MockSpeechRecognition.clearInstances();
      vi.stubGlobal("webkitSpeechRecognition", MockSpeechRecognition);
    });

    it("marks the spoken word green on its own and moves to the next one", async () => {
      render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
      fireEvent.click(screen.getByRole("button", { name: "Leer en voz alta con el micrófono" }));
      fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
      const rec = MockSpeechRecognition.getLastInstance()!;
      await act(async () => {
        await new Promise((r) => setTimeout(r, 5));
      });
      expect(rec.lang).toMatch(/^es/);
      act(() => rec.triggerResult("mama", false));
      const cells = document.querySelectorAll(".ppm-cell");
      expect(cells[0]).toHaveAttribute("data-state", "done");
      expect(cells[1]).toHaveAttribute("data-state", "current");
      act(() => rec.triggerResult("casa"));
      expect(cells[1]).toHaveAttribute("data-state", "current");
    });

    it("falls back to tapping with a note when the microphone is denied", async () => {
      render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
      fireEvent.click(screen.getByRole("button", { name: "Leer en voz alta con el micrófono" }));
      const rec = MockSpeechRecognition.getLastInstance()!;
      act(() => rec.onerror?.({ error: "not-allowed" }));
      expect(screen.getByText(/No pude usar el micrófono/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Empezar 1 minuto" }));
      const cells = document.querySelectorAll<HTMLButtonElement>(".ppm-cell");
      fireEvent.click(cells[0]);
      expect(cells[0]).toHaveAttribute("data-state", "done");
    });

    it("tells the student when the browser has no speech recognition", () => {
      vi.stubGlobal("webkitSpeechRecognition", undefined);
      vi.stubGlobal("SpeechRecognition", undefined);
      render(<PalabrasMinutoScene content={PALABRAS_MINUTO_M} />);
      fireEvent.click(screen.getByRole("button", { name: "Leer en voz alta con el micrófono" }));
      expect(screen.getByText(/no entiende la voz/)).toBeInTheDocument();
    });
  });
});
