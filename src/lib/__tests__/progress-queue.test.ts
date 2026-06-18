// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Supabase-backed sender so we can drive success/failure deterministically.
vi.mock("@/lib/student.functions", () => ({
  logProgress: vi.fn(),
}));

import { logProgress } from "@/lib/student.functions";
import { KEYS } from "@/lib/storage-keys";
import { enqueueProgress, flushProgressQueue, getQueuedCount, type QueuedProgress } from "@/lib/progress-queue";

const sample = (lessonId = "1"): QueuedProgress => ({
  studentId: "11111111-1111-1111-1111-111111111111",
  studentCode: "ABCD",
  lessonId,
  kind: "lesson_completed",
});

const mockedLog = vi.mocked(logProgress);

describe("progress-queue", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedLog.mockReset();
  });

  it("sends an enqueued event and leaves the queue empty on success", async () => {
    mockedLog.mockResolvedValue({ ok: true });

    await enqueueProgress(sample());

    expect(mockedLog).toHaveBeenCalledTimes(1);
    expect(mockedLog).toHaveBeenCalledWith({ data: expect.objectContaining({ lessonId: "1" }) });
    expect(getQueuedCount()).toBe(0);
  });

  it("retains the event and persists it when the send fails (offline/transient)", async () => {
    mockedLog.mockRejectedValue(new Error("network down"));

    await enqueueProgress(sample());

    expect(getQueuedCount()).toBe(1);
    // Persisted to the registered localStorage key so it survives a reload.
    expect(localStorage.getItem(KEYS.progressQueue)).toBeTruthy();
  });

  it("drains everything in FIFO order once connectivity returns", async () => {
    mockedLog.mockRejectedValue(new Error("offline"));
    await enqueueProgress(sample("1"));
    await enqueueProgress(sample("2"));
    await enqueueProgress(sample("3"));
    expect(getQueuedCount()).toBe(3);

    mockedLog.mockReset();
    mockedLog.mockResolvedValue({ ok: true });
    await flushProgressQueue();

    expect(getQueuedCount()).toBe(0);
    const order = mockedLog.mock.calls.map((c) => (c[0] as { data: QueuedProgress }).data.lessonId);
    expect(order).toEqual(["1", "2", "3"]);
  });

  it("drops a permanently-invalid event instead of wedging the queue", async () => {
    const zodErr = new Error("invalid");
    zodErr.name = "ZodError";
    // First (bad) event rejects as a validation error; second is fine.
    mockedLog.mockRejectedValueOnce(zodErr).mockResolvedValue({ ok: true });

    await enqueueProgress(sample("bad"));
    await enqueueProgress(sample("good"));
    await flushProgressQueue();

    // The poison entry is dropped and the good one still goes through.
    expect(getQueuedCount()).toBe(0);
  });

  it("does not double-send: a successful flush clears the backing store", async () => {
    mockedLog.mockResolvedValue({ ok: true });
    await enqueueProgress(sample("1"));

    mockedLog.mockClear();
    await flushProgressQueue();

    expect(mockedLog).not.toHaveBeenCalled();
    expect(getQueuedCount()).toBe(0);
  });
});
