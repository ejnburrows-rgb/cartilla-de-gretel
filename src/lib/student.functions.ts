import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type Call<T> = { data: T };
const joinSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentCode: z.string().trim().min(4).max(10),
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

export async function joinClass(input: Call<z.infer<typeof joinSchema>>) {
  const data = joinSchema.parse(input.data);
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

export async function logProgress(input: Call<z.infer<typeof progressSchema>>) {
  const data = progressSchema.parse(input.data);
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
  const { data: payload, error } = await supabase.rpc("get_student_progress", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });

  if (error) throw new Error(error.message || "No se pudo cargar el progreso.");
  return payload ?? { events: [], lessonProgress: [] };
}
