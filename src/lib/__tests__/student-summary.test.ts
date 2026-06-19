import { describe, expect, it } from "vitest";
import { summarizeStudentEvents, type ProgressEvent } from "@/lib/student-summary";

function event(partial: Partial<ProgressEvent>): ProgressEvent {
  return {
    id: "1",
    lesson_id: "1",
    event_kind: "lesson_completed",
    score: null,
    total: null,
    time_seconds: null,
    meta: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("summarizeStudentEvents", () => {
  it("counts unique completed lessons", () => {
    const summary = summarizeStudentEvents([
      event({ id: "1", lesson_id: "1", event_kind: "lesson_completed" }),
      event({ id: "2", lesson_id: "1", event_kind: "lesson_completed" }),
      event({ id: "3", lesson_id: "2", event_kind: "lesson_completed" }),
    ]);
    expect(summary.completedCount).toBe(2);
    expect(summary.completedSet.has("1")).toBe(true);
    expect(summary.completedSet.has("2")).toBe(true);
  });

  it("aggregates exercise score/total once per lesson+exercise, keeping only the latest run", () => {
    const summary = summarizeStudentEvents([
      event({ id: "1", lesson_id: "3", event_kind: "exercise", score: 4, total: 5, meta: { exercise: "a" } }),
      event({ id: "2", lesson_id: "3", event_kind: "exercise", score: 2, total: 5, meta: { exercise: "b" } }),
    ]);
    expect(summary.exerciseStats["3"]).toEqual({ score: 6, total: 10, runs: 2 });
  });

  it("sums time_seconds across time events", () => {
    const summary = summarizeStudentEvents([
      event({ id: "1", event_kind: "time", time_seconds: 30 }),
      event({ id: "2", event_kind: "time", time_seconds: 45 }),
    ]);
    expect(summary.timeTotal).toBe(75);
  });

  it("collects badge events with their name and timestamp", () => {
    const summary = summarizeStudentEvents([
      event({ id: "1", event_kind: "badge", meta: { name: "Estrella" }, created_at: "2026-02-01T00:00:00.000Z" }),
    ]);
    expect(summary.badges).toEqual([{ name: "Estrella", at: "2026-02-01T00:00:00.000Z" }]);
  });

  it("keeps only the first level event", () => {
    const summary = summarizeStudentEvents([
      event({ id: "1", event_kind: "level", meta: { level: "B" }, created_at: "2026-02-01T00:00:00.000Z" }),
      event({ id: "2", event_kind: "level", meta: { level: "C" }, created_at: "2026-03-01T00:00:00.000Z" }),
    ]);
    expect(summary.level).toEqual({ value: "B", at: "2026-02-01T00:00:00.000Z" });
  });
});
