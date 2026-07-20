/**
 * @vitest-environment jsdom
 *
 * Covers the core class/student CRUD + progress-fetch surface of
 * teacher.functions.ts (the most-used paths). getClassProgress,
 * findStudentsByName, getWeeklyActivity, and getAllTeacherStudents are not
 * covered here yet — a reasonable follow-up, not claimed as done.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  listClasses,
  createClass,
  deleteClass,
  addStudents,
  deleteStudent,
  updateStudent,
  archiveStudent,
  getStudentProgress,
} from "../teacher.functions";
import { makeQueryBuilder, ok, fail, authedUser, signedOut } from "./supabase-query-mock";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn() } },
}));

const CLASS_ID = "11111111-1111-1111-1111-111111111111";
const STUDENT_ID = "22222222-2222-2222-2222-222222222222";

describe("teacher.functions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listClasses", () => {
    it("throws when no teacher is signed in", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as any);
      await expect(listClasses()).rejects.toThrow("Debes iniciar sesión");
    });

    it("attaches a student_count per class from a second query", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const classesBuilder = makeQueryBuilder(
        ok([{ id: CLASS_ID, name: "Clase A", join_code: "ABC123", created_at: "2026-01-01" }]),
      );
      const studentsBuilder = makeQueryBuilder(
        ok([{ class_id: CLASS_ID }, { class_id: CLASS_ID }]),
      );
      vi.mocked(supabase.from)
        .mockReturnValueOnce(classesBuilder as any)
        .mockReturnValueOnce(studentsBuilder as any);

      const result = await listClasses();

      expect(result).toEqual([
        { id: CLASS_ID, name: "Clase A", join_code: "ABC123", created_at: "2026-01-01", student_count: 2 },
      ]);
    });

    it("skips the student-count query entirely when there are no classes", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const classesBuilder = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from).mockReturnValueOnce(classesBuilder as any);

      const result = await listClasses();
      expect(result).toEqual([]);
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe("createClass", () => {
    it("rejects an empty class name", async () => {
      await expect(createClass({ data: { name: "  " } })).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("creates the class with a generated join code", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const row = { id: CLASS_ID, name: "Clase A", join_code: "XYZ789" };
      const insertBuilder = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from).mockReturnValueOnce(insertBuilder as any);

      const result = await createClass({ data: { name: "Clase A" } });
      expect(result).toEqual(row);
    });

    it("retries on a join_code collision instead of failing immediately", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const collision = makeQueryBuilder(fail("duplicate key value violates join_code unique"));
      const row = { id: CLASS_ID, name: "Clase A", join_code: "NEW123" };
      const success = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from).mockReturnValueOnce(collision as any).mockReturnValueOnce(success as any);

      const result = await createClass({ data: { name: "Clase A" } });
      expect(result).toEqual(row);
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteClass", () => {
    it("throws when the class isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const notOwned = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notOwned as any);

      await expect(deleteClass({ data: { id: CLASS_ID } })).rejects.toThrow(
        "Clase no encontrada o sin permiso.",
      );
    });

    it("deletes once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as any)
        .mockReturnValueOnce(deleteBuilder as any);

      const result = await deleteClass({ data: { id: CLASS_ID } });
      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  describe("addStudents", () => {
    it("rejects an empty names list", async () => {
      await expect(addStudents({ data: { classId: CLASS_ID, names: [] } })).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("inserts one row per name with a generated student_code", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const inserted = [
        { id: STUDENT_ID, display_name: "Ana", class_id: CLASS_ID },
        { id: "33333333-3333-3333-3333-333333333333", display_name: "Beto", class_id: CLASS_ID },
      ];
      const insertBuilder = makeQueryBuilder(ok(inserted));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as any)
        .mockReturnValueOnce(insertBuilder as any);

      const result = await addStudents({ data: { classId: CLASS_ID, names: ["Ana", "Beto"] } });

      expect(insertBuilder.insert).toHaveBeenCalledWith([
        expect.objectContaining({ class_id: CLASS_ID, display_name: "Ana" }),
        expect.objectContaining({ class_id: CLASS_ID, display_name: "Beto" }),
      ]);
      expect(result).toEqual(inserted);
    });
  });

  describe("deleteStudent", () => {
    it("throws when the student isn't found or not owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as any);

      await expect(deleteStudent({ data: { id: STUDENT_ID } })).rejects.toThrow(
        "Alumno no encontrado o sin permiso.",
      );
    });

    it("deletes once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as any)
        .mockReturnValueOnce(deleteBuilder as any);

      const result = await deleteStudent({ data: { id: STUDENT_ID } });
      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  describe("updateStudent", () => {
    it("short-circuits to {ok:true} without a query when nothing changed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      vi.mocked(supabase.from).mockReturnValueOnce(ownsStudent as any);

      const result = await updateStudent({ data: { id: STUDENT_ID } });
      expect(result).toEqual({ ok: true });
      expect(supabase.from).toHaveBeenCalledTimes(1); // only the ownership check
    });

    it("updates display_name when provided", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const updateBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as any)
        .mockReturnValueOnce(updateBuilder as any);

      const result = await updateStudent({ data: { id: STUDENT_ID, displayName: "Nuevo Nombre" } });

      expect(updateBuilder.update).toHaveBeenCalledWith({ display_name: "Nuevo Nombre" });
      expect(result).toEqual({ ok: true });
    });
  });

  describe("archiveStudent", () => {
    it("sets archived_at once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const updateBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as any)
        .mockReturnValueOnce(updateBuilder as any);

      const result = await archiveStudent({ data: { id: STUDENT_ID } });

      expect(updateBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(String) }),
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe("getStudentProgress", () => {
    it("throws when the student isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as any);

      await expect(getStudentProgress({ data: { id: STUDENT_ID } })).rejects.toThrow(
        "Alumno no encontrado o sin permiso.",
      );
    });

    it("assembles student + events + lessonProgress + summary", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as any);
      const ownsStudent = makeQueryBuilder(
        ok({
          id: STUDENT_ID,
          display_name: "Ana",
          student_code: "AB123",
          class_id: CLASS_ID,
          archived_at: null,
          teacher_notes: null,
          classes: { id: CLASS_ID, name: "Clase A" },
        }),
      );
      const eventsBuilder = makeQueryBuilder(ok([{ id: "e1", lesson_id: "1", event_kind: "answer_correct" }]));
      const lessonProgressBuilder = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as any)
        .mockReturnValueOnce(eventsBuilder as any)
        .mockReturnValueOnce(lessonProgressBuilder as any);

      const result = await getStudentProgress({ data: { id: STUDENT_ID } });

      expect(result.student.display_name).toBe("Ana");
      expect(result.class).toEqual({ id: CLASS_ID, name: "Clase A" });
      expect(result.events).toHaveLength(1);
      expect(result.lessonProgress).toEqual([]);
      expect(result.summary).toBeDefined();
    });
  });
});
