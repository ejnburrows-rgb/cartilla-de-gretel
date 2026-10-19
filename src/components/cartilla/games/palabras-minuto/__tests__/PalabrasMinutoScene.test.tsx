import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PalabrasMinutoScene } from "../PalabrasMinutoScene";
import { PALABRAS_MINUTO_M } from "../palabras-minuto-m";
import { recordEvent } from "@/lib/student-session";

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
});
