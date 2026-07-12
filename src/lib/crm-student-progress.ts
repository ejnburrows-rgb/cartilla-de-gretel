import { getStudentProgress } from "@/lib/teacher.functions";
import { getSeedTeacherStudentProgress } from "@/lib/seed-data";
import type { LessonProgressRow } from "@/lib/progress-calculation";

export interface CrmEventRow {
  id?: string;
  event_kind: string;
  lesson_id: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  created_at: string;
}

export interface CrmStudentProgress {
  student: {
    id: string;
    display_name: string;
    student_code: string;
    teacher_notes: string | null;
  };
  events: CrmEventRow[];
  lessonProgress: LessonProgressRow[];
}

/** One shared fetch + normalizer for the teacher-side "view a student's
 * progress" data, used by the Estudiante, Lección, and Reporte para
 * Familias drill-down pages — both the real Supabase path and the local
 * demo/seed path get mapped into this exact shape so the three pages never
 * have to branch on which backend answered. */
export async function fetchCrmStudentProgress(
  studentId: string,
  isSeed: boolean,
): Promise<CrmStudentProgress> {
  if (isSeed) {
    const raw = getSeedTeacherStudentProgress(studentId);
    return {
      student: {
        id: raw.student.id,
        display_name: raw.student.display_name,
        student_code: raw.student.student_code,
        teacher_notes: raw.student.teacher_notes ?? null,
      },
      events: raw.events,
      lessonProgress: raw.lessonProgress,
    };
  }
  const raw = await getStudentProgress({ data: { id: studentId } });
  return {
    student: {
      id: raw.student.id,
      display_name: raw.student.display_name,
      student_code: raw.student.student_code,
      teacher_notes: raw.student.teacher_notes ?? null,
    },
    events: raw.events,
    lessonProgress: raw.lessonProgress,
  };
}
