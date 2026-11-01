/**
 * @vitest-environment jsdom
 *
 * EMPIRICAL ADVERSARIAL CHALLENGE SUITE FOR MILESTONE M1
 * Tests the 4 critical scope items:
 * 1. ChromeLocalEars immediate resolution on isFinal: true
 * 2. ChromeLocalEars cancellation during on-device probe
 * 3. Primary/Chrome concurrency and non-blocking Promise.all
 * 4. SPANISH_CARRIER_WORDS grammar presence and tutor-match parsing
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChromeLocalEars } from "../tutor-ears-chrome-local";
import { SPANISH_CARRIER_WORDS, buildListenGrammar } from "../tutor-brain";
import { matchTarget } from "../tutor-match";
import { findTutorItem, itemsForLesson } from "../tutor-content";
import type { EarsListenOutcome } from "../tutor-ears";

// ---------------------------------------------------------------------------
// Chrome on-device Web Speech fakes
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
  processLocally?: boolean = true;
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

describe("M1 Challenge 1: ChromeLocalEars immediate resolution on isFinal", () => {
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
    vi.restoreAllMocks();
  });

  it("resolves immediately on isFinal: true with text without waiting for 60s maxMs", async () => {
    const ears = new ChromeLocalEars();
    const startTime = Date.now();
    const listenPromise = ears.listen({ lang: "es-MX", maxMs: 60_000 });

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    // Emit isFinal: true with text
    rec.results([["oso", true]]);

    const outcome = await listenPromise;
    const elapsed = Date.now() - startTime;

    expect(outcome).toEqual({
      ok: true,
      transcript: "oso",
      alternatives: [],
    });
    // Must resolve in under 1 second, definitely not anywhere near 60,000ms
    expect(elapsed).toBeLessThan(1000);
    expect(rec.abort).toHaveBeenCalled();
  });

  it("does NOT resolve early on isFinal: true if transcript is empty or pure whitespace", async () => {
    const ears = new ChromeLocalEars();
    let settled = false;
    const listenPromise = ears.listen({ lang: "es-MX", maxMs: 5000 }).then((res) => {
      settled = true;
      return res;
    });

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    // Emit isFinal: true at index 0 but empty
    rec.results([["", true]], 0);
    await new Promise((r) => setTimeout(r, 50));
    expect(settled).toBe(false);

    // Emit isFinal: true at index 1 with only whitespace
    rec.results(
      [
        ["", true],
        ["   \t  ", true],
      ],
      1,
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(settled).toBe(false);

    // Now emit valid final text at index 2
    rec.results(
      [
        ["", true],
        ["   \t  ", true],
        ["avión", true],
      ],
      2,
    );
    const outcome = await listenPromise;
    expect(settled).toBe(true);
    expect(outcome).toEqual({
      ok: true,
      transcript: "avión",
      alternatives: [],
    });
  });

  it("handles multiple interim results before isFinal and delivers only final transcript", async () => {
    const ears = new ChromeLocalEars();
    const listenPromise = ears.listen({ lang: "es-MX", maxMs: 5000 });

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    // Interims
    rec.results([["o", false]]);
    expect(ears.status).toBe("listening");
    rec.results([["os", false]]);
    expect(ears.status).toBe("listening");

    // Final
    rec.results([["oso", true]]);
    const outcome = await listenPromise;
    expect(outcome).toEqual({
      ok: true,
      transcript: "oso",
      alternatives: [],
    });
  });
});

describe("M1 Challenge 2: ChromeLocalEars abort during on-device probe", () => {
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
    vi.restoreAllMocks();
  });

  it("aborts probe immediately when cancel() is called and never invokes runSession()", async () => {
    let resolveAvailability!: (val: string) => void;
    FakeRecognition.available.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAvailability = resolve;
        }),
    );

    const ears = new ChromeLocalEars();
    const listenPromise = ears.listen({ lang: "es-MX", maxMs: 5000 });

    // Cancel while probe is still waiting
    ears.cancel();

    // The listen promise must settle immediately with no-speech
    const outcome = await listenPromise;
    expect(outcome).toEqual({
      ok: false,
      problem: "no-speech",
    });

    // Later probe resolution does not start recognizer
    resolveAvailability("available");
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 20));

    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it("aborts probe cleanly even if probe rejects after cancel", async () => {
    let rejectAvailability!: (err: Error) => void;
    FakeRecognition.available.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectAvailability = reject;
        }),
    );

    const ears = new ChromeLocalEars();
    const listenPromise = ears.listen({ lang: "es-MX", maxMs: 5000 });

    ears.cancel();

    const outcome = await listenPromise;
    expect(outcome).toEqual({
      ok: false,
      problem: "no-speech",
    });

    // Probe rejects late
    rejectAvailability(new Error("Probe timeout or failure"));
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 20));

    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it("handles rapid consecutive listen() calls cancelling prior probing session", async () => {
    let resolveFirst!: (val: string) => void;
    FakeRecognition.available.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const ears = new ChromeLocalEars();
    const firstAttempt = ears.listen({ lang: "es-MX", maxMs: 5000 });

    // Second listen cancels first while first is probing
    const secondAttempt = ears.listen({ lang: "es-MX", maxMs: 5000 });

    const firstOutcome = await firstAttempt;
    expect(firstOutcome).toEqual({ ok: false, problem: "no-speech" });

    // Resolve first probe late
    resolveFirst("available");
    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));

    FakeRecognition.instances[0].results([["abeja", true]]);
    const secondOutcome = await secondAttempt;
    expect(secondOutcome).toEqual({
      ok: true,
      transcript: "abeja",
      alternatives: [],
    });
  });
});

describe("M1 Challenge 3: Concurrency with primary and Promise.all", () => {
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
    vi.restoreAllMocks();
  });

  it("cancels ChromeLocalEars when primary settles and Promise.all unblocks immediately", async () => {
    const chromeEars = new ChromeLocalEars();
    const LISTEN_MAX_MS = 6000;
    const chromeReady = true;

    // Simulate primary (e.g. Vosk) settling after 100ms
    let resolvePrimary!: (outcome: EarsListenOutcome) => void;
    const primary = new Promise<EarsListenOutcome>((resolve) => {
      resolvePrimary = resolve;
    });

    // Simulate chrome starting listen()
    const chrome = chromeReady
      ? chromeEars
          .listen({ lang: "es-MX", maxMs: LISTEN_MAX_MS, grammar: ["oso"] })
          .catch(() => null)
      : null;

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    // Primary finally block matches tutor.$n.tsx:361-365
    const primaryPromise = primary.finally(() => {
      if (chromeReady) {
        chromeEars.cancel();
      }
    });

    const startTime = Date.now();

    // Primary settles at 100ms
    setTimeout(() => {
      resolvePrimary({ ok: true, transcript: "oso", alternatives: [] });
    }, 100);

    const [primaryOutcome, chromeOutcome] = await Promise.all([primaryPromise, chrome]);
    const duration = Date.now() - startTime;

    // Concurrency must unblock immediately without waiting for LISTEN_MAX_MS (6000ms)
    expect(duration).toBeLessThan(1000);
    expect(primaryOutcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
    expect(chromeOutcome).toEqual({ ok: false, problem: "no-speech" });
    expect(rec.abort).toHaveBeenCalled();
  });

  it("cancels ChromeLocalEars even if primary rejects/fails", async () => {
    const chromeEars = new ChromeLocalEars();
    const LISTEN_MAX_MS = 6000;
    const chromeReady = true;

    let rejectPrimary!: (err: Error) => void;
    const primary = new Promise<EarsListenOutcome>((_, reject) => {
      rejectPrimary = reject;
    });

    const chrome = chromeReady
      ? chromeEars
          .listen({ lang: "es-MX", maxMs: LISTEN_MAX_MS, grammar: ["oso"] })
          .catch(() => null)
      : null;

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    const primaryPromise = primary.finally(() => {
      if (chromeReady) {
        chromeEars.cancel();
      }
    });

    setTimeout(() => {
      rejectPrimary(new Error("mic disconnected"));
    }, 50);

    await expect(Promise.all([primaryPromise, chrome])).rejects.toThrow("mic disconnected");
    // Chrome was cleanly cancelled
    expect(rec.abort).toHaveBeenCalled();
    const chromeResult = await chrome;
    expect(chromeResult).toEqual({ ok: false, problem: "no-speech" });
  });

  it("fuses ChromeLocalEars transcript if Chrome finished before primary", async () => {
    const chromeEars = new ChromeLocalEars();
    const LISTEN_MAX_MS = 6000;
    const chromeReady = true;

    const chrome = chromeReady
      ? chromeEars
          .listen({ lang: "es-MX", maxMs: LISTEN_MAX_MS, grammar: ["oso"] })
          .catch(() => null)
      : null;

    await vi.waitFor(() => expect(FakeRecognition.instances).toHaveLength(1));
    const rec = FakeRecognition.instances[0];

    // Chrome finishes early with "oso"
    rec.results([["oso", true]]);

    let resolvePrimary!: (outcome: EarsListenOutcome) => void;
    const primary = new Promise<EarsListenOutcome>((resolve) => {
      resolvePrimary = resolve;
    });

    const primaryPromise = primary.finally(() => {
      if (chromeReady) {
        chromeEars.cancel();
      }
    });

    setTimeout(() => {
      resolvePrimary({ ok: true, transcript: "oso", alternatives: [] });
    }, 50);

    const [primaryOutcome, chromeOutcome] = await Promise.all([primaryPromise, chrome]);
    expect(primaryOutcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
    expect(chromeOutcome).toEqual({ ok: true, transcript: "oso", alternatives: [] });
  });
});

describe("M1 Challenge 4: SPANISH_CARRIER_WORDS and tutor-match parsing", () => {
  it("exports SPANISH_CARRIER_WORDS with all required words", () => {
    const requiredWords = ["el", "la", "los", "las", "un", "una", "es", "vocal", "letra", "dije"];
    expect(SPANISH_CARRIER_WORDS).toEqual(expect.arrayContaining(requiredWords));
    expect(SPANISH_CARRIER_WORDS).toHaveLength(10);
  });

  it("includes all carrier words in buildListenGrammar for Lessons 1, 2, and 3", () => {
    for (const lesson of [1, 2, 3]) {
      const grammar = buildListenGrammar(lesson);
      for (const carrier of SPANISH_CARRIER_WORDS) {
        expect(grammar).toContain(carrier);
      }
    }
  });

  it("matches vowel items with carrier phrases across Lessons 1–3", () => {
    const vowels = ["a", "e", "i", "o", "u"];
    for (const vowel of vowels) {
      const item = findTutorItem(1, vowel);

      // Carrier combinations
      expect(matchTarget(item, `la ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `vocal ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `letra ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `es la ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `dije ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `un ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `una ${vowel}`).pass).toBe(true);
      expect(matchTarget(item, `es una ${vowel}`).pass).toBe(true);
    }
  });

  it("matches word items with carrier phrases across Lessons 1–3", () => {
    const testCases: [number, string, string[]][] = [
      [1, "abrigo", ["el abrigo", "un abrigo", "es un abrigo", "dije abrigo"]],
      [1, "imán", ["el imán", "un imán", "es un iman", "dije iman"]],
      [1, "uña", ["la uña", "una uña", "es una uña", "dije uña"]],
      [1, "ojos", ["los ojos", "mis ojos", "esos ojos", "dije ojos"]],
      [2, "ola", ["la ola", "una ola", "es una ola", "dije ola"]],
      [2, "oso", ["el oso", "un oso", "es un oso", "dije oso"]],
      [2, "oveja", ["la oveja", "una oveja", "es una oveja", "dije oveja"]],
      [3, "avión", ["el avión", "un avión", "es un avion", "dije avion"]],
      [3, "árbol", ["el árbol", "un árbol", "es un arbol", "dije arbol"]],
      [3, "abeja", ["la abeja", "una abeja", "es una abeja", "dije abeja"]],
    ];

    for (const [lesson, word, phrases] of testCases) {
      const item = findTutorItem(lesson, word);
      for (const phrase of phrases) {
        const result = matchTarget(item, phrase);
        expect(
          result.pass,
          `Expected "${phrase}" to pass for item "${word}" in lesson ${lesson}`,
        ).toBe(true);
      }
    }
  });

  it("handles punctuation and capitalization in carrier phrases", () => {
    const itemA = findTutorItem(1, "a");
    expect(matchTarget(itemA, "¡La vocal A!").pass).toBe(true);
    expect(matchTarget(itemA, "¿Es la A?").pass).toBe(true);

    const itemOso = findTutorItem(1, "oso");
    expect(matchTarget(itemOso, "¡Es un OSO!").pass).toBe(true);
    expect(matchTarget(itemOso, "¿Dije oso?").pass).toBe(true);
  });

  it("rejects carrier words alone when the target item is absent", () => {
    const itemA = findTutorItem(1, "a");
    for (const carrier of SPANISH_CARRIER_WORDS) {
      expect(matchTarget(itemA, carrier).pass).toBe(false);
    }

    const itemOso = findTutorItem(1, "oso");
    expect(matchTarget(itemOso, "es un").pass).toBe(false);
    expect(matchTarget(itemOso, "vocal").pass).toBe(false);
    expect(matchTarget(itemOso, "dije").pass).toBe(false);
  });

  it("distractor check still wins when carrier words are used with a distractor", () => {
    // "oreja" is a distractor for "oveja" (same page/lesson)
    const oveja = findTutorItem(2, "oveja");
    expect(matchTarget(oveja, "la oreja").pass).toBe(false);
    expect(matchTarget(oveja, "es una oreja").pass).toBe(false);

    // "ocho" is a distractor for "oso" (same page/lesson)
    const oso = findTutorItem(2, "oso");
    expect(matchTarget(oso, "el ocho").pass).toBe(false);
    expect(matchTarget(oso, "es un ocho").pass).toBe(false);
  });

  it("verifies carrier phrases with all 41 lesson items across Lessons 1, 2, and 3", () => {
    const allItems = [...itemsForLesson(1), ...itemsForLesson(2), ...itemsForLesson(3)];
    expect(allItems).toHaveLength(41);

    for (const item of allItems) {
      if (item.kind === "vowel") {
        const vowelPhrases = [
          `la ${item.text}`,
          `vocal ${item.text}`,
          `letra ${item.text}`,
          `es la ${item.text}`,
          `dije ${item.text}`,
        ];
        for (const phrase of vowelPhrases) {
          const match = matchTarget(item, phrase);
          expect(match.pass, `Item ${item.id} with phrase "${phrase}" should pass`).toBe(true);
        }
      } else {
        const wordPhrases = [
          `el ${item.text}`,
          `la ${item.text}`,
          `un ${item.text}`,
          `una ${item.text}`,
          `es ${item.text}`,
          `es un ${item.text}`,
          `es una ${item.text}`,
          `dije ${item.text}`,
        ];
        for (const phrase of wordPhrases) {
          const match = matchTarget(item, phrase);
          expect(match.pass, `Item ${item.id} with phrase "${phrase}" should pass`).toBe(true);
        }
      }
    }
  });
});

describe("M1 Challenge 5: High-concurrency rapid cancellation stress test", () => {
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
    vi.restoreAllMocks();
  });

  it("survives 50 rapid sequential listen / cancel / settle cycles without leaking or hanging", async () => {
    const ears = new ChromeLocalEars();

    for (let i = 0; i < 50; i++) {
      const isCancellation = i % 2 === 0;
      const attempt = ears.listen({ lang: "es-MX", maxMs: 5000 });

      if (isCancellation) {
        ears.cancel();
        const outcome = await attempt;
        expect(outcome.ok).toBe(false);
      } else {
        await vi.waitFor(() => expect(FakeRecognition.instances.length).toBeGreaterThan(i / 2));
        const rec = FakeRecognition.instances.at(-1)!;
        rec.results([["oso", true]]);
        const outcome = await attempt;
        expect(outcome.ok).toBe(true);
        if (outcome.ok) {
          expect(outcome.transcript).toBe("oso");
        }
      }
    }

    expect(ears.status).toBe("ready");
  });
});
