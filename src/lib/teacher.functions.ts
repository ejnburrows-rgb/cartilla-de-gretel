import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  addSeedStudents,
  createSeedClass,
  deleteSeedClass,
  deleteSeedStudent,
  SEED_STUDENT_ACCESS,
  getSeedClass,
  getSeedClassProgress,
  getSeedTeacherStudentProgress,
  listSeedClasses,
} from "@/lib/seed-data";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type Call<T> = { data: T };

type TeacherCtx = {
  userId: string;
};

type TeacherClass = {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
};

type TeacherClassWithCount = TeacherClass & { student_count: number };

type TeacherStudent = {
  id: string;
  display_name: string;
  student_code: string;
  created_at: string;
};

type TeacherStudentWithStats = TeacherStudent & {
  events: number;
  lessons: number;
  lastSeen: string | null;
};

type TeacherStudentWithClass = {
  id: string;
  display_name: string;
  student_code: string;
  class_id: string;
  classes: TeacherClass | TeacherClass[];
};

function makeCode(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

async function requireTeacher(): Promise<TeacherCtx> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Debes iniciar sesion como maestro.");
  return { userId: data.user.id };
}

async function ensureTeacherOwnsClass(classId: string) {
  const { userId } = await requireTeacher();
  const { data: cls, error } = await supabase
    .from("classes")
    .select("id, name, join_code, created_at, teacher_id")
    .eq("id", classId)
    .eq("teacher_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!cls) throw new Error("Clase no encontrada o sin permiso.");
  return cls;
}

async function ensureTeacherOwnsStudent(studentId: string) {
  const { userId } = await requireTeacher();
  const { data: student, error } = await supabase
    .from("students")
    .select(
      "id, display_name, student_code, class_id, classes!inner(id, name, join_code, teacher_id)",
    )
    .eq("id", studentId)
    .eq("classes.teacher_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!student) throw new Error("Alumno no encontrado o sin permiso.");
  return student as unknown as TeacherStudentWithClass;
}

function exerciseName(e: { meta?: unknown }) {
  const meta = (e.meta ?? {}) as Record<string, unknown>;
  return typeof meta.exercise === "string" ? meta.exercise : "exercise";
}

function findSeedStudentsByName(q: string, classId?: string) {
  const needle = q.trim().toLowerCase();
  const joinCodeForClass = classId === "seed-class-emilio" ? "NOVO26" : classId === "seed-class-leonor" ? "GRETEL" : null;
  return SEED_STUDENT_ACCESS.filter((student) => {
    if (joinCodeForClass && student.joinCode !== joinCodeForClass) return false;
    return student.name.toLowerCase().includes(needle);
  })
    .slice(0, 20)
    .map((student) => ({
      id: `seed-search-${student.joinCode}-${student.studentCode}`,
      display_name: student.name,
      student_code: student.studentCode,
      class_id: student.joinCode === "NOVO26" ? "seed-class-emilio" : "seed-class-leonor",
      classes: {
        id: student.joinCode === "NOVO26" ? "seed-class-emilio" : "seed-class-leonor",
        name: student.joinCode === "NOVO26" ? "Clase local - Emilio" : "Clase local - Leonor",
        join_code: student.joinCode,
      },
    }));
}

export async function listClasses(): Promise<TeacherClassWithCount[]> {
  if (!isSupabaseConfigured) return listSeedClasses();
  const { userId } = await requireTeacher();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, join_code, created_at")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((c: { id: string }) => c.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: studs, error: sErr } = await supabase
      .from("students")
      .select("class_id")
      .in("class_id", ids);
    if (sErr) throw new Error(sErr.message);
    (studs ?? []).forEach((s: { class_id: string }) => {
      counts[s.class_id] = (counts[s.class_id] ?? 0) + 1;
    });
  }
  return ((data ?? []) as TeacherClass[]).map((c) => ({ ...c, student_count: counts[c.id] ?? 0 }));
}

export async function createClass(input: Call<{ name: string }>) {
  const data = z.object({ name: z.string().trim().min(1).max(80) }).parse(input.data);
  if (!isSupabaseConfigured) return createSeedClass(data.name);
  const { userId } = await requireTeacher();
  for (let i = 0; i < 5; i++) {
    const code = makeCode(6);
    const { data: row, error } = await supabase
      .from("classes")
      .insert({ name: data.name, join_code: code, teacher_id: userId })
      .select()
      .single();
    if (!error) return row;
    if (!String(error.message).toLowerCase().includes("join_code")) throw new Error(error.message);
  }
  throw new Error("No se pudo generar un codigo unico, intenta otra vez.");
}

export async function deleteClass(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return deleteSeedClass(data.id);
  const { userId } = await requireTeacher();
  await ensureTeacherOwnsClass(data.id);
  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", data.id)
    .eq("teacher_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getClass(
  input: Call<{ id: string }>,
): Promise<{ class: TeacherClass; students: TeacherStudentWithStats[] }> {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return getSeedClass(data.id);
  const cls = await ensureTeacherOwnsClass(data.id);

  const { data: students, error: e2 } = await supabase
    .from("students")
    .select("id, display_name, student_code, created_at")
    .eq("class_id", data.id)
    .order("display_name");
  if (e2) throw new Error(e2.message);

  const ids = (students ?? []).map((s: { id: string }) => s.id);
  const stats: Record<string, { events: number; lessons: number; lastSeen: string | null }> = {};
  if (ids.length) {
    const { data: ev, error: evErr } = await supabase
      .from("progress_events")
      .select("student_id, lesson_id, event_kind, created_at")
      .in("student_id", ids)
      .order("created_at", { ascending: false });
    if (evErr) throw new Error(evErr.message);
    (ev ?? []).forEach(
      (e: { student_id: string; lesson_id: string; event_kind: string; created_at: string }) => {
        const s = (stats[e.student_id] ??= { events: 0, lessons: 0, lastSeen: null });
        s.events += 1;
        if (!s.lastSeen) s.lastSeen = e.created_at;
      },
    );
    const completed: Record<string, Set<string>> = {};
    (ev ?? []).forEach((e: { student_id: string; lesson_id: string; event_kind: string }) => {
      if (e.event_kind !== "lesson_completed") return;
      (completed[e.student_id] ??= new Set()).add(e.lesson_id);
    });
    Object.entries(completed).forEach(([sid, set]) => {
      if (stats[sid]) stats[sid].lessons = set.size;
    });
  }

  return {
    class: cls as TeacherClass,
    students: ((students ?? []) as TeacherStudent[]).map((s) => ({
      ...s,
      ...(stats[s.id] ?? { events: 0, lessons: 0, lastSeen: null }),
    })),
  };
}

export async function addStudents(input: Call<{ classId: string; names: string[] }>) {
  const data = z
    .object({
      classId: z.string().min(1),
      names: z.array(z.string().trim().min(1).max(60)).min(1).max(50),
    })
    .parse(input.data);
  if (!isSupabaseConfigured) return addSeedStudents(data.classId, data.names);
  await ensureTeacherOwnsClass(data.classId);
  const rows = data.names.map((n) => ({
    class_id: data.classId,
    display_name: n,
    student_code: makeCode(5),
  }));
  const { data: inserted, error } = await supabase.from("students").insert(rows).select();
  if (error) throw new Error(error.message);
  return inserted;
}

export async function deleteStudent(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return deleteSeedStudent(data.id);
  await ensureTeacherOwnsStudent(data.id);
  const { error } = await supabase.from("students").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getStudentProgress(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return getSeedTeacherStudentProgress(data.id);
  const student = await ensureTeacherOwnsStudent(data.id);
  const cls = Array.isArray(student.classes) ? student.classes[0] : student.classes;

  const { data: events, error: e2 } = await supabase
    .from("progress_events")
    .select("id, lesson_id, event_kind, score, total, time_seconds, meta, created_at")
    .eq("student_id", data.id)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (e2) throw new Error(e2.message);

  return {
    student: {
      id: student.id,
      display_name: student.display_name,
      student_code: student.student_code,
      class_id: student.class_id,
    },
    class: cls,
    events: events ?? [],
  };
}

export async function getClassProgress(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return getSeedClassProgress(data.id);
  await ensureTeacherOwnsClass(data.id);
  const { data: students, error: sErr } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", data.id);
  if (sErr) throw new Error(sErr.message);
  const ids = (students ?? []).map((s: { id: string }) => s.id);
  if (ids.length === 0) return { perStudent: [], perLesson: {}, assignments: [] };

  const { data: events, error: eErr } = await supabase
    .from("progress_events")
    .select("student_id, lesson_id, event_kind, score, total, time_seconds, meta, created_at")
    .in("student_id", ids)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (eErr) throw new Error(eErr.message);

  const perStudent: Record<
    string,
    { id: string; name: string; lessons: Set<string>; score: number; total: number; time: number }
  > = {};
  const perLesson: Record<string, { score: number; total: number; completedBy: Set<string> }> = {};
  const latestExercise = new Set<string>();
  (students ?? []).forEach((s: { id: string; display_name: string }) => {
    perStudent[s.id] = {
      id: s.id,
      name: s.display_name,
      lessons: new Set(),
      score: 0,
      total: 0,
      time: 0,
    };
  });
  (events ?? []).forEach(
    (e: {
      student_id: string;
      lesson_id: string;
      event_kind: string;
      score: number | null;
      total: number | null;
      time_seconds: number | null;
      meta: unknown;
    }) => {
      const ps = perStudent[e.student_id];
      if (!ps) return;
      const pl = (perLesson[e.lesson_id] ??= { score: 0, total: 0, completedBy: new Set() });
      if (e.event_kind === "lesson_completed") {
        ps.lessons.add(e.lesson_id);
        pl.completedBy.add(e.student_id);
      }
      if (e.event_kind === "exercise") {
        const key = `${e.student_id}:${e.lesson_id}:${exerciseName(e)}`;
        if (latestExercise.has(key)) return;
        latestExercise.add(key);
        ps.score += e.score ?? 0;
        ps.total += e.total ?? 0;
        pl.score += e.score ?? 0;
        pl.total += e.total ?? 0;
      }
      if (e.event_kind === "time") {
        ps.time += e.time_seconds ?? 0;
      }
    },
  );

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, lesson_id, title, due_at")
    .eq("class_id", data.id);
  const assignmentIds = (assignments ?? []).map((a: { id: string }) => a.id);
  let assignmentRows: Array<{
    assignment_id: string;
    status: string;
    score: number | null;
    total: number | null;
    time_seconds: number | null;
  }> = [];
  if (assignmentIds.length) {
    const { data: rows } = await supabase
      .from("assignment_progress")
      .select("assignment_id, status, score, total, time_seconds")
      .in("assignment_id", assignmentIds);
    assignmentRows = rows ?? [];
  }

  return {
    perStudent: Object.values(perStudent).map((s) => ({
      id: s.id,
      name: s.name,
      lessonsCount: s.lessons.size,
      accuracy: s.total > 0 ? s.score / s.total : null,
      timeSeconds: s.time,
    })),
    perLesson: Object.fromEntries(
      Object.entries(perLesson).map(([k, v]) => [
        k,
        {
          completedBy: v.completedBy.size,
          accuracy: v.total > 0 ? v.score / v.total : null,
        },
      ]),
    ),
    assignments: (assignments ?? []).map(
      (a: { id: string; lesson_id: string; title: string | null; due_at: string | null }) => {
        const rows = assignmentRows.filter((r) => r.assignment_id === a.id);
        const completed = rows.filter(
          (r) => r.status === "completed" || r.status === "late",
        ).length;
        const late = rows.filter((r) => r.status === "late").length;
        const time = rows.reduce((sum, r) => sum + (r.time_seconds ?? 0), 0);
        const scored = rows.filter(
          (r) => typeof r.score === "number" && typeof r.total === "number" && (r.total ?? 0) > 0,
        );
        const score = scored.reduce((sum, r) => sum + (r.score ?? 0), 0);
        const total = scored.reduce((sum, r) => sum + (r.total ?? 0), 0);
        return {
          id: a.id,
          lessonId: a.lesson_id,
          title: a.title,
          dueAt: a.due_at,
          completed,
          late,
          assigned: ids.length,
          averageTimeSeconds: rows.length ? Math.round(time / rows.length) : null,
          accuracy: total > 0 ? score / total : null,
        };
      },
    ),
  };
}

export async function findStudentsByName(input: Call<{ q: string; classId?: string }>) {
  const data = z
    .object({ q: z.string().trim().min(1).max(60), classId: z.string().min(1).optional() })
    .parse(input.data);
  if (!isSupabaseConfigured) return findSeedStudentsByName(data.q, data.classId);
  const { userId } = await requireTeacher();
  let q = supabase
    .from("students")
    .select("id, display_name, student_code, class_id, classes!inner(id, name, teacher_id)")
    .eq("classes.teacher_id", userId)
    .ilike("display_name", `%${data.q}%`)
    .limit(20);
  if (data.classId) q = q.eq("class_id", data.classId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
}
