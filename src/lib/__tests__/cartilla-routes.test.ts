import { describe, expect, it } from "vitest";
import { routes } from "@/lib/cartilla-routes";

describe("Typed Route Builders (routes)", () => {
  it("resolves root and general lesson routes correctly", () => {
    expect(routes.root()).toBe("/");
    expect(routes.lessonList()).toBe("/cartilla/lecciones");
    expect(routes.lesson(3)).toBe("/cartilla/leccion/3");
    expect(routes.lesson(24)).toBe("/cartilla/leccion/24");
  });

  it("resolves student-facing routes correctly", () => {
    expect(routes.studentHome()).toBe("/cartilla/alumno");
    expect(routes.studentLogin()).toBe("/cartilla/alumno/login");
    expect(routes.studentProfile()).toBe("/cartilla/alumno/perfil");
    expect(routes.studentHomework()).toBe("/cartilla/alumno/tareas");
    expect(routes.studentMastery()).toBe("/cartilla/alumno/dominio");
    expect(routes.studentAchievements()).toBe("/cartilla/alumno/logros");
  });

  it("resolves family-facing routes correctly", () => {
    expect(routes.familyHome()).toBe("/cartilla/familia");
    expect(routes.familyPractice()).toBe("/cartilla/familia/practica");
    expect(routes.familyMessages()).toBe("/cartilla/familia/mensajes");
    expect(routes.familyReport("test-id-123")).toBe("/cartilla/familia/reporte/test-id-123");
  });

  it("resolves teacher CRM routes correctly", () => {
    expect(routes.teacherHome()).toBe("/cartilla/maestro");
    expect(routes.teacherClasses()).toBe("/cartilla/maestro/clases");
    expect(routes.teacherClass("class-99")).toBe("/cartilla/maestro/clase/class-99");
    expect(routes.teacherStudents()).toBe("/cartilla/maestro/alumnos");
    expect(routes.teacherStudent("student-456")).toBe("/cartilla/maestro/alumno/student-456");
    expect(routes.teacherSession(12)).toBe("/cartilla/maestro/sesion/12");
    expect(routes.teacherAssignments()).toBe("/cartilla/maestro/asignaciones");
    expect(routes.teacherReports()).toBe("/cartilla/maestro/reportes");
    expect(routes.teacherParents()).toBe("/cartilla/maestro/padres");
  });

  it("resolves analytics and reports routes correctly", () => {
    expect(routes.analyticsHome()).toBe("/cartilla/maestro/analitica");
    expect(routes.analyticsClass("c1")).toBe("/cartilla/maestro/analitica/clase/c1");
    expect(routes.analyticsStudent("s1")).toBe("/cartilla/maestro/analitica/alumno/s1");
    expect(routes.analyticsLesson(7)).toBe("/cartilla/maestro/analitica/leccion/7");
    expect(routes.reportsExport()).toBe("/cartilla/maestro/reportes/exportar");
    expect(routes.reportsIep("iep-id")).toBe("/cartilla/maestro/reportes/iep/iep-id");
  });

  it("resolves director, printing, and shareable routes correctly", () => {
    expect(routes.director()).toBe("/cartilla/director");
    expect(routes.directorSchool("school-xyz")).toBe("/cartilla/director/escuela/school-xyz");
    expect(routes.binder()).toBe("/cartilla/binder");
    expect(routes.binderLesson(8)).toBe("/cartilla/binder/8");
    expect(routes.reportShare("share-ref")).toBe("/r/share-ref");
  });
});
