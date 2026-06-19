import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Call<T> = { data: T };

type TeacherCtx = {
  userId: string;
};

async function requireTeacher(): Promise<TeacherCtx> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Debes iniciar sesión como maestro.");
  return { userId: data.user.id };
}

async function ensureTeacherOwnsStudent(studentId: string) {
  const { userId } = await requireTeacher();
  const { data: student, error } = await supabase
    .from("students")
    .select("id, classes!inner(teacher_id)")
    .eq("id", studentId)
    .eq("classes.teacher_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!student) throw new Error("Alumno no encontrado o sin permiso.");
  return { userId };
}

export type StudentNote = {
  id: string;
  student_id: string;
  teacher_id: string;
  body: string;
  created_at: string;
};

export async function listStudentNotes(input: Call<{ studentId: string }>): Promise<StudentNote[]> {
  const data = z.object({ studentId: z.string().uuid() }).parse(input.data);
  await ensureTeacherOwnsStudent(data.studentId);
  const { data: rows, error } = await supabase
    .from("student_notes")
    .select("id, student_id, teacher_id, body, created_at")
    .eq("student_id", data.studentId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return rows ?? [];
}

export async function addStudentNote(
  input: Call<{ studentId: string; body: string }>,
): Promise<StudentNote> {
  const data = z
    .object({ studentId: z.string().uuid(), body: z.string().trim().min(1).max(2000) })
    .parse(input.data);
  const { userId } = await ensureTeacherOwnsStudent(data.studentId);
  const { data: row, error } = await supabase
    .from("student_notes")
    .insert({ student_id: data.studentId, teacher_id: userId, body: data.body })
    .select("id, student_id, teacher_id, body, created_at")
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteStudentNote(input: Call<{ id: string }>): Promise<{ ok: true }> {
  const data = z.object({ id: z.string().uuid() }).parse(input.data);
  const { userId } = await requireTeacher();
  const { error } = await supabase
    .from("student_notes")
    .delete()
    .eq("id", data.id)
    .eq("teacher_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
