/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { PianoPronunciation, PIANO_DESIGN_STORAGE_KEY } from "../PianoPronunciation";
import { CONFIRMED_GREEN, GROUP_RED, GROUP_YELLOW } from "../piano/piano-keyboard";
import {
  FEEDBACK_GUARD_MS,
  RELEASE_AFTER_MS,
  TRY_AGAIN,
  WELL_DONE,
  YELLOW_AFTER_MS,
} from "../piano/usePianoGroups";
import { MELODY_STEP_MS, SPARKLE_MS } from "../piano/usePianoSession";

// --- Microphone: the piano's own listening hook, driven by the test --------
type Listen = {
  onFinal: (t: string) => void;
  onInterim?: (t: string) => void;
  onSound?: (active: boolean) => void;
};
let lastListen: Listen | null = null;
let mockStatus: "idle" | "starting" | "listening" | "hearing" = "idle";
let mockProblem: string | null = null;
let mockProcessing: "checking" | "on-device" | "unavailable" = "on-device";
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockCancel = vi.fn();

vi.mock("@/hooks/usePianoListening", () => ({
  usePianoListening: (options: Listen) => {
    lastListen = options;
    return {
      supported: mockProcessing === "on-device",
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

/** The microphone picks up sound (true) or the sound stops (false). */
function sound(active: boolean) {
  act(() => {
    lastListen?.onSound?.(active);
  });
}

function interim(transcript: string) {
  act(() => {
    lastListen?.onInterim?.(transcript);
  });
}

/** Let the piano finish its own spoken feedback before the child talks again. */
async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(FEEDBACK_GUARD_MS + 10);
  });
}

function groupState(group: number) {
  return screen.getByTestId(`piano-group-${group}`).getAttribute("data-group-state");
}

const PALETA = [{ word: "paleta", syllables: ["pa", "le", "ta"] }];

function keyState(index: number) {
  return screen
    .getByTestId(`piano-key-${index}`)
    .closest("[data-key-state]")
    ?.getAttribute("data-key-state");
}

function keyColor(index: number) {
  return screen.getByTestId(`piano-key-${index}`).style.getPropertyValue("--c");
}

function noteColor(index: number) {
  return screen.getByTestId(`piano-note-${index}`).style.getPropertyValue("--c");
}

describe.each([["piano"], ["cancionero"]] as const)("PianoPronunciation (%s design)", (design) => {
  beforeEach(() => {
    window.localStorage.setItem(PIANO_DESIGN_STORAGE_KEY, design);
    vi.useFakeTimers();
    vi.clearAllMocks();
    lastListen = null;
    mockProcessing = "on-device";
    mockStatus = "idle";
    mockProblem = null;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  /** Piano: syllable i lives on keys 3i..3i+2; Cancionero: one key each. */
  const k = (syllable: number) => (design === "piano" ? syllable * 3 : syllable);
  /** Say a whole word: syllable by syllable on the Piano, at once on the Cancionero. */
  async function sayWord(word: string, syllables: string[]) {
    if (design !== "piano") {
      hear(word);
      return;
    }
    for (const syllable of syllables) {
      hear(syllable);
      await settle();
    }
  }

  if (design === "piano") {
    describe("Nine keys, three groups of three", () => {
      it("shows nine keys; a two-syllable word uses two groups and leaves the third free", () => {
        render(<PianoPronunciation syllables={[]} words={SAPO} />);
        expect(screen.getAllByTestId(/^piano-key-/)).toHaveLength(9);
        expect(groupState(0)).toBe("next");
        expect(groupState(1)).toBe("pending");
        expect(groupState(2)).toBe("free");
        expect(screen.getByTestId("piano-key-6").getAttribute("data-key-state")).toBeNull();
      });

      it("sound presses key 1 red, the voice continuing presses key 2 yellow, recognition turns the group green", () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} lessonId="lesson-12" />);
        for (const key of [0, 1, 2]) expect(keyState(key)).toBe("next");

        sound(true); // the first noise
        expect(keyState(0)).toBe("red");
        expect(keyColor(0)).toBe(GROUP_RED);
        expect(keyState(1)).toBe("next");
        expect(keyState(2)).toBe("next");
        expect(groupState(1)).toBe("pending"); // only the current group reacts

        act(() => {
          vi.advanceTimersByTime(YELLOW_AFTER_MS);
        });
        expect(keyState(0)).toBe("red");
        expect(keyState(1)).toBe("yellow");
        expect(keyColor(1)).toBe(GROUP_YELLOW);
        expect(keyState(2)).toBe("next"); // green needs recognition
        expect(mockPlayNote).not.toHaveBeenCalled();

        hear("pa");
        for (const key of [0, 1, 2]) {
          expect(keyState(key)).toBe("confirmed");
          expect(keyColor(key)).toBe(CONFIRMED_GREEN);
        }
        expect(noteColor(0)).toBe(CONFIRMED_GREEN);
        expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
        expect(screen.getByTestId("piano-sparkle").getAttribute("data-sparkle-for")).toBe("0");
        expect(screen.getByTestId("piano-message").textContent).toContain(WELL_DONE);
        expect(mockSpeak).toHaveBeenCalledWith(WELL_DONE);
        // Next group is up; the finished one stays green.
        expect(groupState(1)).toBe("next");
        act(() => {
          vi.advanceTimersByTime(5000);
        });
        expect(screen.queryByTestId("piano-sparkle")).toBeNull();
        expect(keyColor(0)).toBe(CONFIRMED_GREEN);
        expect(keyColor(2)).toBe(CONFIRMED_GREEN);
      });

      it("recognizer text arriving presses red and yellow at once", () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        interim("pa");
        expect(keyState(0)).toBe("red");
        expect(keyState(1)).toBe("yellow");
        expect(keyState(2)).toBe("next");
      });

      it("wrong syllable: «Tratemos otra vez», only this group restarts, earlier groups stay green", async () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        hear("pa");
        await settle();
        mockSpeak.mockClear();
        mockPlayNote.mockClear();

        sound(true);
        act(() => {
          vi.advanceTimersByTime(YELLOW_AFTER_MS);
        });
        expect(keyState(3)).toBe("red");
        expect(keyState(4)).toBe("yellow");
        hear("pato");
        expect(screen.getByTestId("piano-message").textContent).toContain(TRY_AGAIN);
        expect(mockSpeak).toHaveBeenCalledWith(TRY_AGAIN);
        for (const key of [3, 4, 5]) expect(keyState(key)).toBe("next");
        for (const key of [0, 1, 2]) expect(keyState(key)).toBe("confirmed");
        expect(document.querySelector('[data-sparkle-for="1"]')).toBeNull();
        expect(mockPlayNote).not.toHaveBeenCalled();
        expect(mockPlayWrongBuzz).not.toHaveBeenCalled();

        await settle();
        hear("le");
        for (const key of [3, 4, 5]) expect(keyState(key)).toBe("confirmed");
        expect(groupState(2)).toBe("next");
      });

      it("sound alone never turns anything green, and the keys lift when it stops", () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        sound(true);
        act(() => {
          vi.advanceTimersByTime(10000);
        });
        expect(keyState(1)).toBe("yellow");
        expect(keyState(2)).toBe("next");
        sound(false);
        act(() => {
          vi.advanceTimersByTime(RELEASE_AFTER_MS);
        });
        for (const key of [0, 1, 2]) expect(keyState(key)).toBe("next");
        expect(screen.queryByTestId("piano-sparkle")).toBeNull();
        expect(mockPlayCorrectChord).not.toHaveBeenCalled();
      });

      it("one syllable at a time: the whole word or a containing word does not skip a group", () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        for (const wrong of ["paleta", "papa", "pala", "casa"]) hear(wrong);
        expect(groupState(0)).toBe("next");
        expect(keyColor(2)).not.toBe(CONFIRMED_GREEN);
      });

      it("ignores what the microphone hears while the piano says «¡Muy bien!»", async () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        hear("pa");
        hear("le"); // still speaking its own feedback: ignored
        sound(true);
        expect(groupState(1)).toBe("next");
        await settle();
        hear("le");
        expect(groupState(1)).toBe("confirmed");
      });

      it("finishing the third group celebrates once and records only the outcome", async () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} lessonId="lesson-12" />);
        await sayWord("paleta", ["pa", "le", "ta"]);
        expect(groupState(0)).toBe("confirmed");
        expect(groupState(1)).toBe("confirmed");
        expect(groupState(2)).toBe("confirmed");
        expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("piano-success")).toBeTruthy();
        act(() => {
          vi.advanceTimersByTime(700);
        });
        expect(mockGretelSpeak).toHaveBeenCalledTimes(1);
        expect(mockRecordEvent).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(mockRecordEvent.mock.calls[0])).not.toMatch(/transcript|audio|blob/i);
      });

      it("the switch chooses Palabras (book words) or Sílabas (lesson syllables, three at a time)", () => {
        render(<PianoPronunciation syllables={["pa", "pe", "pi", "po", "pu"]} words={PALETA} />);
        expect(screen.getByTestId("piano-mode-palabras").getAttribute("aria-pressed")).toBe("true");
        expect(screen.getByTestId("piano-note-1").textContent).toContain("le");
        fireEvent.click(screen.getByTestId("piano-mode-silabas"));
        expect(screen.getByTestId("piano-mode-silabas").getAttribute("aria-pressed")).toBe("true");
        expect(screen.getByTestId("piano-note-0").textContent).toContain("pa");
        expect(screen.getByTestId("piano-note-1").textContent).toContain("pe");
        expect(screen.getByTestId("piano-note-2").textContent).toContain("pi");
        expect(screen.getByText(/Ronda 1 de 2/)).toBeTruthy();
        expect(groupState(0)).toBe("next");
      });

      it("shows no switch when only one kind of practice exists", () => {
        render(<PianoPronunciation syllables={[]} words={PALETA} />);
        expect(screen.queryByTestId("piano-mode-silabas")).toBeNull();
      });
    });
  }

  it("renders the chosen design", () => {
    render(<PianoPronunciation syllables={["ma", "me"]} />);
    expect(document.querySelector(".piano-hablador")?.getAttribute("data-design")).toBe(design);
    expect(screen.getByTestId(`piano-design-${design}`).getAttribute("aria-pressed")).toBe("true");
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
    if (design === "cancionero") {
    it("turns SA green with one sparkle, keeps it green, then PO turns green with one sparkle and one Gretel message", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} lessonId="lesson-9" />);
      expect(keyState(0)).toBe("next");
      expect(keyState(1)).toBe("pending");
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
      expect(keyColor(0)).not.toBe(CONFIRMED_GREEN);

      hear("sa");
      expect(keyState(0)).toBe("confirmed");
      expect(keyState(1)).toBe("next");
      expect(keyColor(0)).toBe(CONFIRMED_GREEN);
      expect(noteColor(0)).toBe(CONFIRMED_GREEN);
      expect(keyColor(1)).not.toBe(CONFIRMED_GREEN);
      expect(screen.getByTestId("piano-key-0").tagName).toBe("SPAN");
      expect(screen.queryByRole("button", { name: /tecla sa/i })).toBeNull();
      // Exactly ONE small sparkle, on SA's key, and it goes away by itself.
      expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
      expect(screen.getByTestId("piano-sparkle").getAttribute("data-sparkle-for")).toBe("0");
      act(() => {
        vi.advanceTimersByTime(SPARKLE_MS);
      });
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
      expect(keyColor(0)).toBe(CONFIRMED_GREEN); // stays green

      hear("pa"); // wrong: ignored, SA stays green, no buzzer, no sparkle
      expect(keyState(0)).toBe("confirmed");
      expect(keyState(1)).toBe("next");
      expect(keyColor(0)).toBe(CONFIRMED_GREEN);
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();

      hear("po");
      expect(keyState(1)).toBe("confirmed");
      expect(keyColor(0)).toBe(CONFIRMED_GREEN);
      expect(keyColor(1)).toBe(CONFIRMED_GREEN);
      expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
      expect(screen.getByTestId("piano-sparkle").getAttribute("data-sparkle-for")).toBe("1");
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

    it("a whole word said at once gives each syllable its own single sparkle, never two at a time", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      hear("sapo");
      expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
      expect(screen.getByTestId("piano-sparkle").getAttribute("data-sparkle-for")).toBe("0");
      act(() => {
        vi.advanceTimersByTime(MELODY_STEP_MS);
      });
      expect(screen.getAllByTestId("piano-sparkle")).toHaveLength(1);
      expect(screen.getByTestId("piano-sparkle").getAttribute("data-sparkle-for")).toBe("1");
      act(() => {
        vi.advanceTimersByTime(SPARKLE_MS);
      });
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
      expect(keyColor(0)).toBe(CONFIRMED_GREEN);
      expect(keyColor(1)).toBe(CONFIRMED_GREEN);
    });
    }

    it("never confirms a key from words that merely contain the syllable", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      for (const wrong of ["casa", "papo", "sopa", "esa", "pasó", "masa"]) hear(wrong);
      expect(keyState(k(0))).toBe("next");
      expect(keyState(k(1))).toBe("pending");
      expect(mockPlayCorrectChord).not.toHaveBeenCalled();
      expect(mockPlayWrongBuzz).not.toHaveBeenCalled();
      // No fake recognition: no green, no sparkle.
      expect(keyColor(k(0) + (design === "piano" ? 2 : 0))).not.toBe(CONFIRMED_GREEN);
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
    });

    it("moves to the next verified word and celebrates it separately", async () => {
      render(<PianoPronunciation syllables={["sa"]} words={TWO_WORDS} />);
      await sayWord("sapo", ["sa", "po"]);
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByTestId("piano-next"));
      expect(screen.getByTestId("piano-key-0").getAttribute("data-key-state")).toBe(
        "next",
      );
      expect(keyState(0)).toBe("next");
      act(() => {
        vi.advanceTimersByTime(SPARKLE_MS);
      });
      expect(screen.queryByTestId("piano-sparkle")).toBeNull();
      await sayWord("masa", ["ma", "sa"]);
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

    it("never confirms piano keys when the microphone is denied", () => {
      mockProblem = "denied";
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      expect(screen.getByTestId("piano-message").textContent).toMatch(/permiso/);
      expect(screen.queryByTestId("piano-touch-mode")).toBeNull();
      fireEvent.click(screen.getByTestId("piano-key-0"));
      fireEvent.keyDown(window, { key: "a" });
      expect(keyState(k(0))).toBe("next");
      expect(keyState(k(1))).toBe("pending");
      expect(mockPlayCorrectChord).not.toHaveBeenCalled();
    });

  });

  describe("Microphone only with confirmed on-device recognition", () => {
    it("on-device: the note never mentions an online service being used", () => {
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      const note = screen.getByTestId("piano-privacy").textContent ?? "";
      expect(note).toContain("La Cartilla no graba ni guarda la voz.");
      expect(note).toMatch(/reconocimiento de voz de este dispositivo/);
      expect(note).toMatch(/nunca usa un servicio de voz por internet/);
      expect((screen.getByTestId("piano-mic") as HTMLButtonElement).disabled).toBe(false);
    });

    it("while checking: microphone stays off and nothing claims on-device", () => {
      mockProcessing = "checking";
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      expect((screen.getByTestId("piano-mic") as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(screen.getByTestId("piano-mic"));
      expect(mockStart).not.toHaveBeenCalled();
      expect(screen.getByTestId("piano-privacy").textContent).toMatch(/Comprobando/);
    });

    it("unavailable: no false progress and no touch fallback", () => {
      mockProcessing = "unavailable";
      mockProblem = "no-local";
      render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
      expect(screen.getByTestId("piano-message").textContent).toMatch(
        /no tiene reconocimiento local compatible/,
      );
      expect(screen.getByTestId("piano-privacy").textContent).toMatch(
        /micrófono está apagado y no se usa ningún servicio de voz por internet/,
      );
      const mic = screen.getByTestId("piano-mic") as HTMLButtonElement;
      expect(mic.disabled).toBe(true);
      expect(screen.queryByTestId("piano-touch-mode")).toBeNull();
      fireEvent.click(screen.getByTestId("piano-key-0"));
      fireEvent.click(screen.getByTestId(`piano-key-${k(1)}`));
      expect(keyState(k(0))).toBe("next");
      expect(keyState(k(1))).toBe("pending");
      expect(mockPlayCorrectChord).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });

  });

  describe("Native keyboard navigation and accessibility", () => {
    it("keeps piano keys noninteractive and the Escuchar control accessible", () => {
      render(<PianoPronunciation syllables={["ma", "me"]} />);
      const keyIndicator = screen.getByTestId("piano-key-0");
      const listenBtn = screen.getByRole("button", { name: "Escuchar ma" });
      expect(keyIndicator.tagName).toBe("SPAN");
      expect(keyIndicator.getAttribute("aria-hidden")).toBe("true");
      expect(listenBtn.tagName).toBe("BUTTON");
      expect(listenBtn.getAttribute("type")).toBe("button");
      expect(screen.queryByRole("button", { name: /tecla ma/i })).toBeNull();
      fireEvent.click(keyIndicator);
      fireEvent.keyDown(window, { key: "a" });
      expect(mockPlayNote).not.toHaveBeenCalled();
      expect(keyState(0)).toBe("next");
    });

    it("activates separate Escuchar button without double-triggering key button", async () => {
      render(<PianoPronunciation syllables={["ma"]} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Escuchar ma" }));
      });
      expect(mockPlayNote).not.toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith("ma");
    });
  });
});

describe("PianoPronunciation design choice", () => {
  const originalMatchMedia = window.matchMedia;
  function mockScreen(phone: boolean) {
    window.matchMedia = ((query: string) => ({
      matches: phone && query.includes("max-width"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  }
  const designShown = () => document.querySelector(".piano-hablador")?.getAttribute("data-design");

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessing = "on-device";
    mockStatus = "idle";
    mockProblem = null;
    window.localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
    window.localStorage.clear();
  });

  it("uses the Piano on laptops and tablets", () => {
    mockScreen(false);
    render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
    expect(designShown()).toBe("piano");
  });

  it("uses the Cancionero on phones", () => {
    mockScreen(true);
    render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
    expect(designShown()).toBe("cancionero");
  });

  it("the switch changes the design and remembers it on this device", () => {
    mockScreen(true);
    const { unmount } = render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
    fireEvent.click(screen.getByTestId("piano-design-piano"));
    expect(designShown()).toBe("piano");
    expect(screen.getByTestId("piano-design-piano").getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem(PIANO_DESIGN_STORAGE_KEY)).toBe("piano");
    unmount();
    render(<PianoPronunciation syllables={["sa"]} words={SAPO} />);
    expect(designShown()).toBe("piano");
  });

  it("content with more than five syllables always uses the full Piano", () => {
    mockScreen(true);
    window.localStorage.setItem(PIANO_DESIGN_STORAGE_KEY, "cancionero");
    render(<PianoPronunciation syllables={["a", "e", "i", "o", "u", "ma"]} />);
    expect(designShown()).toBe("piano");
    expect(screen.queryByTestId("piano-design-cancionero")).toBeNull();
    expect(screen.getAllByTestId(/^piano-key-/)).toHaveLength(9);
    expect(screen.queryByRole("button", { name: /^Tecla / })).toBeNull();
  });
});
