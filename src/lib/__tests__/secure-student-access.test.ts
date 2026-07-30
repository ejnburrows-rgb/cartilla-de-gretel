/**
 * @vitest-environment jsdom
 *
 * Negative tests for the scoped student session. These exist to prove the
 * specific attack from the audit is closed: a class join code alone must not
 * be enough to obtain a credential, read a child's progress, write progress,
 * or act as a different child.
 *
 * All fixtures here are synthetic. No real class code, child name or record is
 * used anywhere in this file.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  GENERIC_ACCESS_ERROR,
  assertSessionScope,
  enterClassWithScopedSession,
  getMyAssignmentsWithSession,
  getProgressWithSession,
  isSessionActive,
  logProgressWithSession,
  registerAccessAttempt,
  resetAccessAttempts,
  saveLastPageWithSession,
  type ScopedStudentSession,
} from "../secure-student-access";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

const CHILD_A = "11111111-1111-1111-1111-111111111111";
const CHILD_B = "22222222-2222-2222-2222-222222222222";
const CLASS_A = "33333333-3333-3333-3333-333333333333";
const CLASS_B = "44444444-4444-4444-4444-444444444444";

function activeSession(overrides: Partial<ScopedStudentSession> = {}): ScopedStudentSession {
  return {
    studentId: CHILD_A,
    studentName: "Alumno Sintético",
    classId: CLASS_A,
    className: "Clase Sintética",
    sessionToken: "s".repeat(64),
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    ...overrides,
  };
}

describe("scoped student session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAccessAttempts();
  });

  it("never accepts a reusable student credential from the server", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        student_id: CHILD_A,
        student_name: "Alumno Sintético",
        student_code: "LEAK1",
        class_id: CLASS_A,
        class_name: "Clase Sintética",
        student_session_token: "s".repeat(64),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });
    vi.mocked(supabase.rpc).mockReturnValue({ single } as never);

    await expect(
      enterClassWithScopedSession({ joinCode: "SYN123", studentId: CHILD_A }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);
  });

  it("returns a scoped session, with no credential, on the secure shape", async () => {
    const expiresAt = new Date(Date.now() + 45 * 60_000).toISOString();
    const single = vi.fn().mockResolvedValue({
      data: {
        student_id: CHILD_A,
        student_name: "Alumno Sintético",
        class_id: CLASS_A,
        class_name: "Clase Sintética",
        student_session_token: "s".repeat(64),
        expires_at: expiresAt,
      },
      error: null,
    });
    vi.mocked(supabase.rpc).mockReturnValue({ single } as never);

    const session = await enterClassWithScopedSession({ joinCode: "syn123", studentId: CHILD_A });

    expect(session.studentId).toBe(CHILD_A);
    expect(session.classId).toBe(CLASS_A);
    expect(session.expiresAt).toBe(expiresAt);
    expect(Object.keys(session)).not.toContain("studentCode");
  });

  it("reports the same generic error whether the class or the child is wrong", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "class not found" } });
    vi.mocked(supabase.rpc).mockReturnValue({ single } as never);

    await expect(
      enterClassWithScopedSession({ joinCode: "NOPE12", studentId: CHILD_A }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);

    const single2 = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(supabase.rpc).mockReturnValue({ single: single2 } as never);

    await expect(
      enterClassWithScopedSession({ joinCode: "NOPE12", studentId: CHILD_B }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);
  });

  it("rate limits repeated attempts on the same class code", () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      expect(registerAccessAttempt("SYN123", now)).toBe(true);
    }
    expect(registerAccessAttempt("SYN123", now)).toBe(false);
    expect(registerAccessAttempt("SYN123", now + 61_000)).toBe(true);
  });

  it("treats an expired session as no session", () => {
    const expired = activeSession({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect(isSessionActive(expired)).toBe(false);
    expect(isSessionActive(activeSession())).toBe(true);
    expect(isSessionActive(null)).toBe(false);
  });

  it("refuses to read another child's progress", async () => {
    await expect(getProgressWithSession(activeSession(), CHILD_B)).rejects.toThrow(
      GENERIC_ACCESS_ERROR,
    );
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("refuses to write progress as another child", async () => {
    await expect(
      logProgressWithSession(activeSession(), {
        studentId: CHILD_B,
        lessonId: "1",
        kind: "lesson_completed",
      }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("refuses to write progress with no session at all", async () => {
    await expect(
      logProgressWithSession(null, { studentId: CHILD_A, lessonId: "1", kind: "exercise" }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("refuses a session replayed against a different class", () => {
    expect(() =>
      assertSessionScope(activeSession(), { studentId: CHILD_A, classId: CLASS_B }),
    ).toThrow(GENERIC_ACCESS_ERROR);
  });

  it("refuses to save another child's last page", async () => {
    await expect(
      saveLastPageWithSession(activeSession(), { studentId: CHILD_B, lessonId: "1", page: 2 }),
    ).rejects.toThrow(GENERIC_ACCESS_ERROR);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("saves the last page with the session token, via the secure RPC", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never);
    const session = activeSession();

    await saveLastPageWithSession(session, { studentId: CHILD_A, lessonId: "3", page: 5 });

    expect(supabase.rpc).toHaveBeenCalledWith("save_last_page_secure", {
      p_student_id: CHILD_A,
      p_class_id: session.classId,
      p_session_token: session.sessionToken,
      p_lesson_id: "3",
      p_page: 5,
    });
  });

  it("refuses to list another child's assignments", async () => {
    await expect(getMyAssignmentsWithSession(activeSession(), CHILD_B)).rejects.toThrow(
      GENERIC_ACCESS_ERROR,
    );
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("lists assignments via the secure RPC, with the session token instead of a student code", async () => {
    const rows = [
      {
        id: "a1",
        lesson_id: "3",
        title: null,
        due_at: null,
        time_limit_seconds: null,
        created_at: "now",
      },
    ];
    vi.mocked(supabase.rpc).mockResolvedValue({ data: rows, error: null } as never);
    const session = activeSession();

    const result = await getMyAssignmentsWithSession(session, CHILD_A);

    expect(supabase.rpc).toHaveBeenCalledWith("get_student_assignments_secure", {
      p_class_id: session.classId,
      p_student_id: CHILD_A,
      p_session_token: session.sessionToken,
    });
    expect(result).toEqual(rows);
  });

  it("sends the session token, never a student code, when writing progress", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never);
    const session = activeSession();

    await logProgressWithSession(session, {
      studentId: CHILD_A,
      lessonId: "7",
      kind: "exercise",
      score: 3,
      total: 4,
      meta: { exercise: "syllable_match", attempt: 1 },
    });

    const [rpcName, payload] = vi.mocked(supabase.rpc).mock.calls[0] as unknown as [
      string,
      Record<string, unknown>,
    ];
    expect(rpcName).toBe("log_student_progress_secure");
    expect(payload.p_session_token).toBe(session.sessionToken);
    expect(JSON.stringify(payload)).not.toContain("student_code");
  });

  it("rejects unknown progress metadata instead of storing it on a child", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never);

    await expect(
      logProgressWithSession(activeSession(), {
        studentId: CHILD_A,
        lessonId: "7",
        kind: "exercise",
        meta: { diagnosis: "anything at all" },
      }),
    ).rejects.toThrow(/Unknown progress metadata/);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
