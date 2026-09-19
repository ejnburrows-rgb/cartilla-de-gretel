import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../student-session", () => ({
  getStudentSession: vi.fn(),
}));
vi.mock("../student.functions", () => ({
  logProgress: vi.fn(),
}));

import { getStudentSession } from "../student-session";
import { logProgress } from "../student.functions";
import {
  emitProgressEvent,
  flushProgressEvents,
  getQueuedProgressEvents,
  clearProgressEventsQueue,
} from "../progress-events";

const session = {
  studentId: "s1",
  studentName: "Ana",
  studentCode: "ABC123",
  classId: "c1",
  className: "Clase 1",
};

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("progress-events", () => {
  beforeEach(() => {
    clearProgressEventsQueue();
    vi.mocked(getStudentSession).mockReturnValue(null);
    vi.mocked(logProgress).mockReset();
    setOnline(true);
  });

  afterEach(() => {
    clearProgressEventsQueue();
  });

  it("queues an event locally even with no student session yet", () => {
    emitProgressEvent({
      type: "page_opened",
      physicalPage: 1,
      lesson: 1,
      mechanic: "tap-select",
    });
    const queued = getQueuedProgressEvents();
    expect(queued).toHaveLength(1);
    expect(queued[0].type).toBe("page_opened");
    expect(queued[0].physicalPage).toBe(1);
  });

  it("flushes signed-in work once connectivity returns", async () => {
    vi.mocked(logProgress).mockResolvedValue({ ok: true });
    vi.mocked(getStudentSession).mockReturnValue(session);
    emitProgressEvent({
      type: "answer_correct",
      physicalPage: 3,
      lesson: 1,
      mechanic: "pair-match",
      attempt: 1,
    });
    vi.mocked(getStudentSession).mockReturnValue(session);
    await flushProgressEvents();
    expect(logProgress).toHaveBeenCalledTimes(1);
    expect(getQueuedProgressEvents()).toHaveLength(0);
  });

  it("keeps an event queued when logProgress rejects (real retry, not fire-and-forget)", async () => {
    vi.mocked(getStudentSession).mockReturnValue(session);
    vi.mocked(logProgress).mockRejectedValue(new Error("network down"));
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
    expect(logProgress).not.toHaveBeenCalled();
  });

  it("re-flushes automatically when the browser fires the 'online' event", async () => {
    vi.mocked(logProgress).mockResolvedValue({ ok: true });
    setOnline(false);
    vi.mocked(getStudentSession).mockReturnValue(session);
    emitProgressEvent({
      type: "audio_played",
      physicalPage: 9,
      lesson: 4,
      mechanic: "tap-to-hear",
    });
    expect(logProgress).not.toHaveBeenCalled();

    vi.mocked(getStudentSession).mockReturnValue(session);
    setOnline(true);
    window.dispatchEvent(new Event("online"));
    await vi.waitFor(() => expect(logProgress).toHaveBeenCalledTimes(1));
    expect(getQueuedProgressEvents()).toHaveLength(0);
  });
});

it("never attributes anonymous or another child's queued workbook work to the current student", async () => {
  clearProgressEventsQueue();
  setOnline(false);
  vi.mocked(logProgress).mockReset().mockResolvedValue({ ok: true });
  vi.mocked(getStudentSession).mockReturnValue(null);
  emitProgressEvent({ type: "answer_correct", physicalPage: 1, lesson: 1 });
  vi.mocked(getStudentSession).mockReturnValue(session);
  emitProgressEvent({ type: "answer_correct", physicalPage: 2, lesson: 1 });
  vi.mocked(getStudentSession).mockReturnValue({ ...session, studentId: "s2" });
  setOnline(true);
  await flushProgressEvents();
  expect(logProgress).not.toHaveBeenCalled();
  expect(getQueuedProgressEvents()).toHaveLength(2);
  vi.mocked(getStudentSession).mockReturnValue(session);
  await flushProgressEvents();
  expect(logProgress).toHaveBeenCalledTimes(1);
  expect(getQueuedProgressEvents()).toHaveLength(1);
  expect(getQueuedProgressEvents()[0].studentId).toBeUndefined();
  clearProgressEventsQueue();
});

it("keeps workbook events added during a request and sends each once", async () => {
  clearProgressEventsQueue();
  setOnline(true);
  vi.mocked(getStudentSession).mockReturnValue(session);
  let release!: (result: { ok: boolean }) => void;
  vi.mocked(logProgress).mockReset().mockResolvedValue({ ok: true })
    .mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  emitProgressEvent({ type: "answer_correct", physicalPage: 1, lesson: 1 });
  await vi.waitFor(() => expect(logProgress).toHaveBeenCalledTimes(1));
  emitProgressEvent({ type: "page_completed", physicalPage: 1, lesson: 1 });
  const pending = flushProgressEvents();
  expect(logProgress).toHaveBeenCalledTimes(1);
  release({ ok: true });
  await pending;
  expect(logProgress).toHaveBeenCalledTimes(2);
  expect(getQueuedProgressEvents()).toHaveLength(0);
});
