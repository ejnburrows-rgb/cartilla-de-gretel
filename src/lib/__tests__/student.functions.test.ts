/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { joinClass, logProgress, getMyProgress, listClassStudents, enterClassAsStudent } from "../student.functions";

vi.mock("@/integrations/supabase/client", () => {
  const mockSingle = vi.fn();
  const mockRpc = vi.fn().mockReturnValue({
    single: mockSingle,
  });
  return {
    supabase: {
      rpc: mockRpc,
    },
  };
});

describe("student.functions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("joinClass", () => {
    it("should succeed and return parsed data when Supabase RPC succeeds", async () => {
      const mockResult = {
        student_id: "11111111-1111-1111-1111-111111111111",
        student_name: "Estudiante Demo",
        student_code: "DEMO1",
        class_id: "22222222-2222-2222-2222-222222222222",
        class_name: "Clase Demo",
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as any);

      const result = await joinClass({
        data: {
          joinCode: "DEMO12",
          studentCode: "DEMO1",
        },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("join_class", {
        p_join_code: "DEMO12",
        p_student_code: "DEMO1",
      });
      expect(result).toEqual({
        studentId: mockResult.student_id,
        studentName: mockResult.student_name,
        studentCode: mockResult.student_code,
        classId: mockResult.class_id,
        className: mockResult.class_name,
      });
    });

    it("should throw error when Supabase RPC fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "Invalid code" } });
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as any);

      await expect(
        joinClass({
          data: {
            joinCode: "FAIL12",
            studentCode: "FAIL1",
          },
        })
      ).rejects.toThrow("Invalid code");
    });
  });

  describe("logProgress", () => {
    it("should succeed when Supabase RPC succeeds with valid data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as any);

      const result = await logProgress({
        data: {
          studentId: "11111111-1111-1111-1111-111111111111",
          studentCode: "DEMO1",
          lessonId: "1",
          kind: "lesson_completed",
        },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("log_student_progress", {
        p_student_id: "11111111-1111-1111-1111-111111111111",
        p_student_code: "DEMO1",
        p_lesson_id: "1",
        p_event_kind: "lesson_completed",
        p_score: null,
        p_total: null,
        p_time_seconds: null,
        p_meta: null,
      });
      expect(result).toEqual({ ok: true });
    });

    it("should throw Zod error when studentId is not a valid UUID", async () => {
      await expect(
        logProgress({
          data: {
            studentId: "invalid-uuid-string",
            studentCode: "DEMO1",
            lessonId: "1",
            kind: "lesson_completed",
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("listClassStudents", () => {
    it("should call list_class_students with the uppercased join code and return the roster", async () => {
      const mockRoster = [
        { student_id: "11111111-1111-1111-1111-111111111111", display_name: "Ana" },
        { student_id: "22222222-2222-2222-2222-222222222222", display_name: "Beto" },
      ];
      vi.mocked(supabase.rpc).mockResolvedValue({ data: mockRoster, error: null } as any);

      const result = await listClassStudents({ data: { joinCode: "demo12" } });

      expect(supabase.rpc).toHaveBeenCalledWith("list_class_students", {
        p_join_code: "DEMO12",
      });
      expect(result).toEqual([
        { studentId: mockRoster[0].student_id, displayName: mockRoster[0].display_name },
        { studentId: mockRoster[1].student_id, displayName: mockRoster[1].display_name },
      ]);
    });

    it("should throw when the join code matches no class (empty roster)", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as any);

      await expect(listClassStudents({ data: { joinCode: "NOPE1" } })).rejects.toThrow();
    });

    it("should throw when Supabase RPC errors", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: "boom" } } as any);

      await expect(listClassStudents({ data: { joinCode: "DEMO12" } })).rejects.toThrow("boom");
    });
  });

  describe("enterClassAsStudent", () => {
    it("should succeed and return the session shape when Supabase RPC succeeds", async () => {
      const mockResult = {
        student_id: "11111111-1111-1111-1111-111111111111",
        student_name: "Ana",
        student_code: "X9YZ2",
        class_id: "22222222-2222-2222-2222-222222222222",
        class_name: "Clase Demo",
      };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as any);

      const result = await enterClassAsStudent({
        data: { joinCode: "demo12", studentId: mockResult.student_id },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("enter_class_as_student", {
        p_join_code: "DEMO12",
        p_student_id: mockResult.student_id,
      });
      expect(result).toEqual({
        studentId: mockResult.student_id,
        studentName: mockResult.student_name,
        studentCode: mockResult.student_code,
        classId: mockResult.class_id,
        className: mockResult.class_name,
      });
    });

    it("should throw when the tapped student does not belong to this class", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as any);

      await expect(
        enterClassAsStudent({
          data: { joinCode: "DEMO12", studentId: "11111111-1111-1111-1111-111111111111" },
        }),
      ).rejects.toThrow();
    });

    it("should throw Zod error when studentId is not a valid UUID", async () => {
      await expect(
        enterClassAsStudent({ data: { joinCode: "DEMO12", studentId: "not-a-uuid" } }),
      ).rejects.toThrow();
    });
  });

  describe("getMyProgress", () => {
    it("should succeed and return payload when Supabase RPC succeeds", async () => {
      const mockPayload = {
        events: [],
        lessonProgress: [],
      };
      vi.mocked(supabase.rpc).mockResolvedValue({ data: mockPayload, error: null } as any);

      const result = await getMyProgress({
        data: {
          studentId: "11111111-1111-1111-1111-111111111111",
          studentCode: "DEMO1",
        },
      });

      expect(supabase.rpc).toHaveBeenCalledWith("get_student_progress", {
        p_student_id: "11111111-1111-1111-1111-111111111111",
        p_student_code: "DEMO1",
      });
      expect(result).toEqual(mockPayload);
    });
  });
});
