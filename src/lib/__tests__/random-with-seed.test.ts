import { describe, it, expect } from "vitest";
import {
  mulberry32,
  shuffle,
  pickN,
  pickOne,
  seedFromStrings,
  dailySeed,
} from "../random-with-seed";

describe("random-with-seed", () => {
  describe("mulberry32", () => {
    it("should be deterministic for the same seed", () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);

      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());

      expect(seq1).toEqual(seq2);
    });

    it("should produce different sequences for different seeds", () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(54321);

      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());

      expect(seq1).not.toEqual(seq2);
    });

    it("should produce values between 0 and 1", () => {
      const rng = mulberry32(999);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("shuffle", () => {
    it("should shuffle deterministically based on seed", () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled1 = shuffle(original, 42);
      const shuffled2 = shuffle(original, 42);
      const shuffled3 = shuffle(original, 43);

      expect(shuffled1).toEqual(shuffled2);
      expect(shuffled1).not.toEqual(shuffled3);
    });

    it("should not modify the original array", () => {
      const original = ["a", "b", "c"];
      shuffle(original, 1);
      expect(original).toEqual(["a", "b", "c"]);
    });

    it("should contain all the exact same elements", () => {
      const original = [10, 20, 30, 40, 50];
      const shuffled = shuffle(original, 7);

      expect(shuffled.length).toBe(original.length);
      expect([...shuffled].sort()).toEqual([...original].sort());
    });
  });

  describe("pickN", () => {
    it("should pick N items deterministically", () => {
      const arr = ["apple", "banana", "cherry", "date", "elderberry"];
      const picked1 = pickN(arr, 3, 100);
      const picked2 = pickN(arr, 3, 100);

      expect(picked1).toEqual(picked2);
      expect(picked1.length).toBe(3);
      // All items should be from the original array
      picked1.forEach((item) => expect(arr.includes(item)).toBe(true));
    });

    it("should handle N greater than array length", () => {
      const arr = [1, 2, 3];
      const picked = pickN(arr, 5, 100);

      expect(picked.length).toBe(3);
      expect([...picked].sort()).toEqual([1, 2, 3]);
    });

    it("should handle picking from an empty array", () => {
      expect(pickN([], 3, 1)).toEqual([]);
    });

    it("should handle picking 0 items", () => {
      expect(pickN([1, 2, 3], 0, 1)).toEqual([]);
    });
  });

  describe("pickOne", () => {
    it("should pick one item deterministically", () => {
      const arr = ["A", "B", "C", "D", "E"];
      const picked1 = pickOne(arr, 123);
      const picked2 = pickOne(arr, 123);
      const picked3 = pickOne(arr, 321);

      expect(picked1).toBe(picked2);
      expect(picked1).not.toBe(picked3); // Assuming the seed leads to a different index here
      expect(arr.includes(picked1 as string)).toBe(true);
    });

    it("should return null for an empty array", () => {
      expect(pickOne([], 123)).toBeNull();
    });
  });

  describe("seedFromStrings", () => {
    it("should produce the same hash for the same strings", () => {
      const hash1 = seedFromStrings("hello", "world", "123");
      const hash2 = seedFromStrings("hello", "world", "123");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different strings or order", () => {
      const base = seedFromStrings("A", "B", "C");
      const diff1 = seedFromStrings("A", "B", "D");
      const diff2 = seedFromStrings("B", "A", "C");
      const diff3 = seedFromStrings("A", "B", "C", "D");

      expect(base).not.toBe(diff1);
      expect(base).not.toBe(diff2);
      expect(base).not.toBe(diff3);
    });
  });

  describe("dailySeed", () => {
    it("should be deterministic based on the student, lesson, page, and date", () => {
      const date1 = new Date("2024-05-10T10:00:00Z");
      const date2 = new Date("2024-05-10T15:00:00Z"); // Same day
      const date3 = new Date("2024-05-11T10:00:00Z"); // Different day

      const seed1 = dailySeed("student_1", 1, 5, date1);
      const seed2 = dailySeed("student_1", 1, 5, date1);
      const seed3 = dailySeed("student_1", 1, 5, date2); // Same year/month/date
      const seed4 = dailySeed("student_1", 1, 5, date3); // Different day
      const seed5 = dailySeed("student_2", 1, 5, date1); // Different student
      const seed6 = dailySeed("student_1", 2, 5, date1); // Different lesson
      const seed7 = dailySeed("student_1", 1, 6, date1); // Different page

      expect(seed1).toBe(seed2);
      expect(seed1).toBe(seed3); // Date component relies on Year, Month, Date only
      expect(seed1).not.toBe(seed4);
      expect(seed1).not.toBe(seed5);
      expect(seed1).not.toBe(seed6);
      expect(seed1).not.toBe(seed7);
    });
  });
});
