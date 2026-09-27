/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSeedStudents,
  createSeedAssignment,
  deleteSeedAssignment,
  deleteSeedStudent,
  getSeedAdminOverview,
  getSeedClass,
  getSeedClassProgress,
  getSeedTeacherStudentProgress,
  listSeedAssignments,
  startTeacherReview,
  updateSeedStudent,
} from "../seed-data";

const AUTH_KEY = "cartilla.seed.teacher.v1";
const STATE_KEY = "cartilla.seed.state.v1";

describe("mock teacher data boundaries", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CRM_REVIEW", "true");
    localStorage.clear();
    startTeacherReview();
  });

  it.each([
    ["seed-teacher-leonor", "seed-class-emilio", "seed-student-lucas"],
    ["seed-teacher-emilio", "seed-class-demo", "seed-student-sofia"],
  ])("%s cannot read or change another teacher's class and student", (teacherId, classId, studentId) => {
    localStorage.setItem(AUTH_KEY, teacherId);
    const original = localStorage.getItem(STATE_KEY);

    expect(() => getSeedClass(classId)).toThrow("Clase no encontrada.");
    expect(() => getSeedClassProgress(classId)).toThrow("Clase no encontrada.");
    expect(() => listSeedAssignments(classId)).toThrow("Clase no encontrada.");
    expect(() => getSeedTeacherStudentProgress(studentId)).toThrow("Clase no encontrada.");
    expect(() => addSeedStudents(classId, ["Intruso"])).toThrow("Clase no encontrada.");
    expect(() => createSeedAssignment({ classId, lessonId: "1" })).toThrow("Clase no encontrada.");
    expect(() => updateSeedStudent(studentId, { teacher_notes: "intrusión" })).toThrow("Clase no encontrada.");
    expect(() => deleteSeedStudent(studentId)).toThrow("Clase no encontrada.");
    expect(localStorage.getItem(STATE_KEY)).toBe(original);
  });

  it("does not allow direct class reassignment through a student update", () => {
    updateSeedStudent("seed-student-sofia", {
      class_id: "seed-class-emilio",
      teacher_notes: "Revisar lectura",
    });
    const student = getSeedTeacherStudentProgress("seed-student-sofia").student;
    expect(student.class_id).toBe("seed-class-demo");
    expect(student.teacher_notes).toBe("Revisar lectura");
  });

  it("rejects deletion of another teacher's assignment", () => {
    localStorage.setItem(AUTH_KEY, "seed-teacher-emilio");
    const original = localStorage.getItem(STATE_KEY);
    expect(() => deleteSeedAssignment("seed-assignment-1")).toThrow("Tarea no encontrada.");
    expect(localStorage.getItem(STATE_KEY)).toBe(original);
  });

  it("rejects teacher data reads without a teacher session", () => {
    localStorage.removeItem(AUTH_KEY);
    expect(() => getSeedClass("seed-class-demo")).toThrow("Debes iniciar sesion");
    expect(() => getSeedClassProgress("seed-class-demo")).toThrow("Debes iniciar sesion");
    expect(() => getSeedTeacherStudentProgress("seed-student-sofia")).toThrow("Debes iniciar sesion");
  });

  it("reserves the cross-teacher overview for the mock admin", () => {
    localStorage.setItem(AUTH_KEY, "seed-teacher-emilio");
    expect(() => getSeedAdminOverview()).toThrow("Sin permiso");
    localStorage.setItem(AUTH_KEY, "seed-teacher-leonor");
    expect(getSeedAdminOverview().teachers).toHaveLength(2);
  });
});
