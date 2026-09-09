import { beforeEach, expect, it, vi } from "vitest";
vi.mock("../student.functions", () => ({ logProgress: vi.fn() }));
import { logProgress } from "../student.functions";
import {
  setStudentSession,
  recordEvent,
  flushStudentEvents,
} from "../student-session";
const ana = {
  studentId: "a",
  studentName: "Ana",
  studentCode: "ANA",
  classId: "c",
  className: "Clase",
};
const input = {
  lessonId: "1",
  kind: "exercise" as const,
  score: 1,
  total: 1,
  meta: { exercise: "test" },
};
function online(value: boolean) {
  Object.defineProperty(navigator, "onLine", { value, configurable: true });
}
beforeEach(async () => {
  vi.mocked(logProgress).mockResolvedValue({ ok: true });
  online(true);
  setStudentSession(ana);
  await flushStudentEvents();
  localStorage.clear();
  vi.clearAllMocks();
});
it("preserves answers added during a request without concurrent duplicate sends", async () => {
  let release!: (value: { ok: boolean }) => void;
  vi.mocked(logProgress).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  setStudentSession(ana);
  recordEvent(input);
  await vi.waitFor(() => expect(logProgress).toHaveBeenCalledTimes(1));
  recordEvent(input);
  const pending = flushStudentEvents();
  expect(logProgress).toHaveBeenCalledTimes(1);
  release({ ok: true });
  await pending;
  expect(logProgress).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(localStorage.getItem("cartilla.student-events.v1")!),
  ).toHaveLength(0);
});
it("does not send Ana's offline answer as another student's work", async () => {
  online(false);
  setStudentSession(ana);
  recordEvent(input);
  await flushStudentEvents();
  setStudentSession({ ...ana, studentId: "b", studentCode: "B" });
  online(true);
  await flushStudentEvents();
  expect(logProgress).not.toHaveBeenCalled();
  setStudentSession(ana);
  await flushStudentEvents();
  expect(logProgress).toHaveBeenCalledWith({
    data: expect.objectContaining({ studentId: "a", studentCode: "ANA" }),
  });
});
it("retains a failed answer and retries it on reconnection", async () => {
  vi.mocked(logProgress).mockRejectedValueOnce(new Error("offline"));
  setStudentSession(ana);
  recordEvent(input);
  await flushStudentEvents();
  expect(
    JSON.parse(localStorage.getItem("cartilla.student-events.v1")!),
  ).toHaveLength(1);
  window.dispatchEvent(new Event("online"));
  await flushStudentEvents();
  expect(logProgress).toHaveBeenCalledTimes(2);
  expect(
    JSON.parse(localStorage.getItem("cartilla.student-events.v1")!),
  ).toHaveLength(0);
});
