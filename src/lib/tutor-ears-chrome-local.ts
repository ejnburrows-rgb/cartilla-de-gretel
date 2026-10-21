/**
 * ChromeLocalEars — the browser's own on-device Web Speech recognizer, with
 * `processLocally`-only semantics copied from `src/hooks/usePianoListening.ts`
 * (spec §18.2, owner decision 2026-10-21):
 *
 * - a recognizer is created only after the browser confirms
 *   `available({ processLocally: true }) === "available"` for the language;
 * - `available`/`downloadable` is NOT usable ("downloadable" would mean the
 *   language pack is not on the device yet — never start the recognizer then);
 * - every session starts with `processLocally = true`, and if the property
 *   does not stick the recognizer is never started;
 * - there is never a silent fallback to an online speech service (Google,
 *   Apple, or any other) — if the browser cannot stay on the device, the mic
 *   stays off and the problem is reported as "no-local".
 *
 * The brain layer runs this engine alongside VoskEars on the same tap and
 * treats its transcript as one extra alternative for the matcher (fusion
 * happens there, not here).
 */

import { getSpeechRecognitionCtor } from "./speech-recognition-types";
import type {
  EarsLang,
  EarsListenOptions,
  EarsListenOutcome,
  EarsProblem,
  EarsStatus,
  TutorEars,
} from "./tutor-ears";

type ChromeRecognitionResultList = ArrayLike<
  ArrayLike<{ transcript: string }> & { isFinal?: boolean }
>;

interface ChromeRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  processLocally?: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: ChromeRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type ChromeRecognitionCtor = (new () => ChromeRecognition) & {
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
};

/**
 * The spec's EarsProblem vocabulary has no "network" case: with
 * `processLocally`, a network error means the recognizer could not stay on
 * the device, so the session ends as "no-local" — never a cloud retry.
 */
const ERROR_MAP: Record<string, EarsProblem> = {
  "not-allowed": "denied",
  "audio-capture": "no-microphone",
  network: "no-local",
  "no-speech": "no-speech",
  "language-not-supported": "no-local",
  "service-not-allowed": "no-local",
};

/** Safety stop after `stop()` in case the browser never fires `onend`. */
const END_GRACE_MS = 1000;

interface ChromeSession {
  lang: string;
  recognition: ChromeRecognition;
  delivered: Set<number>;
  finals: string[];
  /** Problem reported by the recognizer before the session ended, if any. */
  pendingProblem: EarsProblem | null;
  listenTimer: ReturnType<typeof setTimeout> | null;
  graceTimer: ReturnType<typeof setTimeout> | null;
  settled: boolean;
  tornDown: boolean;
  resolve: (outcome: EarsListenOutcome) => void;
}

export class ChromeLocalEars implements TutorEars {
  readonly kind = "chrome-local" as const;
  /** Coarse ears state for UI feedback; not part of the TutorEars contract. */
  status: EarsStatus = "off";

  private readonly defaultLang: string;
  private readonly confirmed = new Map<string, boolean>();
  private active: ChromeSession | null = null;

  constructor(options: { lang?: string } = {}) {
    this.defaultLang = options.lang ?? "es-MX";
  }

  /**
   * Readiness check for the configured language. Never opens the microphone
   * (Web Speech manages its own mic; it is only ever touched inside listen()).
   */
  async probe(): Promise<"ready" | EarsProblem> {
    const Ctor = this.ctor();
    if (!Ctor) return "unsupported";
    if (typeof Ctor.available !== "function") {
      // The browser cannot promise on-device recognition: never start it.
      return "no-local";
    }
    if (!(await this.confirmOnDevice(Ctor, this.defaultLang))) {
      return "no-local";
    }
    return "ready";
  }

  async listen(opts: EarsListenOptions): Promise<EarsListenOutcome> {
    // One attempt at a time; a previous recognizer session ends right here.
    this.cancel();
    const Ctor = this.ctor();
    if (!Ctor) return { ok: false, problem: "unsupported" };
    if (typeof Ctor.available !== "function") {
      return { ok: false, problem: "no-local" };
    }
    this.status = "checking";
    // Only a confirmed on-device recognizer may ever be created.
    if (!(await this.confirmOnDevice(Ctor, opts.lang))) {
      this.status = "unavailable";
      return { ok: false, problem: "no-local" };
    }
    return new Promise<EarsListenOutcome>((resolve) => {
      this.runSession(new Ctor(), opts, resolve);
    });
  }

  /** Aborts any open recognizer session immediately. */
  cancel(): void {
    const session = this.active;
    if (!session) return;
    this.finalizeSession();
  }

  private ctor(): ChromeRecognitionCtor | undefined {
    return getSpeechRecognitionCtor() as unknown as ChromeRecognitionCtor | undefined;
  }

  /** Memoized on-device confirmation; only "available" counts. */
  private async confirmOnDevice(Ctor: ChromeRecognitionCtor, lang: string): Promise<boolean> {
    const cached = this.confirmed.get(lang);
    if (cached !== undefined) return cached;
    const available = Ctor.available;
    // async wrapper: a synchronous throw becomes a rejection (handled below).
    const askOnDevice = async () => available!.call(Ctor, { langs: [lang], processLocally: true });
    try {
      const ok = (await askOnDevice()) === "available";
      this.confirmed.set(lang, ok);
      return ok;
    } catch {
      this.confirmed.set(lang, false);
      return false;
    }
  }

  private runSession(
    recognition: ChromeRecognition,
    opts: EarsListenOptions,
    resolve: (outcome: EarsListenOutcome) => void,
  ): void {
    recognition.lang = opts.lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.processLocally = true;
    if (recognition.processLocally !== true) {
      // The property did not stick: this recognizer cannot stay on the device.
      this.confirmed.set(opts.lang, false);
      this.status = "unavailable";
      resolve({ ok: false, problem: "no-local" });
      return;
    }

    const session: ChromeSession = {
      lang: opts.lang,
      recognition,
      delivered: new Set<number>(),
      finals: [],
      pendingProblem: null,
      listenTimer: null,
      graceTimer: null,
      settled: false,
      tornDown: false,
      resolve,
    };
    this.active = session;
    const current = () => this.active === session;

    recognition.onstart = () => {
      // Some browsers report "started" after a permission error; stay put then.
      if (current()) this.status = "listening";
    };
    recognition.onspeechstart = () => {
      if (current()) this.status = "hearing";
    };
    recognition.onspeechend = () => {
      if (current()) this.status = "listening";
    };
    recognition.onresult = (event) => {
      if (!current()) return;
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? "";
        // Every FINAL result is delivered exactly once, by result index.
        if (result?.isFinal && !session.delivered.has(index)) {
          session.delivered.add(index);
          if (text.trim()) session.finals.push(text.trim());
          this.status = "hearing";
        }
      }
    };
    recognition.onerror = (event) => {
      if (!current()) return;
      if (event.error === "aborted") return;
      const mapped = ERROR_MAP[event.error] ?? "failed";
      session.pendingProblem = mapped;
      if (mapped === "no-local") {
        // The browser could not stay on the device: never trust it again.
        this.confirmed.set(session.lang, false);
        this.status = "unavailable";
        this.finalizeSession();
        return;
      }
      if (mapped === "no-speech") {
        // Let the browser's own end event settle the attempt.
        return;
      }
      // Permission, device or service problem: abort now, don't wait for end.
      this.finalizeSession();
    };
    recognition.onend = () => {
      if (!current()) return;
      this.finalizeSession();
    };

    try {
      recognition.start();
    } catch {
      this.finalizeSession();
      return;
    }
    // Safety stop so a forgotten recognizer never stays open.
    session.listenTimer = setTimeout(() => {
      if (!current()) return;
      try {
        // Let the recognizer flush its last final result, then end.
        recognition.stop();
      } catch {
        this.finalizeSession();
      }
    }, opts.maxMs);
    session.graceTimer = setTimeout(() => {
      if (!current()) return;
      this.finalizeSession();
    }, opts.maxMs + END_GRACE_MS);
  }

  private finalizeSession(): void {
    const session = this.active;
    if (!session || session.settled) return;
    session.settled = true;
    this.teardownSession(session);
    const transcript = session.finals.join(" ").trim();
    session.resolve(
      transcript
        ? { ok: true, transcript, alternatives: [] }
        : { ok: false, problem: session.pendingProblem ?? "no-speech" },
    );
  }

  private teardownSession(session: ChromeSession): void {
    if (session.tornDown) return;
    session.tornDown = true;
    const recognition = session.recognition;
    if (session.listenTimer) clearTimeout(session.listenTimer);
    if (session.graceTimer) clearTimeout(session.graceTimer);
    session.listenTimer = null;
    session.graceTimer = null;
    recognition.onstart = null;
    recognition.onspeechstart = null;
    recognition.onspeechend = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.abort();
    } catch {
      // Already stopped.
    }
    if (this.active === session) {
      this.active = null;
      this.status = "ready";
    }
  }
}
