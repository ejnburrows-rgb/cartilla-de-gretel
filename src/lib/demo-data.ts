import { TOTAL_LESSONS } from "@/lib/lesson-catalog";

export const DEMO_TEACHERS = [
  {
    id: "demo-teacher-leonor",
    name: "Leonor Lopetegui",
    username: "leonore",
    email: "leonore@cartilla.demo",
    password: "Cartilla2026!",
  },
  {
    id: "demo-teacher-emilio",
    name: "Emilio Novo",
    username: "emilio",
    email: "emilio@cartilla.demo",
    password: "Novo2026!",
  },
] as const;

export const DEMO_STUDENT_ACCESS = [
  { name: "Erick Novo", joinCode: "GRETEL", studentCode: "NOVO" },
  { name: "Sofia Morejon", joinCode: "GRETEL", studentCode: "SOFIA" },
  { name: "Erick Novo", joinCode: "NOVO26", studentCode: "NOVO" },
  { name: "Sofia Morejon", joinCode: "NOVO26", studentCode: "SOFIA" },
] as const;

const AUTH_KEY = "cartilla.demo.teacher.v1";
const STATE_KEY = "cartilla.demo.state.v1";

type DemoTeacherId = (typeof DEMO_TEACHERS)[number]["id"];

type DemoEvent = {
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

type DemoStudent = {
  id: string;
  class_id: string;
  display_name: string;
  student_code: string;
  created_at: string;
};

type DemoClass = {
  id: string;
  teacher_id: DemoTeacherId;
  name: string;
  join_code: string;
  created_at: string;
};

type DemoAssignment = {
  id: string;
  class_id: string;
  lesson_id: string;
  title: string | null;
  due_at: string | null;
  time_limit_seconds: number | null;
  created_at: string;
};

type DemoState = {
  classes: DemoClass[];
  students: DemoStudent[];
  events: DemoEvent[];
  assignments: DemoAssignment[];
};

function nowIso() {
  return new Date().toISOString();
}

function initialState(): DemoState {
  const classes: DemoClass[] = [
    {
      id: "demo-class-leonor",
      teacher_id: "demo-teacher-leonor",
      name: "Clase demo - Leonor",
      join_code: "GRETEL",
      created_at: nowIso(),
    },
    {
      id: "demo-class-emilio",
      teacher_id: "demo-teacher-emilio",
      name: "Clase demo - Emilio",
      join_code: "NOVO26",
      created_at: nowIso(),
    },
  ];
  const students: DemoStudent[] = [
    {
      id: "demo-student-erick",
      class_id: "demo-class-leonor",
      display_name: "Erick Novo",
      student_code: "NOVO",
      created_at: nowIso(),
    },
    {
      id: "demo-student-sofia",
      class_id: "demo-class-leonor",
      display_name: "Sofia Morejon",
      student_code: "SOFIA",
      created_at: nowIso(),
    },
    {
      id: "demo-student-erick-emilio",
      class_id: "demo-class-emilio",
      display_name: "Erick Novo",
      student_code: "NOVO",
      created_at: nowIso(),
    },
    {
      id: "demo-student-sofia-emilio",
      class_id: "demo-class-emilio",
      display_name: "Sofia Morejon",
      student_code: "SOFIA",
      created_at: nowIso(),
    },
  ];
  return {
    classes,
    students,
    events: seedEvents(),
    assignments: [
      {
        id: "demo-assignment-leonor-l1",
        class_id: "demo-class-leonor",
        lesson_id: "1",
        title: "Primer repaso",
        due_at: null,
        time_limit_seconds: null,
        created_at: nowIso(),
      },
    ],
  };
}

function seedEvents(): DemoEvent[] {
  const base = Date.now() - 1000 * 60 * 60 * 24;
  return [
    event("demo-student-erick", "1", "lesson_completed", null, null, null, { seeded: true }, base),
    event("demo-student-erick", "1", "exercise", 4, 5, 180, { exercise: "syllable_tap" }, base),
    event(
      "demo-student-sofia",
      "1",
      "lesson_completed",
      null,
      null,
      null,
      { seeded: true },
      base + 5000,
    ),
    event("demo-student-sofia", "1", "exercise", 5, 5, 155, { exercise: "word_match" }, base),
  ];
}

function event(
  studentId: string,
  lessonId: string,
  kind: string,
  score: number | null,
  total: number | null,
  timeSeconds: number | null,
  meta: Record<string, unknown> | null,
  time: number,
): DemoEvent {
  return {
    id: `demo-event-${studentId}-${lessonId}-${kind}-${time}`,
    student_id: studentId,
    lesson_id: lessonId,
    event_kind: kind,
    score,
    total,
    time_seconds: timeSeconds,
    meta,
    created_at: new Date(time).toISOString(),
  };
}

function readState(): DemoState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>;
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

function writeState(state: DemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cartilla:demo-data"));
}

export function signInDemoTeacher(email: string, password: string) {
  const teacher = DEMO_TEACHERS.find(
    (t) =>
      (t.email.toLowerCase() === email.toLowerCase() ||
        t.username.toLowerCase() === email.toLowerCase()) &&
      t.password === password,
  );
  if (!teacher) throw new Error("Credenciales demo invalidas.");
  localStorage.setItem(AUTH_KEY, teacher.id);
  window.dispatchEvent(new Event("cartilla:demo-auth"));
  return teacher;
}

export function getDemoTeacher() {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(AUTH_KEY);
  return DEMO_TEACHERS.find((t) => t.id === id) ?? null;
}

export function signOutDemoTeacher() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("cartilla:demo-auth"));
}

export function listDemoClasses() {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  return state.classes
    .filter((c) => c.teacher_id === teacher.id)
    .map((c) => ({
      ...c,
      student_count: state.students.filter((s) => s.class_id === c.id).length,
    }));
}

export function createDemoClass(name: string) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const row: DemoClass = {
    id: `demo-class-${crypto.randomUUID()}`,
    teacher_id: teacher.id,
    name,
    join_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    created_at: nowIso(),
  };
  state.classes.unshift(row);
  writeState(state);
  return row;
}

export function deleteDemoClass(id: string) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === id && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase demo no encontrada.");
  const studentIds = state.students.filter((s) => s.class_id === id).map((s) => s.id);
  state.classes = state.classes.filter((c) => c.id !== id);
  state.students = state.students.filter((s) => s.class_id !== id);
  state.events = state.events.filter((e) => !studentIds.includes(e.student_id));
  state.assignments = state.assignments.filter((a) => a.class_id !== id);
  writeState(state);
  return { ok: true };
}

export function getDemoClass(id: string) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === id && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase demo no encontrada.");
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

export function addDemoStudents(classId: string, names: string[]) {
  const state = readState();
  const rows = names.map((name) => ({
    id: `demo-student-${crypto.randomUUID()}`,
    class_id: classId,
    display_name: name,
    student_code: name.split(/\s+/)[0]?.slice(0, 5).toUpperCase() || "CODE",
    created_at: nowIso(),
  }));
  state.students.push(...rows);
  writeState(state);
  return rows;
}

export function deleteDemoStudent(id: string) {
  const state = readState();
  state.students = state.students.filter((s) => s.id !== id);
  state.events = state.events.filter((e) => e.student_id !== id);
  writeState(state);
  return { ok: true };
}

export function joinDemoClass(joinCode: string, studentCode: string) {
  const state = readState();
  const cls = state.classes.find((c) => c.join_code.toUpperCase() === joinCode.toUpperCase());
  if (!cls) throw new Error("Codigo de clase demo invalido.");
  const student = state.students.find(
    (s) => s.class_id === cls.id && s.student_code.toUpperCase() === studentCode.toUpperCase(),
  );
  if (!student) throw new Error("Codigo de estudiante demo invalido.");
  return {
    studentId: student.id,
    studentName: student.display_name,
    studentCode: student.student_code,
    classId: cls.id,
    className: cls.name,
  };
}

export function logDemoProgress(input: {
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
    id: `demo-event-${crypto.randomUUID()}`,
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

export function listDemoAssignments(classId: string) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === classId && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase demo no encontrada.");
  return state.assignments
    .filter((a) => a.class_id === classId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createDemoAssignment(input: {
  classId: string;
  lessonId: string;
  title?: string;
  dueAt?: string | null;
  timeLimitSeconds?: number | null;
}) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const cls = state.classes.find((c) => c.id === input.classId && c.teacher_id === teacher.id);
  if (!cls) throw new Error("Clase demo no encontrada.");
  const row: DemoAssignment = {
    id: `demo-assignment-${crypto.randomUUID()}`,
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

export function deleteDemoAssignment(id: string) {
  const teacher = getDemoTeacher();
  if (!teacher) throw new Error("Debes iniciar sesion como maestro demo.");
  const state = readState();
  const assignment = state.assignments.find((a) => a.id === id);
  const cls = assignment
    ? state.classes.find((c) => c.id === assignment.class_id && c.teacher_id === teacher.id)
    : null;
  if (!assignment || !cls) throw new Error("Tarea demo no encontrada.");
  state.assignments = state.assignments.filter((a) => a.id !== id);
  writeState(state);
  return { ok: true };
}

export function listDemoStudentAssignments(input: {
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
  if (!student) throw new Error("Alumno demo no encontrado.");
  return state.assignments
    .filter((a) => a.class_id === input.classId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDemoStudentProgress(studentId: string) {
  const state = readState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) throw new Error("Alumno demo no encontrado.");
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

export function getDemoTeacherStudentProgress(id: string) {
  const state = readState();
  const student = state.students.find((s) => s.id === id);
  if (!student) throw new Error("Alumno demo no encontrado.");
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

export function getDemoClassProgress(classId: string) {
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
        lessonEvents
          .filter((e) => e.event_kind === "lesson_completed")
          .map((e) => e.student_id),
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
