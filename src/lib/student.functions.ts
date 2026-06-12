import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { joinSeedClass, logSeedProgress, getSeedStudentProgress } from "@/lib/seed-data";

type Call<T> = { data: T };
const joinSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentCode: z.string().trim().min(4).max(10),
});

const progressSchema = z.object({
  studentId: z.string().min(1),
  studentCode: z.string().trim().min(4).max(10),
  lessonId: z.string().min(1).max(50),
  kind: z.enum(["lesson_completed", "exercise", "time", "badge", "level"]),
  score: z.number().int().min(0).max(10000).optional(),
  total: z.number().int().min(0).max(10000).optional(),
  timeSeconds: z.number().int().min(0).max(86400).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const myProgressSchema = z.object({
  studentId: z.string().min(1),
  studentCode: z.string().trim().min(4).max(10),
});

export async function joinClass(input: Call<z.infer<typeof joinSchema>>) {
  const data = joinSchema.parse(input.data);
  try {
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
  } catch (err) {
    console.warn("Supabase joinClass failed, trying offline/local fallback:", err);
    try {
      const res = joinSeedClass(data.joinCode, data.studentCode);
      return {
        ...res,
        isLocalDemo: true,
      };
    } catch (seedErr) {
      throw new Error(
        err instanceof Error && err.message.includes("Failed to fetch")
          ? "No se pudo conectar al servidor."
          : (seedErr instanceof Error ? seedErr.message : "Código de clase o estudiante inválido.")
      );
    }
  }
}

export async function logProgress(input: Call<z.infer<typeof progressSchema>>) {
  const data = progressSchema.parse(input.data);
  try {
    if (data.studentId.startsWith("seed-")) {
      return logSeedProgress({
        studentId: data.studentId,
        lessonId: data.lessonId,
        kind: data.kind,
        score: data.score,
        total: data.total,
        timeSeconds: data.timeSeconds,
        meta: data.meta as Record<string, unknown> | undefined,
      });
    }

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
  } catch (err) {
    console.warn("Supabase logProgress failed, trying offline/local fallback:", err);
    try {
      return logSeedProgress({
        studentId: data.studentId,
        lessonId: data.lessonId,
        kind: data.kind,
        score: data.score,
        total: data.total,
        timeSeconds: data.timeSeconds,
        meta: data.meta as Record<string, unknown> | undefined,
      });
    } catch (seedErr) {
      throw err;
    }
  }
}

/** Student fetches their own progress using their session credentials. */
export async function getMyProgress(input: Call<z.infer<typeof myProgressSchema>>) {
  const data = myProgressSchema.parse(input.data);
  try {
    if (data.studentId.startsWith("seed-")) {
      const progress = getSeedStudentProgress(data.studentId);
      return {
        student: progress.student,
        class: progress.class,
        events: progress.events.map((e) => ({
          id: e.id,
          lesson_id: e.lesson_id,
          event_kind: e.event_kind,
          score: e.score,
          total: e.total,
          time_seconds: e.time_seconds,
          meta: e.meta,
          created_at: e.created_at,
        })),
        lessonProgress: progress.lessonProgress,
      };
    }

    const { data: payload, error } = await supabase.rpc("get_student_progress", {
      p_student_id: data.studentId,
      p_student_code: data.studentCode.toUpperCase(),
    });

    if (error) throw new Error(error.message || "No se pudo cargar el progreso.");
    return payload ?? { events: [], lessonProgress: [] };
  } catch (err) {
    console.warn("Supabase getMyProgress failed, trying offline/local fallback:", err);
    try {
      const progress = getSeedStudentProgress(data.studentId);
      return {
        student: progress.student,
        class: progress.class,
        events: progress.events.map((e) => ({
          id: e.id,
          lesson_id: e.lesson_id,
          event_kind: e.event_kind,
          score: e.score,
          total: e.total,
          time_seconds: e.time_seconds,
          meta: e.meta,
          created_at: e.created_at,
        })),
        lessonProgress: progress.lessonProgress,
      };
    } catch (seedErr) {
      throw err;
    }
  }
}
