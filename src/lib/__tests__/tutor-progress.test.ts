/**
 * @vitest-environment jsdom
 */
import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  TUTOR_PROGRESS_KEY,
  TUTOR_PROGRESS_MAX_EVENTS,
  TUTOR_SESSION_NAMESPACE,
  appendTutorProgress,
  clearTutorProgress,
  flushTutorProgress,
  logTutorProgressEvent,
  makeSessionId,
  readTutorProgress,
  uuidV5,
  type TutorProgressEvent,
} from "../tutor-progress";

// jsdom's crypto has no subtle; fall back to Node's Web Crypto.
if (!(globalThis as { crypto?: { subtle?: unknown } }).crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: webcrypto,
  });
}

const DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

beforeEach(() => {
  localStorage.clear();
  clearTutorProgress();
});

describe("uuidV5 (RFC 4122 v5, SHA-1)", () => {
  it("matches the published RFC 4122 v5 known-answer vector", async () => {
    // python.org under the DNS namespace (RFC 4122 test vector)
    expect(await uuidV5(DNS_NAMESPACE, "python.org")).toBe("886313e1-3b8a-5372-9b90-0c9aee199e5d");
  });

  it("is deterministic for the same namespace + name", async () => {
    expect(await uuidV5(TUTOR_SESSION_NAMESPACE, "MA101:7")).toBe(
      await uuidV5(TUTOR_SESSION_NAMESPACE, "MA101:7"),
    );
  });

  it("sets the version nibble to 5 and the RFC 4122 variant bits", async () => {
    const id = await uuidV5(TUTOR_SESSION_NAMESPACE, "MA101:7");
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("rejects an invalid namespace UUID", async () => {
    await expect(uuidV5("not-a-uuid", "x")).rejects.toThrow(/namespace/);
  });
});

describe("makeSessionId", () => {
  it("derives a deterministic id from classCode + slot", async () => {
    expect(await makeSessionId("MA101", 3)).toBe(await makeSessionId("MA101", 3));
    expect(await makeSessionId("MA101", 3)).not.toBe(await makeSessionId("MA101", 4));
    expect(await makeSessionId("MA101", 3)).not.toBe(await makeSessionId("MA202", 3));
  });

  it("equals uuidV5(TUTOR_SESSION_NAMESPACE, `${classCode}:${slot}`)", async () => {
    expect(await makeSessionId("MA101", 12)).toBe(
      await uuidV5(TUTOR_SESSION_NAMESPACE, "MA101:12"),
    );
  });

  it("accepts only slots 1–40", async () => {
    await expect(makeSessionId("MA101", 1)).resolves.toBeDefined();
    await expect(makeSessionId("MA101", 40)).resolves.toBeDefined();
    await expect(makeSessionId("MA101", 0)).rejects.toThrow(/slot/);
    await expect(makeSessionId("MA101", 41)).rejects.toThrow(/slot/);
    await expect(makeSessionId("MA101", 2.5)).rejects.toThrow(/slot/);
  });

  it("rejects an empty class code", async () => {
    await expect(makeSessionId("   ", 3)).rejects.toThrow(/classCode/);
  });
});

describe("progress event storage", () => {
  const baseEvent = {
    session_id: "0f1e2d3c-4b5a-5c6d-8e9f-a0b1c2d3e4f5",
    lesson_id: 2,
    item_id: "oso",
    result: "correct_after_retry" as const,
    attempts: 2,
  };

  it("stores exactly the spec §10 event shape, with a real created_at", () => {
    appendTutorProgress(baseEvent);
    const stored = readTutorProgress();
    expect(stored).toHaveLength(1);
    expect(Object.keys(stored[0]).sort()).toEqual([
      "attempts",
      "created_at",
      "item_id",
      "lesson_id",
      "result",
      "session_id",
    ]);
    expect(stored[0].lesson_id).toBe("2");
    expect(stored[0].result).toBe("correct_after_retry");
    expect(stored[0].attempts).toBe(2);
    expect(stored[0].created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("never stores audio, name, or transcript fields, even if passed in", () => {
    appendTutorProgress({
      ...baseEvent,
      // Hostile extras: must never reach storage.
      audio: "data:audio/webm;base64,XYZ",
      name: "Sofia",
      transcript: "osho",
      extra_field: "anything",
    } as never);
    const raw = localStorage.getItem(TUTOR_PROGRESS_KEY) ?? "";
    const stored = readTutorProgress()[0];
    expect(Object.keys(stored).sort()).toEqual([
      "attempts",
      "created_at",
      "item_id",
      "lesson_id",
      "result",
      "session_id",
    ]);
    expect(raw).not.toContain("audio");
    expect(raw).not.toContain("transcript");
    expect(raw).not.toContain("extra_field");
    expect(raw).not.toContain("Sofia");
    expect(raw).not.toContain("osho");
  });

  it("reads events back in write order across multiple appends", () => {
    appendTutorProgress({ ...baseEvent, item_id: "ola", result: "correct", attempts: 1 });
    appendTutorProgress({ ...baseEvent, item_id: "oveja", result: "missed", attempts: 3 });
    const stored = readTutorProgress();
    expect(stored.map((event) => event.item_id)).toEqual(["ola", "oveja"]);
  });

  it("validates lesson, result, attempts, and item_id length", () => {
    expect(() => appendTutorProgress({ ...baseEvent, lesson_id: 4 })).toThrow(/lesson_id/);
    expect(() => appendTutorProgress({ ...baseEvent, result: "almost" as never })).toThrow(
      /result/,
    );
    expect(() => appendTutorProgress({ ...baseEvent, attempts: 0 })).toThrow(/attempts/);
    expect(() => appendTutorProgress({ ...baseEvent, attempts: 4 })).toThrow(/attempts/);
    expect(() => appendTutorProgress({ ...baseEvent, item_id: "x".repeat(65) })).toThrow(/item_id/);
  });

  it("uses the exact spec §10 localStorage key", () => {
    appendTutorProgress(baseEvent);
    expect(localStorage.getItem(TUTOR_PROGRESS_KEY)).toContain("oso");
    expect(TUTOR_PROGRESS_KEY).toBe("cartilla.tutor.progress.v1");
  });
});

describe("FIFO bound and flush helpers", () => {
  const event = (index: number): Parameters<typeof appendTutorProgress>[0] => ({
    session_id: "0f1e2d3c-4b5a-5c6d-8e9f-a0b1c2d3e4f5",
    lesson_id: 1,
    item_id: `item-${index}`,
    result: "correct",
    attempts: 1,
  });

  it("keeps only the newest 500 events (oldest dropped)", () => {
    for (let i = 0; i < 520; i += 1) {
      appendTutorProgress(event(i));
    }
    const stored = readTutorProgress();
    expect(stored).toHaveLength(TUTOR_PROGRESS_MAX_EVENTS);
    expect(TUTOR_PROGRESS_MAX_EVENTS).toBe(500);
    expect(stored[0].item_id).toBe("item-20");
    expect(stored[stored.length - 1].item_id).toBe("item-519");
  });

  it("flush persists buffered events and returns the stored count", () => {
    logTutorProgressEvent(event(1));
    logTutorProgressEvent(event(2));
    // Nothing persisted before the flush.
    expect(readTutorProgress()).toHaveLength(0);
    expect(flushTutorProgress()).toBe(2);
    expect(readTutorProgress()).toHaveLength(2);
    expect(flushTutorProgress()).toBe(2); // idempotent
  });

  it("clearTutorProgress erases stored events and any pending buffer", () => {
    appendTutorProgress(event(1));
    logTutorProgressEvent(event(2));
    clearTutorProgress();
    expect(readTutorProgress()).toHaveLength(0);
    expect(flushTutorProgress()).toBe(0);
    expect(localStorage.getItem(TUTOR_PROGRESS_KEY)).toBeNull();
  });

  it("survives an unreadable stored value without throwing", () => {
    localStorage.setItem(TUTOR_PROGRESS_KEY, "{not json");
    expect(readTutorProgress()).toEqual([] satisfies TutorProgressEvent[]);
    appendTutorProgress(event(9));
    expect(readTutorProgress()).toHaveLength(1);
  });
});
