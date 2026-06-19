import { TOTAL_LESSONS } from "@/lib/lesson-catalog";

export const SEED_TEACHERS = [
  {
    id: "seed-teacher-leonor",
    name: "Leonor Lopetegui",
    username: "leonore",
    email: "leonore@cartilla.local",
    password: "Cartilla2026!",
  },
  {
    id: "seed-teacher-emilio",
    name: "Emilio Novo",
    username: "emilio",
    email: "emilio@cartilla.local",
    password: "Novo2026!",
  },
] as const;

export const SEED_STUDENT_ACCESS = [] as const;

const AUTH_KEY = "cartilla.seed.teacher.v1";
const STATE_KEY = "cartilla.seed.state.v1";

type SeedTeacherId = (typeof SEED_TEACHERS)[number]["id"];

type SeedEvent = {
  id: string;
  student_id: string;
  lesson_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

type SeedStudent = {
  id: string;
  class_id: string;
  display_name: string;
  student_code: string;
  grade?: string;
  teacher_notes?: string;
  created_at: string;
};

type SeedClass = {
  id: string;
  teacher_id: SeedTeacherId;
  name: string;
  join_code: string;
  created_at: string;
};

type SeedAssignment = {
  id: string;
  class_id: string;
  lesson_id: string;
  title: string | null;
  due_at: string | null;
  time_limit_seconds: number | null;
  created_at: string;
};

type SeedState = {
  classes: SeedClass[];
  students: SeedStudent[];
  events: SeedEvent[];
  assignments: SeedAssignment[];
};

function nowIso() {
  return new Date().toISOString();
}

function initialState(): SeedState {
  return {
    classes: [
      {
        id: "seed-class-demo",
        teacher_id: "seed-teacher-leonor",
        name: "Clase de Prueba (Demo Local)",
        join_code: "DEMO12",
        created_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      }
    ],
    students: [
      {
        id: "seed-student-demo",
        class_id: "seed-class-demo",
        display_name: "Estudiante Demo (Local)",
        student_code: "DEMO1",
        created_at: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      }
    ],
    events: [],
    assignments: [],
  };
}

function readState(): SeedState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SeedState>;
      return {
        classes: parsed.classes ?? [],
        students: parsed.students ?? [],
        events: parsed.events ?? [],
        assignments: parsed.assignments ?? [],
      };
    }
  } catch {
    /* reset below */
  }
  const state = initialState();
  writeState(state);
  return state;
}

function writeState(state: SeedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cartilla:seed-data"));
  window.dispatchEvent(new Event("cartilla:seed-data"));
}

export function signInSeedTeacher(email: string, password: string) {
  const teacher = SEED_TEACHERS.find(
    (t) =>
      (t.email.toLowerCase() === email.toLowerCase() ||
        t.username.toLowerCase() === email.toLowerCase()) &&
      t.password === password,
  );
  if (!teacher) throw new Error("Credenciales invalidas.");
  localStorage.setItem(AUTH_KEY, teacher.id);
  window.dispatchEvent(new Event("cartilla:seed-auth"));
  window.dispatchEvent(new Event("cartilla:seed-auth"));
  return teacher;
}

export function getSeedTeacher() {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(AUTH_KEY);
  return SEED_TEACHERS.find((t) => t.id === id) ?? null;
}

export function signOutSeedTeacher() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("cartilla:seed-auth"));
  window.dispatchEvent(new Event("cartilla:seed-auth"));
}

export function listSeedClasses() {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  return state.classes
    .filter((c) => c.teacher_id === teacher.id)
    .map((c) => ({
      ...c,
      student_count: state.students.filter((s) => s.class_id === c.id).length,
    }));
}

export function createSeedClass(name: string) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const row: SeedClass = {
    id: `seed-class-${crypto.randomUUID()}`,
    teacher_id: teacher.id,
    name,
    join_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    created_at: nowIso(),
  };
  state.classes.unshift(row);
  writeState(state);
  return row;
}

export function deleteSeedClass(id: string) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === id && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase no encontrada.");
  const studentIds = state.students.filter((s) => s.class_id === id).map((s) => s.id);
  state.classes = state.classes.filter((c) => c.id !== id);
  state.students = state.students.filter((s) => s.class_id !== id);
  state.events = state.events.filter((e) => !studentIds.includes(e.student_id));
  state.assignments = state.assignments.filter((a) => a.class_id !== id);
  writeState(state);
  return { ok: true };
}

export function getSeedClass(id: string) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === id && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase no encontrada.");
  const students = state.students
    .filter((s) => s.class_id === id)
    .map((s) => {
      const events = state.events.filter((e) => e.student_id === s.id);
      return {
        ...s,
        events: events.length,
        lessons: new Set(
          events.filter((e) => e.event_kind === "lesson_completed").map((e) => e.lesson_id),
        ).size,
        lastSeen: events[0]?.created_at ?? null,
      };
    });
  return { class: cls, students };
}

export function addSeedStudents(classId: string, names: string[]) {
  const state = readState();
  const rows = names.map((name) => ({
    id: `seed-student-${crypto.randomUUID()}`,
    class_id: classId,
    display_name: name,
    student_code: name.split(/\s+/)[0]?.slice(0, 5).toUpperCase() || "CODE",
    created_at: nowIso(),
  }));
  state.students.push(...rows);
  writeState(state);
  return rows;
}

export function deleteSeedStudent(id: string) {
  const state = readState();
  state.students = state.students.filter((s) => s.id !== id);
  state.events = state.events.filter((e) => e.student_id !== id);
  writeState(state);
  return { ok: true };
}

export function updateSeedStudent(id: string, updates: Partial<SeedStudent>) {
  const state = readState();
  const index = state.students.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Alumno no encontrado.");
  state.students[index] = { ...state.students[index], ...updates };
  writeState(state);
  return state.students[index];
}

export function joinSeedClass(joinCode: string, studentCode: string) {
  const state = readState();
  const cls = state.classes.find((c) => c.join_code.toUpperCase() === joinCode.toUpperCase());
  if (!cls) throw new Error("Codigo de clase invalido.");
  const student = state.students.find(
    (s) => s.class_id === cls.id && s.student_code.toUpperCase() === studentCode.toUpperCase(),
  );
  if (!student) throw new Error("Codigo de estudiante invalido.");
  return {
    studentId: student.id,
    studentName: student.display_name,
    studentCode: student.student_code,
    classId: cls.id,
    className: cls.name,
  };
}

export function logSeedProgress(input: {
  studentId: string;
  lessonId: string;
  kind: string;
  score?: number;
  total?: number;
  timeSeconds?: number;
  meta?: Record<string, unknown>;
}) {
  const state = readState();
  state.events.unshift({
    id: `seed-event-${crypto.randomUUID()}`,
    student_id: input.studentId,
    lesson_id: input.lessonId,
    event_kind: input.kind,
    score: input.score ?? null,
    total: input.total ?? null,
    time_seconds: input.timeSeconds ?? null,
    meta: input.meta ?? null,
    created_at: nowIso(),
  });
  writeState(state);
  return { ok: true };
}

export function listSeedAssignments(classId: string) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === classId && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase no encontrada.");
  return state.assignments
    .filter((a) => a.class_id === classId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createSeedAssignment(input: {
  classId: string;
  lessonId: string;
  title?: string;
  dueAt?: string | null;
  timeLimitSeconds?: number | null;
}) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === input.classId && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase no encontrada.");
  const row: SeedAssignment = {
    id: `seed-assignment-${crypto.randomUUID()}`,
    class_id: input.classId,
    lesson_id: input.lessonId,
    title: input.title || null,
    due_at: input.dueAt || null,
    time_limit_seconds: input.timeLimitSeconds || null,
    created_at: nowIso(),
  };
  state.assignments.unshift(row);
  writeState(state);
  return row;
}

export function deleteSeedAssignment(id: string) {
  const teacher = getSeedTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro.");
  const state = readState();
  const assignment = state.assignments.find((a) => a.id === id);
  const cls = assignment
    ? state.classes.find((c) => c.id === assignment.class_id && c.teacher_id === teacher.id)
    : null;
  if (!assignment || !cls) throw new Error("Tarea no encontrada.");
  state.assignments = state.assignments.filter((a) => a.id !== id);
  writeState(state);
  return { ok: true };
}

export function listSeedStudentAssignments(input: {
  classId: string;
  studentId: string;
  studentCode: string;
}) {
  const state = readState();
  const student = state.students.find(
    (s) =>
      s.id === input.studentId &&
      s.class_id === input.classId &&
      s.student_code.toUpperCase() === input.studentCode.toUpperCase(),
  );
  if (!student) throw new Error("Alumno no encontrado.");
  return state.assignments
    .filter((a) => a.class_id === input.classId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getSeedStudentProgress(studentId: string) {
  const state = readState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) throw new Error("Alumno no encontrado.");
  const cls = state.classes.find((c) => c.id === student.class_id) ?? null;
  const events = state.events.filter((e) => e.student_id === studentId);
  return {
    student: { display_name: student.display_name, student_code: student.student_code },
    class: cls ? { name: cls.name } : null,
    events,
    lessonProgress: Array.from(
      new Set(events.filter((e) => e.event_kind === "lesson_completed").map((e) => e.lesson_id)),
    ).map((lesson_id) => ({ lesson_id, status: "completed" })),
  };
}

export function getSeedTeacherStudentProgress(id: string) {
  const state = readState();
  const student = state.students.find((s) => s.id === id);
  if (!student) throw new Error("Alumno no encontrado.");
  const cls = state.classes.find((c) => c.id === student.class_id) ?? null;
  return {
    student: {
      id: student.id,
      display_name: student.display_name,
      student_code: student.student_code,
      class_id: student.class_id,
    },
    class: cls,
    events: state.events.filter((e) => e.student_id === id),
  };
}

export function getSeedClassProgress(classId: string) {
  const state = readState();
  const studentIds = state.students.filter((s) => s.class_id === classId).map((s) => s.id);
  const events = state.events.filter((e) => studentIds.includes(e.student_id));
  const perLesson: Record<string, { score: number; total: number; completedBy: Set<string> }> = {};
  events.forEach((e) => {
    const row = (perLesson[e.lesson_id] ??= { score: 0, total: 0, completedBy: new Set() });
    if (e.event_kind === "lesson_completed") row.completedBy.add(e.student_id);
    if (e.event_kind === "exercise") {
      row.score += e.score ?? 0;
      row.total += e.total ?? 0;
    }
  });
  const assignments = state.assignments.filter((a) => a.class_id === classId);
  return {
    perStudent: state.students
      .filter((s) => s.class_id === classId)
      .map((s) => ({
        id: s.id,
        name: s.display_name,
        lessonsCount: new Set(
          events
            .filter((e) => e.student_id === s.id && e.event_kind === "lesson_completed")
            .map((e) => e.lesson_id),
        ).size,
        accuracy: null,
        timeSeconds: 0,
      })),
    perLesson: Object.fromEntries(
      Object.entries(perLesson).map(([lesson, row]) => [
        lesson,
        {
          completedBy: row.completedBy.size,
          accuracy: row.total > 0 ? row.score / row.total : null,
        },
      ]),
    ),
    assignments: assignments.map((assignment) => {
      const lessonEvents = events.filter((e) => e.lesson_id === assignment.lesson_id);
      const completedIds = new Set(
        lessonEvents.filter((e) => e.event_kind === "lesson_completed").map((e) => e.student_id),
      );
      const exerciseRows = lessonEvents.filter(
        (e) => e.event_kind === "exercise" && e.score != null && e.total != null,
      );
      const score = exerciseRows.reduce((sum, e) => sum + (e.score ?? 0), 0);
      const total = exerciseRows.reduce((sum, e) => sum + (e.total ?? 0), 0);
      return {
        id: assignment.id,
        lessonId: assignment.lesson_id,
        title: assignment.title,
        dueAt: assignment.due_at,
        completed: completedIds.size,
        late: 0,
        assigned: studentIds.length,
        averageTimeSeconds: null,
        accuracy: total > 0 ? score / total : null,
      };
    }),
    totalLessons: TOTAL_LESSONS,
  };
}

export function exportSeedStateRaw(): string {
  if (typeof window === "undefined") return "{}";
  return localStorage.getItem(STATE_KEY) || JSON.stringify(initialState());
}

export function importSeedStateRaw(jsonStr: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.classes)) {
      localStorage.setItem(STATE_KEY, jsonStr);
      window.dispatchEvent(new Event("cartilla:seed-data"));
      window.dispatchEvent(new Event("cartilla:seed-data"));
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

export function resetSeedStateRaw() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STATE_KEY);
  window.dispatchEvent(new Event("cartilla:seed-data"));
  window.dispatchEvent(new Event("cartilla:seed-data"));
}
