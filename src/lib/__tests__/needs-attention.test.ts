import { describe, it, expect } from "vitest";
import {
  selectStrugglingStudents,
  selectStalledStudents,
  selectOverdueAssignments,
} from "@/lib/needs-attention";

describe("selectStrugglingStudents", () => {
  it("flags students below the 70% accuracy threshold", () => {
    const out = selectStrugglingStudents([
      { id: "1", name: "Ana", accuracy: 0.5 },
      { id: "2", name: "Leo", accuracy: 0.9 },
      { id: "3", name: "Max", accuracy: null },
    ]);
    expect(out).toEqual([{ id: "1", name: "Ana", accuracy: 0.5 }]);
  });

  it("treats exactly 0.7 as not struggling", () => {
    expect(selectStrugglingStudents([{ id: "1", name: "Ana", accuracy: 0.7 }])).toEqual([]);
  });
});

describe("selectStalledStudents", () => {
  const now = new Date("2026-06-19T00:00:00Z").getTime();

  it("flags students who never started", () => {
    const out = selectStalledStudents(
      [{ id: "1", display_name: "Ana", lastSeen: null }],
      now,
    );
    expect(out).toEqual([
      { id: "1", name: "Ana", reason: "never_started", daysSinceActive: null },
    ]);
  });

  it("flags students inactive for 7+ days and skips recently active ones", () => {
    const out = selectStalledStudents(
      [
        { id: "1", display_name: "Ana", lastSeen: "2026-06-01T00:00:00Z" },
        { id: "2", display_name: "Leo", lastSeen: "2026-06-18T00:00:00Z" },
      ],
      now,
    );
    expect(out).toEqual([{ id: "1", name: "Ana", reason: "inactive", daysSinceActive: 18 }]);
  });
});

describe("selectOverdueAssignments", () => {
  const now = new Date("2026-06-19T00:00:00Z").getTime();

  it("flags past-due assignments with outstanding students", () => {
    const out = selectOverdueAssignments(
      [
        {
          id: "a1",
          lessonId: "3",
          title: "Tarea",
          dueAt: "2026-06-10T00:00:00Z",
          completed: 2,
          assigned: 5,
        },
      ],
      now,
    );
    expect(out).toEqual([
      { id: "a1", lessonId: "3", title: "Tarea", dueAt: "2026-06-10T00:00:00Z", outstanding: 3 },
    ]);
  });

  it("excludes assignments that are not overdue or already fully completed", () => {
    const out = selectOverdueAssignments(
      [
        { id: "a1", lessonId: "1", title: null, dueAt: "2099-01-01T00:00:00Z", completed: 0, assigned: 5 },
        { id: "a2", lessonId: "2", title: null, dueAt: "2026-06-01T00:00:00Z", completed: 5, assigned: 5 },
        { id: "a3", lessonId: "3", title: null, dueAt: null, completed: 0, assigned: 5 },
      ],
      now,
    );
    expect(out).toEqual([]);
  });
});
