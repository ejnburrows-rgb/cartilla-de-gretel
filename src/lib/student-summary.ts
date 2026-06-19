export type ProgressEvent = {
  id: string;
  lesson_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  meta: unknown;
  created_at: string;
};

export type StudentSummary = {
  completedSet: Set<string>;
  completedCount: number;
  exerciseStats: Record<string, { score: number; total: number; runs: number }>;
  timeTotal: number;
  badges: Array<{ name: string; at: string }>;
  level: { value: string; at: string } | null;
};

export function summarizeStudentEvents(events: ProgressEvent[]): StudentSummary {
  const completed = new Set<string>();
  const exerciseStats: Record<string, { score: number; total: number; runs: number }> = {};
  const latestExerciseKeys = new Set<string>();
  let timeTotal = 0;
  const badges: Array<{ name: string; at: string }> = [];
  let level: { value: string; at: string } | null = null;

  for (const e of events) {
    if (e.event_kind === "lesson_completed") completed.add(e.lesson_id);
    if (e.event_kind === "exercise" && typeof e.score === "number" && typeof e.total === "number") {
      const meta = (e.meta ?? {}) as Record<string, unknown>;
      const exercise = typeof meta.exercise === "string" ? meta.exercise : "exercise";
      const key = `${e.lesson_id}:${exercise}`;
      if (!latestExerciseKeys.has(key)) {
        latestExerciseKeys.add(key);
        const stat = (exerciseStats[e.lesson_id] ??= { score: 0, total: 0, runs: 0 });
        stat.score += e.score;
        stat.total += e.total;
        stat.runs += 1;
      }
    }
    if (e.event_kind === "time" && typeof e.time_seconds === "number") timeTotal += e.time_seconds;
    if (e.event_kind === "badge")
      badges.push({
        name: String((e.meta as Record<string, unknown> | null)?.name ?? "Insignia"),
        at: e.created_at,
      });
    if (e.event_kind === "level" && !level)
      level = {
        value: String((e.meta as Record<string, unknown> | null)?.level ?? "—"),
        at: e.created_at,
      };
  }

  return { completedSet: completed, completedCount: completed.size, exerciseStats, timeTotal, badges, level };
}
