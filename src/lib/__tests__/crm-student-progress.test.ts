import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCrmStudentProgress } from "../crm-student-progress";
import { getStudentProgress } from "../teacher.functions";
import { getSeedTeacherStudentProgress } from "../seed-data";

vi.mock("../teacher.functions", () => ({ getStudentProgress: vi.fn() }));
vi.mock("../seed-data", () => ({ getSeedTeacherStudentProgress: vi.fn() }));

const classA = "11111111-1111-1111-1111-111111111111";
const classB = "22222222-2222-2222-2222-222222222222";
const student = "33333333-3333-3333-3333-333333333333";

const progress = {
  student: {
    id: student,
    class_id: classB,
    display_name: "Alumno B",
    student_code: "B1234",
    teacher_notes: "Privado",
  },
  events: [{ lesson_id: "1", event_kind: "exercise", created_at: "2026-01-01" }],
  lessonProgress: [{ lesson_id: "1", status: "started" }],
};

describe("CRM class and student association", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStudentProgress).mockResolvedValue(progress as never);
    vi.mocked(getSeedTeacherStudentProgress).mockReturnValue(progress as never);
  });

  it.each([false, true])("rejects a direct student ID from another class (seed=%s)", async (seed) => {
    await expect(fetchCrmStudentProgress(student, seed, classA)).rejects.toThrow(
      "Alumno no encontrado en esta clase.",
    );
  });

  it.each([false, true])("returns the student in the requested class (seed=%s)", async (seed) => {
    const result = await fetchCrmStudentProgress(student, seed, classB);
    expect(result.student.id).toBe(student);
    expect(result.events).toHaveLength(1);
  });
});
