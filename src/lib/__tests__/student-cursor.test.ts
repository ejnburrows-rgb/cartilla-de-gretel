import { describe, it, expect } from "vitest";
import { isStudentPath, STUDENT_CURSOR_CLASS } from "../student-cursor";

describe("student-cursor — which screens get the pencil (issue #346)", () => {
  it("turns the pencil on for the student workbook screens", () => {
    const studentPaths = [
      "/cartilla",
      "/cartilla/lecciones",
      "/cartilla/leccion/1",
      "/cartilla/leccion/24",
      "/cartilla/repaso",
      "/cartilla/practica",
      "/cartilla/juego/memoria",
      "/cartilla/mi-progreso",
      "/cartilla/unirse",
      "/cartilla/student-login",
      "/cartilla/animales",
      "/cartilla/ayuda",
    ];
    for (const path of studentPaths) {
      expect(isStudentPath(path), path).toBe(true);
    }
  });

  it("keeps the normal cursor on teacher, admin and projector screens", () => {
    const teacherPaths = [
      "/cartilla/teacher",
      "/cartilla/teacher/crm",
      "/cartilla/teacher/admin",
      "/cartilla/teacher/reportes",
      "/cartilla/teacher/roster",
      "/cartilla/presentar/3",
      "/login",
    ];
    for (const path of teacherPaths) {
      expect(isStudentPath(path), path).toBe(false);
    }
  });

  it("keeps the normal cursor on the landing and entry screens", () => {
    // A parent or teacher is just as likely to be clicking here.
    expect(isStudentPath("/")).toBe(false);
    expect(isStudentPath("/entrar")).toBe(false);
  });

  it("ignores a trailing slash so teacher screens can't leak the pencil", () => {
    expect(isStudentPath("/cartilla/teacher/")).toBe(false);
    expect(isStudentPath("/cartilla/lecciones/")).toBe(true);
  });

  it("does not match a route that merely starts with the same letters", () => {
    // "/cartilla/teacherly" is not under the teacher section.
    expect(isStudentPath("/cartilla/teacherly")).toBe(true);
    // ...and an unrelated top-level route is never a student screen.
    expect(isStudentPath("/cartillas-otra-cosa")).toBe(false);
  });

  it("exposes the class name the stylesheet hangs off", () => {
    expect(STUDENT_CURSOR_CLASS).toBe("student-pencil");
  });
});
