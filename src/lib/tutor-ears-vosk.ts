/**
 * VoskEars — the tutor's primary on-device ears (spec §18.2, Milestone 9).
 *
 * `vosk-browser` (Apache-2.0) runs the Vosk/Kaldi WASM recognizer
 * (`vosk-model-small-es-0.42`) inside its own Web Worker. Audio flows in
 * memory only:
 *
 *   getUserMedia (16 kHz mono, echoCancellation) → AudioContext → ScriptProcessor → recognizer
 *
 * Nothing is recorded, cached, or uploaded: child audio never leaves memory
 * and is discarded when the attempt ends. The only network fetch is the model
 * archive itself, one time, from this app's own same-origin path
 * (`scripts/fetch-vosk-model.mjs` puts it there; it is never committed).
 *
 * Milestone 9 capabilities:
 * - Two explicit modes:
 *   1. `"constrained"`: grammar-limited Kaldi decoding for known lesson words,
 *      letters, syllables, and exercise answers (`"[unk]"` always appended).
 *      NEVER labeled open conversation.
 *   2. `"broad"`: unconstrained Spanish decoding for student questions & commands.
 * - Partial and final transcripts (`onPartial`, `onFinal`).
 * - Silence detection (RMS energy + post-speech / no-speech silence timer).
 * - Confidence & uncertainty thresholds (never grade unreliable transcripts).
 * - Echo cancellation (`echoCancellation`, `noiseSuppression`, `autoGainControl`).
 * - Strict mic gating while Gretel speaks (`setGretelSpeaking` / `isGretelSpeaking`)
 *   so Gretel's own playback can NEVER be fed to the recognizer or graded as student speech.
 * - Always-available `cancel()` and `interrupt()`.
 */

import { assetPath } from "./assets";
import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_SILENCE_RMS_THRESHOLD,
  type EarsHeard,
  type EarsListenOptions,
  type EarsListenOutcome,
  type EarsProblem,
  type EarsRecognitionMode,
  type EarsStatus,
  type TutorEars,
} from "./tutor-ears";

/** Asset path served by this app; `scripts/fetch-vosk-model.mjs` fills it. */
export const VOSK_MODEL_ASSET_PATH = "models/vosk/vosk-model-small-es-0.42.bin";

export function voskModelUrl(): string {
  const relative = assetPath(VOSK_MODEL_ASSET_PATH);
  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(relative, window.location.origin).href;
  }
  return relative;
}

// ---------------------------------------------------------------------------
// Structural vosk-browser types (the real package's types match these; tests
// inject fakes without loading the ~4 MB WASM bundle).
// ---------------------------------------------------------------------------

export interface VoskWordConfidence {
  readonly conf?: number;
  readonly start?: number;
  readonly end?: number;
  readonly word?: string;
}

export type VoskResultMessage =
  | {
      event: "result";
      result: {
        text: string;
        /** Optional Kaldi/Vosk word-level confidence entries. */
        result?: readonly VoskWordConfidence[];
      };
    }
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
  readonly state?: AudioContextState;
  resume?(): Promise<void>;
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

/**
 * Computes mean word confidence [0..1] from Vosk word-level entries.
 * `[unk]` tokens contribute 0 so uncertain utterances drop below threshold.
 */
export function computeVoskConfidence(
  words: readonly VoskWordConfidence[] | undefined,
): number | undefined {
  if (!words || words.length === 0) return undefined;
  let sum = 0;
  let count = 0;
  for (const w of words) {
    const token = w.word?.trim().toLowerCase();
    if (token === "[unk]" || token === "unk") {
      sum += 0;
      count += 1;
      continue;
    }
    if (typeof w.conf === "number" && Number.isFinite(w.conf)) {
      sum += Math.max(0, Math.min(1, w.conf));
      count += 1;
    }
  }
  if (count === 0) return undefined;
  return Number((sum / count).toFixed(4));
}

/** Computes RMS amplitude of channel 0 when available; returns null for fake buffers without PCM. */
export function computeBufferRms(buffer: AudioBuffer | null | undefined): number | null {
  if (!buffer || typeof buffer.getChannelData !== "function") return null;
  try {
    const channel = buffer.getChannelData(0);
    if (!channel || channel.length === 0) return 0;
    let sumSq = 0;
    for (let i = 0; i < channel.length; i++) {
      const sample = channel[i];
      sumSq += sample * sample;
    }
    return Math.sqrt(sumSq / channel.length);
  } catch {
    return null;
  }
}

const AUDIO_CHUNK_SIZE = 4096;
/** Wait after stop for the recognizer's final `result` event to arrive. */
const FINAL_RESULT_GRACE_MS = 300;
/** Conservative confidence assigned when settling from a partial-only fallback. */
const PARTIAL_ONLY_CONFIDENCE = 0.5;

interface VoskSession {
  mode: EarsRecognitionMode;
  explicitMeta: boolean;
  minConfidence: number;
  finals: string[];
  finalConfidences: number[];
  noiseHeard: boolean;
  lastValidPartial: string;
  speechDetected: boolean;
  silenceMs?: number;
  silenceRmsThreshold: number;
  stream: MediaStream;
  audioContext: VoskAudioContextLike;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode;
  silence: GainNode;
  recognizer: VoskRecognizerLike;
  listenTimer: ReturnType<typeof setTimeout> | null;
  graceTimer: ReturnType<typeof setTimeout> | null;
  silenceTimer: ReturnType<typeof setTimeout> | null;
  /** True once the first final result asked the attempt to wind down. */
  settling: boolean;
  settled: boolean;
  tornDown: boolean;
  captureStopped: boolean;
  onCaptureChange?: (capturing: boolean) => void;
  onPartial?: (partial: string) => void;
  onFinal?: (transcript: string, confidence?: number) => void;
  isGretelSpeaking?: () => boolean;
  onTrackEnded?: () => void;
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
  private gretelSpeaking = false;
  private active: VoskSession | null = null;

  constructor(options: VoskEarsOptions = {}) {
    this.modelUrl = options.modelUrl ?? voskModelUrl();
    this.deps = options.deps ?? {};
  }

  /** Whether mic capture is currently gated because Gretel is speaking. */
  get isGretelSpeaking(): boolean {
    return this.gretelSpeaking;
  }

  /**
   * Strict mic gating while Gretel speaks:
   * - While `speaking` is true, `listen()` refuses to open the mic.
   * - If a listen session is currently open, it is immediately aborted and
   *   its mic tracks stopped so Gretel's playback is never recognized.
   */
  setGretelSpeaking(speaking: boolean): void {
    this.gretelSpeaking = speaking;
    if (speaking) {
      this.abortActiveForPlaybackGate();
    }
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

    // Strict playback gate: never open the microphone while Gretel speaks.
    if (this.gretelSpeaking || opts.isGretelSpeaking?.()) {
      return { ok: false, problem: "no-speech", gatedByPlayback: true };
    }

    if (typeof WebAssembly === "undefined") {
      return { ok: false, problem: "unsupported" };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, problem: "no-microphone" };
    }

    const mode: EarsRecognitionMode =
      opts.mode ?? (opts.grammar && opts.grammar.length > 0 ? "constrained" : "broad");
    const explicitMeta = opts.mode !== undefined || opts.minConfidence !== undefined;
    const minConfidence = opts.minConfidence ?? DEFAULT_CONFIDENCE_THRESHOLD;
    const grammarJson = mode === "constrained" ? voskGrammar(opts.grammar) : undefined;

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
    if (this.gretelSpeaking || opts.isGretelSpeaking?.()) {
      return { ok: false, problem: "no-speech", gatedByPlayback: true };
    }

    let stream: MediaStream;
    try {
      stream = await this.waitForAttempt(
        navigator.mediaDevices
          .getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
              sampleRate: 16000,
            },
          })
          .then((mediaStream) => {
            if (
              generation !== this.generation ||
              this.disposed ||
              this.gretelSpeaking ||
              opts.isGretelSpeaking?.()
            ) {
              mediaStream.getTracks().forEach((track) => track.stop());
            }
            return mediaStream;
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
    if (this.gretelSpeaking || opts.isGretelSpeaking?.()) {
      stream.getTracks().forEach((track) => track.stop());
      return { ok: false, problem: "no-speech", gatedByPlayback: true };
    }

    opts.onCaptureChange?.(true);
    try {
      const audioContext = this.deps.createAudioContext?.() ?? new AudioContext();
      if (audioContext.state === "suspended" && typeof audioContext.resume === "function") {
        await audioContext.resume();
      }
      if (generation !== this.generation || this.disposed) {
        stream.getTracks().forEach((track) => track.stop());
        opts.onCaptureChange?.(false);
        audioContext.close().catch(() => {});
        return { ok: false, problem: "no-speech" };
      }
      if (this.gretelSpeaking || opts.isGretelSpeaking?.()) {
        stream.getTracks().forEach((track) => track.stop());
        opts.onCaptureChange?.(false);
        audioContext.close().catch(() => {});
        return { ok: false, problem: "no-speech", gatedByPlayback: true };
      }

      return await new Promise<EarsListenOutcome>((resolve) => {
        // Audio pipeline — everything below lives in memory only.
        // In "broad" mode grammarJson is always undefined (unconstrained Spanish).
        // In "constrained" mode grammarJson is the deduped lesson grammar + "[unk]".
        const recognizer = new model.KaldiRecognizer(audioContext.sampleRate, grammarJson);
        const processor = audioContext.createScriptProcessor(AUDIO_CHUNK_SIZE, 1, 1);
        const source = audioContext.createMediaStreamSource(stream);
        // Chrome only pumps a ScriptProcessor that reaches the destination;
        // route it through a zero-gain node so child audio is never audible.
        const silence = audioContext.createGain();
        silence.gain.value = 0;

        const onTrackEnded = () => {
          if (session.captureStopped || session.settling || session.settled) return;
          session.settled = true;
          this.teardownSession(session);
          session.resolve({ ok: false, problem: "no-microphone" });
        };

        const session: VoskSession = {
          mode,
          explicitMeta,
          minConfidence,
          finals: [],
          finalConfidences: [],
          noiseHeard: false,
          lastValidPartial: "",
          speechDetected: false,
          silenceMs: opts.silenceMs,
          silenceRmsThreshold: opts.silenceRmsThreshold ?? DEFAULT_SILENCE_RMS_THRESHOLD,
          stream,
          audioContext,
          source,
          processor,
          silence,
          recognizer,
          listenTimer: null,
          graceTimer: null,
          silenceTimer: null,
          settling: false,
          settled: false,
          tornDown: false,
          captureStopped: false,
          onTrackEnded,
          resolve,
          onCaptureChange: opts.onCaptureChange,
          onPartial: opts.onPartial,
          onFinal: opts.onFinal,
          isGretelSpeaking: opts.isGretelSpeaking,
        };
        this.active = session;

        const isPlaybackGated = () =>
          this.gretelSpeaking || Boolean(session.isGretelSpeaking?.());

        const resetSilenceTimer = () => {
          if (!session.silenceMs || session.silenceMs <= 0) return;
          if (session.silenceTimer) clearTimeout(session.silenceTimer);
          session.silenceTimer = setTimeout(() => {
            if (session.settling || session.settled) return;
            if (session.speechDetected) {
              this.finishSession();
            } else {
              session.settled = true;
              this.teardownSession(session);
              session.resolve({ ok: false, problem: "no-speech", silenceDetected: true });
            }
          }, session.silenceMs);
        };

        const audioTracks =
          typeof stream.getAudioTracks === "function"
            ? stream.getAudioTracks()
            : typeof stream.getTracks === "function"
              ? stream.getTracks()
              : [];
        for (const track of audioTracks) {
          track.addEventListener?.("ended", onTrackEnded, { once: true });
          if ("onended" in track && !track.onended) {
            track.onended = onTrackEnded;
          }
        }

        recognizer.on("result", (message) => {
          if (message.event !== "result") return;
          if (isPlaybackGated()) {
            this.abortActiveForPlaybackGate();
            return;
          }
          const text = message.result.text.trim();
          if (!text) return;
          const conf = computeVoskConfidence(message.result.result);
          const tokens = text.split(/\s+/).filter(Boolean);
          const isPureNoise =
            tokens.length > 0 &&
            tokens.every((t) => {
              const lower = t.toLowerCase();
              return lower === "[unk]" || lower === "unk";
            });
          if (isPureNoise) {
            session.noiseHeard = true;
            return;
          }
          session.speechDetected = true;
          session.finals.push(text);
          if (conf !== undefined) {
            session.finalConfidences.push(conf);
          }
          session.onFinal?.(text, conf);
          this.status = "hearing";
          // A finished child utterance is recognized: end the attempt now.
          this.finishSession();
        });

        recognizer.on("partialresult", (message) => {
          if (message.event !== "partialresult") return;
          if (isPlaybackGated()) {
            this.abortActiveForPlaybackGate();
            return;
          }
          const partial = message.result.partial.trim();
          if (partial) {
            session.speechDetected = true;
            this.status = "hearing";
            session.onPartial?.(partial);
            resetSilenceTimer();
            const validTokens = partial.split(/\s+/).filter((t) => {
              const lower = t.toLowerCase();
              return lower && lower !== "[unk]" && lower !== "unk";
            });
            if (validTokens.length > 0) {
              session.lastValidPartial = validTokens.join(" ");
            }
          }
        });

        processor.onaudioprocess = (event) => {
          if (isPlaybackGated()) {
            this.abortActiveForPlaybackGate();
            return;
          }
          const rms = computeBufferRms(event.inputBuffer);
          if (rms !== null && rms >= session.silenceRmsThreshold) {
            session.speechDetected = true;
            resetSilenceTimer();
          }
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
        resetSilenceTimer();
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

  /**
   * Always-available stop/interrupt: discards any in-flight speech immediately,
   * closes the mic, and resolves with `{ ok: false, problem: "no-speech", interrupted: true }`.
   */
  interrupt(): void {
    this.generation += 1;
    this.cancelListenWait?.();
    const session = this.active;
    if (!session || session.settled) return;
    session.settled = true;
    this.teardownSession(session);
    session.resolve({ ok: false, problem: "no-speech", interrupted: true });
  }

  dispose(): void {
    this.disposed = true;
    this.cancel();
    this.cancelModelLoad?.();
    this.model?.terminate();
    this.model = null;
    this.modelPromise = null;
    this.status = "off";
  }

  private abortActiveForPlaybackGate(): void {
    this.generation += 1;
    this.cancelListenWait?.();
    const session = this.active;
    if (!session || session.settled) return;
    session.settled = true;
    this.teardownSession(session);
    session.resolve({ ok: false, problem: "no-speech", gatedByPlayback: true });
  }

  /** Ask the recognizer to flush its final result, then settle after a grace. */
  private finishSession(): void {
    const session = this.active;
    if (!session || session.settling || session.settled) return;
    session.settling = true;
    this.stopCapture(session);
    if (session.listenTimer) clearTimeout(session.listenTimer);
    if (session.silenceTimer) clearTimeout(session.silenceTimer);
    session.listenTimer = null;
    session.silenceTimer = null;
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

    const hasFinals = session.finals.length > 0;
    let transcript = session.finals.join(" ").trim();
    if (!transcript && session.lastValidPartial) {
      transcript = session.lastValidPartial;
    }

    if (transcript) {
      const cleanTokens = transcript.split(/\s+/).filter((t) => {
        const lower = t.toLowerCase();
        return lower !== "[unk]" && lower !== "unk";
      });
      if (cleanTokens.length > 0) {
        transcript = cleanTokens.join(" ");
      }

      const outcome: EarsHeard = { ok: true, transcript, alternatives: [] };

      const meanConf =
        session.finalConfidences.length > 0
          ? Number(
              (
                session.finalConfidences.reduce((sum, c) => sum + c, 0) /
                session.finalConfidences.length
              ).toFixed(4),
            )
          : undefined;

      // Attach extended metadata when word confidences were reported or the caller
      // explicitly opted into mode/confidence tracking (preserves exact legacy object
      // shape for existing tests that do not pass mode/minConfidence/word confidences).
      if (meanConf !== undefined || session.explicitMeta) {
        const resolvedConf = meanConf ?? (hasFinals ? 1 : PARTIAL_ONLY_CONFIDENCE);
        outcome.mode = session.mode;
        outcome.confidence = resolvedConf;
        outcome.reliable = resolvedConf >= session.minConfidence;
        outcome.isFinal = hasFinals;
      }

      session.resolve(outcome);
    } else if (session.noiseHeard) {
      const outcome: EarsHeard = { ok: true, transcript: "[unk]", alternatives: [] };
      if (session.explicitMeta) {
        outcome.mode = session.mode;
        outcome.confidence = 0;
        outcome.reliable = false;
        outcome.isFinal = false;
      }
      session.resolve(outcome);
    } else {
      session.resolve({ ok: false, problem: "no-speech" });
    }
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
    if (session.onTrackEnded) {
      const audioTracks =
        typeof session.stream.getAudioTracks === "function"
          ? session.stream.getAudioTracks()
          : typeof session.stream.getTracks === "function"
            ? session.stream.getTracks()
            : [];
      for (const track of audioTracks) {
        track.removeEventListener?.("ended", session.onTrackEnded);
        if (track.onended === session.onTrackEnded) {
          track.onended = null;
        }
      }
    }
    if (session.listenTimer) clearTimeout(session.listenTimer);
    if (session.graceTimer) clearTimeout(session.graceTimer);
    if (session.silenceTimer) clearTimeout(session.silenceTimer);
    session.listenTimer = null;
    session.graceTimer = null;
    session.silenceTimer = null;
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
                if (worker) {
                  worker.onerror = (e: Event) => {
                    const message =
                      "message" in e && typeof e.message === "string"
                        ? e.message
                        : "Worker initialization failed";
                    finish(new Error(message));
                  };
                }
                model.on("load", (message) => {
                  const hasResult =
                    typeof message === "object" &&
                    message !== null &&
                    "result" in message &&
                    Boolean(message.result);
                  finish(hasResult ? undefined : new Error("Local model did not load"));
                });
                model.on("error", (message) => {
                  const errorMsg =
                    typeof message === "object" && message !== null && "error" in message
                      ? String(message.error)
                      : "Model error";
                  finish(new Error(errorMsg));
                });
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
