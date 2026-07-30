// Archived 2026-07-30: these functions authorized every read/write with a
// reusable `student_code` — the exact credential the #385 audit flagged,
// because a class join code alone was enough to obtain one and then replay
// it forever as that child. They have been replaced in the live student flow
// by the scoped, expiring session in src/lib/secure-student-access.ts
// (enterClassWithScopedSession, logProgressWithSession, getProgressWithSession,
// saveLastPageWithSession, getMyAssignmentsWithSession).
//
// Kept here, unused, per this repo's "never delete, archive with a note"
// convention — not wired into any route. Do not re-import these into the
// live student flow.

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type Call<T> = { data: T };

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

/** Step 2 (insecure): student tapped their name — returned a reusable student_code. */
export async function enterClassAsStudent(input: Call<z.infer<typeof enterClassSchema>>) {
  const data = enterClassSchema.parse(input.data);
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

export async function getMyProgress(input: Call<z.infer<typeof myProgressSchema>>) {
  const data = myProgressSchema.parse(input.data);
  const { data: payload, error } = await supabase.rpc("get_student_progress", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });

  if (error) throw new Error(error.message || "No se pudo cargar el progreso.");
  return payload ?? { events: [], lessonProgress: [] };
}

export async function saveLastPage(input: Call<z.infer<typeof lastPageSchema>>) {
  const data = lastPageSchema.parse(input.data);
  const { error } = await supabase.rpc("save_last_page", {
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
    p_lesson_id: data.lessonId,
    p_page: data.page,
  });
  if (error) throw new Error(error.message || "No se pudo guardar la página.");
  return { ok: true };
}

const listMyAssignmentsSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentCode: z.string().trim().min(4).max(10),
});

/** Student session (insecure): list assignments authorized by a reusable student_code. */
export async function listMyAssignments(input: Call<z.infer<typeof listMyAssignmentsSchema>>) {
  const data = listMyAssignmentsSchema.parse(input.data);
  const { data: rows, error } = await supabase.rpc("get_student_assignments", {
    p_class_id: data.classId,
    p_student_id: data.studentId,
    p_student_code: data.studentCode.toUpperCase(),
  });
  if (error) throw new Error(error.message || "No se pudieron cargar las tareas.");
  return rows ?? [];
}
