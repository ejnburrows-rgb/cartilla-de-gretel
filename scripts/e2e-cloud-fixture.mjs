#!/usr/bin/env node
/**
 * B3 Cloud E2E — Teacher A fixture flow.
 *
 * Required env (never printed):
 *   E2E_TEACHER_A_PASSWORD
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional:
 *   E2E_TEACHER_A_EMAIL (default fixture-teacher-e2e@cartilla.test)
 *
 * Steps: auth → create class/student/assignment → record progress → assert → cleanup.
 * Leaves fixture auth users intact. Does not print secrets.
 */
import process from "node:process";

const stamp = () => new Date().toISOString();
const log = (msg) => console.log(`[${stamp()}] ${msg}`);
const fail = (msg, code = 1) => {
  console.error(`[${stamp()}] FATAL: ${msg}`);
  process.exit(code);
};

const email = process.env.E2E_TEACHER_A_EMAIL || "fixture-teacher-e2e@cartilla.test";
const password = process.env.E2E_TEACHER_A_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

log("=== B3 Cloud E2E fixture (Teacher A) ===");

if (!password) fail("E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED");
if (!url) fail("VITE_SUPABASE_URL not set — CRM_CLOUD_HARD_BLOCKED");
if (!anonKey) fail("VITE_SUPABASE_PUBLISHABLE_KEY not set — CRM_CLOUD_HARD_BLOCKED");

log(`Password env present (len=${password.length}). URL host=${new URL(url).host}.`);
log(`Teacher email configured: ${email.replace(/(.{3}).+(@.+)/, "$1***$2")}`);

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = `rc-${Date.now()}`;
const className = `E2E Fixture Class ${runId}`;
const studentName = `E2E Student ${runId}`;
const studentCode = `E2E${String(Date.now()).slice(-6)}`;
const lessonId = "1";

/** @type {{ classId?: string, studentId?: string, assignmentId?: string, progressId?: string }} */
const created = {};

async function cleanup() {
  log("Cleanup starting…");
  // Best-effort reverse order; leave auth users intact.
  if (created.progressId) {
    await supabase.from("student_lesson_progress").delete().eq("id", created.progressId);
  }
  if (created.assignmentId) {
    await supabase.from("assignments").delete().eq("id", created.assignmentId);
  }
  if (created.studentId) {
    await supabase.from("students").delete().eq("id", created.studentId);
  }
  if (created.classId) {
    await supabase.from("classes").delete().eq("id", created.classId);
  }
  log("Cleanup requests issued.");
}

try {
  // 1. Authenticate Teacher A
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (authErr || !authData.session) {
    fail(`Auth failed: ${authErr?.message || "no session"}`);
  }
  const teacherId = authData.user?.id;
  if (!teacherId) fail("Auth succeeded but user id missing");
  log("1. Authenticated Teacher A.");

  // 2–3. Create class
  const { data: klass, error: classErr } = await supabase
    .from("classes")
    .insert({
      name: className,
      teacher_id: teacherId,
      join_code: `J${String(Date.now()).slice(-7)}`,
    })
    .select("id,name")
    .single();
  if (classErr || !klass) {
    await cleanup();
    fail(`Create class failed: ${classErr?.message || "no row"}`);
  }
  created.classId = klass.id;
  log(`2. Created class id=${klass.id} name=${className}`);

  // 4. Add student
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .insert({
      class_id: created.classId,
      display_name: studentName,
      student_code: studentCode,
    })
    .select("id,display_name")
    .single();
  if (studentErr || !student) {
    await cleanup();
    fail(`Create student failed: ${studentErr?.message || "no row"}`);
  }
  created.studentId = student.id;
  log(`3. Created student id=${student.id}`);

  // 5. Assign lesson
  const { data: assignment, error: assignErr } = await supabase
    .from("assignments")
    .insert({
      class_id: created.classId,
      lesson_id: lessonId,
      title: `E2E Assignment ${runId}`,
    })
    .select("id,lesson_id")
    .single();
  if (assignErr || !assignment) {
    // Some schemas use assignment_progress only; try alternate table names once.
    log(`Assignment insert via assignments failed: ${assignErr?.message || "no row"}`);
    const alt = await supabase
      .from("lesson_assignments")
      .insert({
        class_id: created.classId,
        lesson_id: lessonId,
        title: `E2E Assignment ${runId}`,
      })
      .select("id")
      .single();
    if (alt.error || !alt.data) {
      await cleanup();
      fail(`Create assignment failed on both tables: ${assignErr?.message}; ${alt.error?.message}`);
    }
    created.assignmentId = alt.data.id;
  } else {
    created.assignmentId = assignment.id;
  }
  log(`4. Created assignment id=${created.assignmentId} lesson=${lessonId}`);

  // 6. Record progress through app-compatible tables
  const progressPayload = {
    student_id: created.studentId,
    class_id: created.classId,
    lesson_id: lessonId,
    status: "completed",
    completion_percent: 100,
  };
  const { data: progress, error: progErr } = await supabase
    .from("student_lesson_progress")
    .insert(progressPayload)
    .select("id")
    .single();
  if (progErr || !progress) {
    const eventInsert = await supabase.from("progress_events").insert({
      student_id: created.studentId,
      class_id: created.classId,
      lesson_id: lessonId,
      kind: "lesson_completed",
    });
    if (eventInsert.error) {
      await cleanup();
      fail(
        `Progress write failed: ${progErr?.message || "no progress row"}; events: ${eventInsert.error.message}`,
      );
    }
    log("5. Recorded progress_events lesson_completed (student_lesson_progress unavailable).");
  } else {
    created.progressId = progress.id;
    log(`5. Recorded student_lesson_progress id=${progress.id}`);
  }

  // 7–8. Read back dashboard-relevant data
  const { data: classesBack, error: readClassErr } = await supabase
    .from("classes")
    .select("id,name")
    .eq("id", created.classId);
  if (readClassErr || !classesBack?.length) {
    await cleanup();
    fail(`Read-back class failed: ${readClassErr?.message || "empty"}`);
  }

  const { data: studentsBack, error: readStudErr } = await supabase
    .from("students")
    .select("id,display_name")
    .eq("class_id", created.classId);
  if (readStudErr || !studentsBack?.some((s) => s.id === created.studentId)) {
    await cleanup();
    fail(`Read-back student failed: ${readStudErr?.message || "missing student"}`);
  }

  log("6. Dashboard read-back OK: class + student visible to Teacher A.");

  // 9–10. Cleanup + confirm
  await cleanup();
  const { data: gone } = await supabase.from("classes").select("id").eq("id", created.classId);
  if (gone && gone.length > 0) {
    fail("Cleanup incomplete: class row still present");
  }
  log("7. Cleanup confirmed (class row absent). Fixture auth user left intact.");
  log("CRM_CLOUD_COMPLETE");
  await supabase.auth.signOut();
  process.exit(0);
} catch (err) {
  await cleanup().catch(() => {});
  fail(err instanceof Error ? err.message : String(err));
}
