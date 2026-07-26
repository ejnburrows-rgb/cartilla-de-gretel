/**
 * @vitest-environment jsdom
 */
// The cross-teacher admin roll-up must flag "needs attention" for exactly the
// students each teacher's own class overview would flag. Before this, the live
// lane hardcoded 0, which asserted that nobody needed help.
//
// Two things are covered here:
//   1. buildRecentAccuracies — the shared helper both screens now feed into
//      checkNeedsAttention, so the two cannot drift apart.
//   2. getLiveAdminOverview — that the flags roll up correctly per class, per
//      teacher, and globally, against a stubbed database.
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildRecentAccuracies,
  checkNeedsAttention,
  RECENT_ACCURACY_WINDOW,
} from "../progress-calculation";

const from = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...a: unknown[]) => from(...a),
    auth: { getUser: vi.fn() },
    rpc: vi.fn(),
  },
}));

vi.mock("@/lib/seed-data", () => ({
  isSeedAdmin: () => false,
  isSeedSessionActive: () => false,
}));

const ev = (over: Partial<Record<string, unknown>> = {}) => ({
  student_id: "s1",
  lesson_id: "1",
  event_kind: "exercise",
  score: 1,
  total: 4,
  time_seconds: null,
  meta: { exercise: "picture_grid" },
  created_at: "2026-07-26T10:00:00Z",
  ...over,
});

describe("buildRecentAccuracies — the shared half of the attention rule", () => {
  it("returns an entry for every student asked about, even with no events", () => {
    expect(buildRecentAccuracies([], ["s1", "s2"])).toEqual({ s1: [], s2: [] });
  });

  it("keeps only the newest attempt at the same activity", () => {
    // Newest first, as the callers order it. The 1/4 is the retry; the 4/4 is
    // the older attempt and must not also be counted.
    const out = buildRecentAccuracies(
      [ev({ score: 1, total: 4 }), ev({ score: 4, total: 4 })],
      ["s1"],
    );
    expect(out.s1).toEqual([0.25]);
  });

  it("treats different activities in the same lesson separately", () => {
    const out = buildRecentAccuracies(
      [ev({ meta: { exercise: "picture_grid" } }), ev({ meta: { exercise: "vowel_pick_one" } })],
      ["s1"],
    );
    expect(out.s1).toHaveLength(2);
  });

  it("ignores non-exercise events and unscored attempts", () => {
    const out = buildRecentAccuracies(
      [
        ev({ event_kind: "time", time_seconds: 60 }),
        ev({ event_kind: "lesson_completed" }),
        ev({ total: 0, meta: { exercise: "zero_total" } }),
      ],
      ["s1"],
    );
    expect(out.s1).toEqual([]);
  });

  it("ignores events for students not on the list", () => {
    expect(buildRecentAccuracies([ev({ student_id: "stranger" })], ["s1"]).s1).toEqual([]);
  });

  it(`looks at no more than ${RECENT_ACCURACY_WINDOW} recent scores`, () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      ev({ meta: { exercise: `act_${i}` }, score: 0, total: 4 }),
    );
    expect(buildRecentAccuracies(many, ["s1"]).s1).toHaveLength(RECENT_ACCURACY_WINDOW);
  });

  it("produces the ratios checkNeedsAttention flags on: two low scores", () => {
    const out = buildRecentAccuracies(
      [
        ev({ meta: { exercise: "a" }, score: 1, total: 4 }),
        ev({ meta: { exercise: "b" }, score: 1, total: 4 }),
      ],
      ["s1"],
    );
    const result = checkNeedsAttention({
      lastActiveAt: new Date().toISOString(),
      recentAccuracies: out.s1,
    });
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain("Puntuaciones bajas repetidas");
  });
});

// ---------------------------------------------------------------------------

/**
 * Minimal stand-in for the chained supabase query builder, including `.range()`
 * so the paged reads behave like the real thing. `errors` marks a table whose
 * read should fail.
 */
function stubTables(tables: Record<string, unknown[]>, errors: string[] = []) {
  from.mockImplementation((table: string) => {
    const rows = tables[table] ?? [];
    const failed = errors.includes(table);
    const resultFor = (slice: unknown[]) => ({
      data: failed ? null : slice,
      error: failed ? { message: `stubbed failure reading ${table}` } : null,
    });
    const builder = {
      select: () => builder,
      order: () => builder,
      // A page: the real client returns at most (to - from + 1) rows.
      range: (fromIdx: number, toIdx: number) => resultFor(rows.slice(fromIdx, toIdx + 1)),
      then: (resolve: (v: unknown) => void) => resolve(resultFor(rows)),
    };
    return builder;
  });
}

describe("getLiveAdminOverview — attention rolls up from the same rule", () => {
  beforeEach(() => {
    vi.resetModules();
    from.mockReset();
  });

  it("counts a struggling student per class, per teacher, and globally", async () => {
    const recent = new Date().toISOString();
    stubTables({
      classes: [
        { id: "c1", name: "Clase A", join_code: "AAA111", teacher_id: "t1" },
        { id: "c2", name: "Clase B", join_code: "BBB222", teacher_id: "t1" },
      ],
      students: [
        { id: "struggling", class_id: "c1" },
        { id: "doing_fine", class_id: "c1" },
        { id: "also_fine", class_id: "c2" },
      ],
      progress_events: [
        // Two recent low scores -> flagged.
        ev({ student_id: "struggling", meta: { exercise: "a" }, score: 1, total: 4 }),
        ev({ student_id: "struggling", meta: { exercise: "b" }, score: 1, total: 4 }),
        // Strong scores -> not flagged.
        ev({ student_id: "doing_fine", meta: { exercise: "a" }, score: 4, total: 4 }),
        ev({ student_id: "also_fine", meta: { exercise: "a" }, score: 4, total: 4 }),
      ],
      profiles: [{ id: "t1", full_name: "Maestra Uno" }],
      student_lesson_progress: [
        {
          student_id: "struggling",
          lesson_id: "1",
          status: "in_progress",
          completed_at: null,
          last_active_at: recent,
          last_page: 1,
        },
        {
          student_id: "doing_fine",
          lesson_id: "1",
          status: "in_progress",
          completed_at: null,
          last_active_at: recent,
          last_page: 1,
        },
        {
          student_id: "also_fine",
          lesson_id: "1",
          status: "in_progress",
          completed_at: null,
          last_active_at: recent,
          last_page: 1,
        },
      ],
    });

    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    const overview = await getLiveAdminOverview();

    expect(overview).not.toBeNull();
    const classA = overview!.teachers[0].classes.find((c) => c.classId === "c1")!;
    const classB = overview!.teachers[0].classes.find((c) => c.classId === "c2")!;

    expect(classA.attentionCount).toBe(1); // only the struggling one
    expect(classB.attentionCount).toBe(0);
    expect(overview!.teachers[0].attentionCount).toBe(1); // summed across their classes
    expect(overview!.totals.attentionCount).toBe(1);
    expect(overview!.teachers[0].teacherName).toBe("Maestra Uno");
  });

  it("flags a student who has never been active at all", async () => {
    stubTables({
      classes: [{ id: "c1", name: "Clase A", join_code: "AAA111", teacher_id: "t1" }],
      students: [{ id: "never_started", class_id: "c1" }],
      progress_events: [],
      profiles: [{ id: "t1", full_name: "Maestra Uno" }],
      student_lesson_progress: [],
    });

    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    const overview = await getLiveAdminOverview();

    // No activity recorded is itself a reason in checkNeedsAttention.
    expect(overview!.totals.attentionCount).toBe(1);
    expect(overview!.teachers[0].classes[0].attentionCount).toBe(1);
  });

  it("does not flag an active student with good scores", async () => {
    const recent = new Date().toISOString();
    stubTables({
      classes: [{ id: "c1", name: "Clase A", join_code: "AAA111", teacher_id: "t1" }],
      students: [{ id: "s1", class_id: "c1" }],
      progress_events: [ev({ student_id: "s1", score: 4, total: 4 })],
      profiles: [{ id: "t1", full_name: "Maestra Uno" }],
      student_lesson_progress: [
        {
          student_id: "s1",
          lesson_id: "1",
          status: "in_progress",
          completed_at: null,
          last_active_at: recent,
          last_page: 1,
        },
      ],
    });

    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    const overview = await getLiveAdminOverview();
    expect(overview!.totals.attentionCount).toBe(0);
  });
});

describe("getLiveAdminOverview — fails loudly instead of publishing wrong numbers", () => {
  beforeEach(() => {
    vi.resetModules();
    from.mockReset();
  });

  const base = () => ({
    classes: [{ id: "c1", name: "Clase A", join_code: "AAA111", teacher_id: "t1" }],
    students: [{ id: "s1", class_id: "c1" }],
    progress_events: [ev({ student_id: "s1", score: 4, total: 4 })],
    profiles: [{ id: "t1", full_name: "Maestra Uno" }],
    student_lesson_progress: [
      {
        student_id: "s1",
        lesson_id: "1",
        status: "in_progress",
        completed_at: null,
        last_active_at: new Date().toISOString(),
        last_page: 1,
      },
    ],
  });

  it("returns null when the lesson-progress read fails", async () => {
    // The dangerous case: continuing here would strip every student's
    // last-active date and flag the whole school as inactive.
    stubTables(base(), ["student_lesson_progress"]);
    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    expect(await getLiveAdminOverview()).toBeNull();
  });

  it("returns null when the events read fails", async () => {
    stubTables(base(), ["progress_events"]);
    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    expect(await getLiveAdminOverview()).toBeNull();
  });

  it("returns null when the classes or students read fails", async () => {
    stubTables(base(), ["classes"]);
    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    expect(await getLiveAdminOverview()).toBeNull();

    vi.resetModules();
    stubTables(base(), ["students"]);
    const again = await import("../admin-overview.functions");
    expect(await again.getLiveAdminOverview()).toBeNull();
  });

  it("still renders when only the teacher names fail, since no figure depends on them", async () => {
    stubTables(base(), ["profiles"]);
    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    const overview = await getLiveAdminOverview();

    expect(overview).not.toBeNull();
    expect(overview!.totals.studentCount).toBe(1);
    expect(overview!.teachers[0].teacherName).toBe("Maestro"); // fallback label
  });

  it("reads past a single page rather than silently truncating", async () => {
    // 2,400 events across 3 pages of 1,000. An unpaged read would have stopped
    // at the first page and lost the rest, changing every derived figure.
    const many = Array.from({ length: 2400 }, (_, i) =>
      ev({ student_id: "s1", event_kind: "time", time_seconds: 60, meta: { exercise: `t${i}` } }),
    );
    stubTables({ ...base(), progress_events: many });

    const { getLiveAdminOverview } = await import("../admin-overview.functions");
    const overview = await getLiveAdminOverview();

    // 2,400 minutes of recorded time only adds up if every page was read.
    expect(overview!.teachers[0].classes[0].totalMinutes).toBe(2400);
  });
});
