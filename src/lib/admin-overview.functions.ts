// admin-overview.functions.ts — the LIVE cross-teacher roll-up for the admin
// dashboard (D7 live lane, issue #343).
//
// The demo lane (getSeedAdminOverview in seed-data.ts) already produces this
// exact shape from seeded data. This module produces the same shape from the
// real database, so the admin dashboard renders one way and only its data
// source changes — the admin view stays a roll-up of what each teacher sees,
// never a second, divergent calculation.
//
// REQUIRES the admin RLS policies in
// supabase/migrations/20260725120000_admin_cross_teacher_read.sql. Without
// them every query below returns only the caller's own rows, because the base
// policies are scoped to `teacher_id = auth.uid()`. Those policies are
// SELECT-only: an admin can read every class but cannot modify another
// teacher's data.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isSeedAdmin, isSeedSessionActive } from "@/lib/seed-data";
import {
  buildRecentAccuracies,
  checkNeedsAttention,
  summarizeStudentProgress,
  type LessonProgressRow,
} from "@/lib/progress-calculation";
import type { AdminClassSummary, AdminOverview, AdminTeacherSummary } from "@/lib/seed-data";

/** True when the signed-in user actually holds the 'admin' role. */
export async function isLiveAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

/** Same check for whoever is signed in right now, so callers do not each have
 * to fetch the user first. False when nobody is signed in. */
export async function isCurrentUserLiveAdmin(): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;
  return isLiveAdmin(data.user.id);
}

/**
 * "Should this person see the Dirección (principal) area?" — for both lanes.
 *
 * The demo lane answers synchronously from local storage, so it must not wait
 * on a round-trip. A real session cannot be answered synchronously (the role
 * lives in the database), so it starts false and flips to true once the check
 * returns. Starting false is the safe direction: the entry appears when
 * confirmed rather than flashing for teachers who are not admins.
 */
export function useIsAdmin(): boolean {
  const seedAdmin = isSeedSessionActive() && isSeedAdmin();
  const [liveAdmin, setLiveAdmin] = useState(false);

  useEffect(() => {
    if (isSeedSessionActive()) return; // demo lane already answered
    let active = true;
    isCurrentUserLiveAdmin()
      .then((ok) => {
        if (active) setLiveAdmin(ok);
      })
      .catch(() => {
        if (active) setLiveAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return seedAdmin || liveAdmin;
}

type ClassRow = { id: string; name: string; join_code: string; teacher_id: string };
type StudentRow = { id: string; class_id: string };
type EventRow = {
  student_id: string;
  event_kind: string;
  score: number | null;
  total: number | null;
  time_seconds: number | null;
  lesson_id: string | null;
  meta: unknown;
  created_at: string;
};

/** A teacher's display name, best-effort — profiles may not carry one. */
type ProfileRow = { id: string; full_name: string | null };

/** Rows per request. PostgREST caps a single response, so anything unbounded
 * has to be read in pages or it comes back silently truncated. */
const PAGE_SIZE = 1000;

/** Hard ceiling across all pages. Reaching it fails the overview rather than
 * returning a partial one — see fetchAllRows. */
const MAX_ROWS = 100_000;

type PagedResult<T> = { data: T[] | null; error: { message: string } | null };

/**
 * Reads every row of a query, a page at a time.
 *
 * This is not an optimisation, it is a correctness fix. These queries span all
 * teachers, and a single PostgREST response is capped, so an unpaged read comes
 * back quietly truncated once the data grows. Truncation here does not just
 * lose rows, it produces *wrong numbers*: dropped exercise events change a
 * class's accuracy and a child's recent scores, dropped time events shrink the
 * minutes, and dropped lesson-progress rows make an active child look like they
 * have never done anything — which then flags them as needing attention. The
 * per-class teacher view never hits this because it reads one class and asks for
 * up to 5,000 events explicitly.
 *
 * Returns null on a failed page, and also null if MAX_ROWS is reached: past that
 * point the honest answer is "could not load this", not a confident total built
 * from part of the data. The caller renders its load-error state. If a school
 * ever genuinely exceeds the ceiling, the fix is to aggregate server-side rather
 * than to raise it.
 *
 * `page` must apply a stable, total ordering — with ties unbroken, rows can
 * shuffle between pages and be double-counted or missed.
 */
async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PagedResult<T>>,
): Promise<T[] | null> {
  const all: T[] = [];
  for (let start = 0; start < MAX_ROWS; start += PAGE_SIZE) {
    const { data, error } = await page(start, start + PAGE_SIZE - 1);
    if (error) return null;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) return all;
  }
  return null;
}

/**
 * Builds the live cross-teacher overview. Returns null when the caller is not
 * an admin or the data cannot be read, so the caller can fall back rather than
 * render a misleading half-empty dashboard.
 */
export async function getLiveAdminOverview(): Promise<AdminOverview | null> {
  const [classesRes, studentsRes, profilesRes] = await Promise.all([
    supabase.from("classes").select("id, name, join_code, teacher_id"),
    supabase.from("students").select("id, class_id"),
    supabase.from("profiles").select("id, full_name"),
  ]);

  if (classesRes.error || studentsRes.error) return null;

  const [pagedEvents, pagedLessonProgress] = await Promise.all([
    // Newest-first, because buildRecentAccuracies keeps only the newest attempt
    // at each activity — the same ordering getClassProgress uses. `id` breaks
    // ties so paging stays stable when timestamps collide.
    fetchAllRows<EventRow>((from, to) =>
      supabase
        .from("progress_events")
        .select("student_id, event_kind, score, total, time_seconds, lesson_id, meta, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    ),
    // Drives "last active" through the same summarizeStudentProgress the
    // teacher's own screens use, rather than a second interpretation of it.
    fetchAllRows<LessonProgressRow & { student_id: string }>((from, to) =>
      supabase
        .from("student_lesson_progress")
        .select("student_id, lesson_id, status, completed_at, last_active_at, last_page")
        .order("student_id", { ascending: true })
        .order("lesson_id", { ascending: true })
        .range(from, to),
    ),
  ]);

  // Both are load-bearing for the numbers on screen. A missing lesson-progress
  // read in particular would strip every student's last-active date and flag the
  // whole school as inactive, so it must fail the overview, not degrade it.
  if (!pagedEvents || !pagedLessonProgress) return null;

  const classes = (classesRes.data ?? []) as ClassRow[];
  const students = (studentsRes.data ?? []) as StudentRow[];
  const events = pagedEvents;
  // Names only, so this one stays best-effort: a failed read costs the labels
  // (they fall back to "Maestro") but no figure on the page.
  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const lessonProgress = pagedLessonProgress;

  const nameByTeacher = new Map(profiles.map((p) => [p.id, p.full_name ?? ""]));
  const studentsByClass = new Map<string, StudentRow[]>();
  for (const s of students) {
    const list = studentsByClass.get(s.class_id) ?? [];
    list.push(s);
    studentsByClass.set(s.class_id, list);
  }
  const eventsByStudent = new Map<string, EventRow[]>();
  for (const e of events) {
    const list = eventsByStudent.get(e.student_id) ?? [];
    list.push(e);
    eventsByStudent.set(e.student_id, list);
  }

  // "Needs attention", computed exactly as each teacher's own class overview
  // computes it: the same checkNeedsAttention rule, fed by the same two shared
  // helpers (buildRecentAccuracies for recent scores, summarizeStudentProgress
  // for last activity). The admin view is a roll-up of the teacher's numbers,
  // so this must never become a second opinion about the same child.
  const lessonRowsByStudent = new Map<string, LessonProgressRow[]>();
  for (const row of lessonProgress) {
    const list = lessonRowsByStudent.get(row.student_id) ?? [];
    list.push(row);
    lessonRowsByStudent.set(row.student_id, list);
  }
  const allStudentIds = students.map((s) => s.id);
  const recentAccuracies = buildRecentAccuracies(events, allStudentIds);
  const flaggedStudents = new Set<string>();
  for (const id of allStudentIds) {
    const { flagged } = checkNeedsAttention({
      lastActiveAt: summarizeStudentProgress(lessonRowsByStudent.get(id) ?? []).lastActiveAt,
      recentAccuracies: recentAccuracies[id] ?? [],
    });
    if (flagged) flaggedStudents.add(id);
  }

  let globalScore = 0;
  let globalTotal = 0;
  let globalAttention = 0;

  const byTeacher = new Map<string, AdminClassSummary[]>();
  for (const c of classes) {
    const roster = studentsByClass.get(c.id) ?? [];
    let score = 0;
    let total = 0;
    let seconds = 0;
    const completedLessons = new Set<string>();

    for (const s of roster) {
      for (const e of eventsByStudent.get(s.id) ?? []) {
        if (e.event_kind === "exercise") {
          score += e.score ?? 0;
          total += e.total ?? 0;
        }
        seconds += e.time_seconds ?? 0;
        if (e.event_kind === "lesson_completed" && e.lesson_id) {
          completedLessons.add(`${s.id}:${e.lesson_id}`);
        }
      }
    }
    globalScore += score;
    globalTotal += total;

    const classAttention = roster.filter((s) => flaggedStudents.has(s.id)).length;
    globalAttention += classAttention;

    const summary: AdminClassSummary = {
      classId: c.id,
      className: c.name,
      joinCode: c.join_code,
      studentCount: roster.length,
      accuracy: total > 0 ? score / total : null,
      totalMinutes: Math.round(seconds / 60),
      lessonsCompleted: completedLessons.size,
      attentionCount: classAttention,
    };
    const list = byTeacher.get(c.teacher_id) ?? [];
    list.push(summary);
    byTeacher.set(c.teacher_id, list);
  }

  const teachers: AdminTeacherSummary[] = [...byTeacher.entries()].map(
    ([teacherId, teacherClasses]) => {
      const scored = teacherClasses.filter((c) => c.accuracy !== null);
      return {
        teacherId,
        teacherName: nameByTeacher.get(teacherId) || "Maestro",
        classes: teacherClasses,
        studentCount: teacherClasses.reduce((sum, c) => sum + c.studentCount, 0),
        accuracy:
          scored.length > 0
            ? scored.reduce((sum, c) => sum + (c.accuracy ?? 0), 0) / scored.length
            : null,
        attentionCount: teacherClasses.reduce((sum, c) => sum + c.attentionCount, 0),
      };
    },
  );

  return {
    teachers,
    totals: {
      teacherCount: teachers.length,
      classCount: classes.length,
      studentCount: students.length,
      accuracy: globalTotal > 0 ? globalScore / globalTotal : null,
      attentionCount: globalAttention,
    },
  };
}
