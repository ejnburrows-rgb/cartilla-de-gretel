import { describe, expect, it } from "vitest";
import { LOOP_MS, PLACE_MS, TOSS_MS, ballAt, nextCatchTime, poseAt, slotBalls } from "../juggle";

// Owner order on #1015 (2026-10-20): Chano catches the exact ball the child picked from the
// juggle, places it on the next slot where it stays, and the other balls keep juggling.
const SLOT = { x: 420, y: 1052 };
const idx = (s: string) => ["ma", "mi", "mo", "mu", "me"].indexOf(s);

describe("Chano catches the picked ball", () => {
  it("catches each ball only when it rests in one of his hands, within one loop", () => {
    for (let i = 0; i < 5; i++)
      for (let t = 0; t < LOOP_MS; t += 97) {
        const c = nextCatchTime(t, i);
        expect(c).toBeGreaterThanOrEqual(t);
        expect(c - t).toBeLessThan(LOOP_MS);
        expect(["left-hand", "right-hand"]).toContain(ballAt(c, i).phase);
      }
  });

  it("keeps juggling until the catch, flies from that hand without a jump, then stays on the slot", () => {
    const i = idx("mu");
    const catchT = nextCatchTime(1234, i);
    const place = { slot: SLOT, scale: 0.8, pickT: 1234, catchT };
    const before = poseAt(catchT - 1, i, place);
    expect(before.state).toBe("chosen");
    expect(before).toMatchObject(ballAt(catchT - 1, i));
    const atCatch = poseAt(catchT, i, place);
    const hand = ballAt(catchT, i);
    expect(Math.hypot(atCatch.x - hand.x, atCatch.y - hand.y)).toBeLessThan(1);
    expect(poseAt(catchT + PLACE_MS / 2, i, place).state).toBe("placing");
    for (const later of [PLACE_MS, PLACE_MS + 5000, PLACE_MS + 60_000])
      expect(poseAt(catchT + later, i, place)).toMatchObject({ ...SLOT, scale: 0.8, state: "on-board" });
  });

  it("only moves the picked ball; the others keep their juggle path", () => {
    const i = idx("mi");
    const place = { slot: SLOT, scale: 0.8, pickT: 0, catchT: nextCatchTime(0, i) };
    for (const t of [place.catchT + 100, place.catchT + 2000])
      for (let j = 0; j < 5; j++) if (j !== i) expect(poseAt(t, j)).toMatchObject(ballAt(t, j));
  });

  it("tosses a cleared ball back into the live juggle without teleporting", () => {
    const i = idx("ma");
    const toss = { from: SLOT, fromScale: 0.8, startT: 5000 };
    const start = poseAt(5000, i, null, toss);
    expect(Math.hypot(start.x - SLOT.x, start.y - SLOT.y)).toBeLessThan(1);
    const end = poseAt(5000 + TOSS_MS, i, null, toss);
    expect(end).toMatchObject({ ...ballAt(5000 + TOSS_MS, i), scale: 1, state: "juggling" });
  });

  it("uses one physical ball per syllable; a repeated syllable never gets a copy", () => {
    expect(slotBalls(["mi", "ma"])).toEqual([idx("mi"), idx("ma")]);
    expect(slotBalls(["ma", "ma"])).toEqual([idx("ma"), -1]);
    expect(slotBalls(["MÁ", null])).toEqual([idx("ma"), -1]);
    expect(slotBalls([null, "me"])).toEqual([-1, idx("me")]);
  });
});
