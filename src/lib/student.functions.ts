import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

type Call<T> = { data: T };

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

const joinSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentCode: z.string().trim().min(4).max(10),
});

const listClassStudentsSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
});

const enterClassSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentId: z.string().uuid(),
});

const progressSchema = z.object({
  studentId: z.string().uuid(),
  studentCode: z.string().trim().min(4).max(10),
  lessonId: z.string().min(1).max(50),
  kind: z.enum(["lesson_completed", "exercise", "time", "badge", "level"]),
  score: z.number().int().min(0).max(10000).optional(),
  total: z.number().int().min(0).max(10000).optional(),
  timeSeconds: z.number().int().min(0).max(86400).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const myProgressSchema = z.object({
  studentId: z.string().uuid(),
  studentCode: z.string().trim().min(4).max(10),
});

const lastPageSchema = z.object({
  studentId: z.string().uuid(),
  studentCode: z.string().trim().min(4).max(10),
  lessonId: z.string().min(1).max(50),
  page: z.number().int().min(0).max(1000),
});

export async function joinClass(input: Call<z.infer<typeof joinSchema>>) {
  const data = joinSchema.parse(input.data);
  const supabase = await getSupabase();
  const { data: row, error } = await supabase
    .rpc("join_class", {
      p_join_code: data.joinCode.toUpperCase(),
      p_student_code: data.studentCode.toUpperCase(),
    })
    .single();

  if (error) throw new Error(error.message || "No se pudo unir a la clase.");
  if (!row) throw new Error("Código de clase o estudiante inválido.");

  const result = row as {
    student_id: string;
    student_name: string;
    student_code: string;
    class_id: string;
    class_name: string;
  };

  return {
    studentId: result.student_id,
    studentName: result.student_name,
    studentCode: result.student_code,
    classId: result.class_id,
    className: result.class_name,
  };
}

/** Step 1 of the class-code + tap-your-name flow: list the real roster for
 * a class by join code only — no student code required or exposed. */
export async function listClassStudents(input: Call<z.infer<typeof listClassStudentsSchema>>) {
  const data = listClassStudentsSchema.parse(input.data);
  const supabase = await getSupabase();
  const { data: rows, error } = await supabase.rpc("list_class_students", {
    p_join_code: data.joinCode.toUpperCase(),
  });
  if (error) throw new Error(error.message || "No se pudo cargar la clase.");

  const results = (rows ?? []) as Array<{ student_id: string; display_name: string }>;
  if (results.length === 0) throw new Error("Código de clase inválido.");

  return results.map((r) => ({ studentId: r.student_id, displayName: r.display_name }));
}

/** Step 2: student tapped their name — enter the class session, no password
 * or typed code needed beyond the class join code from step 1. */
export async function enterClassAsStudent(input: Call<z.infer<typeof enterClassSchema>>) {
  const data = enterClassSchema.parse(input.data);
  const supabase = await getSupabase();
  const { data: row, error } = await supabase
    .rpc("enter_class_as_student", {
      p_join_code: data.joinCode.toUpperCase(),
      p_student_id: data.studentId,
    })
    .single();

  if (error) throw new Error(error.message || "No se pudo entrar a la clase.");
  if (!row) throw new Error("Código de clase o estudiante inválido.");

  const result = row as {
    student_id: string;
    student_name: string;
    student_code: string;
    class_id: string;
    class_name: string;
  };

  return {
    studentId: result.student_id,
    studentName: result.student_name,
    studentCode: result.student_code,
    classId: result.class_id,
    className: result.class_name,
  };
}

export async function logProgress(input: Call<z.infer<typeof progressSchema>>) {
  const data = progressSchema.parse(input.data);
  const supabase = await getSupabase();
  const { error } = await supabase.rpc("log_student_progress", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
    p_lesson_id: data.lessonId,
    p_event_kind: data.kind,
    p_score: data.score ?? null,
    p_total: data.total ?? null,
    p_time_seconds: data.timeSeconds ?? null,
    p_meta: (data.meta ?? null) as Json | null,
  });
  if (error) throw new Error(error.message || "No se pudo guardar el progreso.");
  return { ok: true };
}

/** Student fetches their own progress using their session credentials. */
export async function getMyProgress(input: Call<z.infer<typeof myProgressSchema>>) {
  const data = myProgressSchema.parse(input.data);
  const supabase = await getSupabase();
  const { data: payload, error } = await supabase.rpc("get_student_progress", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });

  if (error) throw new Error(error.message || "No se pudo cargar el progreso.");
  return payload ?? { events: [], lessonProgress: [] };
}

/** Persists the reader's current page for this student/lesson, so reopening
 * the same lesson later resumes where they left off instead of restarting
 * at page 0. Fire-and-forget from the caller's perspective is fine — the
 * next `getMyProgress` call is always the source of truth for resume. */
export async function saveLastPage(input: Call<z.infer<typeof lastPageSchema>>) {
  const data = lastPageSchema.parse(input.data);
  const supabase = await getSupabase();
  const { error } = await supabase.rpc("save_last_page", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
    p_lesson_id: data.lessonId,
    p_page: data.page,
  });
  if (error) throw new Error(error.message || "No se pudo guardar la página.");
  return { ok: true };
}
