import { describe, expect, it } from "vitest";
import { GRETEL_CINEMATICS, getLessonCinematic } from "@/content/gretel-cinematics";
import { GRETEL_PRIMARY_VOICE, GRETEL_FALLBACK_VOICE } from "@/lib/gretel-voice";

describe("Gretel cinematic catalog", () => {
  it("covers the complete 31-scene welcome, how-to, lesson, milestone and final program", () => {
    expect(GRETEL_CINEMATICS).toHaveLength(31);
    expect(GRETEL_CINEMATICS.filter((item) => item.kind === "lesson")).toHaveLength(24);
    expect(GRETEL_CINEMATICS.some((item) => item.kind === "welcome")).toBe(true);
    expect(GRETEL_CINEMATICS.some((item) => item.kind === "how-to")).toBe(true);
    expect(GRETEL_CINEMATICS.filter((item) => item.kind === "milestone")).toHaveLength(4);
    expect(GRETEL_CINEMATICS.some((item) => item.kind === "final")).toBe(true);
    for (let lesson = 1; lesson <= 24; lesson += 1) {
      const item = getLessonCinematic(lesson);
      expect(item.lesson).toBe(lesson);
      expect(item.script.length).toBeGreaterThan(20);
      expect(item.captions.length).toBeGreaterThan(0);
      expect(item.actions).toContain("talk");
      expect(item.actions).toContain("teach");
    }
  });

  it("locks one voice preference across every cinematic", () => {
    expect(GRETEL_PRIMARY_VOICE).toBe("Leda");
    expect(GRETEL_FALLBACK_VOICE).toBe("Sulafat");
    for (const item of GRETEL_CINEMATICS) {
      expect(item.voice.primary).toBe("Leda");
      expect(item.voice.fallback).toBe("Sulafat");
      expect(item.voice.locale).toBe("es-MX");
    }
  });
});
