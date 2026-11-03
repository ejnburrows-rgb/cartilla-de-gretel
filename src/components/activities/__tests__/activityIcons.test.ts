import { describe, it, expect } from "vitest";
import { activityTint, activitySolid, ActivityTone } from "../activityIcons";

describe("activityIcons", () => {
  const tones: ActivityTone[] = ["a", "e", "i", "o", "u", "primary", "warning"];

  describe("activityTint", () => {
    it("should return a valid string for all tones", () => {
      tones.forEach((tone) => {
        const result = activityTint(tone);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should map specific tones correctly", () => {
      expect(activityTint("a")).toBe("bg-[hsl(var(--vowel-a))]/12 text-[hsl(var(--vowel-a))]");
      expect(activityTint("warning")).toBe("bg-[hsl(var(--warning))]/18 text-[hsl(28,30%,18%)]");
    });
  });

  describe("activitySolid", () => {
    it("should return a valid string for all tones", () => {
      tones.forEach((tone) => {
        const result = activitySolid(tone);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should map specific tones correctly", () => {
      expect(activitySolid("primary")).toBe("bg-[hsl(var(--primary))] text-white");
      expect(activitySolid("warning")).toBe("bg-[hsl(var(--warning))] text-[hsl(28,30%,18%)]");
    });
  });
});
