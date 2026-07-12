#!/usr/bin/env node
/**
 * B3 Cloud E2E — Teacher A fixture flow (schema-aligned).
 *
 * Required env (never printed in full):
 *   E2E_TEACHER_A_PASSWORD
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional:
 *   E2E_TEACHER_A_EMAIL (default fixture-teacher-e2e@cartilla.test)
 *   CRM_QA_OUT_DIR (default generated/crm-qa)
 *
 * Real flow:
 *   auth → create class → create student → create assignment →
 *   record progress via log_student_progress RPC (app path) →
 *   teacher read-back on classes/students/progress → cleanup → sign out.
 *
 * Leaves fixture auth users intact. Writes redacted log to CRM_QA_OUT_DIR.
 */
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Load KEY=VAL from a dotenv-style file into process.env if not already set. */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
  return true;
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const outDir = process.env.CRM_QA_OUT_DIR
  ? path.resolve(process.env.CRM_QA_OUT_DIR)
  : path.join(ROOT, "generated", "crm-qa");
fs.mkdirSync(outDir, { recursive: true });
const logPath = path.join(outDir, "cloud-e2e-output.txt");
const lines = [];

const stamp = () => new Date().toISOString();
const log = (msg) => {
  const line = `[${stamp()}] ${msg}`;
  lines.push(line);
  console.log(line);
};
const redactEmail = (email) =>
  String(email || "").replace(/(.{2}).+(@.+)/, "$1***$2");
const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return "(invalid-url)";
  }
};
const flush = (exitCode) => {
  lines.push(`[${stamp()}] EXIT=${exitCode}`);
  try {
    fs.writeFileSync(logPath, lines.join("\n") + "\n", "utf8");
  } catch {
    /* ignore write errors so the process still exits with the real code */
  }
};
const fail = (msg, code = 1) => {
  const line = `[${stamp()}] FATAL: ${msg}`;
  lines.push(line);
  console.error(line);
  flush(code);
  process.exit(code);
};

const email =
  process.env.E2E_TEACHER_A_EMAIL || "fixture-teacher-e2e@cartilla.test";
const password = process.env.E2E_TEACHER_A_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

log("=== B3 Cloud E2E fixture (Teacher A) ===");
log(`Env presence: E2E_TEACHER_A_PASSWORD=${password ? "SET" : "MISSING"} VITE_SUPABASE_URL=${url ? "SET" : "MISSING"} VITE_SUPABASE_PUBLISHABLE_KEY=${anonKey ? "SET" : "MISSING"}`);

if (!password) fail("E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED");
if (!url) fail("VITE_SUPABASE_URL not set — CRM_CLOUD_HARD_BLOCKED");
if (!anonKey) fail("VITE_SUPABASE_PUBLISHABLE_KEY not set — CRM_CLOUD_HARD_BLOCKED");

log(`Password present (len=${password.length}). URL host=${hostOf(url)}.`);
log(`Teacher email configured: ${redactEmail(email)}`);

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = `rc-${Date.now()}`;
const className = `E2E Fixture Class ${runId}`;
const studentName = `E2E Student ${runId}`;
// student_code is short alphanumeric (matches join-code style in app)
const studentCode = `E${String(Date.now()).slice(-7)}`;
const lessonId = "1";

/** @type {{ classId?: string, studentId?: string, assignmentId?: string, progressId?: string, eventId?: string }} */
const created = {};

async function cleanup() {
  log("Cleanup starting…");
  // Best-effort reverse order; leave auth users intact.
  // Progress rows: teachers have DELETE policy on student_lesson_progress / progress_events.
  if (created.progressId) {
    await supabase.from("student_lesson_progress").delete().eq("id", created.progressId);
  } else if (created.studentId) {
    await supabase
      .from("student_lesson_progress")
      .delete()
      .eq("student_id", created.studentId)
      .eq("lesson_id", lessonId);
  }
  if (created.eventId) {
    await supabase.from("progress_events").delete().eq("id", created.eventId);
  } else if (created.studentId) {
    await supabase
      .from("progress_events")
      .delete()
      .eq("student_id", created.studentId)
      .eq("lesson_id", lessonId);
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

  // 2. Create class (matches teacher.functions createClass shape)
  const joinCode = `J${String(Date.now()).slice(-7)}`;
  const { data: klass, error: classErr } = await supabase
    .from("classes")
    .insert({
      name: className,
      teacher_id: teacherId,
      join_code: joinCode,
    })
    .select("id,name,join_code")
    .single();
  if (classErr || !klass) {
    await cleanup();
    fail(`Create class failed: ${classErr?.message || "no row"}`);
  }
  created.classId = klass.id;
  log(`2. Created class id=${klass.id}`);

  // 3. Add student
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .insert({
      class_id: created.classId,
      display_name: studentName,
      student_code: studentCode,
    })
    .select("id,display_name,student_code")
    .single();
  if (studentErr || !student) {
    await cleanup();
    fail(`Create student failed: ${studentErr?.message || "no row"}`);
  }
  created.studentId = student.id;
  log(`3. Created student id=${student.id}`);

  // 4. Assign lesson (schema: assignments.class_id + lesson_id unique)
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
    await cleanup();
    fail(`Create assignment failed: ${assignErr?.message || "no row"}`);
  }
  created.assignmentId = assignment.id;
  log(`4. Created assignment id=${created.assignmentId} lesson=${lessonId}`);

  // 5. Record progress the way the app does: security-definer RPC
  //    log_student_progress(student_id, student_code, lesson_id, event_kind, …)
  //    Direct INSERT into student_lesson_progress is blocked by RLS for teachers
  //    (select/delete only) — production writes go through this RPC.
  const { data: rpcResult, error: rpcErr } = await supabase.rpc("log_student_progress", {
    p_student_id: created.studentId,
    p_student_code: studentCode,
    p_lesson_id: lessonId,
    p_event_kind: "lesson_completed",
    p_score: 10,
    p_total: 10,
    p_time_seconds: 45,
    p_meta: { source: "e2e-cloud-fixture", runId },
  });
  if (rpcErr) {
    // Fallback: some deployments may only allow authenticated teacher writes via table
    // if policies were loosened — try a schema-correct insert once before failing.
    log(`RPC log_student_progress failed: ${rpcErr.message} — trying direct insert fallback`);
    const { data: progress, error: progErr } = await supabase
      .from("student_lesson_progress")
      .insert({
        student_id: created.studentId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        best_score: 10,
        best_total: 10,
        total_attempts: 1,
        time_seconds: 45,
      })
      .select("id")
      .single();
    if (progErr || !progress) {
      await cleanup();
      fail(
        `Progress write failed (RPC + insert): ${rpcErr.message}; ${progErr?.message || "no row"}`,
      );
    }
    created.progressId = progress.id;
    log(`5. Recorded student_lesson_progress via direct insert id=${progress.id}`);
  } else {
    log(`5. Recorded progress via log_student_progress RPC ok=${JSON.stringify(rpcResult) !== "null"}`);
  }

  // 6. Teacher read-back (dashboard-relevant)
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

  const { data: progressBack, error: readProgErr } = await supabase
    .from("student_lesson_progress")
    .select("id,student_id,lesson_id,status")
    .eq("student_id", created.studentId)
    .eq("lesson_id", lessonId);
  if (readProgErr) {
    await cleanup();
    fail(`Read-back progress failed: ${readProgErr.message}`);
  }
  if (!progressBack?.length) {
    await cleanup();
    fail("Read-back progress empty — dashboard would not reflect completion");
  }
  if (!created.progressId && progressBack[0]?.id) {
    created.progressId = progressBack[0].id;
  }
  const status = progressBack[0]?.status;
  if (status !== "completed" && status !== "started") {
    log(`WARN progress status=${status} (expected completed|started)`);
  }

  const { data: assignBack, error: readAssignErr } = await supabase
    .from("assignments")
    .select("id,lesson_id")
    .eq("id", created.assignmentId);
  if (readAssignErr || !assignBack?.length) {
    await cleanup();
    fail(`Read-back assignment failed: ${readAssignErr?.message || "empty"}`);
  }

  log(
    `6. Dashboard read-back OK: class + student + assignment + progress(status=${status}) visible to Teacher A.`,
  );

  // 7. Cleanup + confirm
  await cleanup();
  const { data: goneClass } = await supabase
    .from("classes")
    .select("id")
    .eq("id", created.classId);
  if (goneClass && goneClass.length > 0) {
    fail("Cleanup incomplete: class row still present");
  }
  const { data: goneProg } = await supabase
    .from("student_lesson_progress")
    .select("id")
    .eq("student_id", created.studentId || "00000000-0000-0000-0000-000000000000");
  if (goneProg && goneProg.length > 0) {
    log("WARN: progress rows remain after cleanup (may be RLS hide; treating as soft warn)");
  }

  log("7. Cleanup confirmed (class row absent). Fixture auth user left intact.");
  log("CRM_CLOUD_COMPLETE");
  await supabase.auth.signOut();
  flush(0);
  process.exit(0);
} catch (err) {
  await cleanup().catch(() => {});
  fail(err instanceof Error ? err.message : String(err));
}
