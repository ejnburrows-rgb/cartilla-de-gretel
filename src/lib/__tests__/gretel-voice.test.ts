import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildLessonIntroLines,
  cancelGretelSpeech,
  isGretelVoiceMuted,
  setGretelVoiceMuted,
} from "../gretel-voice";

describe("buildLessonIntroLines", () => {
  it("uses real L1 intro title/subtitle data only", () => {
    const lines = buildLessonIntroLines({
      n: 1,
      kind: "intro",
      title: "Introducción de las vocales",
      subtitle: "Las cinco vocales: a, e, i, o, u",
    });
    expect(lines[0]).toMatch(/vocales/i);
    expect(lines.join(" ")).toContain("a, e, i, o, u");
    expect(lines.join(" ").length).toBeLessThan(120);
  });

  it("uses real L7 consonant letter", () => {
    const lines = buildLessonIntroLines({
      n: 7,
      kind: "consonant",
      title: "Letra M m",
      letter: "M",
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("¡Hola! Vamos a la lección de la letra M.");
  });

  it("uses real vowel letter for vowel lessons", () => {
    const lines = buildLessonIntroLines({
      n: 2,
      kind: "vowel",
      title: "Vocal O o",
      vowel: "o",
    });
    expect(lines[0]).toContain("vocal O");
  });
});

describe("gretel voice mute + cancel", () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it("stores mute flag", () => {
    setGretelVoiceMuted(true);
    expect(isGretelVoiceMuted()).toBe(true);
    setGretelVoiceMuted(false);
    expect(isGretelVoiceMuted()).toBe(false);
  });

  it("cancel is safe without speechSynthesis throwing", () => {
    expect(() => cancelGretelSpeech()).not.toThrow();
  });
});

describe("reduced-motion policy (presence CSS companion)", () => {
  it("prefersReducedMotion helper remains available for presence", async () => {
    const { prefersReducedMotion } = await import("../living-motion");
    expect(typeof prefersReducedMotion()).toBe("boolean");
  });
});
