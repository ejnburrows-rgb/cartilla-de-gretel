/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StubEars } from "../tutor-ears-stub";
import type { EarsListenOutcome } from "../tutor-ears";

const KEY = "cartilla.tutor.test-ears.v1";

const heard = (transcript: string, alternatives: string[] = []): EarsListenOutcome => ({
  ok: true,
  transcript,
  alternatives,
});

function setScript(value: unknown): void {
  localStorage.setItem(KEY, typeof value === "string" ? value : JSON.stringify(value));
}

interface Settled<T> {
  done: boolean;
  value?: T;
}

/**
 * Attaches to a promise without awaiting it. `check()` flushes microtasks
 * (without advancing fake time) and reports whether the promise has settled.
 */
function tracker<T>(promise: Promise<T>): { check: () => Promise<Settled<T>> } {
  let done = false;
  let value: T | undefined;
  promise.then((result) => {
    done = true;
    value = result;
  });
  return {
    async check(): Promise<Settled<T>> {
      await vi.advanceTimersByTimeAsync(0);
      return { done, value };
    },
  };
}

describe("StubEars e2e script injection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("plays an injected script in order, then answers instant no-speech when dry", async () => {
    setScript({
      probe: "ready",
      queue: [
        { ok: true, transcript: "casa", alternatives: ["la casa"] },
        { ok: false, problem: "no-speech" },
      ],
    });
    const ears = new StubEars([heard("oso")]); // script must win over constructor items

    await expect(ears.probe()).resolves.toBe("ready");

    const first = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(249);
    expect((await first.check()).done).toBe(false); // default 250 ms hold keeps the window open
    await vi.advanceTimersByTimeAsync(1);
    const firstResult = await first.check();
    expect(firstResult.done).toBe(true);
    expect(firstResult.value).toEqual({ ok: true, transcript: "casa", alternatives: ["la casa"] });
    expect(firstResult.value).not.toHaveProperty("holdMs"); // holdMs never leaks into outcomes

    const second = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await second.check()).value).toEqual({ ok: false, problem: "no-speech" });

    const dry = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    const dryResult = await dry.check();
    expect(dryResult.done).toBe(true); // no timers advanced: dry queue is instant
    expect(dryResult.value).toEqual({ ok: false, problem: "no-speech" });

    expect(ears.listenCalls).toHaveLength(3);
    expect(ears.cancel()).toBeUndefined();
  });

  it("reports scripted probe problems and falls back to ready on invalid values", async () => {
    setScript({ probe: "denied" });
    await expect(new StubEars().probe()).resolves.toBe("denied");

    setScript({ probe: "no-microphone" });
    await expect(new StubEars().probe()).resolves.toBe("no-microphone");

    setScript({ probe: "no-speech" }); // listen-only problem, invalid for probe
    await expect(new StubEars().probe()).resolves.toBe("ready");

    setScript({ probe: 42 });
    await expect(new StubEars().probe()).resolves.toBe("ready");

    setScript({}); // valid script, probe field absent
    await expect(new StubEars().probe()).resolves.toBe("ready");
  });

  it("paces probe() with probeDelayMs and ignores invalid delays", async () => {
    setScript({ probe: "no-local", probeDelayMs: 1200 });
    const pending = tracker(new StubEars().probe());
    await vi.advanceTimersByTimeAsync(1199);
    expect((await pending.check()).done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect((await pending.check()).value).toBe("no-local");

    setScript({ probe: "denied", probeDelayMs: "soon" });
    await expect(new StubEars().probe()).resolves.toBe("denied"); // no wait at all

    setScript({ probe: "denied", probeDelayMs: -5 });
    await expect(new StubEars().probe()).resolves.toBe("denied");
  });

  it("holds the listening window open with an item's holdMs", async () => {
    setScript({ queue: [{ ok: true, transcript: "ma", alternatives: [], holdMs: 4000 }] });
    const ears = new StubEars();
    const attempt = tracker(ears.listen({ lang: "es-419", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(3999);
    expect((await attempt.check()).done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect((await attempt.check()).value).toEqual({ ok: true, transcript: "ma", alternatives: [] });
  });

  it("cuts a hold that would exceed maxMs at maxMs with no-speech, consuming the item", async () => {
    setScript({
      queue: [
        { ok: true, transcript: "nunca", alternatives: [], holdMs: 5000 },
        { ok: true, transcript: "y", alternatives: [] },
      ],
    });
    const ears = new StubEars();

    const capped = tracker(ears.listen({ lang: "es-MX", maxMs: 1000 }));
    await vi.advanceTimersByTimeAsync(999);
    expect((await capped.check()).done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect((await capped.check()).value).toEqual({ ok: false, problem: "no-speech" });

    const next = tracker(ears.listen({ lang: "es-MX", maxMs: 1000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await next.check()).value).toEqual({ ok: true, transcript: "y", alternatives: [] });
  });

  it("malformed or non-object scripts fall back to the constructor queue and instant pacing", async () => {
    for (const bad of ["{not json", '"hello"', "42", "[]", "null"]) {
      localStorage.clear();
      setScript(bad);
      const ears = new StubEars([heard("oso"), { ok: false, problem: "denied" }]);
      await expect(ears.probe()).resolves.toBe("ready");
      const first = await tracker(ears.listen({ lang: "es-MX", maxMs: 10 })).check(); // maxMs < 250: instant proof
      expect(first.done, `script ${JSON.stringify(bad)} should resolve instantly`).toBe(true);
      expect(first.value).toEqual(heard("oso"));
      const second = await tracker(ears.listen({ lang: "es-MX", maxMs: 10 })).check();
      expect(second.value).toEqual({ ok: false, problem: "denied" });
      const dry = await tracker(ears.listen({ lang: "es-MX", maxMs: 10 })).check();
      expect(dry.value).toEqual({ ok: false, problem: "no-speech" });
    }
  });

  it("keeps the absent-key constructor path unchanged (instant, no holds)", async () => {
    const ears = new StubEars([heard("oso")]);
    await expect(ears.probe()).resolves.toBe("ready");
    const only = await tracker(ears.listen({ lang: "es-MX", maxMs: 1 })).check();
    expect(only.done).toBe(true);
    expect(only.value).toEqual(heard("oso"));
  });

  it("a valid script without a queue suppresses constructor items", async () => {
    setScript({ probe: "ready" });
    const ears = new StubEars([heard("oso")]);
    const dry = await tracker(ears.listen({ lang: "es-MX", maxMs: 6000 })).check();
    expect(dry.done).toBe(true);
    expect(dry.value).toEqual({ ok: false, problem: "no-speech" });
  });

  it("skips invalid queue items gracefully and never throws", async () => {
    setScript({
      queue: [
        { ok: "maybe" },
        { ok: true, transcript: 7 },
        { ok: false, problem: "nonsense" },
        "just a string",
        { ok: false, problem: "denied" },
        { ok: true, transcript: "mama", alternatives: ["mama mia"] },
      ],
    });
    const ears = new StubEars();

    const denial = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await denial.check()).value).toEqual({ ok: false, problem: "denied" });

    const word = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await word.check()).value).toEqual({
      ok: true,
      transcript: "mama",
      alternatives: ["mama mia"],
    });
  });

  it("a rewritten script restarts its queue", async () => {
    setScript({ queue: [heard("uno")] });
    const ears = new StubEars();
    const uno = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await uno.check()).value).toEqual(heard("uno"));

    setScript({ queue: [heard("dos")] });
    const dos = tracker(ears.listen({ lang: "es-MX", maxMs: 6000 }));
    await vi.advanceTimersByTimeAsync(250);
    expect((await dos.check()).value).toEqual(heard("dos"));
  });

  it("never throws when localStorage itself fails", async () => {
    setScript({ probe: "denied", queue: [heard("x")] });
    // Vitest's jsdom env exposes localStorage as a shim object with own
    // methods, so the spy goes on the instance, not Storage.prototype.
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("storage locked");
    });
    const ears = new StubEars([heard("constructor-path")]);
    await expect(ears.probe()).resolves.toBe("ready");
    const outcome = await tracker(ears.listen({ lang: "es-MX", maxMs: 6000 })).check();
    expect(outcome.done).toBe(true);
    expect(outcome.value).toEqual(heard("constructor-path"));
  });

  it("uses the default behavior when localStorage is undefined", async () => {
    vi.stubGlobal("localStorage", undefined);
    try {
      const ears = new StubEars([heard("oso")]);
      await expect(ears.probe()).resolves.toBe("ready");
      const only = await tracker(ears.listen({ lang: "es-MX", maxMs: 1 })).check();
      expect(only.done).toBe(true);
      expect(only.value).toEqual(heard("oso"));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
