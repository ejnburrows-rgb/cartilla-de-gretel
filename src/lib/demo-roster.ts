const STATE_KEY = "cartilla.seed.state.v1";
const RETIRED_STUDENT_IDS = new Set([
  "seed-student-valentina",
  "seed-student-diego",
]);

type StoredSeedState = {
  students?: Array<{ id?: string }>;
  events?: Array<{ student_id?: string }>;
  [key: string]: unknown;
};

/**
 * One-time compatibility cleanup for browsers that opened the older
 * eight-student faculty demo. Fresh seed data is still created by seed-data;
 * this removes only the two retired canonical records and their events while
 * preserving any classes/students a teacher deliberately creates during the demo.
 */
export function normalizeFacultyDemoRoster(): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage?.getItem(STATE_KEY);
    if (!raw) return;

    const state = JSON.parse(raw) as StoredSeedState;
    const students = Array.isArray(state.students) ? state.students : [];
    const events = Array.isArray(state.events) ? state.events : [];

    const nextStudents = students.filter(
      (student) =>
        typeof student?.id !== "string" || !RETIRED_STUDENT_IDS.has(student.id),
    );
    const nextEvents = events.filter(
      (event) =>
        typeof event?.student_id !== "string" ||
        !RETIRED_STUDENT_IDS.has(event.student_id),
    );

    if (
      nextStudents.length === students.length &&
      nextEvents.length === events.length
    ) {
      return;
    }

    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ ...state, students: nextStudents, events: nextEvents }),
    );
    window.dispatchEvent(new Event("cartilla:seed-data"));
  } catch {
    // If local demo storage is unavailable/corrupt, seed-data owns recovery.
  }
}
