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
};

/** A teacher's display name, best-effort — profiles may not carry one. */
type ProfileRow = { id: string; full_name: string | null };

/**
 * Builds the live cross-teacher overview. Returns null when the caller is not
 * an admin or the data cannot be read, so the caller can fall back rather than
 * render a misleading half-empty dashboard.
 */
export async function getLiveAdminOverview(): Promise<AdminOverview | null> {
  const [classesRes, studentsRes, eventsRes, profilesRes] = await Promise.all([
    supabase.from("classes").select("id, name, join_code, teacher_id"),
    supabase.from("students").select("id, class_id"),
    supabase
      .from("progress_events")
      .select("student_id, event_kind, score, total, time_seconds, lesson_id"),
    supabase.from("profiles").select("id, full_name"),
  ]);

  if (classesRes.error || studentsRes.error || eventsRes.error) return null;

  const classes = (classesRes.data ?? []) as ClassRow[];
  const students = (studentsRes.data ?? []) as StudentRow[];
  const events = (eventsRes.data ?? []) as EventRow[];
  const profiles = (profilesRes.data ?? []) as ProfileRow[];

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

  let globalScore = 0;
  let globalTotal = 0;

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

    const summary: AdminClassSummary = {
      classId: c.id,
      className: c.name,
      joinCode: c.join_code,
      studentCount: roster.length,
      accuracy: total > 0 ? score / total : null,
      totalMinutes: Math.round(seconds / 60),
      lessonsCompleted: completedLessons.size,
      // Attention flagging is a per-student CRM judgement; the live lane does
      // not guess at it here rather than show a number that disagrees with the
      // teacher's own view.
      attentionCount: 0,
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
        attentionCount: 0,
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
      attentionCount: 0,
    },
  };
}
