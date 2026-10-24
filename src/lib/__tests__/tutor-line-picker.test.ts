/**
 * Tutor line picker tests (GRETEL-TUTOR-BUILD-SPEC §18.4 "Variety", §18.5, §18.6).
 *
 * Locks: the no-repeat window (last 5 per role), least-played weighting,
 * praise never repeating immediately, sequence picks as an ordered list,
 * determinism under a fixed rng, and the fixed model/confusion line ids.
 */
import { describe, expect, it } from "vitest";
import { findTutorItem } from "../tutor-content";
import {
  RECENT_WINDOW,
  SEQUENCE_PAUSE_MS,
  TUTOR_LINES,
  confusionLineIdFor,
  createLinePickerState,
  modelLineIdForItem,
  pickLine,
  pickSequence,
  poolForRole,
  type LinePickerState,
} from "../tutor-line-picker";

/** Deterministic LCG so full sessions replay identically. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

describe("poolForRole", () => {
  it("scopes greeting-first to the lesson", () => {
    const pool = poolForRole("greeting-first", 2);
    expect(pool.map((entry) => entry.lineId)).toEqual([
      "l2-greeting-first-01",
      "l2-greeting-first-02",
      "l2-greeting-first-03",
    ]);
  });

  it("includes shared (lesson 0) lines for any lesson", () => {
    const pool = poolForRole("greeting-return", 3);
    expect(pool).toHaveLength(3);
    expect(pool.every((entry) => entry.lineId.startsWith("l0-greeting-return"))).toBe(true);
  });

  it("exposes the §18.5 praise pool (12 shared lines)", () => {
    expect(poolForRole("praise", 1)).toHaveLength(12);
  });
});

describe("pickLine: no-repeat window (last 5 of the same role)", () => {
  it("never repeats a line within the last 5 plays of the role", () => {
    let state = createLinePickerState();
    const rng = seededRng(7);
    const picked: string[] = [];
    for (let i = 0; i < 40; i++) {
      const result = pickLine(state, { role: "praise", lesson: 1 }, rng);
      expect(result).not.toBeNull();
      state = result!.state;
      picked.push(result!.lineId);
      const window = picked.slice(Math.max(0, picked.length - 6), -1);
      expect(window).not.toContain(result!.lineId);
    }
  });

  it("still picks when the pool is smaller than the window (fallback to weighting)", () => {
    let state = createLinePickerState();
    const rng = seededRng(11);
    for (let i = 0; i < 12; i++) {
      // noise pool has only 2 lines; the window is 5.
      const result = pickLine(state, { role: "noise", lesson: 1 }, rng);
      expect(result).not.toBeNull();
      state = result!.state;
      expect(["l0-noise-01", "l0-noise-02"]).toContain(result!.lineId);
    }
  });

  it("RECENT_WINDOW is 5", () => {
    expect(RECENT_WINDOW).toBe(5);
  });
});

describe("pickLine: least-played weighting", () => {
  it("prefers the least-played line for the slot", () => {
    const plays: Record<string, Record<string, number>> = {
      praise: {},
    };
    for (const entry of poolForRole("praise", 1)) {
      plays.praise[entry.lineId] = 5; // heavily played
    }
    plays.praise["l0-praise-07"] = 0; // the fresh one
    const state: LinePickerState = { recent: {}, plays };

    // Every line except -07 has weight 1/6; -07 has weight 1. With rng in
    // the middle, the pick must land in -07's dominant slice.
    const result = pickLine(state, { role: "praise", lesson: 1 }, () => 0.5);
    expect(result?.lineId).toBe("l0-praise-07");
  });

  it("a heavily played line is picked only when nothing fresher is available", () => {
    const plays: Record<string, Record<string, number>> = {
      noise: { "l0-noise-01": 9, "l0-noise-02": 0 },
    };
    const state: LinePickerState = { recent: {}, plays };
    const first = pickLine(state, { role: "noise" }, () => 0.5);
    expect(first?.lineId).toBe("l0-noise-02");
  });
});

describe("praise never repeats immediately", () => {
  it("two consecutive praise picks never match, whatever the rng does", () => {
    for (const seed of [0, 1, 2, 3, 42, 999]) {
      const rng = seededRng(seed);
      let state = createLinePickerState();
      for (let i = 0; i < 10; i++) {
        const a = pickLine(state, { role: "praise" }, rng);
        const b = pickLine(a!.state, { role: "praise" }, rng);
        expect(a?.lineId).not.toBe(b?.lineId);
        state = createLinePickerState();
      }
    }
  });
});

describe("determinism under a fixed rng", () => {
  it("identical rng sequences produce identical line sequences", () => {
    const runA = runPraiseSession(1234);
    const runB = runPraiseSession(1234);
    expect(runA).toEqual(runB);
  });

  it("different seeds can produce different sequences", () => {
    const a = runPraiseSession(1);
    const b = runPraiseSession(20261021);
    expect(a).not.toEqual(b);
  });
});

function runPraiseSession(seed: number): string[] {
  let state = createLinePickerState();
  const rng = seededRng(seed);
  const ids: string[] = [];
  for (let i = 0; i < 20; i++) {
    const result = pickLine(state, { role: "try-again", lesson: 2 }, rng);
    state = result!.state;
    ids.push(result!.lineId);
  }
  return ids;
}

describe("pickSequence: ordered whole-line lists (§18.5)", () => {
  it("returns an ordered list and records both plays", () => {
    const result = pickSequence(
      createLinePickerState(),
      [
        { role: "try-again", lesson: 1 },
        { role: "redirect", lesson: 1 },
      ],
      seededRng(5),
    );
    expect(result).not.toBeNull();
    expect(result!.lineIds).toHaveLength(2);
    expect(TUTOR_LINES.some((entry) => entry.lineId === result!.lineIds[0])).toBe(true);
    expect(TUTOR_LINES.some((entry) => entry.lineId === result!.lineIds[1])).toBe(true);
    expect(result!.state.recent["try-again"]).toContain(result!.lineIds[0]);
    expect(result!.state.recent["redirect"]).toContain(result!.lineIds[1]);
  });

  it("two same-role steps in one sequence never pick the same line twice", () => {
    const result = pickSequence(
      createLinePickerState(),
      [{ role: "try-again" }, { role: "try-again" }],
      seededRng(3),
    );
    expect(result).not.toBeNull();
    expect(result!.lineIds[0]).not.toBe(result!.lineIds[1]);
  });

  it("returns null when a step's role has no pool", () => {
    const result = pickSequence(createLinePickerState(), [{ role: "no-such-role" as never }], () => 0);
    expect(result).toBeNull();
  });

  it("sequences use a 400 ms pause", () => {
    expect(SEQUENCE_PAUSE_MS).toBe(400);
  });
});

describe("fixed line lookups", () => {
  it("vowel items map to l0-vowel-model-*", () => {
    expect(modelLineIdForItem(findTutorItem(1, "a"))).toBe("l0-vowel-model-a");
    expect(modelLineIdForItem(findTutorItem(2, "o"))).toBe("l0-vowel-model-o");
  });

  it("word items map to the manifest word-model with that text", () => {
    expect(modelLineIdForItem(findTutorItem(2, "oso"))).toBe("l1-model-oso");
    expect(modelLineIdForItem(findTutorItem(3, "abeja"))).toBe("l1-model-abeja");
  });

  it("an unknown item has no model line", () => {
    expect(modelLineIdForItem({ id: "x", lesson: 9, text: "zzz", kind: "word", printedPage: 99 })).toBeNull();
  });

  it("confusion lines resolve per heard vowel", () => {
    expect(confusionLineIdFor("e")).toBe("l0-confusion-e");
    expect(confusionLineIdFor("u")).toBe("l0-confusion-u");
    expect(confusionLineIdFor("x")).toBeNull();
  });
});