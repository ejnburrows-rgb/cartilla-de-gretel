import { describe, expect, it } from "vitest";
import {
  evaluateHybridDirectorAtTime,
  GOOGLE_FLOW_CLIP_SLOTS,
  HYBRID_SEQUENCE_WINDOWS,
} from "../tutor-hybrid-director";

describe("tutor-hybrid-director", () => {
  it("progresses through all 8 teaching phases seamlessly in order", () => {
    const sampled = HYBRID_SEQUENCE_WINDOWS.map((win) =>
      evaluateHybridDirectorAtTime({
        timeSec: (win.startSec + win.endSec) * 0.5,
        word: "abeja",
        speechClipDurationSec: 1.56,
      }),
    );

    expect(sampled.map((s) => s.phase)).toEqual([
      "listen_1",
      "acknowledge",
      "turn_to_board",
      "write_demonstrate",
      "erase_board",
      "turn_back",
      "speak_rhubarb",
      "listen_feedback",
    ]);

    // Turn blends smoothly from 0 -> 1 on board -> 0 facing child
    expect(sampled[0].turnBlend).toBe(0);
    expect(sampled[2].turnBlend).toBeGreaterThan(0);
    expect(sampled[2].turnBlend).toBeLessThan(1);
    expect(sampled[3].turnBlend).toBe(1);
    expect(sampled[4].activeTool).toBe("eraser");
    expect(sampled[6].isSpeakingAudio).toBe(true);
    expect(sampled[6].audioSpeechTimeSec).toBeGreaterThan(0);
  });

  it("synchronizes live chalk writing reveal directly to moving chalk IK tip", () => {
    const startWrite = evaluateHybridDirectorAtTime({ timeSec: 3.45, word: "abeja" });
    const midWrite = evaluateHybridDirectorAtTime({ timeSec: 4.1, word: "abeja" });
    expect(midWrite.writeWordProgress).toBeGreaterThan(startWrite.writeWordProgress);
    expect(midWrite.ikTargetStage.x).toBeGreaterThan(startWrite.ikTargetStage.x);
  });

  it("exposes reusable silent Google Flow slots and honors reduced motion", () => {
    expect(Object.keys(GOOGLE_FLOW_CLIP_SLOTS)).toHaveLength(8);
    const reduced = evaluateHybridDirectorAtTime({
      timeSec: 4.5,
      word: "abeja",
      reducedMotion: true,
    });
    expect(reduced.turnBlend).toBe(0);
    expect(reduced.armRaise).toBe(0);
    expect(reduced.writeWordProgress).toBe(1);
  });
});
