/**
 * VoskEars — the tutor's primary on-device ears (spec §18.2).
 *
 * `vosk-browser` (Apache-2.0) runs the Vosk/Kaldi WASM recognizer inside its
 * own Web Worker. Audio flows in memory only:
 *
 *   getUserMedia (16 kHz mono) → AudioContext → ScriptProcessor → recognizer
 *
 * Nothing is recorded, cached, or uploaded: child audio never leaves memory
 * and is discarded when the attempt ends. The only network fetch is the model
 * archive itself, one time, from this app's own same-origin path
 * (`scripts/fetch-vosk-model.mjs` puts it there; it is never committed).
 *
 * The microphone opens ONLY inside listen(), after the child taps. probe()
 * warms/verifies the model and engine without ever touching the microphone.
 *
 * Grammar limiting is native, not a post-filter: `KaldiRecognizer` takes a
 * JSON grammar and decodes constrained to it, which is far more reliable on
 * short child utterances than open dictation. The brain layer passes the
 * per-item list (lesson items, same-page distractors, vowels + aliases,
 * command words) via `listen({ grammar })`; `"[unk]"` is appended here.
 */

import { assetPath } from "./assets";
import type {
  EarsListenOptions,
  EarsListenOutcome,
  EarsProblem,
  EarsStatus,
  TutorEars,
} from "./tutor-ears";

/** Asset path served by this app; `scripts/fetch-vosk-model.mjs` fills it. */
export const VOSK_MODEL_ASSET_PATH = "models/vosk/vosk-model-small-es-0.42.bin";

export function voskModelUrl(): string {
  return assetPath(VOSK_MODEL_ASSET_PATH);
}

// ---------------------------------------------------------------------------
// Structural vosk-browser types (the real package's types match these; tests
// inject fakes without loading the ~4 MB WASM bundle).
// ---------------------------------------------------------------------------

export type VoskResultMessage =
  | { event: "result"; result: { text: string } }
  | { event: "partialresult"; result: { partial: string } }
  | { event: "error"; error: string };

export interface VoskRecognizerLike {
  readonly id: string;
  on(
    event: "result" | "partialresult" | "error",
    listener: (message: VoskResultMessage) => void,
  ): void;
  acceptWaveform(buffer: AudioBuffer): void;
  retrieveFinalResult(): void;
  remove(): void;
}

export interface VoskModelLike {
  readonly ready: boolean;
  setLogLevel(level: number): void;
  terminate(): void;
  readonly KaldiRecognizer: new (sampleRate: number, grammar?: string) => VoskRecognizerLike;
}

export interface VoskAudioContextLike {
  readonly sampleRate: number;
  createScriptProcessor(
    bufferSize: number,
    inputChannels: number,
    outputChannels: number,
  ): ScriptProcessorNode;
  createMediaStreamSource(stream: MediaStream): MediaStreamAudioSourceNode;
  createGain(): GainNode;
  readonly destination: AudioDestinationNode;
  close(): Promise<void>;
}

/** Injection seam for tests. Production code never passes these. */
export interface VoskEarsDeps {
  createModel?: (modelUrl: string) => Promise<VoskModelLike>;
  createAudioContext?: () => VoskAudioContextLike;
}

export interface VoskEarsOptions {
  /** Same-origin URL of the tar.gz model archive (defaults to this app's). */
  modelUrl?: string;
  /** Test seam — see `VoskEarsDeps`. */
  deps?: VoskEarsDeps;
}

/**
 * JSON grammar for the WASM recognizer: the caller's words, deduped and
 * lowercased, plus `"[unk]"` so off-grammar speech degrades to `[unk]`
 * instead of being forced onto a wrong in-grammar word.
 */
export function voskGrammar(grammar: readonly string[] | undefined): string | undefined {
  if (!grammar || grammar.length === 0) return undefined;
  const words = new Set(
    grammar.map((word) => word.trim().toLowerCase()).filter((word) => word.length > 0),
  );
  if (words.size === 0) return undefined;
  words.add("[unk]");
  return JSON.stringify([...words]);
}

const AUDIO_CHUNK_SIZE = 4096;
/** Wait after stop for the recognizer's final `result` event to arrive. */
const FINAL_RESULT_GRACE_MS = 300;

interface VoskSession {
  finals: string[];
  stream: MediaStream;
  audioContext: VoskAudioContextLike;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode;
  silence: GainNode;
  recognizer: VoskRecognizerLike;
  listenTimer: ReturnType<typeof setTimeout> | null;
  graceTimer: ReturnType<typeof setTimeout> | null;
  /** True once the first final result asked the attempt to wind down. */
  settling: boolean;
  settled: boolean;
  tornDown: boolean;
  captureStopped: boolean;
  onCaptureChange?: (capturing: boolean) => void;
  resolve: (outcome: EarsListenOutcome) => void;
}

function micProblem(error: unknown): EarsProblem {
  const name = (error as { name?: string } | null | undefined)?.name ?? "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "denied";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "NotReadableError") {
    return "no-microphone";
  }
  return "failed";
}

export class VoskEars implements TutorEars {
  readonly kind = "vosk" as const;
  /** Coarse mic/ears state for UI feedback; not part of the TutorEars contract. */
  status: EarsStatus = "off";

  private readonly modelUrl: string;
  private readonly deps: VoskEarsDeps;
  private cancelListenWait: (() => void) | null = null;
  private cancelModelLoad: (() => void) | null = null;
  private modelPromise: Promise<VoskModelLike> | null = null;
  private model: VoskModelLike | null = null;
  private generation = 0;
  private disposed = false;
  private active: VoskSession | null = null;

  constructor(options: VoskEarsOptions = {}) {
    this.modelUrl = options.modelUrl ?? voskModelUrl();
    this.deps = options.deps ?? {};
  }

  /** Loads/verifies the on-device engine. Never opens the microphone. */
  async probe(): Promise<"ready" | EarsProblem> {
    if (typeof WebAssembly === "undefined") return "unsupported";
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      // getUserMedia requires a secure context; no on-device mic here.
      return "unsupported";
    }
    if (!navigator.mediaDevices?.getUserMedia) return "no-microphone";
    try {
      await this.ensureModel();
    } catch {
      return "no-local";
    }
    return "ready";
  }

  async listen(opts: EarsListenOptions): Promise<EarsListenOutcome> {
    // One attempt at a time; a previous open mic session ends right here.
    this.cancel();
    const generation = this.generation;
    if (this.disposed) return { ok: false, problem: "failed" };
    if (typeof WebAssembly === "undefined") {
      return { ok: false, problem: "unsupported" };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, problem: "no-microphone" };
    }
    // The model loads with the mic still off; the mic opens only below.
    let model: VoskModelLike;
    try {
      model = await this.waitForAttempt(this.ensureModel());
    } catch {
      if (generation !== this.generation || this.disposed)
        return { ok: false, problem: "no-speech" };
      this.status = "unavailable";
      return { ok: false, problem: "no-local" };
    }

    if (generation !== this.generation || this.disposed) return { ok: false, problem: "no-speech" };
    let stream: MediaStream;
    try {
      stream = await this.waitForAttempt(
        navigator.mediaDevices
          .getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 1,
              sampleRate: 16000,
            },
          })
          .then((stream) => {
            if (generation !== this.generation || this.disposed)
              stream.getTracks().forEach((track) => track.stop());
            return stream;
          }),
      );
    } catch (error) {
      if (generation !== this.generation || this.disposed)
        return { ok: false, problem: "no-speech" };
      this.status = "unavailable";
      return { ok: false, problem: micProblem(error) };
    }

    if (generation !== this.generation || this.disposed) {
      stream.getTracks().forEach((track) => track.stop());
      return { ok: false, problem: "no-speech" };
    }
    opts.onCaptureChange?.(true);
    try {
      return await new Promise<EarsListenOutcome>((resolve) => {
        // Audio pipeline — everything below lives in memory only.
        const audioContext = this.deps.createAudioContext?.() ?? new AudioContext();
        const recognizer = new model.KaldiRecognizer(
          audioContext.sampleRate,
          voskGrammar(opts.grammar),
        );
        const processor = audioContext.createScriptProcessor(AUDIO_CHUNK_SIZE, 1, 1);
        const source = audioContext.createMediaStreamSource(stream);
        // Chrome only pumps a ScriptProcessor that reaches the destination;
        // route it through a zero-gain node so child audio is never audible.
        const silence = audioContext.createGain();
        silence.gain.value = 0;

        const session: VoskSession = {
          finals: [],
          stream,
          audioContext,
          source,
          processor,
          silence,
          recognizer,
          listenTimer: null,
          graceTimer: null,
          settling: false,
          settled: false,
          tornDown: false,
          captureStopped: false,
          resolve,
          onCaptureChange: opts.onCaptureChange,
        };
        this.active = session;

        recognizer.on("result", (message) => {
          if (message.event !== "result") return;
          const text = message.result.text.trim();
          if (!text) return;
          session.finals.push(text);
          this.status = "hearing";
          // A finished child utterance is recognized: end the attempt now.
          this.finishSession();
        });
        recognizer.on("partialresult", (message) => {
          if (message.event !== "partialresult") return;
          if (message.result.partial.trim()) this.status = "hearing";
        });

        processor.onaudioprocess = (event) => {
          try {
            recognizer.acceptWaveform(event.inputBuffer);
          } catch {
            // The recognizer was already removed (attempt ended) — drop the chunk.
          }
        };
        source.connect(processor);
        processor.connect(silence);
        silence.connect(audioContext.destination);

        this.status = "listening";
        session.listenTimer = setTimeout(() => {
          // No final result within maxMs: ask once more, then settle.
          this.finishSession();
        }, opts.maxMs);
      });
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      opts.onCaptureChange?.(false);
      return { ok: false, problem: "failed" };
    }
  }

  /** Stops any open attempt immediately; all mic tracks stop right away. */
  cancel(): void {
    this.generation += 1;
    this.cancelListenWait?.();
    const session = this.active;
    if (!session) return;
    this.finalizeSession();
  }

  dispose(): void {
    this.disposed = true;
    this.cancel();
    this.cancelModelLoad?.();
    this.model?.terminate();
    this.model = null;
  }

  /** Ask the recognizer to flush its final result, then settle after a grace. */
  private finishSession(): void {
    const session = this.active;
    if (!session || session.settling || session.settled) return;
    session.settling = true;
    this.stopCapture(session);
    if (session.listenTimer) clearTimeout(session.listenTimer);
    session.listenTimer = null;
    try {
      session.recognizer.retrieveFinalResult();
    } catch {
      // Recognizer already gone; settle with whatever was heard.
    }
    session.graceTimer = setTimeout(() => {
      this.finalizeSession();
    }, FINAL_RESULT_GRACE_MS);
  }

  private finalizeSession(): void {
    const session = this.active;
    if (!session || session.settled) return;
    session.settled = true;
    this.teardownSession(session);
    const transcript = session.finals.join(" ").trim();
    session.resolve(
      transcript ? { ok: true, transcript, alternatives: [] } : { ok: false, problem: "no-speech" },
    );
  }

  private waitForAttempt<T>(pending: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        if (this.cancelListenWait === cancel) this.cancelListenWait = null;
        fn();
      };
      const cancel = () =>
        finish(() => reject(new DOMException("Tutor listen cancelled", "AbortError")));
      this.cancelListenWait = cancel;
      pending.then(
        (value) => finish(() => resolve(value)),
        (error) => finish(() => reject(error)),
      );
    });
  }

  private stopCapture(session: VoskSession): void {
    if (session.captureStopped) return;
    session.captureStopped = true;
    for (const track of session.stream.getTracks()) track.stop();
    session.onCaptureChange?.(false);
  }

  private teardownSession(session: VoskSession): void {
    if (session.tornDown) return;
    session.tornDown = true;
    this.stopCapture(session);
    if (session.listenTimer) clearTimeout(session.listenTimer);
    if (session.graceTimer) clearTimeout(session.graceTimer);
    session.listenTimer = null;
    session.graceTimer = null;
    try {
      session.processor.onaudioprocess = null;
    } catch {
      // Fake nodes in tests may not accept the assignment.
    }
    try {
      session.source.disconnect();
      session.processor.disconnect();
      session.silence.disconnect();
    } catch {
      // Already disconnected.
    }
    // Mic light off: every track stops now.

    try {
      session.recognizer.remove();
    } catch {
      // Already removed.
    }
    session.audioContext.close().catch(() => {
      // Closing twice or after teardown is harmless.
    });
    if (this.active === session) {
      this.active = null;
      this.status = this.model ? "ready" : "off";
    }
  }

  private ensureModel(): Promise<VoskModelLike> {
    if (!this.modelPromise) {
      this.status = "checking";
      const createModel =
        this.deps.createModel ??
        ((modelUrl: string) =>
          import("vosk-browser").then(
            (vosk) =>
              new Promise<VoskModelLike>((resolve, reject) => {
                const model = new vosk.Model(modelUrl);
                // vosk-browser 0.0.8's createModel listens only for load, so errors
                // otherwise leave callers waiting forever. Its public terminate
                // also cannot close an uninitialized model; close the owned worker.
                const worker = (model as unknown as { worker: Worker }).worker;
                model.terminate = () => worker.terminate();
                let settled = false;
                const finish = (error?: Error) => {
                  if (settled) return;
                  settled = true;
                  clearTimeout(timer);
                  this.cancelModelLoad = null;
                  if (error) {
                    model.terminate();
                    reject(error);
                  } else resolve(model);
                };
                const timer = setTimeout(
                  () => finish(new Error("Local model initialization timed out")),
                  60_000,
                );
                this.cancelModelLoad = () => finish(new Error("Tutor closed"));
                model.on("load", (message) =>
                  finish(message.result ? undefined : new Error("Local model did not load")),
                );
                model.on("error", (message) => finish(new Error(String(message.error))));
                if (this.disposed) this.cancelModelLoad();
              }),
          ));
      this.modelPromise = createModel(this.modelUrl)
        .then((model) => {
          if (this.disposed) {
            model.terminate();
            throw new Error("Tutor closed");
          }
          this.model = model;
          this.status = "ready";
          return model;
        })
        .catch((error: unknown) => {
          // A later attempt may retry (e.g. the offline pack finishing).
          this.modelPromise = null;
          this.status = "unavailable";
          if (!this.disposed) console.warn("On-device tutor model unavailable", error);
          throw error;
        });
    }
    return this.modelPromise;
  }
}
