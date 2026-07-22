import { describe, it, expect } from "vitest";
import {
  mulberry32,
  shuffle,
  pickN,
  pickOne,
  seedFromStrings,
  dailySeed,
} from "../random-with-seed";

describe("mulberry32", () => {
  it("is deterministic: same seed produces the same sequence", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it("returns values in [0, 1)", () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffle", () => {
  const arr = [1, 2, 3, 4, 5];
  it("is deterministic for a given seed", () => {
    expect(shuffle(arr, 9)).toEqual(shuffle(arr, 9));
  });
  it("is a permutation (same elements, possibly reordered) and does not mutate input", () => {
    const copy = [...arr];
    const out = shuffle(arr, 9);
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
    expect(arr).toEqual(copy); // input untouched
  });
  it("handles empty and single-element arrays", () => {
    expect(shuffle([], 1)).toEqual([]);
    expect(shuffle([7], 1)).toEqual([7]);
  });
});

describe("pickN", () => {
  it("returns min(n, length) items deterministically, all from the source", () => {
    const src = ["a", "b", "c", "d"];
    const picked = pickN(src, 2, 5);
    expect(picked).toHaveLength(2);
    expect(pickN(src, 2, 5)).toEqual(picked); // deterministic
    for (const p of picked) expect(src).toContain(p);
    expect(pickN(src, 99, 5)).toHaveLength(4); // capped at length
  });
});

describe("pickOne", () => {
  it("returns null for an empty array", () => {
    expect(pickOne([], 1)).toBeNull();
  });
  it("returns a deterministic element of the array", () => {
    const src = ["x", "y", "z"];
    const one = pickOne(src, 3);
    expect(src).toContain(one);
    expect(pickOne(src, 3)).toBe(one);
  });
});

describe("seedFromStrings", () => {
  it("is deterministic and order-sensitive", () => {
    expect(seedFromStrings("a", "b")).toBe(seedFromStrings("a", "b"));
    expect(seedFromStrings("a", "b")).not.toBe(seedFromStrings("b", "a"));
  });
  it("returns an unsigned 32-bit integer", () => {
    const h = seedFromStrings("cartilla");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("dailySeed", () => {
  it("is stable for the same student/lesson/page/day and changes across days", () => {
    const d1 = new Date(2026, 0, 10);
    const d1b = new Date(2026, 0, 10, 23, 59); // same calendar day
    const d2 = new Date(2026, 0, 11);
    expect(dailySeed("s1", 3, 2, d1)).toBe(dailySeed("s1", 3, 2, d1b));
    expect(dailySeed("s1", 3, 2, d1)).not.toBe(dailySeed("s1", 3, 2, d2));
  });
  it("differs by student", () => {
    const d = new Date(2026, 0, 10);
    expect(dailySeed("s1", 3, 2, d)).not.toBe(dailySeed("s2", 3, 2, d));
  });
});
