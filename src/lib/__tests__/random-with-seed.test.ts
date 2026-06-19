import { describe, it, expect } from "vitest";
import {
  mulberry32,
  shuffle,
  pickN,
  pickOne,
  seedFromStrings,
  dailySeed,
} from "@/lib/random-with-seed";

describe("mulberry32", () => {
  it("produces the same sequence for the same seed", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it("yields values in [0, 1)", () => {
    const rng = mulberry32(999);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffle", () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8];

  it("is deterministic for a given seed", () => {
    expect(shuffle(base, 42)).toEqual(shuffle(base, 42));
  });

  it("returns a permutation without losing or duplicating items", () => {
    const out = shuffle(base, 42);
    expect([...out].sort((a, b) => a - b)).toEqual(base);
  });

  it("does not mutate its input", () => {
    const copy = [...base];
    shuffle(base, 5);
    expect(base).toEqual(copy);
  });
});

describe("pickN", () => {
  it("returns n items, deterministically, all drawn from the source", () => {
    const src = ["a", "b", "c", "d", "e"];
    const picked = pickN(src, 3, 7);
    expect(picked).toHaveLength(3);
    expect(picked).toEqual(pickN(src, 3, 7));
    for (const p of picked) expect(src).toContain(p);
  });

  it("clamps n to the array length", () => {
    expect(pickN(["a", "b"], 10, 1)).toHaveLength(2);
  });
});

describe("pickOne", () => {
  it("returns null for an empty array", () => {
    expect(pickOne([], 1)).toBeNull();
  });

  it("deterministically returns an element of the array", () => {
    const src = ["x", "y", "z"];
    const chosen = pickOne(src, 13);
    expect(src).toContain(chosen);
    expect(pickOne(src, 13)).toBe(chosen);
  });
});

describe("seedFromStrings", () => {
  it("is deterministic and order-sensitive", () => {
    expect(seedFromStrings("a", "b")).toBe(seedFromStrings("a", "b"));
    expect(seedFromStrings("a", "b")).not.toBe(seedFromStrings("b", "a"));
  });

  it("returns a non-negative 32-bit integer", () => {
    const s = seedFromStrings("student-42", "lesson-3");
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("dailySeed", () => {
  it("gives one student the same variant all day, but changes by day", () => {
    const morning = new Date(2026, 5, 19, 8, 0, 0);
    const evening = new Date(2026, 5, 19, 20, 0, 0);
    const nextDay = new Date(2026, 5, 20, 8, 0, 0);
    expect(dailySeed("s1", 3, 12, morning)).toBe(dailySeed("s1", 3, 12, evening));
    expect(dailySeed("s1", 3, 12, morning)).not.toBe(dailySeed("s1", 3, 12, nextDay));
  });

  it("differs by student and by page within the same day", () => {
    const day = new Date(2026, 5, 19);
    expect(dailySeed("s1", 3, 12, day)).not.toBe(dailySeed("s2", 3, 12, day));
    expect(dailySeed("s1", 3, 12, day)).not.toBe(dailySeed("s1", 3, 13, day));
  });
});
