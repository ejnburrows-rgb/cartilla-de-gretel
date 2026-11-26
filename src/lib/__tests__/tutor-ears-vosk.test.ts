/**
 * @vitest-environment jsdom
 *
 * Milestone 9 unit tests for VoskEars offline speech recognition modes:
 * - explicit "constrained" (grammar-limited, NEVER labeled open conversation) vs "broad" (unconstrained Spanish)
 * - partial & final transcript callbacks
 * - silence detection (post-speech auto-settle & no-speech timeout)
 * - confidence & uncertainty thresholds (never grade unreliable transcripts)
 * - echo cancellation constraints
 * - strict mic gating while Gretel speaks (her playback is never recognized)
 * - always-available stop / interrupt
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  describeRecognitionMode,
  isTranscriptReliable,
} from "../tutor-ears";
import {
  VoskEars,
  computeBufferRms,
  computeVoskConfidence,
  type VoskModelLike,
  type VoskResultMessage,
} from "../tutor-ears-vosk";

class FakeRecognizer {
  static instances: FakeRecognizer[] = [];
  readonly id = `rec-${FakeRecognizer.instances.length}`;
  readonly sampleRate: number;
  readonly grammar?: string;
  private readonly listeners = new Map<string, (msg: VoskResultMessage) => void>();
  acceptWaveform = vi.fn();
  retrieveFinalResult = vi.fn();
  remove = vi.fn();

  constructor(sampleRate: number, grammar?: string) {
    this.sampleRate = sampleRate;
    this.grammar = grammar;
    FakeRecognizer.instances.push(this);
  }

  on(event: "result" | "partialresult" | "error", fn: (msg: VoskResultMessage) => void): void {
    this.listeners.set(event, fn);
  }

  emit(msg: VoskResultMessage): void {
    this.listeners.get(msg.event)?.(msg);
  }
}

function makeFakeDeps() {
  let latestProcessor: { onaudioprocess: ((e: { inputBuffer: AudioBuffer }) => void) | null } | null =
    null;

  const model = {
    ready: true,
    setLogLevel: vi.fn(),
    terminate: vi.fn(),
    KaldiRecognizer: FakeRecognizer,
  } as unknown as VoskModelLike;

  const createModel = vi.fn(async () => model);
  const createAudioContext = () =>
    ({
      sampleRate: 16000,
      state: "running" as AudioContextState,
      resume: vi.fn(() => Promise.resolve()),
      destination: {} as AudioDestinationNode,
      createScriptProcessor: vi.fn(() => {
        const proc = {
          onaudioprocess: null as ((e: { inputBuffer: AudioBuffer }) => void) | null,
          connect: vi.fn(),
          disconnect: vi.fn(),
        };
        latestProcessor = proc;
        return proc as unknown as ScriptProcessorNode;
      }),
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
    }) as unknown as AudioContext;

  return {
    createModel,
    createAudioContext,
    getProcessor: () => latestProcessor,
  };
}

function makeFakeBuffer(amplitude: number): AudioBuffer {
  const data = new Float32Array(128).fill(amplitude);
  return {
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}

describe("Milestone 9: Vosk recognition modes & reliability helpers", () => {
  it("never labels constrained mode as open conversation", () => {
    const constrained = describeRecognitionMode("constrained");
    const broad = describeRecognitionMode("broad");

    expect(constrained.grammarLimited).toBe(true);
    expect(constrained.isOpenConversation).toBe(false);
    expect(constrained.label.toLowerCase()).not.toContain("abierta");
    expect(constrained.label.toLowerCase()).not.toContain("open conversation");

    expect(broad.grammarLimited).toBe(false);
    expect(broad.isOpenConversation).toBe(false);
    expect(broad.label.toLowerCase()).toContain("preguntas");
  });

  it("computes word confidence and rejects unreliable transcripts", () => {
    expect(
      computeVoskConfidence([
        { word: "mamá", conf: 0.92 },
        { word: "ama", conf: 0.88 },
      ]),
    ).toBe(0.9);

    expect(
      computeVoskConfidence([
        { word: "mamá", conf: 0.8 },
        { word: "[unk]", conf: 0.99 },
      ]),
    ).toBe(0.4);

    expect(
      isTranscriptReliable({ transcript: "mamá", confidence: 0.85, reliable: true }),
    ).toBe(true);
    expect(
      isTranscriptReliable({ transcript: "mamá", confidence: 0.35 }),
    ).toBe(false);
    expect(
      isTranscriptReliable({ transcript: "mamá", confidence: 0.9, reliable: false }),
    ).toBe(false);
    expect(isTranscriptReliable({ transcript: "[unk]", confidence: 1 })).toBe(false);
    expect(DEFAULT_CONFIDENCE_THRESHOLD).toBe(0.6);
  });

  it("computes RMS amplitude safely", () => {
    expect(computeBufferRms(makeFakeBuffer(0))).toBe(0);
    expect(computeBufferRms(makeFakeBuffer(0.1))).toBeCloseTo(0.1, 4);
    expect(computeBufferRms(undefined)).toBeNull();
  });
});

describe("Milestone 9: VoskEars runtime modes, gating, confidence & interrupt", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;
  let tracks: { stop: ReturnType<typeof vi.fn> }[];

  beforeEach(() => {
    FakeRecognizer.instances = [];
    tracks = [{ stop: vi.fn() }];
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
    vi.useRealTimers();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
  });

  it("passes JSON grammar in constrained mode and omits grammar in broad mode", async () => {
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });

    // Constrained mode
    const constrainedAttempt = ears.listen({
      lang: "es-MX",
      maxMs: 5000,
      mode: "constrained",
      grammar: ["mamá", "mami"],
    });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(1));
    const constrainedRec = FakeRecognizer.instances[0];
    expect(JSON.parse(constrainedRec.grammar!)).toEqual(["mamá", "mami", "[unk]"]);
    constrainedRec.emit({
      event: "result",
      result: { text: "mamá", result: [{ word: "mamá", conf: 0.95 }] },
    });
    const constrainedOut = await constrainedAttempt;
    expect(constrainedOut).toMatchObject({
      ok: true,
      transcript: "mamá",
      mode: "constrained",
      confidence: 0.95,
      reliable: true,
      isFinal: true,
    });

    // Broad mode ignores any passed grammar so Vosk decodes unconstrained Spanish
    const broadAttempt = ears.listen({
      lang: "es-MX",
      maxMs: 5000,
      mode: "broad",
      grammar: ["mamá", "mami"],
    });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(2));
    const broadRec = FakeRecognizer.instances[1];
    expect(broadRec.grammar).toBeUndefined();
    broadRec.emit({
      event: "result",
      result: {
        text: "cómo se lee esta letra",
        result: [
          { word: "cómo", conf: 0.9 },
          { word: "se", conf: 0.9 },
          { word: "lee", conf: 0.9 },
        ],
      },
    });
    const broadOut = await broadAttempt;
    expect(broadOut).toMatchObject({
      ok: true,
      transcript: "cómo se lee esta letra",
      mode: "broad",
      reliable: true,
    });
  });

  it("enables echoCancellation, noiseSuppression, and autoGainControl on getUserMedia", async () => {
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });

    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, mode: "constrained", grammar: ["oso"] });
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
    expect(getUserMedia).toHaveBeenCalledWith({
      video: false,
      audio: expect.objectContaining({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }),
    });
    ears.interrupt();
    await attempt;
  });

  it("marks low-confidence transcripts as reliable: false so they are never graded", async () => {
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });
    const onPartial = vi.fn();
    const onFinal = vi.fn();

    const attempt = ears.listen({
      lang: "es-MX",
      maxMs: 5000,
      mode: "constrained",
      grammar: ["oso"],
      minConfidence: 0.7,
      onPartial,
      onFinal,
    });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(1));
    const rec = FakeRecognizer.instances[0];
    rec.emit({ event: "partialresult", result: { partial: "o" } });
    rec.emit({
      event: "result",
      result: { text: "oso", result: [{ word: "oso", conf: 0.42 }] },
    });

    const out = await attempt;
    expect(onPartial).toHaveBeenCalledWith("o");
    expect(onFinal).toHaveBeenCalledWith("oso", 0.42);
    expect(out).toMatchObject({
      ok: true,
      transcript: "oso",
      confidence: 0.42,
      reliable: false,
    });
  });

  it("strictly gates the mic while Gretel speaks — refuses to open and aborts active capture", async () => {
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });

    // Refuses to open mic while Gretel is speaking
    ears.setGretelSpeaking(true);
    expect(ears.isGretelSpeaking).toBe(true);
    const blocked = await ears.listen({ lang: "es-MX", maxMs: 5000, mode: "constrained", grammar: ["a"] });
    expect(blocked).toEqual({ ok: false, problem: "no-speech", gatedByPlayback: true });
    expect(getUserMedia).not.toHaveBeenCalled();

    // Opens once Gretel stops speaking, then aborts immediately if she starts speaking mid-capture
    ears.setGretelSpeaking(false);
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, mode: "constrained", grammar: ["a"] });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(1));
    const rec = FakeRecognizer.instances[0];
    rec.emit({ event: "partialresult", result: { partial: "a" } });

    ears.setGretelSpeaking(true);
    const aborted = await attempt;
    expect(aborted).toEqual({ ok: false, problem: "no-speech", gatedByPlayback: true });
    expect(tracks[0].stop).toHaveBeenCalled();

    // Audio frames arriving while isGretelSpeaking() is true are dropped before acceptWaveform
    ears.setGretelSpeaking(false);
    let speaking = false;
    const gatedByCallback = ears.listen({
      lang: "es-MX",
      maxMs: 5000,
      mode: "constrained",
      grammar: ["a"],
      isGretelSpeaking: () => speaking,
    });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(2));
    const rec2 = FakeRecognizer.instances[1];
    speaking = true;
    deps.getProcessor()?.onaudioprocess?.({ inputBuffer: makeFakeBuffer(0.2) });
    expect(rec2.acceptWaveform).not.toHaveBeenCalled();
    expect(await gatedByCallback).toEqual({
      ok: false,
      problem: "no-speech",
      gatedByPlayback: true,
    });
  });

  it("supports always-available interrupt() that immediately discards in-flight speech", async () => {
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });

    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, mode: "broad" });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(1));
    FakeRecognizer.instances[0].emit({ event: "partialresult", result: { partial: "hola" } });

    ears.interrupt();
    const out = await attempt;
    expect(out).toEqual({ ok: false, problem: "no-speech", interrupted: true });
    expect(tracks[0].stop).toHaveBeenCalled();
  });

  it("detects silence and settles cleanly when no speech arrives within silenceMs", async () => {
    vi.useFakeTimers();
    const deps = makeFakeDeps();
    const ears = new VoskEars({ deps });

    const attempt = ears.listen({
      lang: "es-MX",
      maxMs: 10_000,
      silenceMs: 800,
      mode: "constrained",
      grammar: ["oso"],
    });
    await vi.waitFor(() => expect(FakeRecognizer.instances).toHaveLength(1));

    await vi.advanceTimersByTimeAsync(850);
    const out = await attempt;
    expect(out).toEqual({ ok: false, problem: "no-speech", silenceDetected: true });
    expect(tracks[0].stop).toHaveBeenCalled();
  });
});
