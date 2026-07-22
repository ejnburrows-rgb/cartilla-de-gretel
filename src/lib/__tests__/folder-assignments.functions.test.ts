/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  createFolderAssignment,
  listFolderAssignments,
  deleteFolderAssignment,
  getMyFolderAssignments,
} from "../folder-assignments.functions";
import { makeQueryBuilder, ok, fail, authedUser, signedOut } from "./supabase-query-mock";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), rpc: vi.fn(), auth: { getUser: vi.fn() } },
}));

const CLASS_ID = "11111111-1111-1111-1111-111111111111";
const STUDENT_ID = "22222222-2222-2222-2222-222222222222";
const ASSIGNMENT_ID = "33333333-3333-3333-3333-333333333333";

describe("folder-assignments.functions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFolderAssignment", () => {
    it("throws when no teacher is signed in, before ever touching the table", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(signedOut as never);

      await expect(
        createFolderAssignment({
          data: {
            classId: CLASS_ID,
            folderKey: "guia",
            lessonId: "7",
            activityLabel: "Guía Lección 7",
            targetScope: "class",
          },
        }),
      ).rejects.toThrow("Debes iniciar sesión");
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("throws when targetScope is 'students' but no studentIds are given", async () => {
      await expect(
        createFolderAssignment({
          data: {
            classId: CLASS_ID,
            folderKey: "tareas",
            lessonId: "7",
            activityLabel: "Tarea",
            targetScope: "students",
          },
        }),
      ).rejects.toThrow();
    });

    it("inserts the assignment once class ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const row = {
        id: ASSIGNMENT_ID,
        class_id: CLASS_ID,
        teacher_id: authedUser().data.user.id,
        folder_key: "guia",
        lesson_id: "7",
        activity_label: "Guía Lección 7",
        target_scope: "class",
        student_ids: null,
        created_at: "2026-01-01T00:00:00Z",
      };
      const insertBuilder = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(insertBuilder as never);

      const result = await createFolderAssignment({
        data: {
          classId: CLASS_ID,
          folderKey: "guia",
          lessonId: "7",
          activityLabel: "Guía Lección 7",
          targetScope: "class",
        },
      });

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ folder_key: "guia", target_scope: "class", student_ids: null }),
      );
      expect(result).toEqual(row);
    });

    it("throws when the class isn't found or isn't owned by this teacher", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notOwned = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notOwned as never);

      await expect(
        createFolderAssignment({
          data: {
            classId: CLASS_ID,
            folderKey: "guia",
            lessonId: "7",
            activityLabel: "x",
            targetScope: "class",
          },
        }),
      ).rejects.toThrow("Clase no encontrada o sin permiso.");
    });
  });

  describe("listFolderAssignments", () => {
    it("lists newest-first once ownership is confirmed", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const rows = [{ id: ASSIGNMENT_ID, class_id: CLASS_ID }];
      const listBuilder = makeQueryBuilder(ok(rows));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(listBuilder as never);

      const result = await listFolderAssignments({ data: { classId: CLASS_ID } });

      expect(listBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(result).toEqual(rows);
    });

    it("returns an empty array rather than null when there are no rows", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const listBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(listBuilder as never);

      const result = await listFolderAssignments({ data: { classId: CLASS_ID } });
      expect(result).toEqual([]);
    });
  });

  describe("deleteFolderAssignment", () => {
    it("throws when the assignment doesn't exist", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const notFound = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(notFound as never);

      await expect(deleteFolderAssignment({ data: { id: ASSIGNMENT_ID } })).rejects.toThrow(
        "Tarea no encontrada.",
      );
    });

    it("deletes once found and owned", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(authedUser() as never);
      const readBuilder = makeQueryBuilder(ok({ id: ASSIGNMENT_ID, class_id: CLASS_ID }));
      const ownsClass = makeQueryBuilder(ok({ id: CLASS_ID }));
      const deleteBuilder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from)
        .mockReturnValueOnce(readBuilder as never)
        .mockReturnValueOnce(ownsClass as never)
        .mockReturnValueOnce(deleteBuilder as never);

      const result = await deleteFolderAssignment({ data: { id: ASSIGNMENT_ID } });

      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(deleteBuilder.eq).toHaveBeenCalledWith("id", ASSIGNMENT_ID);
      expect(result).toEqual({ ok: true });
    });
  });

  describe("getMyFolderAssignments", () => {
    it("calls the student RPC with an uppercased code and returns rows", async () => {
      const rows = [{ id: ASSIGNMENT_ID }];
      vi.mocked(supabase.rpc).mockResolvedValue(ok(rows) as never);

      const result = await getMyFolderAssignments({
        data: { classId: CLASS_ID, studentId: STUDENT_ID, studentCode: "abcd" },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("get_student_folder_assignments", {
        p_class_id: CLASS_ID,
        p_student_id: STUDENT_ID,
        p_student_code: "ABCD",
      });
      expect(result).toEqual(rows);
    });

    it("throws when the RPC errors", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue(fail("nope") as never);

      await expect(
        getMyFolderAssignments({
          data: { classId: CLASS_ID, studentId: STUDENT_ID, studentCode: "abcd" },
        }),
      ).rejects.toThrow("nope");
    });
  });
});
