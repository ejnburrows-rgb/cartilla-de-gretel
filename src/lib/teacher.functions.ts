import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  summarizeStudentProgress,
  checkNeedsAttention,
  type LessonProgressRow,
} from "@/lib/progress-calculation";

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
  archived_at: string | null;
  teacher_notes: string | null;
};

type TeacherStudentWithStats = TeacherStudent & {
  events: number;
  lessons: number;
  lastSeen: string | null;
  completionPercent: number;
};

type TeacherStudentWithClass = {
  id: string;
  display_name: string;
  student_code: string;
  class_id: string;
  archived_at: string | null;
  teacher_notes: string | null;
  classes: TeacherClass | TeacherClass[];
};

/** Fetches student_lesson_progress for a set of student ids and runs each
 * student's rows through the one shared progress-calculation module — the
 * same source every surface (roster, dashboard, student detail) reads, so
 * "lessons completed" never disagrees between screens. */
async function fetchProgressStats(
  studentIds: string[],
): Promise<
  Record<string, { lessons: number; lastSeen: string | null; completionPercent: number }>
> {
  const stats: Record<
    string,
    { lessons: number; lastSeen: string | null; completionPercent: number }
  > = {};
  if (studentIds.length === 0) return stats;

  const { data: rows, error } = await supabase
    .from("student_lesson_progress")
    .select("student_id, lesson_id, status, completed_at, last_active_at, last_page")
    .in("student_id", studentIds);
  if (error) throw new Error(error.message);

  const byStudent: Record<string, LessonProgressRow[]> = {};
  (rows ?? []).forEach((r) => {
    (byStudent[r.student_id] ??= []).push(r);
  });
  for (const id of studentIds) {
    const summary = summarizeStudentProgress(byStudent[id] ?? []);
    stats[id] = {
      lessons: summary.completedLessons,
      lastSeen: summary.lastActiveAt,
      completionPercent: summary.completionPercent,
    };
  }
  return stats;
}

function makeCode(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

async function requireTeacher(): Promise<TeacherCtx> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Debes iniciar sesión como maestro.");
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
      "id, display_name, student_code, class_id, archived_at, teacher_notes, classes!inner(id, name, join_code, teacher_id)",
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

/** Real exercise-kind prefixes recorded by the interactive page components
 * (each fires with a per-region-id suffix, e.g. "picture_grid_p1-grid1") —
 * bucket by kind for a per-student, per-exercise-type breakdown. */
const EXERCISE_KIND_PREFIXES = [
  "picture_grid",
  "vowel_pick_one",
  "vowel_match_all",
  "syllable_match",
  "fill_in_blank",
  "vowel_line_match",
  "workbook_letter_trace",
  "drag_syllable_order",
] as const;

function exerciseKind(exercise: string): string {
  const prefix = EXERCISE_KIND_PREFIXES.find((p) => exercise === p || exercise.startsWith(`${p}_`));
  return prefix ?? exercise;
}

export async function listClasses(): Promise<TeacherClassWithCount[]> {
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
  throw new Error("No se pudo generar un código único, intenta otra vez.");
}

export async function deleteClass(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
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
  input: Call<{ id: string; includeArchived?: boolean }>,
): Promise<{ class: TeacherClass; students: TeacherStudentWithStats[] }> {
  const data = z
    .object({ id: z.string().uuid(), includeArchived: z.boolean().optional() })
    .parse(input.data);
  const cls = await ensureTeacherOwnsClass(data.id);

  let q = supabase
    .from("students")
    .select("id, display_name, student_code, created_at, archived_at, teacher_notes")
    .eq("class_id", data.id)
    .order("display_name");
  if (!data.includeArchived) q = q.is("archived_at", null);
  const { data: students, error: e2 } = await q;
  if (e2) throw new Error(e2.message);

  const ids = (students ?? []).map((s: { id: string }) => s.id);
  const eventCounts: Record<string, number> = {};
  if (ids.length) {
    const { data: ev, error: evErr } = await supabase
      .from("progress_events")
      .select("student_id")
      .in("student_id", ids);
    if (evErr) throw new Error(evErr.message);
    (ev ?? []).forEach((e: { student_id: string }) => {
      eventCounts[e.student_id] = (eventCounts[e.student_id] ?? 0) + 1;
    });
  }
  const progressStats = await fetchProgressStats(ids);

  return {
    class: cls as TeacherClass,
    students: ((students ?? []) as TeacherStudent[]).map((s) => ({
      ...s,
      events: eventCounts[s.id] ?? 0,
      lessons: progressStats[s.id]?.lessons ?? 0,
      lastSeen: progressStats[s.id]?.lastSeen ?? null,
      completionPercent: progressStats[s.id]?.completionPercent ?? 0,
    })),
  };
}

export async function addStudents(input: Call<{ classId: string; names: string[] }>) {
  const data = z
    .object({
      classId: z.string().uuid(),
      names: z.array(z.string().trim().min(1).max(60)).min(1).max(50),
    })
    .parse(input.data);
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
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsStudent(data.id);
  const { error } = await supabase.from("students").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Rename a student and/or update the teacher's private notes on them. */
export async function updateStudent(
  input: Call<{ id: string; displayName?: string; teacherNotes?: string | null }>,
) {
  const data = z
    .object({
      id: z.string().uuid(),
      displayName: z.string().trim().min(1).max(60).optional(),
      teacherNotes: z.string().trim().max(2000).nullable().optional(),
    })
    .parse(input.data);
  await ensureTeacherOwnsStudent(data.id);

  const update: { display_name?: string; teacher_notes?: string | null } = {};
  if (data.displayName !== undefined) update.display_name = data.displayName;
  if (data.teacherNotes !== undefined) update.teacher_notes = data.teacherNotes;
  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await supabase.from("students").update(update).eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Archive (soft-delete) a student — hides them from the roster/dashboard
 * by default without destroying their progress history. */
export async function archiveStudent(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsStudent(data.id);
  const { error } = await supabase
    .from("students")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function restoreStudent(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsStudent(data.id);
  const { error } = await supabase.from("students").update({ archived_at: null }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getStudentProgress(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  const student = await ensureTeacherOwnsStudent(data.id);
  const cls = Array.isArray(student.classes) ? student.classes[0] : student.classes;

  const { data: events, error: e2 } = await supabase
    .from("progress_events")
    .select("id, lesson_id, event_kind, score, total, time_seconds, meta, created_at")
    .eq("student_id", data.id)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (e2) throw new Error(e2.message);

  const { data: lessonRows, error: e3 } = await supabase
    .from("student_lesson_progress")
    .select("lesson_id, status, completed_at, last_active_at, last_page")
    .eq("student_id", data.id);
  if (e3) throw new Error(e3.message);

  const summary = summarizeStudentProgress(lessonRows ?? []);

  return {
    student: {
      id: student.id,
      display_name: student.display_name,
      student_code: student.student_code,
      class_id: student.class_id,
      archived_at: student.archived_at,
      teacher_notes: student.teacher_notes,
    },
    class: cls,
    events: events ?? [],
    lessonProgress: lessonRows ?? [],
    summary,
  };
}

/** Aggregated progress for a whole class — for the teacher class chart. */
export async function getClassProgress(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsClass(data.id);
  const { data: students, error: sErr } = await supabase
    .from("students")
    .select("id, display_name")
    .eq("class_id", data.id);
  if (sErr) throw new Error(sErr.message);
  const ids = (students ?? []).map((s: { id: string }) => s.id);
  if (ids.length === 0) {
    return {
      perStudent: [],
      perLesson: {},
      perStudentExercise: {},
      assignments: [],
      recentEvents: [],
      attentionByStudent: {},
    };
  }

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
  const recentAccuraciesByStudent: Record<string, number[]> = {};
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
    recentAccuraciesByStudent[s.id] = [];
  });
  const recentEvents: Array<{
    studentId: string;
    studentName: string;
    lessonId: string;
    eventKind: string;
    score: number | null;
    total: number | null;
    createdAt: string;
  }> = [];
  (events ?? []).forEach(
    (e: {
      student_id: string;
      lesson_id: string;
      event_kind: string;
      score: number | null;
      total: number | null;
      time_seconds: number | null;
      meta: unknown;
      created_at: string;
    }) => {
      const ps = perStudent[e.student_id];
      if (!ps) return;
      if (recentEvents.length < 20) {
        recentEvents.push({
          studentId: e.student_id,
          studentName: ps.name,
          lessonId: e.lesson_id,
          eventKind: e.event_kind,
          score: e.score,
          total: e.total,
          createdAt: e.created_at,
        });
      }
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
        const bucket = recentAccuraciesByStudent[e.student_id];
        if (bucket && (e.total ?? 0) > 0 && bucket.length < 5) {
          bucket.push((e.score ?? 0) / (e.total ?? 1));
        }
      }
      if (e.event_kind === "time") {
        ps.time += e.time_seconds ?? 0;
      }
    },
  );

  const { data: exerciseSummaries, error: exErr } = await supabase
    .from("exercise_attempt_summary")
    .select("student_id, exercise, hits, attempts")
    .in("student_id", ids);
  if (exErr) throw new Error(exErr.message);

  const perStudentExercise: Record<string, Record<string, { hits: number; attempts: number }>> = {};
  (students ?? []).forEach((s: { id: string }) => {
    perStudentExercise[s.id] = {};
  });
  (exerciseSummaries ?? []).forEach(
    (row: { student_id: string; exercise: string; hits: number; attempts: number }) => {
      const kind = exerciseKind(row.exercise);
      const bucket = (perStudentExercise[row.student_id] ??= {});
      const cell = (bucket[kind] ??= { hits: 0, attempts: 0 });
      cell.hits += row.hits ?? 0;
      cell.attempts += row.attempts ?? 0;
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

  const progressStats = await fetchProgressStats(ids);
  const attentionByStudent: Record<string, { flagged: boolean; reasons: string[] }> = {};
  for (const id of ids) {
    attentionByStudent[id] = checkNeedsAttention({
      lastActiveAt: progressStats[id]?.lastSeen ?? null,
      recentAccuracies: recentAccuraciesByStudent[id] ?? [],
    });
  }

  return {
    recentEvents,
    attentionByStudent,
    perStudent: Object.values(perStudent).map((s) => ({
      id: s.id,
      name: s.name,
      lessonsCount: s.lessons.size,
      completedLessonIds: Array.from(s.lessons),
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
    perStudentExercise,
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

/** Search students by name within the teacher's classes — for "código olvidado". */
export async function findStudentsByName(input: Call<{ q: string; classId?: string }>) {
  const data = z
    .object({ q: z.string().trim().min(1).max(60), classId: z.string().uuid().optional() })
    .parse(input.data);
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

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Real per-day event counts for a class over the last 7 days — powers the
 * dashboard's "Actividad reciente" chart with actual progress_events rows
 * instead of a hardcoded mock series. */
export async function getWeeklyActivity(
  input: Call<{ classId: string }>,
): Promise<Array<{ label: string; count: number }>> {
  const data = z.object({ classId: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsClass(data.classId);

  const { data: students, error: sErr } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", data.classId);
  if (sErr) throw new Error(sErr.message);
  const ids = (students ?? []).map((s: { id: string }) => s.id);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const counts = new Array(7).fill(0) as number[];
  if (ids.length > 0) {
    const { data: events, error } = await supabase
      .from("progress_events")
      .select("created_at")
      .in("student_id", ids)
      .gte("created_at", since.toISOString());
    if (error) throw new Error(error.message);
    (events ?? []).forEach((e: { created_at: string }) => {
      const diffDays = Math.floor((new Date(e.created_at).getTime() - since.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
    });
  }

  return counts.map((count, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    return { label: WEEKDAY_LABELS[d.getDay()], count };
  });
}

/** Get all students across all classes for the current teacher. */
export async function getAllTeacherStudents(
  input: Call<{ includeArchived?: boolean } | Record<string, never>>,
) {
  const opts = z.object({ includeArchived: z.boolean().optional() }).parse(input.data ?? {});
  const { userId } = await requireTeacher();
  let q = supabase
    .from("students")
    .select(
      "id, display_name, student_code, created_at, class_id, archived_at, teacher_notes, classes!inner(teacher_id)",
    )
    .eq("classes.teacher_id", userId);
  if (!opts.includeArchived) q = q.is("archived_at", null);
  const { data: students, error: sErr } = await q;
  if (sErr) throw new Error(sErr.message);

  const ids = (students ?? []).map((s: { id: string }) => s.id);
  const eventCounts: Record<string, number> = {};
  if (ids.length) {
    const { data: ev, error: evErr } = await supabase
      .from("progress_events")
      .select("student_id")
      .in("student_id", ids);
    if (evErr) throw new Error(evErr.message);
    (ev ?? []).forEach((e: { student_id: string }) => {
      eventCounts[e.student_id] = (eventCounts[e.student_id] ?? 0) + 1;
    });
  }
  const progressStats = await fetchProgressStats(ids);

  return ((students ?? []) as TeacherStudent[]).map((s) => ({
    ...s,
    events: eventCounts[s.id] ?? 0,
    lessons: progressStats[s.id]?.lessons ?? 0,
    lastSeen: progressStats[s.id]?.lastSeen ?? null,
    completionPercent: progressStats[s.id]?.completionPercent ?? 0,
  }));
}
