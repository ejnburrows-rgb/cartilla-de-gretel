import { describe, it, expect } from "vitest";
import { mulberry32, shuffle, pickN, pickOne, seedFromStrings, dailySeed } from "../../src/lib/random-with-seed";

describe("random-with-seed", () => {
  describe("mulberry32", () => {
    it("generates deterministic sequences from the same seed", () => {
      const rng1 = mulberry32(123);
      const rng2 = mulberry32(123);

      const seq1 = [rng1(), rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2(), rng2()];

      expect(seq1).toEqual(seq2);
    });

    it("generates different sequences from different seeds", () => {
      const rng1 = mulberry32(123);
      const rng2 = mulberry32(456);

      const seq1 = [rng1(), rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2(), rng2()];

      expect(seq1).not.toEqual(seq2);
    });

    it("returns values between 0 (inclusive) and 1 (exclusive)", () => {
      const rng = mulberry32(999);
      for (let i = 0; i < 1000; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("shuffle", () => {
    const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it("shuffles deterministically based on seed", () => {
      const shuffled1 = shuffle(originalArray, 123);
      const shuffled2 = shuffle(originalArray, 123);

      expect(shuffled1).toEqual(shuffled2);
    });

    it("produces different shuffles for different seeds", () => {
      const shuffled1 = shuffle(originalArray, 123);
      const shuffled2 = shuffle(originalArray, 456);

      expect(shuffled1).not.toEqual(shuffled2);
    });

    it("preserves all elements", () => {
      const shuffled = shuffle(originalArray, 123);
      expect(shuffled.length).toBe(originalArray.length);
      expect([...shuffled].sort((a, b) => a - b)).toEqual([...originalArray].sort((a, b) => a - b));
    });

    it("does not mutate the original array", () => {
      const arr = [1, 2, 3];
      shuffle(arr, 123);
      expect(arr).toEqual([1, 2, 3]);
    });

    it("handles empty arrays", () => {
      expect(shuffle([], 123)).toEqual([]);
    });

    it("handles single-element arrays", () => {
      expect(shuffle([42], 123)).toEqual([42]);
    });
  });

  describe("pickN", () => {
    const originalArray = ['a', 'b', 'c', 'd', 'e'];

    it("picks N items deterministically", () => {
      const picked1 = pickN(originalArray, 3, 123);
      const picked2 = pickN(originalArray, 3, 123);

      expect(picked1).toEqual(picked2);
      expect(picked1.length).toBe(3);
    });

    it("picks different combinations for different seeds", () => {
      const picked1 = pickN(originalArray, 3, 123);
      const picked2 = pickN(originalArray, 3, 456);

      expect(picked1).not.toEqual(picked2);
    });

    it("limits N to array length", () => {
      const picked = pickN(originalArray, 10, 123);
      expect(picked.length).toBe(originalArray.length);
    });

    it("handles n = 0", () => {
      expect(pickN(originalArray, 0, 123)).toEqual([]);
    });
  });

  describe("pickOne", () => {
    const originalArray = [10, 20, 30, 40, 50];

    it("picks one item deterministically", () => {
      const picked1 = pickOne(originalArray, 123);
      const picked2 = pickOne(originalArray, 123);

      expect(picked1).toBe(picked2);
      expect(originalArray.includes(picked1!)).toBe(true);
    });

    it("returns null for empty array", () => {
      expect(pickOne([], 123)).toBeNull();
    });
  });

  describe("seedFromStrings", () => {
    it("generates deterministic hash from strings", () => {
      const hash1 = seedFromStrings("hello", "world");
      const hash2 = seedFromStrings("hello", "world");

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("number");
    });

    it("generates different hashes for different strings", () => {
      const hash1 = seedFromStrings("hello", "world");
      const hash2 = seedFromStrings("hello", "there");

      expect(hash1).not.toBe(hash2);
    });

    it("is order sensitive", () => {
      const hash1 = seedFromStrings("a", "b");
      const hash2 = seedFromStrings("b", "a");

      expect(hash1).not.toBe(hash2);
    });

    it("handles empty strings and empty arguments", () => {
      expect(typeof seedFromStrings()).toBe("number");
      expect(typeof seedFromStrings("", "")).toBe("number");
    });
  });

  describe("dailySeed", () => {
    it("generates deterministic seed for the same day and parameters", () => {
      const date = new Date("2024-03-15T12:00:00Z");
      const seed1 = dailySeed("student123", 1, 5, date);
      const seed2 = dailySeed("student123", 1, 5, date);

      expect(seed1).toBe(seed2);
    });

    it("generates different seeds for different days", () => {
      const date1 = new Date("2024-03-15T12:00:00Z");
      const date2 = new Date("2024-03-16T12:00:00Z");

      const seed1 = dailySeed("student123", 1, 5, date1);
      const seed2 = dailySeed("student123", 1, 5, date2);

      expect(seed1).not.toBe(seed2);
    });

    it("generates different seeds for different students on same day", () => {
      const date = new Date("2024-03-15T12:00:00Z");

      const seed1 = dailySeed("student123", 1, 5, date);
      const seed2 = dailySeed("student456", 1, 5, date);

      expect(seed1).not.toBe(seed2);
    });

    it("generates different seeds for different lessons/pages on same day", () => {
      const date = new Date("2024-03-15T12:00:00Z");

      const seed1 = dailySeed("student123", 1, 5, date);
      const seed2 = dailySeed("student123", 2, 5, date);
      const seed3 = dailySeed("student123", 1, 6, date);

      expect(seed1).not.toBe(seed2);
      expect(seed1).not.toBe(seed3);
    });
  });
});
