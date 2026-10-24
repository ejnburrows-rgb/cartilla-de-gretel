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
  it("indexes all 67 real archived clips but blocks rejected versions from playback", () => {
    expect(EXISTING_GRETEL_CLIP_IDS).toHaveLength(67);
    expect(new Set(EXISTING_GRETEL_CLIP_IDS).size).toBe(67);
    for (const id of EXISTING_GRETEL_CLIP_IDS) {
      expect(recordedClipUrl(id)).toBeNull(); // Archived only until individually approved clean
    }
  });

  it("rejects unknown or injected filenames rather than using a substitute", () => {
    expect(recordedClipUrl("")).toBeNull();
    expect(recordedClipUrl("../private/master.m4a")).toBeNull();
    expect(recordedClipUrl("gretel_49")).toBeNull();
  });

  it("never plays rejected clips even when a feedback outcome points to an indexed ID", () => {
    expect(recordedOutcomeUrl("correct")).toBeNull();
    expect(recordedOutcomeUrl("try-again")).toBeNull();
    expect(recordedOutcomeUrl("lesson-complete")).toBeNull();
    expect(Object.values(RECORDED_OUTCOME_CLIP).every(id => EXISTING_GRETEL_CLIP_IDS.includes(id))).toBe(true);
  });

  it("uses specific M and P recordings only at the corresponding lesson", () => {
    expect(recordedIntroClipIds(7)).toEqual(["gretel_11", "gretel_12", "gretel_13"]);
    expect(recordedIntroClipIds(8)).toEqual(["gretel_18"]);
    expect(recordedIntroClipIds(9)).toEqual(["gretel_35"]);
    expect(recordedPracticeClipIds(2)).toContain("gretel_10");
  });


  it("does not stitch rejected clips for correct/try-again feedback", () => {
    expect(recordedOutcomeUrls("correct")).toEqual([]);
    expect(recordedOutcomeUrls("try-again")).toEqual([]);
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
