import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
  const data = z.object({ classId: z.string().uuid() }).parse(input.data);
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
      classId: z.string().uuid(),
      lessonId: z.string().min(1).max(50),
      title: z.string().trim().max(120).optional(),
      dueAt: z.string().datetime().optional().nullable(),
      timeLimitSeconds: z.number().int().min(30).max(3600).optional().nullable(),
    })
    .parse(input.data);

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
  if (error) {
    if (error.code === "23505") {
      throw new Error("Esta clase ya tiene una tarea asignada para esta lección.");
    }
    throw new Error(error.message);
  }
  return row;
}

/** Teacher: delete assignment. */
export async function deleteAssignment(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
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

// Student session: listing a student's own assignments moved to
// getMyAssignmentsWithSession in src/lib/secure-student-access.ts, which
// authorizes with the scoped session token instead of the reusable
// student_code this used to take. See
// src/_archive/insecure-student-code-rpcs.ts for the retired version.
