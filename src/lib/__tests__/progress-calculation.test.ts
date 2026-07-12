import { describe, it, expect } from "vitest";
import {
  computeLessonStatus,
  completedLessonIds,
  computeCompletionPercent,
  computeLastActive,
  summarizeStudentProgress,
  needsAttention,
  type LessonProgressRow,
} from "../progress-calculation";

describe("computeLessonStatus", () => {
  it("returns not_started for a missing row", () => {
    expect(computeLessonStatus(null)).toBe("not_started");
    expect(computeLessonStatus(undefined)).toBe("not_started");
  });

  it("returns completed only when the row's own status says completed", () => {
    expect(computeLessonStatus({ lesson_id: "1", status: "completed" })).toBe("completed");
  });

  it("returns in_progress for a started row (never inferred as completed)", () => {
    expect(computeLessonStatus({ lesson_id: "1", status: "started" })).toBe("in_progress");
  });

  it("returns not_started for an explicit not_started row", () => {
    expect(computeLessonStatus({ lesson_id: "1", status: "not_started" })).toBe("not_started");
  });
});

describe("completedLessonIds", () => {
  it("collects only the lesson ids with a real completed status", () => {
    const rows: LessonProgressRow[] = [
      { lesson_id: "1", status: "completed" },
      { lesson_id: "2", status: "started" },
      { lesson_id: "3", status: "completed" },
    ];
    expect(completedLessonIds(rows)).toEqual(new Set(["1", "3"]));
  });
});

describe("computeCompletionPercent", () => {
  it("computes a whole-number percentage against the given total", () => {
    const rows: LessonProgressRow[] = [
      { lesson_id: "1", status: "completed" },
      { lesson_id: "2", status: "completed" },
    ];
    expect(computeCompletionPercent(rows, 24)).toBe(8); // 2/24 = 8.33% -> 8
  });

  it("returns 0 for no completed rows", () => {
    expect(computeCompletionPercent([], 24)).toBe(0);
  });

  it("caps at 100% even if somehow more distinct lessons are completed than totalLessons", () => {
    const rows: LessonProgressRow[] = Array.from({ length: 30 }, (_, i) => ({
      lesson_id: String(i + 1),
      status: "completed",
    }));
    expect(computeCompletionPercent(rows, 24)).toBe(100);
  });
});

describe("computeLastActive", () => {
  it("returns null when there are no rows", () => {
    expect(computeLastActive([])).toBeNull();
  });

  it("returns the most recent last_active_at across rows", () => {
    const rows: LessonProgressRow[] = [
      { lesson_id: "1", status: "started", last_active_at: "2026-01-01T00:00:00Z" },
      { lesson_id: "2", status: "completed", last_active_at: "2026-03-01T00:00:00Z" },
    ];
    expect(computeLastActive(rows)).toBe("2026-03-01T00:00:00Z");
  });

  it("falls back to completed_at when last_active_at is missing", () => {
    const rows: LessonProgressRow[] = [
      { lesson_id: "1", status: "completed", completed_at: "2026-02-01T00:00:00Z" },
    ];
    expect(computeLastActive(rows)).toBe("2026-02-01T00:00:00Z");
  });
});

describe("summarizeStudentProgress", () => {
  it("aggregates completedLessons, percent, lastActiveAt, and per-lesson status consistently", () => {
    const rows: LessonProgressRow[] = [
      { lesson_id: "1", status: "completed", completed_at: "2026-01-01T00:00:00Z" },
      { lesson_id: "2", status: "started", last_active_at: "2026-02-01T00:00:00Z" },
    ];
    const summary = summarizeStudentProgress(rows, 24);
    expect(summary.completedLessons).toBe(1);
    expect(summary.totalLessons).toBe(24);
    expect(summary.completionPercent).toBe(4); // 1/24 -> 4.16 -> 4
    expect(summary.lastActiveAt).toBe("2026-02-01T00:00:00Z");
    expect(summary.statusByLesson.get("1")).toBe("completed");
    expect(summary.statusByLesson.get("2")).toBe("in_progress");
    expect(summary.statusByLesson.get("3")).toBeUndefined();
  });
});

describe("needsAttention", () => {
  it("is false when completion is 40% or above regardless of activity", () => {
    expect(needsAttention({ completionPercent: 40, lastActiveAt: null })).toBe(false);
    expect(needsAttention({ completionPercent: 100, lastActiveAt: null })).toBe(false);
  });

  it("is true when completion is low and there is no recorded activity at all", () => {
    expect(needsAttention({ completionPercent: 10, lastActiveAt: null })).toBe(true);
  });

  it("is true when completion is low and the last activity was more than 3 days ago", () => {
    const now = new Date("2026-01-10T00:00:00Z").getTime();
    expect(
      needsAttention({ completionPercent: 10, lastActiveAt: "2026-01-01T00:00:00Z" }, now),
    ).toBe(true);
  });

  it("is false when completion is low but the student was active within the last 3 days", () => {
    const now = new Date("2026-01-10T00:00:00Z").getTime();
    expect(
      needsAttention({ completionPercent: 10, lastActiveAt: "2026-01-09T00:00:00Z" }, now),
    ).toBe(false);
  });
});
