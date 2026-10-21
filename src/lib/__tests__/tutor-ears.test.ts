/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTutorEars, type EarsListenOutcome } from "../tutor-ears";
import { StubEars } from "../tutor-ears-stub";
import {
  VoskEars,
  voskGrammar,
  voskModelUrl,
  type VoskModelLike,
  type VoskResultMessage,
} from "../tutor-ears-vosk";
import { ChromeLocalEars } from "../tutor-ears-chrome-local";

it("never constructs StubEars in a production build, including test mode", () => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("MODE", "test");
  vi.stubEnv("VITE_TUTOR_EARS", "stub");
  try {
    expect(createTutorEars().kind).toBe("vosk");
  } finally {
    vi.unstubAllEnvs();
  }
});

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
// Vosk fakes (no WASM, no worker, no real audio)
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

function makeFakeAudioContext(): () => AudioContext {
  const create = () =>
    ({
      sampleRate: 16000,
      destination: {} as AudioDestinationNode,
      createScriptProcessor: vi.fn(
        () => ({ onaudioprocess: null, connect: vi.fn() }) as unknown as ScriptProcessorNode,
      ),
      createMediaStreamSource: vi.fn(
        () => ({ connect: vi.fn() }) as unknown as MediaStreamAudioSourceNode,
      ),
      createGain: vi.fn(
        () =>
          ({
            gain: { value: 1 },
            connect: vi.fn(),
          }) as unknown as GainNode,
      ),
      close: vi.fn(() => Promise.resolve()),
    }) as unknown as AudioContext;
  return create;
}

function makeFakeTracks(count = 2) {
  return Array.from({ length: count }, () => ({ stop: vi.fn() }));
}

describe("createTutorEars factory", () => {
  it("returns the scripted stub under the test environment", () => {
    const ears = createTutorEars();
    expect(ears.kind).toBe("stub");
    expect(ears instanceof StubEars).toBe(true);
  });

  // NARROW e2e override (screens lane): VITE_TUTOR_EARS is checked BEFORE
  // the MODE check so Playwright can force the scripted stub in any mode.
  // It is a compile-time env: unset in production builds, so it can never
  // fire there (dead comparison in the shipped bundle).
  describe("VITE_TUTOR_EARS override", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("forces the stub before the MODE check", () => {
      vi.stubEnv("VITE_TUTOR_EARS", "stub");
      vi.stubEnv("MODE", "production");
      const ears = createTutorEars();
      expect(ears.kind).toBe("stub");
      expect(ears instanceof StubEars).toBe(true);
    });

    it("is inert when the flag is unset, even outside the test environment", () => {
      vi.stubEnv("MODE", "production");
      // The VoskEars constructor is lazy: constructing it here opens no
      // worker, model, or mic (probe() does, and only when called).
      const ears = createTutorEars();
      expect(ears.kind).toBe("vosk");
    });

    it('ignores any value other than the exact string "stub"', () => {
      vi.stubEnv("VITE_TUTOR_EARS", "Stub");
      vi.stubEnv("MODE", "production");
      const ears = createTutorEars();
      expect(ears.kind).toBe("vosk");
    });
  });
});

describe("VoskEars (primary on-device engine)", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;
  let tracks: ReturnType<typeof makeFakeTracks>;

  const makeEars = () => {
    const { createModel } = makeFakeModel();
    return {
      createModel,
      ears: new VoskEars({
        deps: { createModel, createAudioContext: makeFakeAudioContext() },
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

  it("a real model error settles readiness instead of leaving the microphone waiting", async () => {
    const ears = new VoskEars();
    const pending = ears.probe();
    await vi.waitFor(() => expect(defaultModels.models.at(-1)?.handlers.error).toBeDefined());
    const model = defaultModels.models.at(-1)!;
    model.handlers.error({ event: "error", error: "model unavailable" });
    expect(await pending).toBe("no-local");
    expect(model.worker.terminate).toHaveBeenCalledTimes(1);
  });
  it("route exit terminates the model worker while it is still loading", async () => {
    defaultModels.models.length = 0;
    const ears = new VoskEars();
    const pending = ears.probe();
    await vi.waitFor(() => expect(defaultModels.models.at(-1)).toBeDefined());
    const model = defaultModels.models.at(-1)!;
    ears.dispose();
    expect(await pending).toBe("no-local");
    expect(model.worker.terminate).toHaveBeenCalledTimes(1);
  });
  it("route exit while microphone permission is pending releases the late stream", async () => {
    const { ears } = makeEars();
    await ears.probe();
    let grant!: (stream: unknown) => void;
    getUserMedia.mockImplementation(
      () =>
        new Promise((resolve) => {
          grant = resolve;
        }),
    );
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
    ears.cancel();
    await expect(attempt).resolves.toEqual({ ok: false, problem: "no-speech" });
    grant({ getTracks: () => tracks });
    await Promise.resolve();
    expect(tracks.every((track) => track.stop.mock.calls.length === 1)).toBe(true);
    expect(FakeVoskRecognizer.instances).toHaveLength(0);
  });
  it("capture indicator follows real track lifetime", async () => {
    const { ears } = makeEars();
    const onCaptureChange = vi.fn();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, onCaptureChange });
    expect(onCaptureChange).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onCaptureChange).toHaveBeenCalledWith(true));
    ears.cancel();
    await attempt;
    expect(onCaptureChange.mock.lastCall).toEqual([false]);
  });
  it("probe() loads the model and reports ready but never opens the mic", async () => {
    const { createModel, ears } = makeEars();
    await expect(ears.probe()).resolves.toBe("ready");
    expect(createModel).toHaveBeenCalledTimes(1);
    expect(createModel).toHaveBeenCalledWith(voskModelUrl());
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("probe() reports no-microphone when getUserMedia is unavailable", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {},
    });
    const { ears } = makeEars();
    await expect(ears.probe()).resolves.toBe("no-microphone");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("listen() opens the mic only when called, at 16 kHz mono", async () => {
    const { ears } = makeEars();
    await ears.probe();
    expect(getUserMedia).not.toHaveBeenCalled();

    const outcome = await ears.listen({
      lang: "es-MX",
      maxMs: 20,
      grammar: ["oso", "E"],
    });
    // Nothing was heard (the fake recognizer emits nothing) → gentle silence.
    expect(outcome).toEqual({ ok: false, problem: "no-speech" });
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    const constraints = getUserMedia.mock.calls[0][0];
    expect(constraints.video).toBe(false);
    expect(constraints.audio.channelCount).toBe(1);
    expect(constraints.audio.sampleRate).toBe(16000);
  });

  it("constrains the recognizer natively to the caller's grammar plus [unk]", async () => {
    const { ears } = makeEars();
    await ears.listen({ lang: "es-MX", maxMs: 20, grammar: ["oso", "E"] });
    const recognizer = FakeVoskRecognizer.instances.at(-1)!;
    expect(recognizer.sampleRate).toBe(16000);
    expect(JSON.parse(recognizer.grammar!)).toEqual(["oso", "e", "[unk]"]);

    // Without a grammar, the recognizer is still created (open dictation).
    await ears.listen({ lang: "es-MX", maxMs: 20 });
    expect(FakeVoskRecognizer.instances.at(-1)!.grammar).toBeUndefined();
  });

  it("resolves with the heard transcript, releases the mic, and returns [unk]-safe empty alternatives", async () => {
    const { ears } = makeEars();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000, grammar: ["oso"] });
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

    const recognizer = FakeVoskRecognizer.instances.at(-1)!;
    recognizer.emit({ event: "result", result: { text: " oso " } });
    await expect(attempt).resolves.toEqual({
      ok: true,
      transcript: "oso",
      alternatives: [],
    });
    // Mic light off: every track stopped.
    await vi.waitFor(() =>
      expect(tracks.every((track) => track.stop.mock.calls.length === 1)).toBe(true),
    );
    expect(recognizer.remove).toHaveBeenCalled();
  });

  it("cancel() stops all mic tracks immediately and settles the attempt", async () => {
    const { ears } = makeEars();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));

    ears.cancel();
    // Not "eventually" — cancel() must stop tracks synchronously.
    expect(tracks.every((track) => track.stop.mock.calls.length === 1)).toBe(true);
    await expect(attempt).resolves.toEqual({ ok: false, problem: "no-speech" });
    expect(FakeVoskRecognizer.instances.at(-1)!.remove).toHaveBeenCalled();
    // A cancelled ears is immediately reusable for the next tap.
    await ears.listen({ lang: "es-MX", maxMs: 20 });
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it("maps a denied microphone to the denied problem", async () => {
    getUserMedia.mockRejectedValueOnce(
      Object.assign(new Error("denied"), { name: "NotAllowedError" }),
    );
    const { ears } = makeEars();
    await expect(ears.listen({ lang: "es-MX", maxMs: 100 })).resolves.toEqual({
      ok: false,
      problem: "denied",
    });
    // No recognizer session was ever started for a failed mic.
    expect(FakeVoskRecognizer.instances).toHaveLength(0);
  });

  it("reports no-local when the on-device model cannot load", async () => {
    const createModel = vi.fn(async () => {
      throw new Error("model download failed");
    });
    const ears = new VoskEars({ deps: { createModel } });
    await expect(ears.probe()).resolves.toBe("no-local");
    await expect(ears.listen({ lang: "es-MX", maxMs: 100 })).resolves.toEqual({
      ok: false,
      problem: "no-local",
    });
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});

describe("voskGrammar", () => {
  it("lowercases, dedupes, trims, and always adds [unk]", () => {
    expect(JSON.parse(voskGrammar(["Oso", " oso ", "E"])!)).toEqual(["oso", "e", "[unk]"]);
    expect(voskGrammar(undefined)).toBeUndefined();
    expect(voskGrammar([])).toBeUndefined();
    expect(voskGrammar(["", "   "])).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Chrome on-device Web Speech fakes (pattern from usePianoListening tests)
// ---------------------------------------------------------------------------

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  static availability: string | null = "available";
  static available = vi.fn(async () => FakeRecognition.availability ?? "unavailable");
  static dropProcessLocally = false;
  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  processLocally?: boolean;
  onstart: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();

  constructor() {
    FakeRecognition.instances.push(this);
    if (FakeRecognition.dropProcessLocally) {
      // Simulate a browser that rejects the non-standard property.
      Object.defineProperty(this, "processLocally", {
        get() {
          return undefined;
        },
        set() {
          /* dropped */
        },
      });
    }
  }

  results(list: Array<[string, boolean]>, resultIndex = 0) {
    const results = list.map(([transcript, isFinal]) =>
      Object.assign([{ transcript }], { isFinal }),
    );
    this.onresult?.({ resultIndex, results });
  }
}

const win = window as unknown as Record<string, unknown>;

describe("ChromeLocalEars (browser on-device engine)", () => {
  beforeEach(() => {
    FakeRecognition.instances = [];
    FakeRecognition.availability = "available";
    FakeRecognition.dropProcessLocally = false;
    FakeRecognition.available.mockClear();
    win.SpeechRecognition = FakeRecognition;
  });
  afterEach(() => {
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
  });

  it("probe() is ready only when on-device processing is confirmed", async () => {
    const ears = new ChromeLocalEars();
    await expect(ears.probe()).resolves.toBe("ready");
    expect(FakeRecognition.available).toHaveBeenCalledWith({
      langs: ["es-MX"],
      processLocally: true,
    });

    FakeRecognition.availability = "downloadable";
    await expect(new ChromeLocalEars().probe()).resolves.toBe("no-local");
  });

  it("is unsupported when the browser has no Web Speech recognizer", async () => {
    delete win.SpeechRecognition;
    const ears = new ChromeLocalEars();
    await expect(ears.probe()).resolves.toBe("unsupported");
    await expect(ears.listen({ lang: "es-MX", maxMs: 100 })).resolves.toEqual({
      ok: false,
      problem: "unsupported",
    });
  });

  it("never creates a recognizer when the language is only downloadable", async () => {
    FakeRecognition.availability = "downloadable";
    const ears = new ChromeLocalEars();
    await expect(ears.listen({ lang: "es-MX", maxMs: 100 })).resolves.toEqual({
      ok: false,
      problem: "no-local",
    });
    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it("never starts a recognizer that cannot confirm processLocally", async () => {
    FakeRecognition.dropProcessLocally = true;
    const ears = new ChromeLocalEars();
    await expect(ears.listen({ lang: "es-MX", maxMs: 100 })).resolves.toEqual({
      ok: false,
      problem: "no-local",
    });
    const recognition = FakeRecognition.instances.at(-1)!;
    expect(recognition.start).not.toHaveBeenCalled();
  });

  it("starts an on-device continuous session and returns the final transcript", async () => {
    const ears = new ChromeLocalEars();
    const attempt = ears.listen({ lang: "es-419", maxMs: 5000 });
    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.instances[0];
    expect(recognition.lang).toBe("es-419");
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.processLocally).toBe(true);

    recognition.results([[" oso ", true]]);
    recognition.stop();
    await expect(attempt).resolves.toEqual({
      ok: true,
      transcript: "oso",
      alternatives: [],
    });
  });

  it("maps a permission denial to the denied problem and aborts", async () => {
    const ears = new ChromeLocalEars();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });
    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.instances[0];
    recognition.onerror?.({ error: "not-allowed" });
    await expect(attempt).resolves.toEqual({ ok: false, problem: "denied" });
    expect(recognition.abort).toHaveBeenCalled();
  });

  it("ends with no-speech when nothing was heard", async () => {
    const ears = new ChromeLocalEars();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });
    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.instances[0];
    recognition.onerror?.({ error: "no-speech" });
    recognition.stop();
    await expect(attempt).resolves.toEqual({ ok: false, problem: "no-speech" });
  });

  it("cancel() aborts the recognizer and settles the attempt", async () => {
    const ears = new ChromeLocalEars();
    const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });
    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const recognition = FakeRecognition.instances[0];

    ears.cancel();
    expect(recognition.abort).toHaveBeenCalled();
    await expect(attempt).resolves.toEqual({ ok: false, problem: "no-speech" });
  });
});

describe("StubEars", () => {
  const heard = (transcript: string): EarsListenOutcome => ({
    ok: true,
    transcript,
    alternatives: [],
  });

  it("plays its scripted queue in order and repeats no-speech when dry", async () => {
    const ears = new StubEars([heard("oso"), { ok: false, problem: "denied" }]);
    await expect(ears.probe()).resolves.toBe("ready");
    await expect(ears.listen({ lang: "es-MX", maxMs: 1000 })).resolves.toEqual(heard("oso"));
    await expect(ears.listen({ lang: "es-MX", maxMs: 1000 })).resolves.toEqual({
      ok: false,
      problem: "denied",
    });
    await expect(ears.listen({ lang: "es-MX", maxMs: 1000 })).resolves.toEqual({
      ok: false,
      problem: "no-speech",
    });
    expect(ears.listenCalls).toHaveLength(3);
    expect(ears.cancel()).toBeUndefined();
  });
});
