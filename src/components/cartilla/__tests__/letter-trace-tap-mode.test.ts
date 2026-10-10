import { describe, it, expect, afterEach, vi } from "vitest";
import {
  LETTER_TEMPLATES,
  advanceTap,
  flattenCheckpoints,
  isActiveCheckpoint,
  isCheckpointDone,
  type Point,
  type TapPosition,
} from "../letter-stroke-templates";
import { detectTraceInputMode } from "../useLetterTraceInput";

/**
 * Tap-the-dots grading, used on mouse-primary devices. It must walk the very
 * same stroke templates the drag trace follows, in the very same order — that
 * is what keeps the child seeing correct letter formation and direction.
 */

const START: TapPosition = { strokeIdx: 0, pointIdx: 0 };

/** Walk a template start to finish by always tapping the checkpoint that is due. */
function tapThrough(strokes: Point[][]) {
  let pos = START;
  const visited: Array<{ strokeIdx: number; pointIdx: number }> = [];
  let completed = false;
  // generous bound so a logic bug loops out instead of hanging the suite
  for (let guard = 0; guard < 500 && !completed; guard++) {
    const result = advanceTap(strokes, pos, pos);
    visited.push({ strokeIdx: pos.strokeIdx, pointIdx: pos.pointIdx });
    if (result.kind === "complete") {
      completed = true;
      break;
    }
    if (result.kind === "wrong") throw new Error("in-order tap was graded wrong");
    pos = result.next;
  }
  return { visited, completed };
}

describe("advanceTap — order is the grading", () => {
  it("accepts every checkpoint of every template when tapped in writing order", () => {
    for (const [letter, strokes] of Object.entries(LETTER_TEMPLATES)) {
      const { visited, completed } = tapThrough(strokes);
      const total = strokes.reduce((n, s) => n + s.length, 0);
      expect(completed, `${letter} never completed`).toBe(true);
      expect(visited.length, `${letter} visited the wrong number of checkpoints`).toBe(total);
    }
  });

  it("visits checkpoints in exactly the template's own order (direction is preserved)", () => {
    const strokes = LETTER_TEMPLATES.A;
    const { visited } = tapThrough(strokes);
    const expected = flattenCheckpoints(strokes).map((c) => ({
      strokeIdx: c.strokeIdx,
      pointIdx: c.pointIdx,
    }));
    expect(visited).toEqual(expected);
  });

  it("rejects a tap that skips ahead — the letter cannot be short-circuited", () => {
    const strokes = LETTER_TEMPLATES.A; // 3 strokes x 3 points
    // jumping straight to the last checkpoint of the last stroke
    expect(advanceTap(strokes, START, { strokeIdx: 2, pointIdx: 2 }).kind).toBe("wrong");
    // even one step ahead within the same stroke is wrong
    expect(advanceTap(strokes, START, { strokeIdx: 0, pointIdx: 1 }).kind).toBe("wrong");
  });

  it("rejects tapping a checkpoint already completed", () => {
    const strokes = LETTER_TEMPLATES.A;
    const pos: TapPosition = { strokeIdx: 1, pointIdx: 0 };
    expect(advanceTap(strokes, pos, { strokeIdx: 0, pointIdx: 0 }).kind).toBe("wrong");
  });

  it("reports a stroke boundary so the path can be banked and redrawn", () => {
    const strokes = LETTER_TEMPLATES.A;
    // last point of stroke 0 -> should report "stroke", moving to stroke 1
    const atLast: TapPosition = { strokeIdx: 0, pointIdx: strokes[0].length - 1 };
    const result = advanceTap(strokes, atLast, atLast);
    expect(result.kind).toBe("stroke");
    if (result.kind === "stroke") {
      expect(result.next).toEqual({ strokeIdx: 1, pointIdx: 0 });
    }
  });

  it("reports completion only on the final checkpoint of the final stroke", () => {
    const strokes = LETTER_TEMPLATES.O; // single stroke
    const lastIdx = strokes[0].length - 1;
    const beforeLast: TapPosition = { strokeIdx: 0, pointIdx: lastIdx - 1 };
    expect(advanceTap(strokes, beforeLast, beforeLast).kind).toBe("point");
    const last: TapPosition = { strokeIdx: 0, pointIdx: lastIdx };
    expect(advanceTap(strokes, last, last).kind).toBe("complete");
  });

  it("a wrong tap does not advance the position (no penalty spiral, no progress)", () => {
    const strokes = LETTER_TEMPLATES.A;
    // Repeated wrong taps always return "wrong" and never carry state forward.
    for (let i = 0; i < 5; i++) {
      expect(advanceTap(strokes, START, { strokeIdx: 2, pointIdx: 2 }).kind).toBe("wrong");
    }
    // the due checkpoint is still the very first one
    expect(advanceTap(strokes, START, START).kind).not.toBe("wrong");
  });
});

describe("coincident checkpoints — the closed-letterform trap", () => {
  /**
   * Regression guard for a real bug caught in the browser: a closed letterform
   * (O) ends exactly where it starts, and several letters (M, N, T…) begin a
   * stroke on the previous stroke's last point. Those checkpoints share pixel
   * coordinates, so if the active dot is not drawn LAST it can be covered by a
   * later checkpoint's invisible hit area and the child's click is graded
   * wrong. This test proves such overlaps really exist, so the render-order
   * comment in both components never gets "tidied away" as unnecessary.
   */
  function coincidentPairs(strokes: Point[][]) {
    const flat = flattenCheckpoints(strokes);
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i].point.x === flat[j].point.x && flat[i].point.y === flat[j].point.y) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs;
  }

  it("O closes on its own start point", () => {
    expect(coincidentPairs(LETTER_TEMPLATES.O).length).toBeGreaterThan(0);
  });

  it("M chains strokes through shared endpoints", () => {
    expect(coincidentPairs(LETTER_TEMPLATES.M).length).toBeGreaterThan(0);
  });

  it("a coincident later checkpoint is still graded wrong when tapped early", () => {
    // O: first and last checkpoint share coordinates. At the very start, the
    // LAST one must not be accepted just because it sits on the same spot.
    const strokes = LETTER_TEMPLATES.O;
    const lastIdx = strokes[0].length - 1;
    expect(strokes[0][0]).toEqual(strokes[0][lastIdx]);
    expect(advanceTap(strokes, START, { strokeIdx: 0, pointIdx: lastIdx }).kind).toBe("wrong");
    expect(advanceTap(strokes, START, { strokeIdx: 0, pointIdx: 0 }).kind).toBe("point");
  });
});

describe("checkpoint display helpers", () => {
  it("marks exactly one checkpoint active, and only earlier ones done", () => {
    const pos: TapPosition = { strokeIdx: 1, pointIdx: 1 };
    expect(isActiveCheckpoint(pos, 1, 1)).toBe(true);
    expect(isActiveCheckpoint(pos, 1, 0)).toBe(false);
    // earlier stroke entirely done
    expect(isCheckpointDone(pos, 0, 2)).toBe(true);
    // earlier point in the same stroke done
    expect(isCheckpointDone(pos, 1, 0)).toBe(true);
    // the active one is not "done"
    expect(isCheckpointDone(pos, 1, 1)).toBe(false);
    // later ones not done
    expect(isCheckpointDone(pos, 2, 0)).toBe(false);
  });

  it("numbers checkpoints 1..n across the whole letter, in writing order", () => {
    const flat = flattenCheckpoints(LETTER_TEMPLATES.A);
    expect(flat).toHaveLength(9);
    expect(flat.map((c) => c.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(flat[0].point).toEqual(LETTER_TEMPLATES.A[0][0]);
  });
});

describe("detectTraceInputMode — matchMedia only, never user-agent", () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });

  function mockPointer(matches: Record<string, boolean>) {
    window.matchMedia = vi.fn((q: string) => ({
      matches: matches[q] ?? false,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }

  it("mouse-primary (fine, not coarse) gets tap mode", () => {
    mockPointer({ "(pointer: fine)": true, "(pointer: coarse)": false });
    expect(detectTraceInputMode()).toBe("tap");
  });

  it("touch-primary (coarse) keeps the drag trace", () => {
    mockPointer({ "(pointer: coarse)": true, "(pointer: fine)": false });
    expect(detectTraceInputMode()).toBe("drag");
  });

  it("a hybrid reporting BOTH coarse and fine keeps the drag trace", () => {
    mockPointer({ "(pointer: coarse)": true, "(pointer: fine)": true });
    expect(detectTraceInputMode()).toBe("drag");
  });

  it("falls back to drag when matchMedia is unavailable, never degrading touch", () => {
    // @ts-expect-error deliberately removing the API to simulate old/jsdom envs
    window.matchMedia = undefined;
    expect(detectTraceInputMode()).toBe("drag");
  });

  it("falls back to drag when matchMedia throws", () => {
    window.matchMedia = vi.fn(() => {
      throw new Error("nope");
    }) as unknown as typeof window.matchMedia;
    expect(detectTraceInputMode()).toBe("drag");
  });
});
