/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { PianoPronunciation } from "../PianoPronunciation";

// --- Microphone: the piano's own listening hook, driven by the test --------
type Listen = { onFinal: (t: string) => void; onInterim?: (t: string) => void };
let lastListen: Listen | null = null;
let mockStatus: "idle" | "starting" | "listening" | "hearing" = "idle";
let mockProblem: string | null = null;
let mockProcessing: "on-device" | "browser-service" | "unknown" = "unknown";
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockCancel = vi.fn();

vi.mock("@/hooks/usePianoListening", () => ({
  usePianoListening: (options: Listen) => {
    lastListen = options;
    return {
      supported: true,
      status: mockStatus,
      problem: mockProblem,
      processing: mockProcessing,
      start: mockStart,
      stop: mockStop,
      cancel: mockCancel,
    };
  },
}));

const mockPlayNote = vi.fn();
const mockPlayCorrectChord = vi.fn();
const mockPlayWrongBuzz = vi.fn();

vi.mock("@/lib/piano-audio", () => ({
  playNote: (...args: unknown[]) => mockPlayNote(...args),
  playCorrectChord: (...args: unknown[]) => mockPlayCorrectChord(...args),
  playWrongBuzz: (...args: unknown[]) => mockPlayWrongBuzz(...args),
  NOTE_FREQS: {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23,
    G: 392.0,
    A: 440.0,
    B: 493.88,
    C5: 523.25,
  },
}));

const mockSpeak = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/speak", () => ({
  speak: (s: string) => mockSpeak(s),
}));

vi.mock("@/lib/picture-vocabulary", () => ({
  approvedPictureRecording: () => undefined,
}));

const mockRecordEvent = vi.fn();
vi.mock("@/lib/student-session", () => ({
  recordEvent: (...args: unknown[]) => mockRecordEvent(...args),
}));

const mockGretelSpeak = vi.fn().mockResolvedValue(undefined);
vi.mock("@/components/gretel/GretelLiveAvatar", async () => {
  const ReactModule = await import("react");
  return {
    GretelLiveAvatar: ReactModule.forwardRef(function FakeGretel(_props: unknown, ref) {
      ReactModule.useImperativeHandle(ref, () => ({
        speakMessage: mockGretelSpeak,
        cancel: vi.fn(),
      }));
      return ReactModule.createElement("div", { "data-testid": "fake-gretel" });
    }),
  };
});

const SAPO = [{ word: "sapo", syllables: ["sa", "po"] }];
const TWO_WORDS = [
  { word: "sapo", syllables: ["sa", "po"] },
  { word: "masa", syllables: ["ma", "sa"] },
];

function hear(transcript: string) {
  act(() => {
    lastListen?.onFinal(transcript);
  });
}

function keyState(index: number) {
  return screen
    .getByTestId(`piano-key-${index}`)
    .closest("[data-key-state]")
    ?.getAttribute("data-key-state");
}

describe("PianoPronunciation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    lastListen = null;
    mockProcessing = "unknown";
    mockStatus = "idle";
    mockProblem = null;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("Completion timer lifecycle", () => {
    it("runs onComplete once after 2000ms when all syllables are completed", () => {
      const onComplete = vi.fn();
      render(<PianoPronunciation syllables={["ma"]} onComplete={onComplete} />);

      hear("ma");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(onComplete).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);

      // Hearing it again never celebrates or completes a second time.
      hear("ma");
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
    });

    it("does NOT run onComplete after unmount if unmounted during 2000ms delay", () => {
      const onComplete = vi.fn();
      const { unmount } = render(<PianoPronunciation syllables={["ma"]} onComplete={onComplete} />);
      hear("ma");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      unmount();
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("does NOT run onComplete for previous attempt if syllables prop changes during 2000ms delay", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <PianoPronunciation syllables={["ma"]} onComplete={onComplete} />,
      );
      hear("ma");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      rerender(<PianoPronunciation syllables={["pa", "pe"]} onComplete={onComplete} />);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(onComplete).not.toHaveBeenCalled();
      // The new item starts fresh and the microphone was released.
      expect(keyState(0)).toBe("next");
      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe("Word mode (Sapo = SA–PO)", () => {
    it("turns SA green, keeps it green, then completes on PO with one sparkle and one Gretel message", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} lessonId="lesson-9" />);
      expect(keyState(0)).toBe("next");
      expect(keyState(1)).toBe("pending");

      hear("sa");
      expect(keyState(0)).toBe("confirmed");
      expect(keyState(1)).toBe("next");
      expect(
        screen.getByRole("button", { name: "Tecla sa, lista" }).getAttribute("aria-pressed"),
      ).toBe("true");
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();

      hear("pa"); // wrong: ignored, SA stays green, no buzzer
      expect(keyState(0)).toBe("confirmed");
      expect(keyState(1)).toBe("next");

      hear("po");
      expect(keyState(1)).toBe("confirmed");
      expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
      expect(screen.getByTestId("piano-message").textContent).toContain("¡Muy bien!");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      expect(mockPlayWrongBuzz).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(mockGretelSpeak).toHaveBeenCalledTimes(1);
      // Only the outcome is recorded — no transcript or audio.
      expect(mockRecordEvent).toHaveBeenCalledTimes(1);
      const payload = JSON.stringify(mockRecordEvent.mock.calls[0]);
      expect(payload).not.toMatch(/transcript|audio|blob/i);
    });

    it("never confirms a key from words that merely contain the syllable", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      for (const wrong of ["casa", "papo", "sopa", "esa", "pasó", "masa"]) hear(wrong);
      expect(keyState(0)).toBe("next");
      expect(keyState(1)).toBe("pending");
      expect(mockPlayCorrectChord).not.toHaveBeenCalled();
      expect(mockPlayWrongBuzz).not.toHaveBeenCalled();
    });

    it("moves to the next verified word and celebrates it separately", () => {
      render(<PianoPronunciation syllables={["sa"]} words={TWO_WORDS} />);
      hear("sapo");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByTestId("piano-next"));
      expect(screen.getByTestId("piano-key-0").textContent).toContain("ma");
      expect(keyState(0)).toBe("next");
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
      hear("masa");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(2);
    });

    it("does not start the microphone while an example is playing", async () => {
      let finishSpeech: () => void = () => {};
      mockSpeak.mockImplementationOnce(
        () => new Promise<void>((resolve) => (finishSpeech = resolve)),
      );
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      await act(async () => {
        fireEvent.click(screen.getByTestId("piano-escuchar"));
      });
      expect(mockCancel).toHaveBeenCalled();
      expect((screen.getByTestId("piano-mic") as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(screen.getByTestId("piano-mic"));
      expect(mockStart).not.toHaveBeenCalled();
      await act(async () => {
        finishSpeech();
      });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect((screen.getByTestId("piano-mic") as HTMLButtonElement).disabled).toBe(false);
      fireEvent.click(screen.getByTestId("piano-mic"));
      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it("offers touch mode when the microphone is denied, confirming keys only in order", () => {
      mockProblem = "denied";
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      expect(screen.getByTestId("piano-message").textContent).toMatch(/permiso/);
      fireEvent.click(screen.getByTestId("piano-key-1")); // out of order: plays only
      expect(keyState(1)).toBe("pending");
      fireEvent.click(screen.getByTestId("piano-key-0"));
      expect(keyState(0)).toBe("confirmed");
      fireEvent.click(screen.getByTestId("piano-key-1"));
      expect(keyState(1)).toBe("confirmed");
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
    });
  });

  describe("Privacy note matches where the voice is processed", () => {
    it("never claims on-device recognition unless the browser confirmed it", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      const note = screen.getByTestId("piano-privacy").textContent ?? "";
      expect(note).toContain("La Cartilla no graba ni guarda la voz.");
      expect(note).toMatch(/puede enviarla por internet/);
      expect(note).not.toMatch(/en este dispositivo/);
    });

    it("says the voice stays on the device only when on-device recognition is available", () => {
      mockProcessing = "on-device";
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      const note = screen.getByTestId("piano-privacy").textContent ?? "";
      expect(note).toMatch(/en este dispositivo, sin enviarla/);
      expect(note).not.toMatch(/internet/);
    });
  });

  describe("Native keyboard navigation and accessibility", () => {
    it("renders separate native buttons for piano key and Escuchar action without nested interactive elements", () => {
      render(<PianoPronunciation syllables={["ma", "me"]} />);
      const keyBtn = screen.getByRole("button", { name: /^Tecla ma,/ });
      const listenBtn = screen.getByRole("button", { name: "Escuchar ma" });
      expect(keyBtn.tagName).toBe("BUTTON");
      expect(keyBtn.getAttribute("type")).toBe("button");
      expect(keyBtn.className).toMatch(/focus-visible:ring-/);
      expect(listenBtn.tagName).toBe("BUTTON");
      expect(listenBtn.getAttribute("type")).toBe("button");
      expect(keyBtn.contains(listenBtn)).toBe(false);
      expect(listenBtn.contains(keyBtn)).toBe(false);
    });

    it("activates piano key button via click (native Enter / Space)", async () => {
      render(<PianoPronunciation syllables={["ma", "me"]} />);
      const keyBtn = screen.getByRole("button", { name: /^Tecla ma,/ });
      await act(async () => {
        fireEvent.click(keyBtn);
      });
      expect(mockPlayNote).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith("ma");
      await act(async () => {
        fireEvent.click(keyBtn);
      });
      expect(mockPlayNote).toHaveBeenCalledTimes(2);
    });

    it("activates separate Escuchar button without double-triggering key button", async () => {
      render(<PianoPronunciation syllables={["ma"]} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Escuchar ma" }));
      });
      expect(mockPlayNote).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith("ma");
    });
  });
});
