import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Call<T> = { data: T };

export async function logLessonVerification(
  input: Call<{
    lessonNumber: number;
    studentId: string;
    teacherId: string;
    verified: boolean;
  }>,
) {
  const data = z
    .object({
      lessonNumber: z.number().int().min(7).max(24),
      studentId: z.string().uuid(),
      teacherId: z.string().uuid(),
      verified: z.boolean(),
    })
    .parse(input.data);

  const { data: result, error } = await supabase
    .from("lesson_verifications")
    .upsert(
      {
        lesson_number: data.lessonNumber,
        student_id: data.studentId,
        teacher_id: data.teacherId,
        verified: data.verified,
        timestamp: new Date().toISOString(),
      },
      { onConflict: "lesson_number, student_id" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result as unknown as { verified: boolean; lesson_number: number; student_id: string };
}

export async function getLessonVerification(
  input: Call<{
    lessonNumber: number;
    studentId: string;
  }>,
) {
  const data = z
    .object({
      lessonNumber: z.number().int(),
      studentId: z.string().uuid(),
    })
    .parse(input.data);

  const { data: result, error } = await supabase
    .from("lesson_verifications")
    .select("*")
    .eq("lesson_number", data.lessonNumber)
    .eq("student_id", data.studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return result as unknown as {
    verified: boolean;
    lesson_number: number;
    student_id: string;
  } | null;
}

export async function getAllStudentVerifications(
  input: Call<{
    studentId: string;
  }>,
) {
  const data = z
    .object({
      studentId: z.string().uuid(),
    })
    .parse(input.data);

  const { data: result, error } = await supabase
    .from("lesson_verifications")
    .select("*")
    .eq("student_id", data.studentId);

  if (error) throw new Error(error.message);
  return result as unknown as Array<{
    verified: boolean;
    lesson_number: number;
    student_id: string;
  }>;
}
