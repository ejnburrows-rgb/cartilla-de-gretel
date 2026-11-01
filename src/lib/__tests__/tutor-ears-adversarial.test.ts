/**
 * @vitest-environment jsdom
 *
 * tutor-ears-adversarial.test.ts — EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * Milestone M1: Speech Recognition & Audio Pipeline (R1) Verification
 *
 * Exhaustively stress-tests:
 * Scope 1: Noise tokens ([unk], unk, uppercase/lowercase, bursts) do not terminate the window; subsequent speech captured.
 * Scope 2: Pure noise during 6s window resolves with [unk] (NOISE intent) and not no-speech.
 * Scope 3: Zero speech / noise resolves with no-speech (SILENCE intent in brain).
 * Scope 4: Short vowel partials (a, e, i, o, u, uppercase, accented) rescued on timeout.
 * Scope 5: track.onended mid-attempt immediately aborts with no-microphone without waiting for timeout.
 * Scope 6: AudioContext suspended resumption and error handling.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VoskEars,
  type VoskAudioContextLike,
  type VoskModelLike,
  type VoskResultMessage,
} from "../tutor-ears-vosk";
import { classifyIntent } from "../tutor-intent";
import { tutorItems } from "../tutor-content";
import { createBrainState, reduce } from "../tutor-brain";

// ---------------------------------------------------------------------------
// Mock vosk-browser module
// ---------------------------------------------------------------------------
const defaultModels = vi.hoisted(() => ({
  models: [] as {
    worker: { terminate: ReturnType<typeof vi.fn> };
    handlers: Record<
      string,
      (message: { event: string; result?: boolean; error?: string }) => void
    >;
  }[],
}));

vi.mock("vosk-browser", () => ({
  Model: class {
    ready = true;
    worker = { terminate: vi.fn() };
    handlers: Record<
      string,
      (message: { event: string; result?: boolean; error?: string }) => void
    > = {};
    constructor() {
      defaultModels.models.push(this);
    }
    on(
      event: string,
      listener: (message: { event: string; result?: boolean; error?: string }) => void,
    ) {
      this.handlers[event] = listener;
    }
    terminate() {}
  },
}));

// ---------------------------------------------------------------------------
// Fakes for Recognizer, AudioContext, and MediaStream Tracks
// ---------------------------------------------------------------------------
class FakeVoskRecognizer {
  static instances: FakeVoskRecognizer[] = [];
  readonly id = `rec-${FakeVoskRecognizer.instances.length}`;
  grammar?: string;
  sampleRate: number;
  private readonly listeners = new Map<string, (message: VoskResultMessage) => void>();
  acceptWaveform = vi.fn();
  retrieveFinalResult = vi.fn();
  remove = vi.fn();

  constructor(sampleRate: number, grammar?: string) {
    this.sampleRate = sampleRate;
    this.grammar = grammar;
    FakeVoskRecognizer.instances.push(this);
  }

  on(
    event: "result" | "partialresult" | "error",
    listener: (message: VoskResultMessage) => void,
  ): void {
    this.listeners.set(event, listener);
  }

  emit(message: VoskResultMessage): void {
    this.listeners.get(message.event)?.(message);
  }
}

function makeFakeModel(): {
  model: VoskModelLike;
  createModel: (modelUrl: string) => Promise<VoskModelLike>;
} {
  const model = {
    ready: true,
    setLogLevel: vi.fn(),
    terminate: vi.fn(),
    KaldiRecognizer: FakeVoskRecognizer,
  } as unknown as VoskModelLike;
  const createModel = vi.fn(async () => model);
  return { model, createModel };
}

function makeFakeAudioContext(
  options: {
    state?: AudioContextState;
    resume?: () => Promise<void>;
  } = {},
): () => VoskAudioContextLike {
  const create = () =>
    ({
      sampleRate: 16000,
      state: options.state ?? "running",
      resume: options.resume ?? vi.fn(() => Promise.resolve()),
      destination: {} as AudioDestinationNode,
      createScriptProcessor: vi.fn(
        () =>
          ({
            onaudioprocess: null,
            connect: vi.fn(),
            disconnect: vi.fn(),
          }) as unknown as ScriptProcessorNode,
      ),
      createMediaStreamSource: vi.fn(
        () => ({ connect: vi.fn(), disconnect: vi.fn() }) as unknown as MediaStreamAudioSourceNode,
      ),
      createGain: vi.fn(
        () =>
          ({
            gain: { value: 1 },
            connect: vi.fn(),
            disconnect: vi.fn(),
          }) as unknown as GainNode,
      ),
      close: vi.fn(() => Promise.resolve()),
    }) as unknown as VoskAudioContextLike;
  return create;
}

interface FakeTrack {
  stop: ReturnType<typeof vi.fn>;
  addEventListener: (event: string, fn: (e: unknown) => void) => void;
  removeEventListener: (event: string, fn: (e: unknown) => void) => void;
  dispatchEvent: (event: { type: string }) => boolean;
  onended: (() => void) | null;
  _fireEnded: () => void;
}

function makeFakeTracks(count = 2): FakeTrack[] {
  return Array.from({ length: count }, () => {
    const listeners: Record<string, ((event: unknown) => void)[]> = {};
    const track: FakeTrack = {
      stop: vi.fn(),
      addEventListener: vi.fn((event: string, fn: (e: unknown) => void) => {
        listeners[event] = listeners[event] ?? [];
        listeners[event].push(fn);
      }),
      removeEventListener: vi.fn((event: string, fn: (e: unknown) => void) => {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter((l) => l !== fn);
      }),
      dispatchEvent: vi.fn((event: { type: string }) => {
        listeners[event.type]?.forEach((l) => l(event));
        return true;
      }),
      onended: null,
      _fireEnded() {
        this.dispatchEvent({ type: "ended" });
        this.onended?.();
      },
    };
    return track;
  });
}

describe("Milestone M1 Empirical Stress Harness — VoskEars Adversarial Review", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;
  let tracks: ReturnType<typeof makeFakeTracks>;

  const makeEars = (
    audioCtxOptions: { state?: AudioContextState; resume?: () => Promise<void> } = {},
  ) => {
    const { createModel } = makeFakeModel();
    const createAudioContext = makeFakeAudioContext(audioCtxOptions);
    return {
      createModel,
      createAudioContext,
      ears: new VoskEars({
        deps: { createModel, createAudioContext },
      }),
    };
  };

  beforeEach(() => {
    FakeVoskRecognizer.instances = [];
    tracks = makeFakeTracks();
    getUserMedia = vi.fn(async () => ({
      getTracks: () => tracks,
      getAudioTracks: () => tracks,
    }));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
  });

  // =========================================================================
  // SCOPE 1: Noise tokens ([unk], unk, case variations) & Window Survival
  // =========================================================================
  describe("Scope 1: Noise token resilience and valid speech capture", () => {
    it("1.1 survives lowercase [unk] noise token and captures subsequent valid speech", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Noise arrives
      recognizer.emit({ event: "result", result: { text: "[unk]" } });
      expect(recognizer.remove).not.toHaveBeenCalled();

      // Speech arrives
      recognizer.emit({ event: "result", result: { text: "oso" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
    });

    it("1.2 survives uppercase [UNK] noise token and captures subsequent valid speech", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["avión"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "[UNK]" } });
      expect(recognizer.remove).not.toHaveBeenCalled();

      recognizer.emit({ event: "result", result: { text: "avión" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "avión", alternatives: [] });
    });

    it("1.3 survives bare 'unk', 'UNK', and '[Unk]' variations without terminating", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["árbol"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "unk" } });
      recognizer.emit({ event: "result", result: { text: "UNK" } });
      recognizer.emit({ event: "result", result: { text: "[Unk]" } });
      expect(recognizer.remove).not.toHaveBeenCalled();

      recognizer.emit({ event: "result", result: { text: "árbol" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "árbol", alternatives: [] });
    });

    it("1.4 survives multi-token noise bursts '[unk] [unk]' and '[UNK] unk'", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["iglú"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "[unk] [unk]" } });
      recognizer.emit({ event: "result", result: { text: "[UNK] unk" } });
      expect(recognizer.remove).not.toHaveBeenCalled();

      recognizer.emit({ event: "result", result: { text: "iglú" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "iglú", alternatives: [] });
    });

    it("1.5 strips noise tokens when mixed with valid speech in single result", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["uña"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Result with mixed noise and word
      recognizer.emit({ event: "result", result: { text: "[unk] uña [UNK]" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "uña", alternatives: [] });
    });

    it("1.6 preserves Spanish carrier words accompanied by noise tokens", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["el", "oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "[unk] el oso" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "el oso", alternatives: [] });
    });
  });

  // =========================================================================
  // SCOPE 2: Pure noise during 6s window resolves with [unk] (NOISE intent)
  // =========================================================================
  describe("Scope 2: Pure noise resolution and NOISE intent mapping", () => {
    it("2.1 resolves with [unk] when only lowercase [unk] was heard before timeout", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "[unk]" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "[unk]", alternatives: [] });
    });

    it("2.2 resolves with [unk] when only bare unk / UNK was heard before timeout", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "UNK" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "[unk]", alternatives: [] });
    });

    it("2.3 maps [unk] transcript to NOISE intent in tutor-intent engine", () => {
      const targetItem = tutorItems.find((item) => item.text === "oso")!;
      const intent = classifyIntent("[unk]", targetItem, tutorItems);
      expect(intent).toBe("NOISE");
    });

    it("2.4 verifies brain reducer handles [unk] with NOISE response (not silence-nudge)", () => {
      const state = createBrainState({
        lesson: 1,
        sessionId: "test-sess",
        items: tutorItems.slice(0, 5),
      });
      const activeState = { ...state, started: true, phase: "LISTEN" as const, capturing: true };
      const rng = () => 0.5;

      const { state: nextState, effects } = reduce(
        activeState,
        { type: "HEARD", transcript: "[unk]", alternatives: [] },
        rng,
      );

      // Verify phase stays in LISTEN
      expect(nextState.phase).toBe("LISTEN");
      // Verify silenceNudges was NOT incremented
      expect(nextState.silenceNudges).toBe(0);
      // Verify an effect was generated to play the noise response
      expect(effects.some((e) => e.type === "playLine")).toBe(true);
    });
  });

  // =========================================================================
  // SCOPE 3: Zero speech/noise resolves with no-speech
  // =========================================================================
  describe("Scope 3: Absolute silence and empty transcript handling", () => {
    it("3.1 resolves with no-speech when window expires without any recognizer events", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      // No events emitted
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-speech" });
    });

    it("3.2 resolves with no-speech when only whitespace or empty text is emitted", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "result", result: { text: "   " } });
      recognizer.emit({ event: "partialresult", result: { partial: "\t\n  " } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-speech" });
    });

    it("3.3 ignores [unk] in partialresult without any result event and resolves with no-speech", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "partialresult", result: { partial: "[unk]" } });
      recognizer.emit({ event: "partialresult", result: { partial: "UNK" } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-speech" });
    });

    it("3.4 maps empty transcript to SILENCE intent in tutor-intent engine", () => {
      const targetItem = tutorItems.find((item) => item.text === "oso")!;
      expect(classifyIntent("", targetItem, tutorItems)).toBe("SILENCE");
      expect(classifyIntent("   ", targetItem, tutorItems)).toBe("SILENCE");
    });
  });

  // =========================================================================
  // SCOPE 4: Short vowel and partial transcript rescue on timeout
  // =========================================================================
  describe("Scope 4: Short vowel partial rescue across all 5 vowels", () => {
    const vowels = ["a", "e", "i", "o", "u"] as const;

    for (const v of vowels) {
      it(`4.1 rescues lowercase vowel '${v}' from partialresult on timeout`, async () => {
        const { ears } = makeEars();
        const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: [v] });
        await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
        const recognizer = FakeVoskRecognizer.instances.at(-1)!;

        recognizer.emit({ event: "partialresult", result: { partial: ` ${v} ` } });

        const outcome = await attempt;
        expect(outcome).toEqual({ ok: true, transcript: v, alternatives: [] });
      });

      it(`4.2 rescues uppercase vowel '${v.toUpperCase()}' from partialresult on timeout`, async () => {
        const { ears } = makeEars();
        const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: [v] });
        await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
        const recognizer = FakeVoskRecognizer.instances.at(-1)!;

        recognizer.emit({ event: "partialresult", result: { partial: v.toUpperCase() } });

        const outcome = await attempt;
        expect(outcome).toEqual({ ok: true, transcript: v.toUpperCase(), alternatives: [] });
      });
    }

    it("4.3 rescues accented word partial (avión) from partialresult on timeout", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["avión"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "partialresult", result: { partial: "avión" } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "avión", alternatives: [] });
    });

    it("4.4 rescues vowel when partial contains noise token '[unk] a'", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["a"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "partialresult", result: { partial: "[unk] a" } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "a", alternatives: [] });
    });

    it("4.5 vowel partial takes precedence over prior noise result", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["e"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Noise result arrived earlier
      recognizer.emit({ event: "result", result: { text: "[unk]" } });
      // Then child uttered short vowel partial right before timeout
      recognizer.emit({ event: "partialresult", result: { partial: "e" } });

      const outcome = await attempt;
      // Rescued vowel "e" takes precedence over [unk]
      expect(outcome).toEqual({ ok: true, transcript: "e", alternatives: [] });
    });

    it("4.6 multiple partials update lastValidPartial to latest speech", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["o", "oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      recognizer.emit({ event: "partialresult", result: { partial: "o" } });
      recognizer.emit({ event: "partialresult", result: { partial: "oso" } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
    });
  });

  // =========================================================================
  // SCOPE 5: track.onended mid-attempt immediate abort
  // =========================================================================
  describe("Scope 5: Hardware disconnection and track.onended abort", () => {
    it("5.1 aborts immediately with no-microphone without waiting for 10s timeout", async () => {
      const { ears } = makeEars();
      const start = Date.now();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 10_000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Disconnect hardware track
      tracks[0]._fireEnded();

      const outcome = await attempt;
      const elapsed = Date.now() - start;

      expect(outcome).toEqual({ ok: false, problem: "no-microphone" });
      // Crucial: Must abort immediately (well under 1000ms), never waiting 10,000ms!
      expect(elapsed).toBeLessThan(1000);
      expect(recognizer.remove).toHaveBeenCalled();
      expect(tracks.every((t) => t.stop.mock.calls.length >= 1)).toBe(true);
    });

    it("5.2 aborts immediately when second track in multi-track stream ends", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 10_000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      // Fire ended on track 1
      tracks[1]._fireEnded();

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-microphone" });
    });

    it("5.3 handles legacy onended property invocation directly", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 10_000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      // Invoke track.onended directly if present
      expect(tracks[0].onended).toBeDefined();
      tracks[0].onended!();

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-microphone" });
    });

    it("5.4 does not overwrite result if track ended is fired after normal completion", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Normal speech recognized
      recognizer.emit({ event: "result", result: { text: "oso" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });

      // Track ends post-settlement (e.g. OS hardware teardown)
      expect(() => tracks[0]._fireEnded()).not.toThrow();
    });
  });

  // =========================================================================
  // SCOPE 6: AudioContext Suspended Resumption & Error Handling
  // =========================================================================
  describe("Scope 6: AudioContext resumption and lifecycle", () => {
    it("6.1 resumes suspended AudioContext before starting capture", async () => {
      const resume = vi.fn(async () => {});
      const { ears } = makeEars({ state: "suspended", resume });

      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      expect(resume).toHaveBeenCalledTimes(1);

      const recognizer = FakeVoskRecognizer.instances.at(-1)!;
      recognizer.emit({ event: "result", result: { text: "oso" } });
      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
    });

    it("6.2 does not call resume if AudioContext is already running", async () => {
      const resume = vi.fn(async () => {});
      const { ears } = makeEars({ state: "running", resume });

      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      expect(resume).not.toHaveBeenCalled();

      const recognizer = FakeVoskRecognizer.instances.at(-1)!;
      recognizer.emit({ event: "result", result: { text: "oso" } });
      await attempt;
    });

    it("6.3 handles AudioContext resume failure cleanly by returning failed problem and stopping tracks", async () => {
      const resume = vi.fn(async () => {
        throw new DOMException("Autoplay policy prevented audio resumption", "NotAllowedError");
      });
      const { ears } = makeEars({ state: "suspended", resume });
      const onCaptureChange = vi.fn();

      const outcome = await ears.listen({ lang: "es-MX", maxMs: 5000, onCaptureChange });

      expect(resume).toHaveBeenCalledTimes(1);
      expect(outcome).toEqual({ ok: false, problem: "failed" });
      // Mic tracks stopped cleanly
      expect(tracks.every((t) => t.stop.mock.calls.length >= 1)).toBe(true);
      // Capture indicator reset
      expect(onCaptureChange).toHaveBeenCalledWith(false);
    });
  });

  // =========================================================================
  // ADDITIONAL ADVERSARIAL STRESS TESTS: Concurrency, Carrier Phrases & Lifecycle
  // =========================================================================
  describe("Adversarial Stress: Concurrency, Carrier Phrases & Lifecycle", () => {
    it("7.1 rapid consecutive listen() calls cancel previous attempt cleanly without leaking tracks", async () => {
      const { ears } = makeEars();
      const attempt1 = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

      // Immediate second call while first is listening
      const attempt2 = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["avión"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));

      // Attempt 1 should settle with no-speech (cancelled)
      const outcome1 = await attempt1;
      expect(outcome1).toEqual({ ok: false, problem: "no-speech" });

      // Attempt 2 can proceed and recognize target
      const recognizer2 = FakeVoskRecognizer.instances.at(-1)!;
      recognizer2.emit({ event: "result", result: { text: "avión" } });

      const outcome2 = await attempt2;
      expect(outcome2).toEqual({ ok: true, transcript: "avión", alternatives: [] });
    });

    it("7.2 dispose() during active listening aborts attempt immediately and frees resources", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      ears.dispose();

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: false, problem: "no-speech" });
      expect(recognizer.remove).toHaveBeenCalled();
      expect(tracks.every((t) => t.stop.mock.calls.length >= 1)).toBe(true);
      expect(ears.status).toBe("off");

      // Post-dispose listen returns failed immediately
      const postAttempt = await ears.listen({ lang: "es-MX", maxMs: 1000 });
      expect(postAttempt).toEqual({ ok: false, problem: "failed" });
    });

    it("7.3 rescues short vowel accompanied by Spanish carrier word in partialresult", async () => {
      const { ears } = makeEars();
      const attempt = ears.listen({ lang: "es-MX", maxMs: 40, grammar: ["la", "a"] });
      await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
      const recognizer = FakeVoskRecognizer.instances.at(-1)!;

      // Child says "la a" but only partial arrives before window expires
      recognizer.emit({ event: "partialresult", result: { partial: "la a" } });

      const outcome = await attempt;
      expect(outcome).toEqual({ ok: true, transcript: "la a", alternatives: [] });
    });
  });
});
