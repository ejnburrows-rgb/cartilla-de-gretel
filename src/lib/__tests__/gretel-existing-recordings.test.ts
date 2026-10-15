import { describe, expect, it } from "vitest";
import {
  EXISTING_GRETEL_CLIP_IDS,
  RECORDED_OUTCOME_CLIP,
  RECORDED_OUTCOME_SEQUENCE,
  recordedOutcomeUrls,
  recordedClipUrl,
  recordedOutcomeUrl,
  recordedIntroClipIds,
  recordedPracticeClipIds,
} from "../gretel-existing-recordings";

describe("owner-recorded Gretel audio, no synthesis", () => {
  it("recognizes all 48 original and 19 added recordings", () => {
    expect(EXISTING_GRETEL_CLIP_IDS).toHaveLength(67);
    expect(new Set(EXISTING_GRETEL_CLIP_IDS).size).toBe(67);
    for (const id of EXISTING_GRETEL_CLIP_IDS) {
      expect(recordedClipUrl(id)).toMatch(/^\/audio\/gretel\/clips\/rec_[a-z0-9_-]+\.mp3$/);
    }
  });

  it("rejects unknown or injected filenames rather than using a substitute", () => {
    expect(recordedClipUrl("")).toBeNull();
    expect(recordedClipUrl("../private/master.m4a")).toBeNull();
    expect(recordedClipUrl("gretel_49")).toBeNull();
  });

  it("binds feedback outcomes to actual indexed recordings", () => {
    expect(recordedOutcomeUrl("correct")).toBe("/audio/gretel/clips/rec_gretel_23.mp3");
    expect(recordedOutcomeUrl("try-again")).toBe("/audio/gretel/clips/rec_gretel_30.mp3");
    expect(recordedOutcomeUrl("lesson-complete")).toBe("/audio/gretel/clips/rec_gretel_41.mp3");
    expect(Object.values(RECORDED_OUTCOME_CLIP).every(id => EXISTING_GRETEL_CLIP_IDS.includes(id))).toBe(true);
  });

  it("uses specific M and P recordings only at the corresponding lesson", () => {
    expect(recordedIntroClipIds(7)).toEqual(["gretel_11", "gretel_12"]);
    expect(recordedIntroClipIds(8)).toEqual(["gretel_18"]);
    expect(recordedIntroClipIds(9)).toEqual(["gretel_35"]);
    expect(recordedPracticeClipIds(2)).toContain("gretel_10");
  });


  it("stitches only complete existing phrases for correct/try-again feedback", () => {
    expect(recordedOutcomeUrls("correct")).toEqual([
      "/audio/gretel/clips/rec_gretel_23.mp3",
      "/audio/gretel/clips/rec_gretel_24.mp3",
    ]);
    expect(recordedOutcomeUrls("try-again")).toEqual([
      "/audio/gretel/clips/rec_gretel_29.mp3",
      "/audio/gretel/clips/rec_gretel_34.mp3",
    ]);
    for (const clips of Object.values(RECORDED_OUTCOME_SEQUENCE)) {
      expect(clips.length).toBeGreaterThan(0);
      expect(clips.every(id=>EXISTING_GRETEL_CLIP_IDS.includes(id))).toBe(true);
    }
  });

  it("never assigns audio to a nonexistent lesson", () => {
    for (const n of [0,25,86,NaN,1.5]) {
      expect(recordedIntroClipIds(n)).toEqual([]);
      expect(recordedPracticeClipIds(n)).toEqual([]);
    }
  });
});
