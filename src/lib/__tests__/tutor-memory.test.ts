/**
 * Tutor memory tests (GRETEL-TUTOR-BUILD-SPEC §18.4, §18.6).
 *
 * Locks: returning-child detection (greeting-return vs greeting-first),
 * the review-round set, pacing hints, best-streak updates, the no-PII shape
 * of the persisted store, corrupt-data tolerance, and clear-all
 * ("Borrar memoria"). Storage is injected — tests never touch localStorage.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAUSE_MS,
  SLOW_PACE_PAUSE_MS,
  TUTOR_MEMORY_KEY,
  beginSession,
  clearAllTutorMemory,
  getTutorMemory,
  greetingRole,
  noteMissedItem,
  pacingFor,
  recordStreak,
  reviewRoundSet,
  streakPraiseDue,
  type TutorMemoryStorage,
} from "../tutor-memory";

function fakeStore(): TutorMemoryStorage & { raw: () => string | null } {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    raw: () => data.get(TUTOR_MEMORY_KEY) ?? null,
  };
}

describe("beginSession: returning-child detection", () => {
  it("first visit is a first-time greeting", () => {
    const store = fakeStore();
    const { record, returning } = beginSession(store, "classA:7", 1);
    expect(returning).toBe(false);
    expect(greetingRole(returning)).toBe("greeting-first");
    expect(record.sessions).toBe(1);
    expect(record.lastLesson).toBe(1);
  });

  it("second visit plays the greeting-return line", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    const { record, returning } = beginSession(store, "classA:7", 2);
    expect(returning).toBe(true);
    expect(greetingRole(returning)).toBe("greeting-return");
    expect(record.sessions).toBe(2);
    expect(record.lastLesson).toBe(2);
  });

  it("keeps session_ids independent", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    const { returning } = beginSession(store, "classA:8", 1);
    expect(returning).toBe(false);
  });
});

describe("missed items and the review-round set", () => {
  it("records missed item ids, deduped, and reads them back", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    noteMissedItem(store, "classA:7", "l1-word-oso");
    expect(getTutorMemory(store, "classA:7").missedItemIds).toEqual([
      "l1-vowel-a",
      "l1-word-oso",
    ]);
  });

  it("beginSession resets the current misses and hands back last time's", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    noteMissedItem(store, "classA:7", "l1-word-oso");
    const second = beginSession(store, "classA:7", 1);
    expect(second.previousMissedItemIds).toEqual(["l1-vowel-a", "l1-word-oso"]);
    expect(second.record.missedItemIds).toEqual([]);
  });

  it("review round = this session's misses + up to 3 from last time, deduped", () => {
    expect(reviewRoundSet(["a", "b"], ["p1", "p2", "p3", "p4"])).toEqual([
      "a",
      "b",
      "p1",
      "p2",
      "p3",
    ]);
    expect(reviewRoundSet(["x"], ["x", "y"])).toEqual(["x", "y"]);
    expect(reviewRoundSet([], ["only", "two"])).toEqual(["only", "two"]);
  });
});

describe("best streak", () => {
  it("only ever grows", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    expect(recordStreak(store, "classA:7", 3).bestStreak).toBe(3);
    expect(recordStreak(store, "classA:7", 5).bestStreak).toBe(5);
    expect(recordStreak(store, "classA:7", 2).bestStreak).toBe(5);
    expect(getTutorMemory(store, "classA:7").bestStreak).toBe(5);
  });
});

describe("pacing hints (§18.4)", () => {
  it("2 misses in a row → longer pause + slow model", () => {
    expect(pacingFor(2)).toEqual({ pauseMs: SLOW_PACE_PAUSE_MS, slowModel: true });
    expect(pacingFor(3)).toEqual({ pauseMs: SLOW_PACE_PAUSE_MS, slowModel: true });
  });

  it("0–1 misses keep the default pace", () => {
    expect(pacingFor(0)).toEqual({ pauseMs: DEFAULT_PAUSE_MS, slowModel: false });
    expect(pacingFor(1)).toEqual({ pauseMs: DEFAULT_PAUSE_MS, slowModel: false });
  });

  it("a streak of 3 earns the streak praise line", () => {
    expect(streakPraiseDue(2)).toBe(false);
    expect(streakPraiseDue(3)).toBe(true);
    expect(streakPraiseDue(7)).toBe(true);
  });
});

describe("privacy: no names, audio, or transcripts", () => {
  it("the serialized store never contains name/audio/transcript data", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 2);
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    recordStreak(store, "classA:7", 4);

    const raw = store.raw();
    expect(raw).not.toBeNull();
    expect(raw).not.toMatch(/name/i);
    expect(raw).not.toMatch(/audio/i);
    expect(raw).not.toMatch(/transcript/i);
    expect(raw).not.toMatch(/apellido/i);

    const shape = JSON.parse(raw!) as Record<string, unknown>;
    const allowedTopLevel = new Set(Object.keys(shape));
    expect(allowedTopLevel).toEqual(new Set(["classA:7"]));
    const record = shape["classA:7"] as Record<string, unknown>;
    expect(Object.keys(record).sort()).toEqual([
      "bestStreak",
      "lastLesson",
      "missedItemIds",
      "sessions",
    ]);
  });

  it("corrupt stored JSON degrades to empty memory", () => {
    const store = fakeStore();
    store.setItem(TUTOR_MEMORY_KEY, "{not json");
    expect(getTutorMemory(store, "classA:7")).toEqual({
      sessionId: "classA:7",
      sessions: 0,
      lastLesson: null,
      missedItemIds: [],
      bestStreak: 0,
    });
  });
});

describe("Borrar memoria (clear-all)", () => {
  it("removes the whole tutor memory key", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    beginSession(store, "classA:8", 2);
    expect(store.raw()).not.toBeNull();

    clearAllTutorMemory(store);
    expect(store.raw()).toBeNull();
    expect(getTutorMemory(store, "classA:7").sessions).toBe(0);

    // A cleared child is a first-timer again.
    expect(beginSession(store, "classA:7", 1).returning).toBe(false);
  });
});