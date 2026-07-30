// Scoped, short-lived student access.
//
// The problem this replaces: the anonymous class-code flow handed back a
// child's `student_code`, a reusable credential. Anyone holding a class join
// code could therefore read a child's learning history and write progress as
// that child.
//
// The replacement: the server issues a session token that is tied to ONE child
// and ONE class and expires. The browser never receives a reusable credential,
// and every read/write is checked server-side against the session.
//
// This module is the client half. It is deliberately inert until the prepared
// migration is applied, because that migration changes authentication on real
// children's records and needs the owner's sign-off first.

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { validateProgressMeta } from "@/lib/student-progress-meta";

/**
 * One generic message for every failure in this flow. Distinct messages would
 * confirm whether a class or a child exists, which is exactly the information
 * an attacker with a guessed code is fishing for.
 */
export const GENERIC_ACCESS_ERROR = "No se pudo entrar a la clase.";

export class StudentAccessError extends Error {
  constructor() {
    super(GENERIC_ACCESS_ERROR);
    this.name = "StudentAccessError";
  }
}

export type ScopedStudentSession = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  sessionToken: string;
  expiresAt: string;
};

const enterClassInput = z.object({
  joinCode: z.string().trim().min(4).max(10),
  studentId: z.string().uuid(),
});

/** Shape the secure RPC is allowed to return. Note: no `student_code`. */
const scopedSessionRow = z
  .object({
    student_id: z.string().uuid(),
    student_name: z.string(),
    class_id: z.string().uuid(),
    class_name: z.string(),
    student_session_token: z.string().min(32),
    expires_at: z.string(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

const ATTEMPT_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

/**
 * Client-side throttle on class-code attempts. This is the cheap half of the
 * defence and is honest about its limits: it slows down guessing in a real
 * browser, it cannot stop someone calling the API directly. The server-side
 * session checks in the prepared migration are what actually protect the data.
 */
export function registerAccessAttempt(key: string, now: number = Date.now()): boolean {
  const normalized = key.trim().toUpperCase();
  const recent = (attempts.get(normalized) ?? []).filter((at) => now - at < ATTEMPT_WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS_PER_WINDOW) {
    attempts.set(normalized, recent);
    return false;
  }
  recent.push(now);
  attempts.set(normalized, recent);
  return true;
}

export function resetAccessAttempts() {
  attempts.clear();
}

// ---------------------------------------------------------------------------
// Session validity and scope
// ---------------------------------------------------------------------------

export function isSessionActive(
  session: ScopedStudentSession | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!session) return false;
  const expiry = Date.parse(session.expiresAt);
  if (Number.isNaN(expiry)) return false;
  return expiry > now;
}

/**
 * A session may only ever act as its own child, inside its own class. This is
 * what stops one child's session being replayed against another child's id.
 */
export function assertSessionScope(
  session: ScopedStudentSession | null | undefined,
  target: { studentId: string; classId?: string },
  now: number = Date.now(),
): asserts session is ScopedStudentSession {
  if (!isSessionActive(session, now)) throw new StudentAccessError();
  if (session!.studentId !== target.studentId) throw new StudentAccessError();
  if (target.classId !== undefined && session!.classId !== target.classId) {
    throw new StudentAccessError();
  }
}

// ---------------------------------------------------------------------------
// Server calls
// ---------------------------------------------------------------------------

/**
 * Step 2 of the class-code + tap-your-name flow, secured: returns a scoped,
 * expiring session instead of a reusable student credential.
 */
export async function enterClassWithScopedSession(input: {
  joinCode: string;
  studentId: string;
}): Promise<ScopedStudentSession> {
  let data: z.infer<typeof enterClassInput>;
  try {
    data = enterClassInput.parse(input);
  } catch {
    throw new StudentAccessError();
  }

  if (!registerAccessAttempt(data.joinCode)) throw new StudentAccessError();

  const { data: row, error } = await supabase
    .rpc("enter_class_as_student", {
      p_join_code: data.joinCode.toUpperCase(),
      p_student_id: data.studentId,
    })
    .single();

  if (error || !row) throw new StudentAccessError();

  // Defence in depth: if a future server change ever reintroduces a reusable
  // credential in this payload, fail rather than accept and store it.
  const parsed = scopedSessionRow.safeParse(row);
  if (!parsed.success) throw new StudentAccessError();

  return {
    studentId: parsed.data.student_id,
    studentName: parsed.data.student_name,
    classId: parsed.data.class_id,
    className: parsed.data.class_name,
    sessionToken: parsed.data.student_session_token,
    expiresAt: parsed.data.expires_at,
  };
}

/** Writes one progress event as the session's own child, with validated metadata. */
export async function logProgressWithSession(
  session: ScopedStudentSession | null,
  input: {
    studentId: string;
    lessonId: string;
    kind: "lesson_completed" | "exercise" | "time" | "badge" | "level";
    score?: number;
    total?: number;
    timeSeconds?: number;
    meta?: Record<string, unknown>;
  },
): Promise<{ ok: true }> {
  assertSessionScope(session, { studentId: input.studentId });
  const meta = validateProgressMeta(input.meta);

  const { error } = await supabase.rpc("log_student_progress_secure", {
    p_student_id: input.studentId,
    p_class_id: session.classId,
    p_session_token: session.sessionToken,
    p_lesson_id: input.lessonId,
    p_event_kind: input.kind,
    p_score: input.score ?? null,
    p_total: input.total ?? null,
    p_time_seconds: input.timeSeconds ?? null,
    p_meta: meta,
  });
  if (error) throw new StudentAccessError();
  return { ok: true };
}

/** Reads the session's own child's progress. Never another child's. */
export async function getProgressWithSession(
  session: ScopedStudentSession | null,
  studentId: string,
): Promise<unknown> {
  assertSessionScope(session, { studentId });
  const { data, error } = await supabase.rpc("get_student_progress_secure", {
    p_student_id: studentId,
    p_class_id: session.classId,
    p_session_token: session.sessionToken,
  });
  if (error) throw new StudentAccessError();
  return data ?? { events: [], lessonProgress: [] };
}

/** Saves the reader's current page, scoped to the session's own child. */
export async function saveLastPageWithSession(
  session: ScopedStudentSession | null,
  input: { studentId: string; lessonId: string; page: number },
): Promise<{ ok: true }> {
  assertSessionScope(session, { studentId: input.studentId });
  const { error } = await supabase.rpc("save_last_page_secure", {
    p_student_id: input.studentId,
    p_class_id: session.classId,
    p_session_token: session.sessionToken,
    p_lesson_id: input.lessonId,
    p_page: input.page,
  });
  if (error) throw new StudentAccessError();
  return { ok: true };
}

export type StudentAssignmentRow = {
  id: string;
  lesson_id: string;
  title: string | null;
  due_at: string | null;
  time_limit_seconds: number | null;
  created_at: string;
};

/** Lists the session's own child's assignments. Never another child's. */
export async function getMyAssignmentsWithSession(
  session: ScopedStudentSession | null,
  studentId: string,
): Promise<StudentAssignmentRow[]> {
  assertSessionScope(session, { studentId });
  const { data, error } = await supabase.rpc("get_student_assignments_secure", {
    p_class_id: session.classId,
    p_student_id: studentId,
    p_session_token: session.sessionToken,
  });
  if (error) throw new StudentAccessError();
  return (data ?? []) as StudentAssignmentRow[];
}
