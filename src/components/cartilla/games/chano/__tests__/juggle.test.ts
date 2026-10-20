import { describe, expect, it } from "vitest";
import {
  ARCH_MS,
  BALL_R,
  BEAT_MS,
  DWELL_MS,
  FACE_BOX,
  FEED_MS,
  HAT_BOX,
  JUGGLE_BALLS,
  LOOP_MS,
  ballAt,
  circleHitsBox,
  frameAt,
  handLift,
} from "../juggle";

const STEP = 2;
const frames = Array.from({ length: LOOP_MS / STEP }, (_, k) => frameAt(k * STEP));

describe("Chano rainbow juggle (owner order 2026-10-20)", () => {
  it("juggles exactly the five painted balls on one steady loop", () => {
    expect(JUGGLE_BALLS.map((b) => b.syllable)).toEqual(["ma", "mi", "mo", "mu", "me"]);
    expect(LOOP_MS).toBe(5 * BEAT_MS);
    expect(DWELL_MS * 2 + ARCH_MS + FEED_MS).toBe(LOOP_MS);
    // Loop closes seamlessly.
    for (let i = 0; i < 5; i++) {
      const a = ballAt(0, i);
      const b = ballAt(LOOP_MS, i);
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(0.01);
    }
  });

  it("never lets two balls overlap (evenly spaced, one beat apart)", () => {
    let min = Infinity;
    for (const f of frames)
      for (let i = 0; i < 5; i++)
        for (let j = i + 1; j < 5; j++)
          min = Math.min(min, Math.hypot(f.balls[i].x - f.balls[j].x, f.balls[i].y - f.balls[j].y));
    expect(min).toBeGreaterThan(2 * BALL_R);
  });

  it("never crosses his face or hat; the arch peaks above the hat", () => {
    for (const f of frames)
      for (const b of f.balls) {
        expect(circleHitsBox(b, BALL_R, FACE_BOX)).toBe(false);
        expect(circleHitsBox(b, BALL_R, HAT_BOX)).toBe(false);
      }
    const archTop = Math.min(
      ...frames.flatMap((f) => f.balls.filter((b) => b.phase === "arch").map((b) => b.y)),
    );
    expect(archTop + BALL_R).toBeLessThan(HAT_BOX.y);
  });

  it("moves every ball smoothly (no jumps between hand and air)", () => {
    for (let k = 1; k < frames.length; k++)
      for (let i = 0; i < 5; i++) {
        const a = frames[k - 1].balls[i];
        const b = frames[k].balls[i];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(4);
      }
  });

  it("rests each ball in a hand before every throw, one ball per hand at a time", () => {
    for (const f of frames) {
      expect(f.balls.filter((b) => b.phase === "left-hand").length).toBeLessThanOrEqual(1);
      expect(f.balls.filter((b) => b.phase === "right-hand").length).toBeLessThanOrEqual(1);
    }
    for (let i = 0; i < 5; i++) {
      const phases = frames.map((_, k) => ballAt(k * STEP, i).phase);
      const order = phases.filter((p, k) => k === 0 || p !== phases[k - 1]);
      if (order.length > 1 && order[0] === order[order.length - 1]) order.pop();
      expect(order).toHaveLength(4);
      const s = order.join(",");
      expect(`${s},${s}`).toContain("left-hand,arch,right-hand,feed");
    }
    expect(DWELL_MS).toBeGreaterThanOrEqual(BEAT_MS / 2);
  });

  it("dips the hand when a ball lands and lifts it when the ball leaves", () => {
    expect(handLift(0)).toBeCloseTo(0, 5);
    expect(handLift(DWELL_MS * 0.4)).toBeLessThan(-5); // dip after the catch
    expect(handLift(DWELL_MS - 1)).toBeGreaterThan(5); // lifted at the throw
    expect(handLift(BEAT_MS - 1)).toBeCloseTo(0, 1); // back to ready for the next catch
  });
});
