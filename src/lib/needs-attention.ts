// Pure selection rules for the teacher "needs attention" panels.
// Mirrors the weak-lesson threshold from src/lib/exercise-stats.ts (accuracy < 0.7)
// but operates on the server-aggregated shapes already returned by teacher.functions.ts.

const WEAK_ACCURACY_THRESHOLD = 0.7;
const DEFAULT_INACTIVE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type StrugglingStudentInput = {
  id: string;
  name: string;
  accuracy: number | null;
};

export type StrugglingStudent = {
  id: string;
  name: string;
  accuracy: number;
};

export function selectStrugglingStudents(
  perStudent: StrugglingStudentInput[],
): StrugglingStudent[] {
  return perStudent
    .filter((s) => s.accuracy != null && s.accuracy < WEAK_ACCURACY_THRESHOLD)
    .map((s) => ({ id: s.id, name: s.name, accuracy: s.accuracy as number }));
}

export type StalledStudentInput = {
  id: string;
  display_name: string;
  lastSeen: string | null;
};

export type StalledStudent = {
  id: string;
  name: string;
  reason: "never_started" | "inactive";
  daysSinceActive: number | null;
};

export function selectStalledStudents(
  students: StalledStudentInput[],
  now: number = Date.now(),
  inactiveDays: number = DEFAULT_INACTIVE_DAYS,
): StalledStudent[] {
  const out: StalledStudent[] = [];
  for (const s of students) {
    if (!s.lastSeen) {
      out.push({ id: s.id, name: s.display_name, reason: "never_started", daysSinceActive: null });
      continue;
    }
    const elapsedMs = now - new Date(s.lastSeen).getTime();
    if (elapsedMs >= inactiveDays * DAY_MS) {
      out.push({
        id: s.id,
        name: s.display_name,
        reason: "inactive",
        daysSinceActive: Math.floor(elapsedMs / DAY_MS),
      });
    }
  }
  return out;
}

export type OverdueAssignmentInput = {
  id: string;
  lessonId: string;
  title: string | null;
  dueAt: string | null;
  completed: number;
  assigned: number;
};

export type OverdueAssignment = {
  id: string;
  lessonId: string;
  title: string | null;
  dueAt: string;
  outstanding: number;
};

export function selectOverdueAssignments(
  assignments: OverdueAssignmentInput[],
  now: number = Date.now(),
): OverdueAssignment[] {
  return assignments
    .filter((a) => a.dueAt != null && new Date(a.dueAt).getTime() < now && a.completed < a.assigned)
    .map((a) => ({
      id: a.id,
      lessonId: a.lessonId,
      title: a.title,
      dueAt: a.dueAt as string,
      outstanding: a.assigned - a.completed,
    }));
}
