/**
 * TutorEars — the tutor's "ears": on-device speech recognition for the
 * child's spoken answers (spec §4, §18.2, Milestone 9).
 *
 * Owner decision (2026-10-21, spec §0): recognition is **on-device only**.
 * No cloud speech service, no Gemini, ever. The microphone opens only inside
 * `listen()`, which runs only after the child taps; the mic is off by
 * default. Audio stays in memory and is discarded after each attempt — it is
 * never written to IndexedDB, Cache, storage, or the network.
 *
 * Milestone 9 explicit Vosk recognition modes:
 * - `"constrained"`: grammar-limited decoding for known words, letters,
 *   syllables, and exercise answers. NEVER labeled open conversation.
 * - `"broad"`: unconstrained Spanish decoding for student questions and
 *   commands.
 *
 * Engines:
 * - `VoskEars` (primary): vosk-browser WASM (`vosk-model-small-es-0.42`),
 *   runs in its own Web Worker.
 * - `ChromeLocalEars`: the browser's own on-device Web Speech recognizer,
 *   used only when the browser confirms on-device processing.
 * - `StubEars`: scripted results for tests and e2e.
 */

import { StubEars } from "./tutor-ears-stub";
import { VoskEars } from "./tutor-ears-vosk";

export type EarsStatus = "off" | "checking" | "ready" | "listening" | "hearing" | "unavailable";

export type EarsProblem =
  | "unsupported"
  | "no-local"
  | "denied"
  | "no-microphone"
  | "no-speech"
  | "failed";

export type EarsLang = "es-US" | "es-419" | "es-MX";

/**
 * Explicit on-device speech recognition mode:
 * - `"constrained"`: grammar-limited for known lesson words/letters/answers
 *   (NEVER labeled open conversation).
 * - `"broad"`: unconstrained Spanish for questions and commands.
 */
export type EarsRecognitionMode = "constrained" | "broad";

export interface EarsModeDescriptor {
  readonly mode: EarsRecognitionMode;
  readonly label: string;
  readonly description: string;
  readonly grammarLimited: boolean;
  /** Always false for constrained mode; broad mode is still on-device command/question recognition. */
  readonly isOpenConversation: false;
}

export const EARS_MODE_DESCRIPTORS: Readonly<Record<EarsRecognitionMode, EarsModeDescriptor>> = {
  constrained: {
    mode: "constrained",
    label: "Reconocimiento guiado (palabras y respuestas de la lección)",
    description:
      "Escucha limitada al vocabulario de la lección, letras, sílabas y comandos básicos.",
    grammarLimited: true,
    isOpenConversation: false,
  },
  broad: {
    mode: "broad",
    label: "Español amplio (preguntas y comandos)",
    description:
      "Reconocimiento local de español sin lista fija para preguntas, ayuda y navegación.",
    grammarLimited: false,
    isOpenConversation: false,
  },
};

export function describeRecognitionMode(mode: EarsRecognitionMode): EarsModeDescriptor {
  return EARS_MODE_DESCRIPTORS[mode];
}

/** Default minimum confidence [0..1] required before a transcript may be graded. */
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;
/** Default post-speech silence window (ms) before auto-settling a turn. */
export const DEFAULT_SILENCE_MS = 1800;
/** Default RMS amplitude threshold below which audio is treated as silence. */
export const DEFAULT_SILENCE_RMS_THRESHOLD = 0.012;

export interface EarsHeard {
  ok: true;
  transcript: string;
  alternatives: string[];
  /** Explicit recognition mode used for this utterance when specified. */
  mode?: EarsRecognitionMode;
  /** Mean word confidence [0..1] when reported by the recognizer. */
  confidence?: number;
  /**
   * False when confidence is below threshold or transcript is unreliable.
   * Unreliable transcripts must NEVER be graded as counted attempts.
   */
  reliable?: boolean;
  /** True when produced from a final recognizer result (false for partial-only fallback). */
  isFinal?: boolean;
}

export interface EarsFailure {
  ok: false;
  problem: EarsProblem;
  /** True when capture was refused or aborted because Gretel is speaking. */
  gatedByPlayback?: boolean;
  /** True when the attempt was explicitly stopped/interrupted. */
  interrupted?: boolean;
  /** True when silence detection closed the turn without speech. */
  silenceDetected?: boolean;
}

export type EarsListenOutcome = EarsHeard | EarsFailure;

export interface EarsListenOptions {
  lang: EarsLang;
  /** Hard stop for the attempt; the mic is released by then at the latest. */
  maxMs: number;
  /**
   * Explicit Vosk mode:
   * - `"constrained"`: grammar-limited for known words/letters/exercise answers.
   * - `"broad"`: unconstrained Spanish for questions & commands (ignores `grammar`).
   * Defaults to `"constrained"` when `grammar` is non-empty, otherwise `"broad"`.
   */
  mode?: EarsRecognitionMode;
  /**
   * On-device grammar for `"constrained"` mode (spec §18.2): the lesson's items,
   * same-page distractors, vowels and aliases, command words. `"[unk]"` is always
   * appended by the engine so off-grammar speech degrades gracefully.
   */
  grammar?: readonly string[];
  /** Confidence threshold [0..1] below which a transcript is marked unreliable. */
  minConfidence?: number;
  /** Optional silence timeout (ms) for voice-activity / post-speech silence detection. */
  silenceMs?: number;
  /** RMS amplitude threshold for silence detection (default 0.012). */
  silenceRmsThreshold?: number;
  /** Callback for live partial transcripts while the student is speaking. */
  onPartial?: (partial: string) => void;
  /** Callback for final recognizer transcripts before the session settles. */
  onFinal?: (transcript: string, confidence?: number) => void;
  /** Synchronous playback gate: returns true while Gretel's audio is playing. */
  isGretelSpeaking?: () => boolean;
  onCaptureChange?: (capturing: boolean) => void;
}

export interface TutorEars {
  readonly kind: "vosk" | "chrome-local" | "stub";
  /** Readiness check. NEVER opens the microphone. */
  probe(): Promise<"ready" | EarsProblem>;
  /** Opens the mic, listens once, and releases the mic before resolving. */
  listen(opts: EarsListenOptions): Promise<EarsListenOutcome>;
  /** Stops any open mic session immediately; mic light off. */
  cancel(): void;
  /** Always-available stop/interrupt that discards in-flight audio immediately. */
  interrupt?(): void;
  /** Strict mic gating while Gretel speaks so her playback is never recognized. */
  setGretelSpeaking?(speaking: boolean): void;
  dispose?(): void;
}

/**
 * Determines whether a heard transcript is reliable enough to grade.
 * Unreliable transcripts (low confidence, partial-only uncertainty, or pure `[unk]`)
 * must NEVER be graded as counted student attempts.
 */
export function isTranscriptReliable(
  heard: Pick<EarsHeard, "transcript" | "confidence" | "reliable">,
  minConfidence: number = DEFAULT_CONFIDENCE_THRESHOLD,
): boolean {
  if (heard.reliable === false) return false;
  if (typeof heard.confidence === "number" && heard.confidence < minConfidence) {
    return false;
  }
  const trimmed = heard.transcript.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const allUnk = tokens.every((t) => {
    const lower = t.toLowerCase();
    return lower === "[unk]" || lower === "unk";
  });
  return !allUnk;
}

/**
 * Builds the tutor's ears. The microphone stays off; `listen()` is the only
 * code path that can open it. Under Vitest (`import.meta.env.MODE === "test"`,
 * the repo's existing test-env signal) the scripted StubEars is returned so
 * no test or e2e run ever touches a real microphone.
 */
export function createTutorEars(): TutorEars {
  // NARROW e2e OVERRIDE (screens lane, the one approved exception to the
  // finished-lanes rule): a compile-time env flag lets Playwright force the
  // scripted StubEars before the MODE check. It is impossible to trigger in
  // a production build: Vite bakes `import.meta.env.VITE_TUTOR_EARS` at
  // build time and production never defines it, so the comparison is dead.
  if (!import.meta.env.PROD && import.meta.env.VITE_TUTOR_EARS === "stub") return new StubEars();
  if (!import.meta.env.PROD && import.meta.env.MODE === "test") return new StubEars();
  // Owner decision: Vosk is the primary engine. ChromeLocalEars is built by
  // the brain/route layer next to it and only when its own probe() is ready.
  return new VoskEars();
}
