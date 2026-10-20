import { describe, it, expect } from "vitest";

// We import the contract even if it doesn't exist yet
import {
  BEAT_MS,
  HAND_CYCLE_MS,
  BALL_LOOP_MS,
  DWELL_RATIO,
  DWELL_MS,
  FLIGHT_MS,
  PHASE_OFFSETS_MS,
  ballStateAt,
  type BallGeometry
} from "../juggle";

const geometry: BallGeometry = {
  catchLeft: { x: 300, y: 1000 },
  throwLeft: { x: 450, y: 1000 },
  catchRight: { x: 786, y: 1000 },
  throwRight: { x: 636, y: 1000 },
  apexY: 400
};

describe("Juggle Engine (Contract)", () => {
  it("1. Constants are exactly the spec values and segment durations sum correctly", () => {
    expect(BEAT_MS).toBe(360);
    expect(HAND_CYCLE_MS).toBe(720);
    expect(BALL_LOOP_MS).toBe(2160);
    expect(DWELL_RATIO).toBe(0.65);
    expect(DWELL_MS).toBe(468);
    expect(FLIGHT_MS).toBe(612);
    expect(PHASE_OFFSETS_MS).toEqual([0, 720, 1440]);

    expect(DWELL_MS + FLIGHT_MS).toBe(1080);
    expect(BALL_LOOP_MS / 2).toBe(1080);
  });

  it("2. Determinism/purity: repeated calls identical; t and t + 2160 give identical states", () => {
    const t = 1500;
    const slot = 1;

    const state1 = ballStateAt(t, slot, geometry);
    const state2 = ballStateAt(t, slot, geometry);
    expect(state1).toEqual(state2);

    const stateWrapped = ballStateAt(t + BALL_LOOP_MS, slot, geometry);
    expect(state1).toEqual(stateWrapped);

    const stateWrappedNeg = ballStateAt(t - BALL_LOOP_MS, slot, geometry);
    expect(state1).toEqual(stateWrappedNeg);
  });

  it("3. Dwell is never parked: ball position changes between consecutive samples", () => {
    // Test slot 0 dwell phase which is 0 to DWELL_MS (0 to 468)
    const dt = 10;
    let prev = ballStateAt(0, 0, geometry);

    // Initial position should be catch position (since slot 0 starts with a left catch)
    expect(prev.x).toBeCloseTo(geometry.catchLeft.x, 1);
    expect(prev.y).toBeCloseTo(geometry.catchLeft.y, 1);
    expect(prev.phase).toBe("dwell");

    for (let t = dt; t <= DWELL_MS; t += dt) {
      const current = ballStateAt(t, 0, geometry);
      expect(current.phase).toBe("dwell");
      // ensure we are not parked
      const dx = current.x - prev.x;
      const dy = current.y - prev.y;
      expect(Math.abs(dx) + Math.abs(dy)).toBeGreaterThan(0.001);
      prev = current;
    }

    // End of dwell should be throw position
    const endOfDwell = ballStateAt(DWELL_MS, 0, geometry);
    expect(endOfDwell.x).toBeCloseTo(geometry.throwLeft.x, 1);
    expect(endOfDwell.y).toBeCloseTo(geometry.throwLeft.y, 1);
  });

  it("4. Flight X is linear: midpoint X = average of endpoints; equal time steps = equal X steps", () => {
    const flightStart = DWELL_MS; // 468
    const flightEnd = DWELL_MS + FLIGHT_MS; // 1080

    const startState = ballStateAt(flightStart, 0, geometry);
    const endState = ballStateAt(flightEnd, 0, geometry);

    const midTime = flightStart + FLIGHT_MS / 2;
    const midState = ballStateAt(midTime, 0, geometry);

    // Midpoint should be exact average
    const expectedMidX = (startState.x + endState.x) / 2;
    expect(midState.x).toBeCloseTo(expectedMidX, 1);

    // Equal time steps -> equal X steps
    const dt = 50;
    const s1 = ballStateAt(flightStart + dt, 0, geometry);
    const s2 = ballStateAt(flightStart + dt * 2, 0, geometry);
    const s3 = ballStateAt(flightStart + dt * 3, 0, geometry);

    const dx1 = s2.x - s1.x;
    const dx2 = s3.x - s2.x;
    expect(dx1).toBeCloseTo(dx2, 2);
  });

  it("5. Flight Y is a true parabola: apex at flight midpoint, symmetric, endpoints match hand height", () => {
    const flightStart = DWELL_MS;
    const flightEnd = DWELL_MS + FLIGHT_MS;
    const midTime = flightStart + FLIGHT_MS / 2;

    const midState = ballStateAt(midTime, 0, geometry);
    expect(midState.y).toBeCloseTo(geometry.apexY, 1);

    // Check symmetry
    const dt = 100;
    const stateBeforeApex = ballStateAt(midTime - dt, 0, geometry);
    const stateAfterApex = ballStateAt(midTime + dt, 0, geometry);
    expect(stateBeforeApex.y).toBeCloseTo(stateAfterApex.y, 1);

    // Endpoints match hand height
    const startState = ballStateAt(flightStart, 0, geometry);
    const endState = ballStateAt(flightEnd, 0, geometry);
    expect(startState.y).toBeCloseTo(geometry.throwLeft.y, 1);
    expect(endState.y).toBeCloseTo(geometry.catchRight.y, 1);
  });

  it("6. Catch squash: t=0 scales (1.15, 0.85), t=90 recovering, mid-flight is 1", () => {
    // catch instant for slot 0
    const catchState = ballStateAt(0, 0, geometry);
    expect(catchState.scaleX).toBeCloseTo(1.15, 2);
    expect(catchState.scaleY).toBeCloseTo(0.85, 2);

    // 90ms later, recovering towards 1
    const recState = ballStateAt(90, 0, geometry);
    expect(recState.scaleX).toBeLessThan(1.15);
    expect(recState.scaleX).toBeGreaterThanOrEqual(1.0);
    expect(recState.scaleY).toBeGreaterThan(0.85);
    expect(recState.scaleY).toBeLessThanOrEqual(1.0);

    // Mid flight
    const flightMidTime = DWELL_MS + FLIGHT_MS / 2;
    const flightState = ballStateAt(flightMidTime, 0, geometry);
    expect(flightState.scaleX).toBeCloseTo(1.0, 2);
    expect(flightState.scaleY).toBeCloseTo(1.0, 2);
  });

  it("7. Throw cadence: flight starts occur every 360ms and alternate hands", () => {
    const flightStarts = [];

    // Scan resolution is high enough to catch transitions
    // Flight start occurs exactly when phase transitions from dwell to flight
    // But since the API returns phase="dwell" or "flight", we can just pinpoint DWELL_MS relative to each slot's clock.
    // For a 2160ms window:
    for (let slot = 0; slot < 3; slot++) {
      for (let t = 0; t < 2160; t++) {
        const current = ballStateAt(t, slot, geometry);
        const prev = ballStateAt(t - 1, slot, geometry);
        if (prev.phase === "dwell" && current.phase === "flight") {
          flightStarts.push({ time: t, hand: prev.hand, slot });
        }
      }
    }

    flightStarts.sort((a, b) => a.time - b.time);

    expect(flightStarts.length).toBe(6); // 2 flights per loop per slot -> 6 flights total

    for (let i = 1; i < flightStarts.length; i++) {
      const diff = flightStarts[i].time - flightStarts[i - 1].time;
      expect(diff).toBe(BEAT_MS); // 360ms
      expect(flightStarts[i].hand).not.toBe(flightStarts[i - 1].hand); // Should alternate
    }
  });

  it("8. Phase offsets: slots offset by 720ms", () => {
    const t = 1000; // arbitrary time

    // For segment model, the hands alternate.
    // slot 1 is offset by 720ms from slot 0.
    // slot 2 is offset by 1440ms from slot 0.

    const s0 = ballStateAt(t, 0, geometry);
    const s1 = ballStateAt(t + 720, 1, geometry);
    const s2 = ballStateAt(t + 1440, 2, geometry);

    // Due to the segment model logic (1080ms per segment), adding 720ms to the observation time
    // of slot 1 should perfectly line up its internal phase with slot 0's internal phase at t.
    // Wait, the specification says: "slot k state at t equals slot 0 state at t - 720k, modulo hand mirroring".
    // Let's assert based on the offset logic.
    const s0Base = ballStateAt(t, 0, geometry);

    // Helper to check state equality ignoring hand/x mirroring if they are on opposite sides
    const expectStatesEquivalent = (stateA: ReturnType<typeof ballStateAt>, stateB: ReturnType<typeof ballStateAt>) => {
      // If hands match, states should be strictly equal
      if (stateA.hand === stateB.hand) {
        expect(stateA).toEqual(stateB);
      } else {
        // If hands are opposite, y and scales and phase are equal, x is mirrored
        expect(stateA.y).toBeCloseTo(stateB.y, 1);
        expect(stateA.phase).toBe(stateB.phase);
        expect(stateA.scaleX).toBeCloseTo(stateB.scaleX, 2);
        expect(stateA.scaleY).toBeCloseTo(stateB.scaleY, 2);
        expect(stateA.underHandCap).toBe(stateB.underHandCap);

        // x mirroring depends on the geometry. It's symmetric.
        // center is (catchLeft.x + catchRight.x) / 2
        const centerX = (geometry.catchLeft.x + geometry.catchRight.x) / 2;
        const distA = stateA.x - centerX;
        const distB = stateB.x - centerX;
        expect(distA).toBeCloseTo(-distB, 1);
      }
    };

    const s1Base = ballStateAt(t + 720, 1, geometry);
    const s2Base = ballStateAt(t + 1440, 2, geometry);

    expectStatesEquivalent(s0Base, s1Base);
    expectStatesEquivalent(s0Base, s2Base);

    // Spec exactly: slot k state at t equals slot 0 state at t - 720k
    const s1Exact = ballStateAt(t, 1, geometry);
    const s0AtTMinus720 = ballStateAt(t - 720, 0, geometry);
    expectStatesEquivalent(s1Exact, s0AtTMinus720);

    const s2Exact = ballStateAt(t, 2, geometry);
    const s0AtTMinus1440 = ballStateAt(t - 1440, 0, geometry);
    expectStatesEquivalent(s2Exact, s0AtTMinus1440);
  });

  it("9. underHandCap is true exactly during dwell and false during flight", () => {
    // Dwell phase 0 to DWELL_MS (excluding boundaries which might overlap but let's test strict interior)
    const dwellMid = DWELL_MS / 2;
    const dwellState = ballStateAt(dwellMid, 0, geometry);
    expect(dwellState.underHandCap).toBe(true);
    expect(dwellState.phase).toBe("dwell");

    // Flight phase DWELL_MS to 1080
    const flightMid = DWELL_MS + FLIGHT_MS / 2;
    const flightState = ballStateAt(flightMid, 0, geometry);
    expect(flightState.underHandCap).toBe(false);
    expect(flightState.phase).toBe("flight");
  });

  it("10. Loop continuity: position at end of segment equals position at start of next", () => {
    // Segment 1 ends at 1080, Segment 2 starts at 1080
    // Segment 1 flight ends at catchRight
    const endSegment1 = ballStateAt(1080, 0, geometry); // Exact moment of catch

    // At t=1080 exactly, it should be at the catch point
    expect(endSegment1.x).toBeCloseTo(geometry.catchRight.x, 1);
    expect(endSegment1.y).toBeCloseTo(geometry.catchRight.y, 1);

    // Test the wrap around 0 / 2160
    const wrapWrap = ballStateAt(2160, 0, geometry);
    expect(wrapWrap.x).toBeCloseTo(geometry.catchLeft.x, 1);
    expect(wrapWrap.y).toBeCloseTo(geometry.catchLeft.y, 1);

    const wrapStart = ballStateAt(0, 0, geometry);
    expect(wrapStart.x).toBeCloseTo(geometry.catchLeft.x, 1);
    expect(wrapStart.y).toBeCloseTo(geometry.catchLeft.y, 1);
  });
});
