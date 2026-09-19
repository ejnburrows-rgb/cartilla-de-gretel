/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  listAssignments,
  createAssignment,
  deleteAssignment,
  listMyAssignments,
} from "../assignments.functions";
import { makeQueryBuilder, ok, fail, authedUser, signedOut } from "./supabase-query-mock";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), rpc: vi.fn(), auth: { getUser: vi.fn() } },
}));

const CLASS_ID = "11111111-1111-1111-1111-111111111111";
const STUDENT_ID = "22222222-2222-2222-2222-222222222222";
const ASSIGNMENT_ID = "33333333-3333-3333-3333-333333333333";

describe("assignments.functions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAssignments", () => {
    it("throws when no teacher is signed in", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as never);
      await expect(listAssignments({ data: { classId: CLASS_ID } })).rejects.toThrow(
        "Debes iniciar sesión",
      );
    });

    it("returns the class's assignments newest-first once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const rows = [{ id: ASSIGNMENT_ID, class_id: CLASS_ID, lesson_id: "7" }];
      const listBuilder = makeQueryBuilder(ok(rows));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(listBuilder as never);

      const result = await listAssignments({ data: { classId: CLASS_ID } });

      expect(listBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(result).toEqual(rows);
    });
  });

  describe("createAssignment", () => {
    it("turns a duplicate (class, lesson) Postgres error into a friendly message", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const insertBuilder = makeQueryBuilder(fail("duplicate key value", "23505"));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(insertBuilder as never);

      await expect(
        createAssignment({ data: { classId: CLASS_ID, lessonId: "7" } }),
      ).rejects.toThrow("ya tiene una tarea asignada");
    });

    it("creates the assignment on success", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const row = { id: ASSIGNMENT_ID, class_id: CLASS_ID, lesson_id: "7", title: null };
      const insertBuilder = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(insertBuilder as never);

      const result = await createAssignment({ data: { classId: CLASS_ID, lessonId: "7" } });
      expect(result).toEqual(row);
    });

    it("rejects a time limit outside the 30s-3600s range", async () => {
      await expect(
        createAssignment({
          data: { classId: CLASS_ID, lessonId: "7", timeLimitSeconds: 10 },
        }),
      ).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe("deleteAssignment", () => {
    it("throws when the assignment doesn't exist", async () => {
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as never);

      await expect(deleteAssignment({ data: { id: ASSIGNMENT_ID } })).rejects.toThrow(
        "Tarea no encontrada.",
      );
    });

    it("deletes once found and owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const readBuilder = makeQueryBuilder(ok({ id: ASSIGNMENT_ID, class_id: CLASS_ID }));
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(readBuilder as never)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(deleteBuilder as never);

      const result = await deleteAssignment({ data: { id: ASSIGNMENT_ID } });

      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });

  describe("listMyAssignments", () => {
    it("calls the student RPC with an uppercased code", async () => {
      const rows = [{ id: ASSIGNMENT_ID }];
      vi.mocked(supabase.rpc).mockResolvedValue(ok(rows) as never);

      const result = await listMyAssignments({
        data: { classId: CLASS_ID, studentId: STUDENT_ID, studentCode: "abcd" },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("get_student_assignments", {
        p_class_id: CLASS_ID,
        p_student_id: STUDENT_ID,
        p_student_code: "ABCD",
      });
      expect(result).toEqual(rows);
    });

    it("throws when the RPC errors", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue(fail("nope") as never);
      await expect(
        listMyAssignments({
          data: { classId: CLASS_ID, studentId: STUDENT_ID, studentCode: "abcd" },
        }),
      ).rejects.toThrow("nope");
    });
  });
});
