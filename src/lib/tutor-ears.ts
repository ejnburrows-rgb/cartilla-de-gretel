/**
 * TutorEars — the tutor's "ears": on-device speech recognition for the
 * child's spoken answers (spec §4, §18.2).
 *
 * Owner decision (2026-10-21, spec §0): recognition is **on-device only**.
 * No cloud speech service, no Gemini, ever. The microphone opens only inside
 * `listen()`, which runs only after the child taps; the mic is off by
 * default. Audio stays in memory and is discarded after each attempt — it is
 * never written to IndexedDB, Cache, storage, or the network.
 *
 * Engines:
 * - `VoskEars` (primary): vosk-browser WASM, runs in its own Web Worker.
 * - `ChromeLocalEars`: the browser's own on-device Web Speech recognizer,
 *   used only when the browser confirms on-device processing. Constructed by
 *   the brain/route layer alongside VoskEars; its transcript is treated there
 *   as one extra alternative (fusion is the brain layer's job, not ours).
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

export interface EarsHeard {
  ok: true;
  transcript: string;
  alternatives: string[];
}

export interface EarsFailure {
  ok: false;
  problem: EarsProblem;
}

export type EarsListenOutcome = EarsHeard | EarsFailure;

export interface EarsListenOptions {
  lang: EarsLang;
  /** Hard stop for the attempt; the mic is released by then at the latest. */
  maxMs: number;
  /**
   * On-device grammar for this attempt (spec §18.2): the lesson's items, the
   * same-page distractors, the 5 vowels and their aliases, the command words.
   * Engines that can constrain decoding use it natively; `"[unk]"` is always
   * added by the engine so off-grammar speech degrades gracefully. The brain
   * layer composes the list from the lesson content and the command words.
   */
  grammar?: readonly string[];
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
  dispose?(): void;
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
