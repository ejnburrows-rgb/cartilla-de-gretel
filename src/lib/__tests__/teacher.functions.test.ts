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
  getClassProgress,
  findStudentsByName,
  getWeeklyActivity,
  getAllTeacherStudents,
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
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as never);
      await expect(listClasses()).rejects.toThrow("Debes iniciar sesión");
    });

    it("attaches a student_count per class from a second query", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const classesBuilder = makeQueryBuilder(
        ok([{ id: CLASS_ID, name: "Clase A", join_code: "ABC123", created_at: "2026-01-01" }]),
      );
      const studentsBuilder = makeQueryBuilder(
        ok([{ class_id: CLASS_ID }, { class_id: CLASS_ID }]),
      );
      vi.mocked(supabase.from)
        .mockReturnValueOnce(classesBuilder as never)
        .mockReturnValueOnce(studentsBuilder as never);

      const result = await listClasses();

      expect(result).toEqual([
        {
          id: CLASS_ID,
          name: "Clase A",
          join_code: "ABC123",
          created_at: "2026-01-01",
          student_count: 2,
        },
      ]);
    });

    it("skips the student-count query entirely when there are no classes", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const classesBuilder = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from).mockReturnValueOnce(classesBuilder as never);

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
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const row = { id: CLASS_ID, name: "Clase A", join_code: "XYZ789" };
      const insertBuilder = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from).mockReturnValueOnce(insertBuilder as never);

      const result = await createClass({ data: { name: "Clase A" } });
      expect(result).toEqual(row);
    });

    it("retries on a join_code collision instead of failing immediately", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const collision = makeQueryBuilder(fail("duplicate key value violates join_code unique"));
      const row = { id: CLASS_ID, name: "Clase A", join_code: "NEW123" };
      const success = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(collision as never)
        .mockReturnValueOnce(success as never);

      const result = await createClass({ data: { name: "Clase A" } });
      expect(result).toEqual(row);
      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe("deleteClass", () => {
    it("throws when the class isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notOwned = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notOwned as never);

      await expect(deleteClass({ data: { id: CLASS_ID } })).rejects.toThrow(
        "Clase no encontrada o sin permiso.",
      );
    });

    it("deletes once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(deleteBuilder as never);

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
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const inserted = [
        { id: STUDENT_ID, display_name: "Ana", class_id: CLASS_ID },
        { id: "33333333-3333-3333-3333-333333333333", display_name: "Beto", class_id: CLASS_ID },
      ];
      const insertBuilder = makeQueryBuilder(ok(inserted));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(insertBuilder as never);

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
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as never);

      await expect(deleteStudent({ data: { id: STUDENT_ID } })).rejects.toThrow(
        "Alumno no encontrado o sin permiso.",
      );
    });

    it("deletes once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as never)
        .mockReturnValueOnce(deleteBuilder as never);

      const result = await deleteStudent({ data: { id: STUDENT_ID } });
      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  describe("updateStudent", () => {
    it("short-circuits to {ok:true} without a query when nothing changed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      vi.mocked(supabase.from).mockReturnValueOnce(ownsStudent as never);

      const result = await updateStudent({ data: { id: STUDENT_ID } });
      expect(result).toEqual({ ok: true });
      expect(supabase.from).toHaveBeenCalledTimes(1); // only the ownership check
    });

    it("updates display_name when provided", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const updateBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as never)
        .mockReturnValueOnce(updateBuilder as never);

      const result = await updateStudent({ data: { id: STUDENT_ID, displayName: "Nuevo Nombre" } });

      expect(updateBuilder.update).toHaveBeenCalledWith({ display_name: "Nuevo Nombre" });
      expect(result).toEqual({ ok: true });
    });
  });

  describe("archiveStudent", () => {
    it("sets archived_at once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsStudent = makeQueryBuilder(
        ok({ id: STUDENT_ID, classes: { id: CLASS_ID, teacher_id: authedUser().data.user.id } }),
      );
      const updateBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as never)
        .mockReturnValueOnce(updateBuilder as never);

      const result = await archiveStudent({ data: { id: STUDENT_ID } });

      expect(updateBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(String) }),
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe("getStudentProgress", () => {
    it("throws when the student isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as never);

      await expect(getStudentProgress({ data: { id: STUDENT_ID } })).rejects.toThrow(
        "Alumno no encontrado o sin permiso.",
      );
    });

    it("assembles student + events + lessonProgress + summary", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
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
      const eventsBuilder = makeQueryBuilder(
        ok([{ id: "e1", lesson_id: "1", event_kind: "answer_correct" }]),
      );
      const lessonProgressBuilder = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsStudent as never)
        .mockReturnValueOnce(eventsBuilder as never)
        .mockReturnValueOnce(lessonProgressBuilder as never);

      const result = await getStudentProgress({ data: { id: STUDENT_ID } });

      expect(result.student.display_name).toBe("Ana");
      expect(result.class).toEqual({ id: CLASS_ID, name: "Clase A" });
      expect(result.events).toHaveLength(1);
      expect(result.lessonProgress).toEqual([]);
      expect(result.summary).toBeDefined();
    });
  });

  describe("getClassProgress", () => {
    it("rejects an id that is not a UUID before touching the database", async () => {
      await expect(getClassProgress({ data: { id: "not-a-uuid" } })).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("throws when the class isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notOwned = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValueOnce(notOwned as never);

      await expect(getClassProgress({ data: { id: CLASS_ID } })).rejects.toThrow(
        "Clase no encontrada o sin permiso.",
      );
    });

    it("returns the empty progress shape when the class has no students", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const noStudents = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(noStudents as never);

      const result = await getClassProgress({ data: { id: CLASS_ID } });

      expect(result.perStudent).toEqual([]);
      expect(result.assignments).toEqual([]);
      expect(result.recentEvents).toEqual([]);
      expect(result.perLesson).toEqual({});
      expect(result.attentionByStudent).toEqual({});
    });
  });

  describe("findStudentsByName", () => {
    it("rejects an empty search string without querying", async () => {
      await expect(findStudentsByName({ data: { q: "   " } })).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("throws when no teacher is signed in", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as never);
      await expect(findStudentsByName({ data: { q: "Ana" } })).rejects.toThrow(
        "Debes iniciar sesión",
      );
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("returns the matching students and filters by name", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const rows = [
        { id: STUDENT_ID, display_name: "Ana", student_code: "AB123", class_id: CLASS_ID },
      ];
      const builder = makeQueryBuilder(ok(rows));
      vi.mocked(supabase.from).mockReturnValueOnce(builder as never);

      const result = await findStudentsByName({ data: { q: "Ana" } });

      expect(result).toEqual(rows);
      expect(builder.ilike).toHaveBeenCalledWith("display_name", "%Ana%");
    });
  });

  describe("getWeeklyActivity", () => {
    it("throws when the class isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notOwned = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValueOnce(notOwned as never);

      await expect(getWeeklyActivity({ data: { classId: CLASS_ID } })).rejects.toThrow(
        "Clase no encontrada o sin permiso.",
      );
    });

    it("returns 7 day buckets, all zero, when there are no students", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const noStudents = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(noStudents as never);

      const result = await getWeeklyActivity({ data: { classId: CLASS_ID } });

      expect(result).toHaveLength(7);
      expect(result.every((d) => d.count === 0)).toBe(true);
      expect(result.every((d) => typeof d.label === "string")).toBe(true);
    });

    it("counts real events into the 7-day window", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const students = makeQueryBuilder(ok([{ id: "s1" }]));
      const events = makeQueryBuilder(ok([{ created_at: new Date().toISOString() }]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(students as never)
        .mockReturnValueOnce(events as never);

      const result = await getWeeklyActivity({ data: { classId: CLASS_ID } });

      expect(result).toHaveLength(7);
      expect(result.reduce((sum, d) => sum + d.count, 0)).toBe(1);
    });
  });

  describe("getAllTeacherStudents", () => {
    it("throws when no teacher is signed in", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as never);
      await expect(getAllTeacherStudents({ data: {} })).rejects.toThrow("Debes iniciar sesión");
    });

    it("returns an empty list when the teacher has no students", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const noStudents = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from).mockReturnValueOnce(noStudents as never);

      const result = await getAllTeacherStudents({ data: {} });
      expect(result).toEqual([]);
    });

    it("attaches an event count per student and hides archived by default", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const student = {
        id: STUDENT_ID,
        display_name: "Ana",
        student_code: "AB123",
        created_at: "2026-01-01",
        class_id: CLASS_ID,
        archived_at: null,
        teacher_notes: null,
      };
      const studentsBuilder = makeQueryBuilder(ok([student]));
      const eventsBuilder = makeQueryBuilder(
        ok([{ student_id: STUDENT_ID }, { student_id: STUDENT_ID }]),
      );
      const lessonProgressBuilder = makeQueryBuilder(ok([]));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(studentsBuilder as never)
        .mockReturnValueOnce(eventsBuilder as never)
        .mockReturnValueOnce(lessonProgressBuilder as never);

      const result = await getAllTeacherStudents({ data: {} });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(STUDENT_ID);
      expect(result[0].events).toBe(2);
      expect(studentsBuilder.is).toHaveBeenCalledWith("archived_at", null);
    });
  });
});
