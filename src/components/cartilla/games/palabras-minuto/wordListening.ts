// Free in-browser speech recognition (Web Speech API) for Palabras por minuto.
// No accounts, keys or paid services. Detects that a word was said, tolerant of imperfect pronunciation.
import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "@/lib/speech-recognition-types";

/** Spanish-sounding key: no accents, h silent, b/v, s/z/c, k/c/qu, ll/y merged. */
export function sound(word: string): string {
  let w = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  w = w
    .replace(/qu/g, "k")
    .replace(/ll/g, "y")
    .replace(/c([ei])/g, "s$1")
    .replace(/c/g, "k")
    .replace(/[zx]/g, "s")
    .replace(/[vw]/g, "b")
    .replace(/h/g, "")
    .replace(/y$/, "i")
    .replace(/(.)\1+/g, "$1");
  return w;
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

/** True when the spoken token is the target word, allowing one slip for words of 3+ sounds. */
export function wordHeard(spoken: string, target: string): boolean {
  const a = sound(spoken);
  const b = sound(target);
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 3) return false;
  return distance(a, b) <= (Math.max(a.length, b.length) >= 7 ? 2 : 1);
}

export function tokens(transcript: string): string[] {
  return transcript
    .split(/[\s,.;:!?¡¿"']+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Walk the spoken tokens in order and count how many consecutive target words, starting at `from`,
 * were said. Returns the number of targets matched and how many tokens were used.
 */
export function matchSpoken(
  spoken: string[],
  targets: string[],
  from: number,
  startToken = 0,
): { matched: number; tokensUsed: number } {
  let pos = startToken;
  let matched = 0;
  while (from + matched < targets.length) {
    const target = targets[from + matched];
    let found = -1;
    for (let j = pos; j < spoken.length; j++) {
      if (wordHeard(spoken[j], target)) {
        found = j;
        break;
      }
    }
    if (found < 0) break;
    matched++;
    pos = found + 1;
  }
  return { matched, tokensUsed: pos };
}

export type ListenState = "off" | "listening" | "denied" | "unsupported";

export function speechSupported(): boolean {
  return !!getSpeechRecognitionCtor();
}

export function spanishLang(): string {
  const l = typeof navigator !== "undefined" ? navigator.language || "" : "";
  return /^es/i.test(l) ? l : "es-US";
}

export interface WordListener {
  start(): void;
  stop(): void;
}

/**
 * Continuous listener that restarts itself while active (browsers end sessions after silence).
 * `onSpoken(alternatives, resultKey)` gets every alternative transcript of a result; `resultKey`
 * identifies the utterance so the caller can avoid counting the same words twice.
 */
export function createWordListener(handlers: {
  onSpoken: (alternatives: string[], resultKey: number) => void;
  onState: (s: ListenState) => void;
}): WordListener | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;
  let rec: SpeechRecognitionLike | null = null;
  let active = false;
  let session = 0;

  const make = () => {
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = spanishLang();
    (r as unknown as { maxAlternatives: number }).maxAlternatives = 3;
    r.onstart = () => handlers.onState("listening");
    r.onresult = (event: SpeechRecognitionEventLike) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const alts: string[] = [];
        for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
        handlers.onSpoken(alts, session * 1000 + i);
      }
    };
    r.onerror = (e) => {
      if (
        e.error === "not-allowed" ||
        e.error === "service-not-allowed" ||
        e.error === "audio-capture"
      ) {
        active = false;
        handlers.onState("denied");
      }
      // "no-speech" / "aborted" / "network": onend restarts while active.
    };
    r.onend = () => {
      if (!active) return;
      session++;
      window.setTimeout(() => {
        if (!active) return;
        try {
          r.start();
        } catch {
          /* already started */
        }
      }, 250);
    };
    return r;
  };

  return {
    start() {
      if (active) return;
      active = true;
      session++;
      rec = make();
      try {
        rec.start();
      } catch {
        active = false;
        handlers.onState("denied");
      }
    },
    stop() {
      active = false;
      try {
        rec?.abort();
      } catch {
        /* ignore */
      }
      rec = null;
      handlers.onState("off");
    },
  };
}
