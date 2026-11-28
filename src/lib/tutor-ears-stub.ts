/**
 * StubEars — scripted ears for unit tests and e2e runs (spec §2, §4).
 *
 * Never touches a microphone, a Web Worker, or the network. The queue is
 * consumed in order, one item per `listen()` call; when it runs dry, every
 * further attempt reports "no-speech" (the gentle silence path).
 *
 * e2e injection: a Playwright spec writes a JSON script to the localStorage
 * key `cartilla.tutor.test-ears.v1`. The script is read fresh at every
 * `probe()` and `listen()` call, so a spec can rewrite it mid-run. Shape:
 *
 *   { "probe": "ready" | "denied" | "no-local" | "no-microphone"
 *             | "unsupported" | "failed",
 *     "probeDelayMs": 1200,
 *     "queue": [ { "ok": true, "transcript": "casa", "alternatives": ["la casa"] },
 *                { "ok": false, "problem": "no-speech", "holdMs": 4000 } ] }
 *
 * Each queue item resolves after its `holdMs` (250 ms by default) so a spec
 * can hold the listening window open; a hold that would outlast the caller's
 * `maxMs` is cut off at `maxMs` with "no-speech" (the mic never really opens).
 * An absent, malformed, or non-object script keeps the constructor queue and
 * its instant pacing untouched. The stub never throws and never writes — it
 * only reads that one key. Rewriting the script restarts its queue.
 */

import type {
  EarsFailure,
  EarsListenOptions,
  EarsListenOutcome,
  EarsProblem,
  EarsStatus,
  TutorEars,
} from "./tutor-ears";

export type StubEarsItem = EarsListenOutcome;

/** localStorage key Playwright specs write to script the stub (test-only). */
const TEST_EARS_SCRIPT_KEY = "cartilla.tutor.test-ears.v1";
/** Default pacing for scripted queue items without an explicit `holdMs`. */
const SCRIPTED_HOLD_MS = 250;

/** probe() results a script may ask for ("no-speech" is a listen outcome). */
const SCRIPTED_PROBE_RESULTS: readonly string[] = [
  "ready",
  "denied",
  "no-local",
  "no-microphone",
  "unsupported",
  "failed",
];

/** EarsProblem values a scripted failure item may carry. */
const SCRIPTED_PROBLEMS: readonly string[] = [
  "unsupported",
  "no-local",
  "denied",
  "no-microphone",
  "no-speech",
  "failed",
];

interface EarsScript {
  /** Raw text as last stored, to detect mid-run rewrites. */
  readonly raw: string;
  readonly probe: unknown;
  readonly probeDelayMs: unknown;
  readonly queue: readonly unknown[];
}

interface ScriptedItem {
  readonly holdMs: number;
  readonly outcome: EarsListenOutcome;
}

const NO_SPEECH: EarsFailure = { ok: false, problem: "no-speech" };

/**
 * Reads the injected script. Null when localStorage is unavailable, the key
 * is absent, or the value is malformed — callers fall back to default
 * behavior. Never throws.
 */
function readScript(): EarsScript | null {
  if (typeof localStorage === "undefined") return null;
  let raw: string | null;
  try {
    raw = localStorage.getItem(TEST_EARS_SCRIPT_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    return {
      raw,
      probe: record.probe,
      probeDelayMs: record.probeDelayMs,
      queue: Array.isArray(record.queue) ? (record.queue as readonly unknown[]) : [],
    };
  } catch {
    return null;
  }
}

/** holdMs of a scripted item; anything invalid falls back to the default. */
function itemHoldMs(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : SCRIPTED_HOLD_MS;
}

/** Validates one queue entry; null for anything not a well-formed outcome. */
function asScriptedItem(value: unknown): ScriptedItem | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const holdMs = itemHoldMs(record.holdMs);
  if (record.ok === true) {
    if (typeof record.transcript !== "string") return null;
    const rawAlternatives = record.alternatives;
    const alternatives =
      Array.isArray(rawAlternatives) && rawAlternatives.every((a) => typeof a === "string")
        ? (rawAlternatives as string[])
        : [];
    return { holdMs, outcome: { ok: true, transcript: record.transcript, alternatives } };
  }
  if (
    record.ok === false &&
    typeof record.problem === "string" &&
    SCRIPTED_PROBLEMS.includes(record.problem)
  ) {
    return { holdMs, outcome: { ok: false, problem: record.problem as EarsProblem } };
  }
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      "[StubEars] Discarding malformed queue item (expected ok:true with transcript, or ok:false with problem in SCRIPTED_PROBLEMS):",
      value,
    );
  }
  return null;
}

export class StubEars implements TutorEars {
  readonly kind = "stub" as const;
  readonly status: EarsStatus = "ready";
  /** Every `listen()` call, in order — for test/e2e assertions. */
  readonly listenCalls: EarsListenOptions[] = [];
  private readonly queue: StubEarsItem[];
  /** Raw script last consumed; its queue is consumed via `scriptCursor`. */
  private scriptRaw: string | null = null;
  private scriptCursor = 0;

  constructor(items: readonly StubEarsItem[] = []) {
    this.queue = [...items];
  }

  probe(): Promise<"ready" | EarsProblem> {
    const script = readScript();
    if (script === null) return Promise.resolve("ready");
    const problem =
      typeof script.probe === "string" && SCRIPTED_PROBE_RESULTS.includes(script.probe)
        ? (script.probe as "ready" | EarsProblem)
        : "ready";
    const delay =
      typeof script.probeDelayMs === "number" &&
      Number.isFinite(script.probeDelayMs) &&
      script.probeDelayMs > 0
        ? script.probeDelayMs
        : 0;
    if (delay <= 0) return Promise.resolve(problem);
    return new Promise((resolve) => {
      setTimeout(() => resolve(problem), delay);
    });
  }

  listen(opts: EarsListenOptions): Promise<EarsListenOutcome> {
    this.listenCalls.push(opts);
    const script = readScript();
    if (script === null) {
      // No script: the constructor queue with its original instant pacing.
      const next = this.queue.shift();
      return Promise.resolve(next ?? NO_SPEECH);
    }

    // Same stored script → keep consuming its queue in order. A rewritten
    // script restarts from its first item, so a spec can inject the next
    // outcomes mid-run.
    if (script.raw !== this.scriptRaw) {
      this.scriptRaw = script.raw;
      this.scriptCursor = 0;
    }

    // Skip malformed entries gracefully; the stub never throws.
    let item: ScriptedItem | null = null;
    while (item === null && this.scriptCursor < script.queue.length) {
      item = asScriptedItem(script.queue[this.scriptCursor]);
      this.scriptCursor += 1;
    }
    if (item === null) return Promise.resolve(NO_SPEECH); // dry → instant

    if (item.holdMs > opts.maxMs) {
      // The attempt's hard stop: the scripted hold would outlast maxMs, and
      // the mic never opened, so the gentle silence path answers.
      return new Promise((resolve) => {
        setTimeout(() => resolve(NO_SPEECH), opts.maxMs);
      });
    }
    const outcome = item.outcome;
    const holdMs = item.holdMs;
    return new Promise((resolve) => {
      setTimeout(() => resolve(outcome), holdMs);
    });
  }

  cancel(): void {
    // Nothing is ever open in the stub; a scripted result already returned
    // stays with its caller, mirroring the real engines' settle semantics.
  }
}
