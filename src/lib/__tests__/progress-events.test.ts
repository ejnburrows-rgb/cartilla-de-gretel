import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../student-session", () => ({
  getStudentSession: vi.fn(),
}));
vi.mock("../secure-student-access", () => ({
  logProgressWithSession: vi.fn(),
  isSessionActive: vi.fn(() => true),
}));

import { getStudentSession } from "../student-session";
import { logProgressWithSession } from "../secure-student-access";
import {
  emitProgressEvent,
  flushProgressEvents,
  getQueuedProgressEvents,
  clearProgressEventsQueue,
} from "../progress-events";

const session = {
  studentId: "s1",
  studentName: "Ana",
  classId: "c1",
  className: "Clase 1",
  sessionToken: "s".repeat(64),
  expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
};

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", { value, configurable: true, writable: true });
}

describe("progress-events", () => {
  beforeEach(() => {
    clearProgressEventsQueue();
    vi.mocked(getStudentSession).mockReturnValue(null);
    vi.mocked(logProgressWithSession).mockReset();
    setOnline(true);
  });

  afterEach(() => {
    clearProgressEventsQueue();
  });

  it("queues an event locally even with no student session yet", () => {
    emitProgressEvent({ type: "page_opened", physicalPage: 1, lesson: 1, mechanic: "tap-select" });
    const queued = getQueuedProgressEvents();
    expect(queued).toHaveLength(1);
    expect(queued[0].type).toBe("page_opened");
    expect(queued[0].physicalPage).toBe(1);
  });

  it("flushes and clears the queue once a real session exists and logProgressWithSession succeeds", async () => {
    vi.mocked(logProgressWithSession).mockResolvedValue({ ok: true });
    emitProgressEvent({
      type: "answer_correct",
      physicalPage: 3,
      lesson: 1,
      mechanic: "pair-match",
      attempt: 1,
    });
    vi.mocked(getStudentSession).mockReturnValue(session);
    await flushProgressEvents();
    expect(logProgressWithSession).toHaveBeenCalledTimes(1);
    expect(getQueuedProgressEvents()).toHaveLength(0);
  });

  it("keeps an event queued when logProgressWithSession rejects (real retry, not fire-and-forget)", async () => {
    vi.mocked(getStudentSession).mockReturnValue(session);
    vi.mocked(logProgressWithSession).mockRejectedValue(new Error("network down"));
    emitProgressEvent({
      type: "page_completed",
      physicalPage: 5,
      lesson: 2,
      mechanic: "drag-place",
    });
    await flushProgressEvents();
    expect(getQueuedProgressEvents()).toHaveLength(1);
  });

  it("skips the flush attempt entirely while offline, leaving the event queued", async () => {
    vi.mocked(getStudentSession).mockReturnValue(session);
    setOnline(false);
    emitProgressEvent({
      type: "activity_completed",
      physicalPage: 7,
      lesson: 3,
      mechanic: "mark-circle",
    });
    expect(getQueuedProgressEvents()).toHaveLength(1);
    expect(logProgressWithSession).not.toHaveBeenCalled();
  });

  it("re-flushes automatically when the browser fires the 'online' event", async () => {
    vi.mocked(logProgressWithSession).mockResolvedValue({ ok: true });
    setOnline(false);
    emitProgressEvent({
      type: "audio_played",
      physicalPage: 9,
      lesson: 4,
      mechanic: "tap-to-hear",
    });
    expect(logProgressWithSession).not.toHaveBeenCalled();

    vi.mocked(getStudentSession).mockReturnValue(session);
    setOnline(true);
    window.dispatchEvent(new Event("online"));
    await vi.waitFor(() => expect(logProgressWithSession).toHaveBeenCalledTimes(1));
    expect(getQueuedProgressEvents()).toHaveLength(0);
  });
});
