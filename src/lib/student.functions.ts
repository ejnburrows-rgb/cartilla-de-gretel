// Session-scoped reads/writes (enter class, log/get progress, save last page)
// live in src/lib/secure-student-access.ts, which authorizes with a
// short-lived session token instead of the reusable student_code these
// functions used to take. See src/_archive/insecure-student-code-rpcs.ts for
// the retired versions.

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Call<T> = { data: T };
const joinSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentCode: z.string().trim().min(4).max(10),
});

const listClassStudentsSchema = z.object({
  joinCode: z.string().trim().min(4).max(10),
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

/** Step 1 of the class-code + tap-your-name flow: list the real roster for
 * a class by join code only — no student code required or exposed. */
export async function listClassStudents(input: Call<z.infer<typeof listClassStudentsSchema>>) {
  const data = listClassStudentsSchema.parse(input.data);
  const { data: rows, error } = await supabase.rpc("list_class_students", {
    p_join_code: data.joinCode.toUpperCase(),
  });
  if (error) throw new Error(error.message || "No se pudo cargar la clase.");

  const results = (rows ?? []) as Array<{ student_id: string; display_name: string }>;
  if (results.length === 0) throw new Error("Código de clase inválido.");

  return results.map((r) => ({ studentId: r.student_id, displayName: r.display_name }));
}
