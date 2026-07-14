// folder-assignments.functions.ts — teacher assigns a real activity from
// one of the 5 guide folders (Guía del profesor, Tablas silábicas y de
// vocales, Tareas para el hogar, Evaluaciones, Poemas y audio) to one
// student, a set of selected students, or the whole class. Backed by the
// additive `folder_assignments` table (supabase/migrations/
// 20260710132007_folder_assignments.sql) — never touches any existing table.
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Call<T> = { data: T };

export type FolderKey = "guia" | "tablas" | "tareas" | "evaluaciones" | "poemas";

export interface FolderAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  folder_key: FolderKey;
  lesson_id: string;
  activity_label: string;
  target_scope: "class" | "students";
  student_ids: string[] | null;
  created_at: string;
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Debes iniciar sesión como maestro.");
  return data.user;
}

async function ensureTeacherOwnsClass(classId: string, userId: string) {
  const { data: cls, error } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!cls) throw new Error("Clase no encontrada o sin permiso.");
}

const createSchema = z
  .object({
    classId: z.string().uuid(),
    folderKey: z.enum(["guia", "tablas", "tareas", "evaluaciones", "poemas"]),
    lessonId: z.string().min(1).max(10),
    activityLabel: z.string().trim().min(1).max(200),
    targetScope: z.enum(["class", "students"]),
    studentIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (d) => (d.targetScope === "class" ? true : !!d.studentIds && d.studentIds.length > 0),
    { message: "Selecciona al menos un estudiante." },
  );

/** Teacher: assign a folder activity to the whole class or selected students. */
export async function createFolderAssignment(input: Call<z.infer<typeof createSchema>>) {
  const data = createSchema.parse(input.data);
  const user = await requireUser();
  await ensureTeacherOwnsClass(data.classId, user.id);

  const { data: row, error } = await supabase
    .from("folder_assignments")
    .insert({
      class_id: data.classId,
      teacher_id: user.id,
      folder_key: data.folderKey,
      lesson_id: data.lessonId,
      activity_label: data.activityLabel,
      target_scope: data.targetScope,
      student_ids: data.targetScope === "students" ? data.studentIds : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as FolderAssignment;
}

/** Teacher: list every folder assignment for a class they own. */
export async function listFolderAssignments(input: Call<{ classId: string }>) {
  const data = z.object({ classId: z.string().uuid() }).parse(input.data);
  const user = await requireUser();
  await ensureTeacherOwnsClass(data.classId, user.id);

  const { data: rows, error } = await supabase
    .from("folder_assignments")
    .select("*")
    .eq("class_id", data.classId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (rows ?? []) as FolderAssignment[];
}

/** Teacher: remove a folder assignment. */
export async function deleteFolderAssignment(input: Call<{ id: string }>) {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  const user = await requireUser();
  const { data: row, error: readErr } = await supabase
    .from("folder_assignments")
    .select("id, class_id")
    .eq("id", data.id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Tarea no encontrada.");
  await ensureTeacherOwnsClass(row.class_id, user.id);
  const { error } = await supabase.from("folder_assignments").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Student session: list folder assignments that actually target them. */
export async function getMyFolderAssignments(
  input: Call<{ classId: string; studentId: string; studentCode: string }>,
) {
  const data = z
    .object({
      classId: z.string().uuid(),
      studentId: z.string().uuid(),
      studentCode: z.string().trim().min(4).max(10),
    })
    .parse(input.data);

  const { data: rows, error } = await supabase.rpc("get_student_folder_assignments", {
    p_class_id: data.classId,
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });
  if (error) throw new Error(error.message || "No se pudieron cargar las tareas asignadas.");
  return (rows ?? []) as FolderAssignment[];
}
