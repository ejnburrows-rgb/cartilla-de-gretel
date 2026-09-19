/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  logLessonVerification,
  getLessonVerification,
  getAllStudentVerifications,
} from "../lesson-verification.functions";
import { makeQueryBuilder, ok, fail } from "./supabase-query-mock";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const STUDENT_ID = "11111111-1111-1111-1111-111111111111";
const TEACHER_ID = "22222222-2222-2222-2222-222222222222";

describe("lesson-verification.functions tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logLessonVerification", () => {
    it("upserts on the (lesson_number, student_id) key and returns the row", async () => {
      const row = { verified: true, lesson_number: 7, student_id: STUDENT_ID };
      const builder = makeQueryBuilder(ok(row));
      vi.mocked(supabase.from).mockReturnValue(builder as never);

      const result = await logLessonVerification({
        data: { lessonNumber: 7, studentId: STUDENT_ID, teacherId: TEACHER_ID, verified: true },
      });

      expect(supabase.from).toHaveBeenCalledWith("lesson_verifications");
      expect(builder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          lesson_number: 7,
          student_id: STUDENT_ID,
          teacher_id: TEACHER_ID,
          verified: true,
        }),
        { onConflict: "lesson_number, student_id" },
      );
      expect(result).toEqual(row);
    });

    it("rejects a lesson number outside the 7-24 consonant range", async () => {
      await expect(
        logLessonVerification({
          data: { lessonNumber: 3, studentId: STUDENT_ID, teacherId: TEACHER_ID, verified: true },
        }),
      ).rejects.toThrow();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("throws when Supabase errors", async () => {
      const builder = makeQueryBuilder(fail("boom"));
      vi.mocked(supabase.from).mockReturnValue(builder as never);

      await expect(
        logLessonVerification({
          data: { lessonNumber: 7, studentId: STUDENT_ID, teacherId: TEACHER_ID, verified: false },
        }),
      ).rejects.toThrow("boom");
    });
  });

  describe("getLessonVerification", () => {
    it("returns null when no verification row exists yet", async () => {
      const builder = makeQueryBuilder(ok(null));
      vi.mocked(supabase.from).mockReturnValue(builder as never);

      const result = await getLessonVerification({
        data: { lessonNumber: 8, studentId: STUDENT_ID },
      });

      expect(builder.eq).toHaveBeenCalledWith("lesson_number", 8);
      expect(builder.eq).toHaveBeenCalledWith("student_id", STUDENT_ID);
      expect(result).toBeNull();
    });

    it("rejects a non-UUID studentId", async () => {
      await expect(
        getLessonVerification({ data: { lessonNumber: 8, studentId: "not-a-uuid" } }),
      ).rejects.toThrow();
    });
  });

  describe("getAllStudentVerifications", () => {
    it("returns every verification row for the student", async () => {
      const rows = [
        { verified: true, lesson_number: 7, student_id: STUDENT_ID },
        { verified: false, lesson_number: 8, student_id: STUDENT_ID },
      ];
      const builder = makeQueryBuilder(ok(rows));
      vi.mocked(supabase.from).mockReturnValue(builder as never);

      const result = await getAllStudentVerifications({ data: { studentId: STUDENT_ID } });

      expect(builder.eq).toHaveBeenCalledWith("student_id", STUDENT_ID);
      expect(result).toEqual(rows);
    });

    it("throws when Supabase errors", async () => {
      const builder = makeQueryBuilder(fail("db down"));
      vi.mocked(supabase.from).mockReturnValue(builder as never);

      await expect(getAllStudentVerifications({ data: { studentId: STUDENT_ID } })).rejects.toThrow(
        "db down",
      );
    });
  });
});
