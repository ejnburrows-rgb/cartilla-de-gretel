import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Index } from "@/routes/index";

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  static oscillatorsStarted = 0;
  static waveforms: string[] = [];
  resume() {}
  createGain() {
    const param = {
      value: 1,
      setValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
    };
    return { gain: param, connect: (d: unknown) => d };
  }
  createOscillator() {
    const osc = {
      type: "sine",
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: (d: unknown) => d,
      start: () => {
        FakeAudioContext.oscillatorsStarted++;
        FakeAudioContext.waveforms.push(osc.type);
      },
      stop: () => {},
    };
    return osc;
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { buffer: null, connect: (d: unknown) => d, start: () => {} };
  }
  createBiquadFilter() {
    return { type: "bandpass", frequency: { value: 0 }, Q: { value: 0 }, connect: (d: unknown) => d };
  }
}

describe("Bubble Organ gameplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeAudioContext.oscillatorsStarted = 0;
    FakeAudioContext.waveforms = [];
    vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak: vi.fn() });
    vi.stubGlobal("SpeechSynthesisUtterance", class { lang = ""; rate = 1; constructor(public text: string) {} });
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
  const tap = (syllable: string) => {
    const pipe = screen.getAllByRole("button", { name: `tubo ${syllable}` })[0];
    if (!pipe) throw new Error("Pipe missing");
    fireEvent.click(pipe);
  };
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
  const resetSound = () => {
    FakeAudioContext.oscillatorsStarted = 0;
    FakeAudioContext.waveforms = [];
  };

  it("two ma taps form mamá and activate the reading target", () => {
    const { container } = render(<Index />);
    tap("ma"); tap("ma"); advance(3000);
    expect(screen.getByRole("button", { name: "Explotar burbuja mamá" })).toBeDefined();
    expect(container.querySelector(".organ-word.formed")).not.toBeNull();
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({ text: "mamá", lang: "es-ES" }));
  });
  it.each(["ma", "me", "mi", "mo", "mu"])("pipe %s creates a poppable syllable", (syllable) => {
    render(<Index />); tap(syllable);
    fireEvent.click(screen.getByRole("button", { name: `Explotar burbuja ${syllable}` })); advance(500);
    expect(screen.queryByRole("button", { name: `Explotar burbuja ${syllable}` })).toBeNull();
  });
  it("tapping a pipe plays a tap toot, not a pop", () => {
    render(<Index />);
    tap("me");
    expect(FakeAudioContext.waveforms).toEqual(["triangle"]);
  });
  it("popping a bubble plays one pop bloop", () => {
    render(<Index />); tap("me");
    resetSound();
    fireEvent.click(screen.getByRole("button", { name: "Explotar burbuja me" }));
    advance(500);
    expect(FakeAudioContext.oscillatorsStarted).toBe(1);
    expect(FakeAudioContext.waveforms).toEqual(["sine"]);
  });
  it("popping a bubble early silences its scheduled auto-pop", () => {
    render(<Index />); tap("me");
    resetSound();
    fireEvent.click(screen.getByRole("button", { name: "Explotar burbuja me" }));
    advance(500);
    expect(FakeAudioContext.oscillatorsStarted).toBe(1);
    advance(6000);
    expect(FakeAudioContext.oscillatorsStarted).toBe(1);
  });
  it("forming mamá plays a richer merge chime than a single pop", () => {
    render(<Index />);
    tap("ma"); tap("ma");
    resetSound();
    advance(3000);
    expect(FakeAudioContext.oscillatorsStarted).toBe(4);
    expect(FakeAudioContext.waveforms.filter((w) => w === "sine")).toHaveLength(1);
    expect(FakeAudioContext.waveforms.filter((w) => w === "triangle")).toHaveLength(3);
  });
  it("popping a waiting ma prevents a phantom merge", () => {
    render(<Index />); tap("ma");
    fireEvent.click(screen.getByRole("button", { name: "Explotar burbuja ma" })); advance(1);
    tap("ma"); advance(3000);
    expect(screen.queryByRole("button", { name: "Explotar burbuja mamá" })).toBeNull();
  });
  it("Otra vez cancels a pending merge and permits immediate replay", () => {
    const { container } = render(<Index />); tap("ma"); tap("ma");
    fireEvent.click(screen.getByRole("button", { name: "Otra vez" })); advance(3000);
    expect(container.querySelector(".organ-word.formed")).toBeNull();
    expect(container.querySelectorAll(".organ-bubble")).toHaveLength(0);
    tap("ma"); tap("ma"); advance(3000);
    expect(screen.getByRole("button", { name: "Explotar burbuja mamá" })).toBeDefined();
  });
});