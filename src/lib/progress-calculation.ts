import { TOTAL_LESSONS } from "@/lib/lesson-catalog";

/**
 * Single shared source of truth for "how far along is this student" —
 * used identically by the teacher dashboard, the student detail page, and
 * per-lesson status badges, so the same student never shows a different
 * status/percentage in two different places.
 */

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgressRow {
  lesson_id: string;
  status: string;
  completed_at?: string | null;
  last_active_at?: string | null;
  last_page?: number | null;
}

/**
 * The explicit completion rule: a lesson counts as completed only when the
 * database row's own status says so (set exclusively by the
 * `log_student_progress` RPC's `lesson_completed` event — never inferred
 * from merely having opened a page). Any other real status maps to
 * "in_progress"; no row at all is "not_started".
 */
export function computeLessonStatus(row: LessonProgressRow | undefined | null): LessonStatus {
  if (!row) return "not_started";
  if (row.status === "completed") return "completed";
  if (row.status === "started") return "in_progress";
  return "not_started";
}

/** Every lesson_id string this student has ANY real completed row for. */
export function completedLessonIds(rows: LessonProgressRow[]): Set<string> {
  const set = new Set<string>();
  for (const row of rows) {
    if (computeLessonStatus(row) === "completed") set.add(row.lesson_id);
  }
  return set;
}

/** 0-100 whole-number percentage of the 24-lesson curriculum completed. */
export function computeCompletionPercent(
  rows: LessonProgressRow[],
  totalLessons: number = TOTAL_LESSONS,
): number {
  if (totalLessons <= 0) return 0;
  const completed = completedLessonIds(rows).size;
  return Math.round((Math.min(completed, totalLessons) / totalLessons) * 100);
}

/** The most recent `last_active_at` (or `completed_at`) across all rows, or null if the student has never engaged with any lesson. */
export function computeLastActive(rows: LessonProgressRow[]): string | null {
  let latest: string | null = null;
  for (const row of rows) {
    const candidate = row.last_active_at ?? row.completed_at ?? null;
    if (candidate && (!latest || candidate > latest)) latest = candidate;
  }
  return latest;
}

export interface StudentProgressSummary {
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  lastActiveAt: string | null;
  statusByLesson: Map<string, LessonStatus>;
}

/** The one function every surface (dashboard, roster, student detail) should
 * call to get a student's progress numbers — never recompute independently. */
export function summarizeStudentProgress(
  rows: LessonProgressRow[],
  totalLessons: number = TOTAL_LESSONS,
): StudentProgressSummary {
  const statusByLesson = new Map<string, LessonStatus>();
  for (const row of rows) statusByLesson.set(row.lesson_id, computeLessonStatus(row));
  return {
    completedLessons: completedLessonIds(rows).size,
    totalLessons,
    completionPercent: computeCompletionPercent(rows, totalLessons),
    lastActiveAt: computeLastActive(rows),
    statusByLesson,
  };
}

/** True once enough time has passed with too little progress that a
 * teacher should be nudged to check on this student. Matches the existing
 * dashboard heuristic (progress < 40% and no activity in 3+ days), now in
 * one place instead of duplicated per-component. */
export function needsAttention(
  summary: Pick<StudentProgressSummary, "completionPercent" | "lastActiveAt">,
  now: number = Date.now(),
): boolean {
  if (summary.completionPercent >= 40) return false;
  if (!summary.lastActiveAt) return true;
  const daysSinceActive = (now - new Date(summary.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceActive > 3;
}

export interface AttentionCheckInput {
  lastActiveAt: string | null;
  /** Most recent exercise accuracy ratios (0-1), most recent first. */
  recentAccuracies: number[];
}

export interface AttentionCheckResult {
  flagged: boolean;
  reasons: string[];
}

/** The Class Overview "needs attention" rule: 7+ days with no activity, or
 * repeated (2+) recent low scores (<50% accuracy). Distinct from
 * `needsAttention` above (which drives the dashboard KPI/pipeline alert and
 * uses a faster 3-day + <40%-completion heuristic) — this one is specifically
 * for surfacing struggling students at the top of the class overview. */
export function checkNeedsAttention(
  input: AttentionCheckInput,
  now: number = Date.now(),
): AttentionCheckResult {
  const reasons: string[] = [];
  if (!input.lastActiveAt) {
    reasons.push("Sin actividad registrada");
  } else {
    const days = (now - new Date(input.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 7) reasons.push(`Sin actividad hace ${Math.floor(days)} días`);
  }
  const lowScores = input.recentAccuracies.filter((a) => a < 0.5);
  if (lowScores.length >= 2) reasons.push("Puntuaciones bajas repetidas");
  return { flagged: reasons.length > 0, reasons };
}

export type TileStatus = LessonStatus;

export interface LessonTileState {
  lessonNumber: number;
  status: TileStatus;
  assigned: boolean;
}

/** Builds all `totalLessons` tile states (one per lesson number 1..N) for
 * the Lalilo-style lesson tile grid — every lesson gets a tile even if the
 * student has no row for it yet (not_started), and a lesson currently
 * assigned to the class gets its `assigned` flag set regardless of the
 * student's own progress on it. */
export function buildLessonTiles(
  rows: LessonProgressRow[],
  assignedLessonIds: ReadonlySet<string>,
  totalLessons: number = TOTAL_LESSONS,
): LessonTileState[] {
  const byLesson = new Map<string, LessonProgressRow>();
  for (const row of rows) byLesson.set(row.lesson_id, row);
  const tiles: LessonTileState[] = [];
  for (let n = 1; n <= totalLessons; n++) {
    const id = String(n);
    tiles.push({
      lessonNumber: n,
      status: computeLessonStatus(byLesson.get(id)),
      assigned: assignedLessonIds.has(id),
    });
  }
  return tiles;
}
