/**
 * Tutor memory tests (GRETEL-TUTOR-BUILD-SPEC §18.4, §18.6, Milestone 10).
 *
 * Locks: returning-child detection (greeting-return vs greeting-first),
 * lessons 1–24 support, bounded per-learner & conversation memory,
 * strict isolation between learners, no raw audio/images/transcripts/names,
 * corrupt-data & quota tolerance, and authorized clearing leaving offline
 * packs and progress logs intact.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAUSE_MS,
  SLOW_PACE_PAUSE_MS,
  TUTOR_CONVERSATION_MAX_TURNS,
  TUTOR_CONVERSATION_MEMORY_KEY,
  TUTOR_MEMORY_KEY,
  TUTOR_MEMORY_MAX_MISSED_ITEMS,
  beginSession,
  clearAllTutorMemory,
  clearLearnerTutorMemory,
  getConversationMemory,
  getTutorMemory,
  greetingRole,
  listTutorMemoryLearners,
  noteMissedItem,
  pacingFor,
  recordConversationTurn,
  recordStreak,
  reviewRoundSet,
  streakPraiseDue,
  type TutorMemoryStorage,
} from "../tutor-memory";
import { TUTOR_PACK_MARKER_KEY } from "../tutor-offline-pack";
import { TUTOR_PROGRESS_KEY } from "../tutor-progress";

function fakeStore(): TutorMemoryStorage & {
  raw: () => string | null;
  rawConversation: () => string | null;
  dump: () => Map<string, string>;
} {
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
    rawConversation: () => data.get(TUTOR_CONVERSATION_MEMORY_KEY) ?? null,
    dump: () => data,
  };
}

describe("beginSession: returning-child detection across lessons 1–24", () => {
  it("first visit is a first-time greeting", () => {
    const store = fakeStore();
    const { record, returning } = beginSession(store, "classA:7", 1);
    expect(returning).toBe(false);
    expect(greetingRole(returning)).toBe("greeting-first");
    expect(record.sessions).toBe(1);
    expect(record.lastLesson).toBe(1);
  });

  it("second visit plays the greeting-return line and supports lessons up to 24", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    const { record, returning } = beginSession(store, "classA:7", 18);
    expect(returning).toBe(true);
    expect(greetingRole(returning)).toBe("greeting-return");
    expect(record.sessions).toBe(2);
    expect(record.lastLesson).toBe(18);
  });

  it("keeps session_ids strictly independent", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    const { returning } = beginSession(store, "classA:8", 1);
    expect(returning).toBe(false);
    expect(listTutorMemoryLearners(store).sort()).toEqual(["classA:7", "classA:8"]);
  });
});

describe("missed items and the review-round set", () => {
  it("records missed item ids, deduped and bounded, and reads them back", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 1);
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    noteMissedItem(store, "classA:7", "l1-word-oso");
    expect(getTutorMemory(store, "classA:7").missedItemIds).toEqual(["l1-vowel-a", "l1-word-oso"]);

    for (let i = 0; i < TUTOR_MEMORY_MAX_MISSED_ITEMS + 15; i += 1) {
      noteMissedItem(store, "classA:7", `item-${i}`);
    }
    expect(getTutorMemory(store, "classA:7").missedItemIds).toHaveLength(
      TUTOR_MEMORY_MAX_MISSED_ITEMS,
    );
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

describe("bounded per-learner conversation memory", () => {
  it("bounds turns per learner, isolates learners, and strips raw audio/images/transcripts", () => {
    const store = fakeStore();
    for (let i = 0; i < TUTOR_CONVERSATION_MAX_TURNS + 8; i += 1) {
      recordConversationTurn(store, "learner-a", {
        lesson: 7,
        itemId: `l7-syl-${i}`,
        outcome: "correct",
        hintUsed: i % 2 === 0,
        attempts: 1,
        // Hostile extras must never be persisted
        ...({
          audio: "data:audio/webm;base64,AAA",
          image: "data:image/png;base64,BBB",
          transcript: "raw student speech",
          name: "Mateo",
        } as object),
      });
    }
    recordConversationTurn(store, "learner-b", {
      lesson: 12,
      itemId: "l12-word-casa",
      outcome: "missed",
      hintUsed: true,
      attempts: 2,
    });

    const turnsA = getConversationMemory(store, "learner-a");
    const turnsB = getConversationMemory(store, "learner-b");
    expect(turnsA).toHaveLength(TUTOR_CONVERSATION_MAX_TURNS);
    expect(turnsA[0].itemId).toBe("l7-syl-8");
    expect(turnsB).toHaveLength(1);
    expect(turnsB[0].itemId).toBe("l12-word-casa");

    const raw = store.rawConversation() ?? "";
    expect(raw).not.toContain("audio");
    expect(raw).not.toContain("image");
    expect(raw).not.toContain("transcript");
    expect(raw).not.toContain("Mateo");
  });
});

describe("privacy: no names, audio, images, or transcripts", () => {
  it("the serialized store never contains name/audio/image/transcript data", () => {
    const store = fakeStore();
    beginSession(store, "classA:7", 2);
    noteMissedItem(store, "classA:7", "l1-vowel-a");
    recordStreak(store, "classA:7", 4);

    const raw = store.raw();
    expect(raw).not.toBeNull();
    expect(raw).not.toMatch(/name/i);
    expect(raw).not.toMatch(/audio/i);
    expect(raw).not.toMatch(/image/i);
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

describe("Authorized clearing leaves offline packs and progress intact", () => {
  it("clearLearnerTutorMemory removes only that learner and keeps offline packs + progress intact", () => {
    const store = fakeStore();
    store.setItem(TUTOR_PACK_MARKER_KEY, JSON.stringify({ version: "v1.1.0" }));
    store.setItem(TUTOR_PROGRESS_KEY, JSON.stringify([{ session_id: "classA:7" }]));

    beginSession(store, "classA:7", 1);
    beginSession(store, "classA:8", 2);
    recordConversationTurn(store, "classA:7", {
      lesson: 1,
      itemId: "l1-vowel-a",
      outcome: "correct",
      hintUsed: false,
      attempts: 1,
    });
    recordConversationTurn(store, "classA:8", {
      lesson: 2,
      itemId: "l2-vowel-o",
      outcome: "missed",
      hintUsed: true,
      attempts: 2,
    });

    clearLearnerTutorMemory(store, "classA:7");

    expect(getTutorMemory(store, "classA:7").sessions).toBe(0);
    expect(getConversationMemory(store, "classA:7")).toEqual([]);
    // Other learner untouched
    expect(getTutorMemory(store, "classA:8").sessions).toBe(1);
    expect(getConversationMemory(store, "classA:8")).toHaveLength(1);
    // Offline pack marker & progress log untouched
    expect(store.getItem(TUTOR_PACK_MARKER_KEY)).toBe(JSON.stringify({ version: "v1.1.0" }));
    expect(store.getItem(TUTOR_PROGRESS_KEY)).toBe(JSON.stringify([{ session_id: "classA:7" }]));
  });

  it("clearAllTutorMemory removes both memory keys while leaving offline packs + progress intact", () => {
    const store = fakeStore();
    store.setItem(TUTOR_PACK_MARKER_KEY, JSON.stringify({ version: "v1.1.0" }));
    store.setItem(TUTOR_PROGRESS_KEY, JSON.stringify([{ session_id: "classA:7" }]));

    beginSession(store, "classA:7", 1);
    beginSession(store, "classA:8", 2);
    recordConversationTurn(store, "classA:7", {
      lesson: 1,
      itemId: "l1-vowel-a",
      outcome: "correct",
      hintUsed: false,
      attempts: 1,
    });

    clearAllTutorMemory(store);
    expect(store.raw()).toBeNull();
    expect(store.rawConversation()).toBeNull();
    expect(getTutorMemory(store, "classA:7").sessions).toBe(0);
    expect(beginSession(store, "classA:7", 1).returning).toBe(false);
    // Offline pack marker & progress log remain completely intact
    expect(store.getItem(TUTOR_PACK_MARKER_KEY)).toBe(JSON.stringify({ version: "v1.1.0" }));
    expect(store.getItem(TUTOR_PROGRESS_KEY)).toBe(JSON.stringify([{ session_id: "classA:7" }]));
  });
});

describe("storage faults and separate seats", () => {
  it("malformed stored records cannot crash a returning session", () => {
    const store = fakeStore();
    store.setItem(
      TUTOR_MEMORY_KEY,
      JSON.stringify({ broken: { sessions: 2, missedItemIds: null } }),
    );
    expect(beginSession(store, "broken", 1).returning).toBe(false);
  });

  it("storage denied/quota errors leave the lesson usable", () => {
    const store = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {},
    };
    expect(beginSession(store, "seat", 1).returning).toBe(false);
  });

  it("one seat never inherits another seat's missed words", () => {
    const store = fakeStore();
    beginSession(store, "class:1", 1);
    noteMissedItem(store, "class:1", "l1-word-oso");
    expect(beginSession(store, "class:2", 1).previousMissedItemIds).toEqual([]);
    expect(beginSession(store, "class:1", 1).previousMissedItemIds).toEqual(["l1-word-oso"]);
  });
});
