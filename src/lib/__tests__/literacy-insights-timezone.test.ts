/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildStudentLearningInsight } from "../literacy-insights";

describe("literacy-insights timezone behavior", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("evaluates overdue against local end of day, not UTC midnight", () => {
    // 2026-10-16 local midnight in America/New_York (UTC-4) == 2026-10-16T04:00:00.000Z
    const dueAtStr = "2026-10-16T04:00:00.000Z";
    // local 23:59:59.999 on the due date == local midnight + 24h - 1ms
    const localEndMs = new Date(dueAtStr).getTime() + 24 * 60 * 60 * 1000 - 1;

    const notOverdue = buildStudentLearningInsight(
      [],
      new Set(),
      [{ lesson_id: "8", due_at: dueAtStr }],
      localEndMs,
    );
    expect(notOverdue.attention.find((item) => item.key === "assignment-8")).toBeUndefined();

    const overdue = buildStudentLearningInsight(
      [],
      new Set(),
      [{ lesson_id: "8", due_at: dueAtStr }],
      localEndMs + 1,
    );
    const flag = overdue.attention.find((item) => item.key === "assignment-8");
    expect(flag).toBeDefined();
    expect(flag?.reason).toContain("vencida");
  });

  it("parses a date-only due date as local midnight, not UTC midnight", () => {
    // Simulates the TaskList save path: input type=date gives "2026-10-16".
    // TZ-agnostic: the "T00:00:00" suffix must yield local midnight, while the
    // naive parse is pinned to UTC midnight (the original bug).
    expect(new Date("2026-10-16").toISOString()).toBe("2026-10-16T00:00:00.000Z");
    const d = new Date("2026-10-16" + "T00:00:00");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 16]);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe("additional date-only parsing tests", () => {
  it("buildStudentLearningInsight handles naive date strings", () => {
    // A naive date string "2026-10-16" should be treated as local midnight,
    // which means it lasts exactly 24 hours in local time.
    const naiveDateStr = "2026-10-16";
    // We expect it to act exactly as if it was parsed as local midnight
    const localMidnightMs = new Date(naiveDateStr + "T00:00:00").getTime();
    const localEndMs = localMidnightMs + 24 * 60 * 60 * 1000 - 1;

    // Should NOT be overdue precisely at local end
    const notOverdue = buildStudentLearningInsight(
      [],
      new Set(),
      [{ lesson_id: "9", due_at: naiveDateStr }],
      localEndMs,
    );
    expect(notOverdue.attention.find((item) => item.key === "assignment-9")).toBeUndefined();

    // Should BE overdue 1 ms later
    const overdue = buildStudentLearningInsight(
      [],
      new Set(),
      [{ lesson_id: "9", due_at: naiveDateStr }],
      localEndMs + 1,
    );
    const flag = overdue.attention.find((item) => item.key === "assignment-9");
    expect(flag).toBeDefined();
    expect(flag?.reason).toContain("vencida");
  });
});
