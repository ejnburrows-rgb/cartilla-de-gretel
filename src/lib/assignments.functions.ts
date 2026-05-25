import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  createSeedAssignment,
  deleteSeedAssignment,
  listSeedAssignments,
  listSeedStudentAssignments,
} from "@/lib/seed-data";

type Call<T> = { data: T };
type AssignmentRow = {
  id: string;
  class_id: string;
  lesson_id: string;
  title: string | null;
  due_at: string | null;
  time_limit_seconds: number | null;
  created_at: string;
};

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Debes iniciar sesión como maestro.");
  return data.user;
}

async function ensureTeacherOwnsClass(classId: string) {
  const user = await requireUser();
  const { data: cls, error } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!cls) throw new Error("Clase no encontrada o sin permiso.");
}

/** Teacher: list assignments for a class they own. */
export async function listAssignments(input: Call<{ classId: string }>) {
  const data = z.object({ classId: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return listSeedAssignments(data.classId) as AssignmentRow[];
  await ensureTeacherOwnsClass(data.classId);
  const { data: rows, error } = await supabase
    .from("assignments")
    .select("id, class_id, lesson_id, title, due_at, time_limit_seconds, created_at")
    .eq("class_id", data.classId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (rows ?? []) as AssignmentRow[];
}

/** Teacher: create assignment. */
export async function createAssignment(
  input: Call<{
    classId: string;
    lessonId: string;
    title?: string;
    dueAt?: string | null;
    timeLimitSeconds?: number | null;
  }>,
) {
  const data = z
    .object({
      classId: z.string().min(1),
      lessonId: z.string().min(1).max(50),
      title: z.string().trim().max(120).optional(),
      dueAt: z.string().datetime().optional().nullable(),
      timeLimitSeconds: z.number().int().min(30).max(3600).optional().nullable(),
    })
    .parse(input.data);

  if (!isSupabaseConfigured)
    return createSeedAssignment({
      classId: data.classId,
      lessonId: data.lessonId,
      title: data.title,
      dueAt: data.dueAt,
      timeLimitSeconds: data.timeLimitSeconds,
    });

  await ensureTeacherOwnsClass(data.classId);
  const { data: row, error } = await supabase
    .from("assignments")
    .insert({
      class_id: data.classId,
      lesson_id: data.lessonId,
      title: data.title || null,
      due_at: data.dueAt || null,
      time_limit_seconds: data.timeLimitSeconds || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

/** Teacher: delete assignment. */
export async function deleteAssignment(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().min(1) }).parse(input.data);
  if (!isSupabaseConfigured) return deleteSeedAssignment(data.id);
  const { data: assignment, error: readErr } = await supabase
    .from("assignments")
    .select("id, class_id")
    .eq("id", data.id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!assignment) throw new Error("Tarea no encontrada.");
  await ensureTeacherOwnsClass(assignment.class_id);
  const { error } = await supabase.from("assignments").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Student session: list assignments only after validating the student's personal class code. */
export async function listMyAssignments(
  input: Call<{ classId: string; studentId: string; studentCode: string }>,
) {
  const data = z
    .object({
      classId: z.string().min(1),
      studentId: z.string().min(1),
      studentCode: z.string().trim().min(4).max(10),
    })
    .parse(input.data);

  if (!isSupabaseConfigured)
    return listSeedStudentAssignments({
      classId: data.classId,
      studentId: data.studentId,
      studentCode: data.studentCode,
    });

  const { data: rows, error } = await supabase.rpc("get_student_assignments", {
    p_class_id: data.classId,
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });
  if (error) throw new Error(error.message || "No se pudieron cargar las tareas.");
  return rows ?? [];
}
