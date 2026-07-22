import { TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { checkNeedsAttention } from "@/lib/progress-calculation";

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

/** Demo/seed mode is hard-disabled in production builds (import.meta.env.PROD).
 * Even if VITE_ALLOW_DEMO_MODE is set on a host, PROD builds never activate it.
 * Preview/dev only when VITE_ALLOW_DEMO_MODE === "true". */
function demoModeAllowed(): boolean {
  if (import.meta.env.PROD) return false;
  return import.meta.env.VITE_ALLOW_DEMO_MODE === "true";
}

/** Single shared check for "is this teacher session the local demo lane" —
 * replaces the same inline localStorage check that used to be duplicated
 * (and included a no-op `!supabase.auth.getSession()`, which is always
 * false since getSession() returns a Promise) across every CRM component. */
export function isSeedSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  if (!demoModeAllowed()) return false;
  // Node 26 / some test runners expose window without a usable localStorage
  // (ExperimentalWarning: localStorage is not available). Never throw here —
  // a storage failure means "no seed session", not a crash of the teacher gate.
  try {
    const store = globalThis.localStorage;
    if (!store || typeof store.getItem !== "function") return false;
    return !!store.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

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

/** Days-ago helper for generating realistic-looking seed timestamps relative
 * to whenever the demo lane is first opened, rather than baking in stale
 * absolute dates. */
function daysAgoIso(days: number, hour = 15): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** Deterministic per-student event generator so the demo lane always shows
 * the same varied spread of tile-grid states (completed/in-progress/
 * not-started, good scores/struggling, active/inactive) without relying on
 * Math.random — every reset of the demo produces the same story. */
function generateSeedEvents(
  studentId: string,
  completedLessons: number[],
  inProgressLessons: number[],
  opts: { lastActiveDaysAgo: number; scoreQuality: "high" | "medium" | "low" },
): SeedEvent[] {
  const events: SeedEvent[] = [];
  const scoreFor = (kind: typeof opts.scoreQuality) =>
    kind === "high"
      ? { score: 9, total: 10 }
      : kind === "medium"
        ? { score: 6, total: 10 }
        : { score: 3, total: 10 };

  completedLessons.forEach((lessonNum, i) => {
    const daysAgo = opts.lastActiveDaysAgo + (completedLessons.length - i) * 2;
    const lessonId = String(lessonNum);
    const { score, total } = scoreFor(opts.scoreQuality);
    events.push({
      id: `seed-event-${studentId}-l${lessonNum}-ex`,
      student_id: studentId,
      lesson_id: lessonId,
      event_kind: "exercise",
      score,
      total,
      time_seconds: null,
      meta: { exercise: "picture_grid" },
      created_at: daysAgoIso(daysAgo + 1),
    });
    events.push({
      id: `seed-event-${studentId}-l${lessonNum}-time`,
      student_id: studentId,
      lesson_id: lessonId,
      event_kind: "time",
      score: null,
      total: null,
      time_seconds: 420,
      meta: null,
      created_at: daysAgoIso(daysAgo),
    });
    events.push({
      id: `seed-event-${studentId}-l${lessonNum}-done`,
      student_id: studentId,
      lesson_id: lessonId,
      event_kind: "lesson_completed",
      score: null,
      total: null,
      time_seconds: null,
      meta: null,
      created_at: daysAgoIso(daysAgo),
    });
  });

  inProgressLessons.forEach((lessonNum) => {
    const { score, total } = scoreFor(opts.scoreQuality);
    events.push({
      id: `seed-event-${studentId}-l${lessonNum}-inprog`,
      student_id: studentId,
      lesson_id: String(lessonNum),
      event_kind: "exercise",
      score,
      total,
      time_seconds: null,
      meta: { exercise: "vowel_pick_one" },
      created_at: daysAgoIso(opts.lastActiveDaysAgo),
    });
  });

  return events;
}

/** Second seed teacher's class — gives the admin cross-teacher dashboard a
 * real spread to aggregate in the demo lane (D7). Kept as its own slice so
 * readState() can migrate older stored demo states that predate it. */
const EMILIO_CLASS_ID = "seed-class-emilio";
function emilioSlice(): Pick<SeedState, "classes" | "students" | "events"> {
  const students: SeedStudent[] = [
    {
      id: "seed-student-lucas",
      class_id: EMILIO_CLASS_ID,
      display_name: "Lucas Herrera",
      student_code: "LUCAS",
      created_at: daysAgoIso(30),
    },
    {
      id: "seed-student-emma",
      class_id: EMILIO_CLASS_ID,
      display_name: "Emma Delgado",
      student_code: "EMMAD",
      created_at: daysAgoIso(28),
    },
    {
      id: "seed-student-nico",
      class_id: EMILIO_CLASS_ID,
      display_name: "Nicolás Peña",
      student_code: "NICOP",
      created_at: daysAgoIso(25),
    },
  ];
  const events: SeedEvent[] = [
    // Lucas — steady, 7/24 completed, medium scores.
    ...generateSeedEvents(
      "seed-student-lucas",
      Array.from({ length: 7 }, (_, i) => i + 1),
      [8],
      { lastActiveDaysAgo: 1, scoreQuality: "medium" },
    ),
    // Emma — strong starter, 4 completed, high scores.
    ...generateSeedEvents("seed-student-emma", [1, 2, 3, 4], [5], {
      lastActiveDaysAgo: 0,
      scoreQuality: "high",
    }),
    // Nicolás — needs attention: low scores, inactive 12 days.
    ...generateSeedEvents("seed-student-nico", [1], [2], {
      lastActiveDaysAgo: 12,
      scoreQuality: "low",
    }),
  ];
  return {
    classes: [
      {
        id: EMILIO_CLASS_ID,
        teacher_id: "seed-teacher-emilio",
        name: "Clase de Emilio (Demo)",
        join_code: "EMIL12",
        created_at: daysAgoIso(30),
      },
    ],
    students,
    events,
  };
}

function initialState(): SeedState {
  const classId = "seed-class-demo";
  const students: SeedStudent[] = [
    {
      id: "seed-student-sofia",
      class_id: classId,
      display_name: "Sofía Ramírez",
      student_code: "SOFIA",
      created_at: daysAgoIso(60),
    },
    {
      id: "seed-student-mateo",
      class_id: classId,
      display_name: "Mateo Torres",
      student_code: "MATEO",
      created_at: daysAgoIso(45),
    },
    {
      id: "seed-student-valentina",
      class_id: classId,
      display_name: "Valentina Cruz",
      student_code: "VALEN",
      created_at: daysAgoIso(20),
    },
    {
      id: "seed-student-diego",
      class_id: classId,
      display_name: "Diego Fernández",
      student_code: "DIEGO",
      created_at: daysAgoIso(50),
      teacher_notes: "Le cuesta la lectura de sílabas compuestas — reforzar en casa.",
    },
    {
      id: "seed-student-camila",
      class_id: classId,
      display_name: "Camila Ortiz",
      student_code: "CAMIL",
      created_at: daysAgoIso(5),
    },
  ];

  const events: SeedEvent[] = [
    // Sofía — advanced, 18/24 completed, high scores, active recently.
    ...generateSeedEvents(
      "seed-student-sofia",
      Array.from({ length: 18 }, (_, i) => i + 1),
      [19],
      { lastActiveDaysAgo: 1, scoreQuality: "high" },
    ),
    // Mateo — mid-progress, 10/24 completed, active 2 days ago.
    ...generateSeedEvents(
      "seed-student-mateo",
      Array.from({ length: 10 }, (_, i) => i + 1),
      [11],
      { lastActiveDaysAgo: 2, scoreQuality: "medium" },
    ),
    // Valentina — just getting started, 2 completed + 1 in progress.
    ...generateSeedEvents("seed-student-valentina", [1, 2], [3], {
      lastActiveDaysAgo: 0,
      scoreQuality: "high",
    }),
    // Diego — needs attention: 1 completed, repeated low scores, inactive 9 days.
    ...generateSeedEvents("seed-student-diego", [1], [2, 3], {
      lastActiveDaysAgo: 9,
      scoreQuality: "low",
    }),
    // Camila — needs attention: brand new, zero activity at all.
  ];

  const emilio = emilioSlice();
  return {
    classes: [
      {
        id: classId,
        teacher_id: "seed-teacher-leonor",
        name: "Clase de Prueba (Demo Local)",
        join_code: "DEMO12",
        created_at: daysAgoIso(60),
      },
      ...emilio.classes,
    ],
    students: [...students, ...emilio.students],
    events: [...events, ...emilio.events],
    assignments: [
      {
        id: "seed-assignment-1",
        class_id: classId,
        lesson_id: "19",
        title: "Repaso de la letra R",
        due_at: null,
        time_limit_seconds: null,
        created_at: daysAgoIso(3),
      },
    ],
  };
}

function readState(): SeedState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SeedState>;
      const state: SeedState = {
        classes: parsed.classes ?? [],
        students: parsed.students ?? [],
        events: parsed.events ?? [],
        assignments: parsed.assignments ?? [],
      };
      // Migration: demo states stored before the admin dashboard existed
      // lack the second teacher's class — append it once so the
      // cross-teacher view always has data without resetting user edits.
      if (!state.classes.some((c) => c.id === EMILIO_CLASS_ID)) {
        const emilio = emilioSlice();
        state.classes.push(...emilio.classes);
        state.students.push(...emilio.students);
        state.events.push(...emilio.events);
        writeState(state);
      }
      return state;
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
    join_code: (() => {
      // Secure, unguessable demo join code (matches the crypto codes used in
      // the live teacher path).
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0].toString(36).padStart(6, "0").slice(0, 6).toUpperCase();
    })(),
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
  const events = state.events.filter((e) => e.student_id === id);

  const lessonIds = new Set(events.map((e) => e.lesson_id));
  const lessonProgress = Array.from(lessonIds).map((lesson_id) => {
    const lessonEvents = events.filter((e) => e.lesson_id === lesson_id);
    const completed = lessonEvents.some((e) => e.event_kind === "lesson_completed");
    const lastActive = lessonEvents
      .map((e) => e.created_at)
      .sort()
      .at(-1);
    return {
      lesson_id,
      status: completed ? "completed" : "started",
      last_active_at: lastActive ?? null,
    };
  });

  return {
    student: {
      id: student.id,
      display_name: student.display_name,
      student_code: student.student_code,
      class_id: student.class_id,
      teacher_notes: student.teacher_notes ?? null,
    },
    class: cls,
    events,
    lessonProgress,
    assignments: cls ? state.assignments.filter((a) => a.class_id === cls.id) : [],
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
  const classStudents = state.students.filter((s) => s.class_id === classId);

  // Same aggregation as the live getClassProgress() in teacher.functions.ts:
  // accumulate score/total from "exercise" events and elapsed time from
  // "time" events, per student, plus a per-exercise-type hits/attempts
  // breakdown from each event's meta.exercise — so the demo lane's report
  // shows real numbers instead of always "—" / "0 mins".
  const scoreTotalTimeByStudent: Record<string, { score: number; total: number; time: number }> =
    {};
  const perStudentExercise: Record<string, Record<string, { hits: number; attempts: number }>> = {};
  classStudents.forEach((s) => {
    scoreTotalTimeByStudent[s.id] = { score: 0, total: 0, time: 0 };
    perStudentExercise[s.id] = {};
  });
  events.forEach((e) => {
    const bucket = scoreTotalTimeByStudent[e.student_id];
    if (!bucket) return;
    if (e.event_kind === "exercise") {
      bucket.score += e.score ?? 0;
      bucket.total += e.total ?? 0;
      const exerciseKind =
        typeof e.meta?.exercise === "string" ? (e.meta.exercise as string) : "exercise";
      const cell = (perStudentExercise[e.student_id][exerciseKind] ??= { hits: 0, attempts: 0 });
      cell.hits += e.score ?? 0;
      cell.attempts += e.total ?? 0;
    }
    if (e.event_kind === "time") {
      bucket.time += e.time_seconds ?? 0;
    }
  });

  const recentEvents = events
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((e) => ({
      studentId: e.student_id,
      studentName: classStudents.find((s) => s.id === e.student_id)?.display_name ?? "?",
      lessonId: e.lesson_id,
      eventKind: e.event_kind,
      score: e.score,
      total: e.total,
      createdAt: e.created_at,
    }));

  const attentionByStudent: Record<string, { flagged: boolean; reasons: string[] }> = {};
  classStudents.forEach((s) => {
    const studentEvents = events
      .filter((e) => e.student_id === s.id)
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const lastActiveAt = studentEvents[0]?.created_at ?? null;
    const recentAccuracies = studentEvents
      .filter((e) => e.event_kind === "exercise" && (e.total ?? 0) > 0)
      .slice(0, 5)
      .map((e) => (e.score ?? 0) / (e.total ?? 1));
    attentionByStudent[s.id] = checkNeedsAttention({ lastActiveAt, recentAccuracies });
  });

  return {
    recentEvents,
    attentionByStudent,
    perStudentExercise,
    perStudent: classStudents.map((s) => {
      const { score, total, time } = scoreTotalTimeByStudent[s.id] ?? {
        score: 0,
        total: 0,
        time: 0,
      };
      return {
        id: s.id,
        name: s.display_name,
        lessonsCount: new Set(
          events
            .filter((e) => e.student_id === s.id && e.event_kind === "lesson_completed")
            .map((e) => e.lesson_id),
        ).size,
        completedLessonIds: Array.from(
          new Set(
            events
              .filter((e) => e.student_id === s.id && e.event_kind === "lesson_completed")
              .map((e) => e.lesson_id),
          ),
        ),
        accuracy: total > 0 ? score / total : null,
        timeSeconds: time,
      };
    }),
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

/** The demo lane's admin: the workbook's author account. The live path will
 * use a real 'admin' role via has_role once D2's Supabase go-live lands. */
const SEED_ADMIN_ID: SeedTeacherId = "seed-teacher-leonor";

export function isSeedAdmin(): boolean {
  if (!isSeedSessionActive()) return false;
  return getSeedTeacher()?.id === SEED_ADMIN_ID;
}

export type AdminClassSummary = {
  classId: string;
  className: string;
  joinCode: string;
  studentCount: number;
  /** 0..1 or null when no scored exercises yet */
  accuracy: number | null;
  totalMinutes: number;
  lessonsCompleted: number;
  attentionCount: number;
};

export type AdminTeacherSummary = {
  teacherId: string;
  teacherName: string;
  classes: AdminClassSummary[];
  studentCount: number;
  accuracy: number | null;
  attentionCount: number;
};

export type AdminOverview = {
  teachers: AdminTeacherSummary[];
  totals: {
    teacherCount: number;
    classCount: number;
    studentCount: number;
    accuracy: number | null;
    attentionCount: number;
  };
};

/** Cross-teacher aggregation for the admin dashboard (demo lane, D7).
 * Reuses getSeedClassProgress so every number matches what each teacher
 * sees on their own CRM — the admin view is a roll-up, never a fork. */
export function getSeedAdminOverview(): AdminOverview {
  const state = readState();
  let globalScore = 0;
  let globalTotal = 0;

  const teachers: AdminTeacherSummary[] = SEED_TEACHERS.map((t) => {
    const classes = state.classes
      .filter((c) => c.teacher_id === t.id)
      .map((c): AdminClassSummary => {
        const progress = getSeedClassProgress(c.id);
        const classEvents = state.events.filter((e) =>
          state.students.some((s) => s.class_id === c.id && s.id === e.student_id),
        );
        const score = classEvents
          .filter((e) => e.event_kind === "exercise")
          .reduce((sum, e) => sum + (e.score ?? 0), 0);
        const total = classEvents
          .filter((e) => e.event_kind === "exercise")
          .reduce((sum, e) => sum + (e.total ?? 0), 0);
        globalScore += score;
        globalTotal += total;
        return {
          classId: c.id,
          className: c.name,
          joinCode: c.join_code,
          studentCount: progress.perStudent.length,
          accuracy: total > 0 ? score / total : null,
          totalMinutes: Math.round(
            progress.perStudent.reduce((sum, s) => sum + s.timeSeconds, 0) / 60,
          ),
          lessonsCompleted: progress.perStudent.reduce((sum, s) => sum + s.lessonsCount, 0),
          attentionCount: Object.values(progress.attentionByStudent).filter((a) => a.flagged)
            .length,
        };
      });

    const studentCount = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const scored = classes.filter((c) => c.accuracy !== null);
    return {
      teacherId: t.id,
      teacherName: t.name,
      classes,
      studentCount,
      accuracy:
        scored.length > 0
          ? scored.reduce((sum, c) => sum + (c.accuracy ?? 0), 0) / scored.length
          : null,
      attentionCount: classes.reduce((sum, c) => sum + c.attentionCount, 0),
    };
  });

  return {
    teachers,
    totals: {
      teacherCount: teachers.length,
      classCount: teachers.reduce((sum, t) => sum + t.classes.length, 0),
      studentCount: teachers.reduce((sum, t) => sum + t.studentCount, 0),
      accuracy: globalTotal > 0 ? globalScore / globalTotal : null,
      attentionCount: teachers.reduce((sum, t) => sum + t.attentionCount, 0),
    },
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
