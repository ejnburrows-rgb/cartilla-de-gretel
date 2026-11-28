import { describe, expect, it } from "vitest";
import {
  CHALKBOARD_RIG_LIMITS,
  computeChalkboardRigFrame,
  evaluateBlinkStage,
  resolveCoarticulatedViseme,
} from "../tutor-chalkboard-rig";

describe("tutor-chalkboard-rig", () => {
  const sampleTimeline = [
    { start: 0, end: 0.14, shape: "X" },
    { start: 0.14, end: 0.22, shape: "A" },
    { start: 0.22, end: 0.38, shape: "D" },
    { start: 0.38, end: 0.56, shape: "E" },
  ];

  it("drives primary lip-sync strictly from Rhubarb timeline and currentTime with coarticulation", () => {
    // Mid-cue (0.28 inside D)
    const mid = resolveCoarticulatedViseme({
      currentTime: 0.28,
      timeline: sampleTimeline,
      isSpeaking: true,
    });
    expect(mid.primaryShape).toBe("D");
    expect(mid.secondaryShape).toBeNull();
    expect(mid.primaryOpacity).toBe(1);
    expect(mid.source).toBe("rhubarb-coarticulated");

    // 25ms before boundary D -> E (inside 55ms vowel coarticulation window)
    const cross = resolveCoarticulatedViseme({
      currentTime: 0.355,
      timeline: sampleTimeline,
      isSpeaking: true,
    });
    expect(cross.primaryShape).toBe("D");
    expect(cross.secondaryShape).toBe("E");
    expect(cross.primaryOpacity + cross.secondaryOpacity).toBeCloseTo(1, 2);
    expect(cross.secondaryOpacity).toBeGreaterThan(0);
  });

  it("forces calm resting shape X when muted, paused, idle, or reduced-motion", () => {
    for (const flags of [
      { isSpeaking: false },
      { isSpeaking: true, isPaused: true },
      { isSpeaking: true, isMuted: true },
      { isSpeaking: true, reducedMotion: true },
    ]) {
      const res = resolveCoarticulatedViseme({
        currentTime: 0.28,
        timeline: sampleTimeline,
        ...flags,
      });
      expect(res.primaryShape).toBe("X");
      expect(res.secondaryShape).toBeNull();
    }
  });

  it("keeps pupils bounded inside sockets and supports all 5 asymmetric blink stages", () => {
    for (const gaze of [
      "student",
      "chalkboard-title",
      "chalkboard-teaching",
      "flipchart-right",
      "thinking-up",
      "workbook-down",
    ] as const) {
      const frame = computeChalkboardRigFrame({
        timeSec: 1.25,
        expression: "speaking",
        gazeTarget: gaze,
        isSpeaking: true,
        reducedMotion: false,
      });
      expect(Math.abs(frame.pupilX)).toBeLessThanOrEqual(CHALKBOARD_RIG_LIMITS.maxPupilX);
      expect(Math.abs(frame.pupilY)).toBeLessThanOrEqual(CHALKBOARD_RIG_LIMITS.maxPupilY);
      expect(Math.abs(frame.headTiltDeg)).toBeLessThanOrEqual(CHALKBOARD_RIG_LIMITS.maxHeadTiltDeg);
      expect(Math.abs(frame.hairLeftDeg)).toBeLessThanOrEqual(CHALKBOARD_RIG_LIMITS.maxHairSwayDeg);
      expect(frame.breathingScaleY).toBeGreaterThanOrEqual(1);
      expect(frame.breathingScaleY).toBeLessThanOrEqual(CHALKBOARD_RIG_LIMITS.maxBreathingScaleY);
    }

    const stages = [10, 30, 48, 70, 120, 155, 180].map((ms) => evaluateBlinkStage(ms));
    expect(stages).toEqual([25, 50, 75, 100, 75, 50, 25]);
    expect(evaluateBlinkStage(-1)).toBe(0);
    expect(evaluateBlinkStage(250)).toBe(0);
  });

  it("returns pure calm identity pose under prefers-reduced-motion", () => {
    const reduced = computeChalkboardRigFrame({
      timeSec: 2.4,
      expression: "listening",
      gazeTarget: "chalkboard-teaching",
      isSpeaking: true,
      blinkElapsedMs: 65,
      reducedMotion: true,
    });
    expect(reduced).toEqual({
      pupilX: 0,
      pupilY: 0,
      lidStage: 0,
      leftBrowY: 0,
      rightBrowY: 0,
      leftBrowTiltDeg: 0,
      rightBrowTiltDeg: 0,
      headTiltDeg: 0,
      headShiftX: 0,
      headShiftY: 0,
      breathingScaleY: 1,
      hairLeftDeg: 0,
      hairRightDeg: 0,
    });
  });
});
