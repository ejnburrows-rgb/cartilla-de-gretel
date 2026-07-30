/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { joinClass, listClassStudents } from "../student.functions";

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
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as never);

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
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Invalid code" } });
      vi.mocked(supabase.rpc).mockReturnValue({ single: mockSingle } as never);

      await expect(
        joinClass({
          data: {
            joinCode: "FAIL12",
            studentCode: "FAIL1",
          },
        }),
      ).rejects.toThrow("Invalid code");
    });
  });

  describe("listClassStudents", () => {
    it("should call list_class_students with the uppercased join code and return the roster", async () => {
      const mockRoster = [
        { student_id: "11111111-1111-1111-1111-111111111111", display_name: "Ana" },
        { student_id: "22222222-2222-2222-2222-222222222222", display_name: "Beto" },
      ];
      vi.mocked(supabase.rpc).mockResolvedValue({ data: mockRoster, error: null } as never);

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
      vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as never);

      await expect(listClassStudents({ data: { joinCode: "NOPE1" } })).rejects.toThrow();
    });

    it("should throw when Supabase RPC errors", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "boom" },
      } as never);

      await expect(listClassStudents({ data: { joinCode: "DEMO12" } })).rejects.toThrow("boom");
    });
  });

  // enterClassAsStudent, logProgress, getMyProgress, saveLastPage moved to
  // src/lib/secure-student-access.ts (session-token authorized) — covered by
  // src/lib/__tests__/secure-student-access.test.ts, which asserts the
  // session shape carries no student_code.
});
