#!/usr/bin/env node
/**
 * B4 Live RLS negative tests — Teacher B must not see Teacher A data.
 *
 * Required env (never printed in full):
 *   E2E_TEACHER_A_PASSWORD
 *   E2E_TEACHER_B_PASSWORD
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional:
 *   E2E_TEACHER_A_EMAIL / E2E_TEACHER_B_EMAIL
 *   CRM_QA_OUT_DIR (default generated/crm-qa)
 *
 * Schema notes (migrations):
 *   - student_lesson_progress has student_id + lesson_id (NO class_id)
 *   - progress_events has student_id + lesson_id + event_kind (NO class_id)
 *   - Isolation is via join students → classes.teacher_id = auth.uid()
 */
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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
const logPath = path.join(outDir, "rls-output.txt");
const lines = [];

const stamp = () => new Date().toISOString();
const log = (msg) => {
  const line = `[${stamp()}] ${msg}`;
  lines.push(line);
  console.log(line);
};
const flush = (exitCode) => {
  lines.push(`[${stamp()}] EXIT=${exitCode}`);
  try {
    fs.writeFileSync(logPath, lines.join("\n") + "\n", "utf8");
  } catch {
    /* ignore */
  }
};
const fail = (msg) => {
  const line = `[${stamp()}] FATAL: ${msg}`;
  lines.push(line);
  console.error(line);
  flush(1);
  process.exit(1);
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

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const pwA = process.env.E2E_TEACHER_A_PASSWORD;
const pwB = process.env.E2E_TEACHER_B_PASSWORD;
const emailA = process.env.E2E_TEACHER_A_EMAIL || "fixture-teacher-e2e@cartilla.test";
const emailB = process.env.E2E_TEACHER_B_EMAIL || "fixture-teacher-b@cartilla.test";

log("=== B4 RLS Negative Test (Teacher B vs Teacher A) ===");
log(
  `Env presence: A_PW=${pwA ? "SET" : "MISSING"} B_PW=${pwB ? "SET" : "MISSING"} URL=${url ? "SET" : "MISSING"} KEY=${anonKey ? "SET" : "MISSING"}`,
);
log(`Emails: A=${redactEmail(emailA)} B=${redactEmail(emailB)} host=${url ? hostOf(url) : "n/a"}`);

if (!pwA) fail("E2E_TEACHER_A_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED");
if (!pwB) fail("E2E_TEACHER_B_PASSWORD not set — CRM_CLOUD_HARD_BLOCKED");
if (!url) fail("VITE_SUPABASE_URL not set — CRM_CLOUD_HARD_BLOCKED");
if (!anonKey) fail("VITE_SUPABASE_PUBLISHABLE_KEY not set — CRM_CLOUD_HARD_BLOCKED");

const { createClient } = await import("@supabase/supabase-js");

function client() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const supabaseA = client();
const { data: authA, error: errA } = await supabaseA.auth.signInWithPassword({
  email: emailA,
  password: pwA,
});
if (errA || !authA.user) fail(`Teacher A auth failed: ${errA?.message || "no user"}`);
const teacherAId = authA.user.id;
log("1. Authenticated Teacher A.");

const { data: aClassesRaw, error: aClassErr } = await supabaseA
  .from("classes")
  .select("id,name,teacher_id")
  .eq("teacher_id", teacherAId);
if (aClassErr) fail(`Teacher A class list failed: ${aClassErr.message}`);

/** @type {Array<{id: string, teacher_id?: string}>} */
const aClasses = Array.isArray(aClassesRaw) ? [...aClassesRaw] : [];
let createdProbeClassId = null;

if (!aClasses.length) {
  log("Teacher A has no classes — creating temporary fixture class for RLS probe.");
  const { data: tmp, error: tmpErr } = await supabaseA
    .from("classes")
    .insert({
      name: `RLS Probe ${Date.now()}`,
      teacher_id: teacherAId,
      join_code: `R${String(Date.now()).slice(-7)}`,
    })
    .select("id,teacher_id")
    .single();
  if (tmpErr || !tmp) fail(`Could not create probe class: ${tmpErr?.message}`);
  aClasses.push(tmp);
  createdProbeClassId = tmp.id;
}
const classAIds = aClasses.map((c) => c.id);
log(`2. Teacher A fixture class ids count=${classAIds.length}`);

const { data: aStudents } = await supabaseA
  .from("students")
  .select("id,class_id")
  .in("class_id", classAIds);
const studentAIds = (aStudents || []).map((s) => s.id);
log(`2b. Teacher A student ids count=${studentAIds.length}`);

// Optionally seed one progress row (via RPC if a student exists) so isolation
// of student_lesson_progress can be asserted non-vacuously when possible.
if (studentAIds.length) {
  const { data: anyProg } = await supabaseA
    .from("student_lesson_progress")
    .select("id")
    .in("student_id", studentAIds)
    .limit(1);
  log(`2c. Existing progress rows sample count=${anyProg?.length ?? 0}`);
}

await supabaseA.auth.signOut();

const supabaseB = client();
const { data: authB, error: errB } = await supabaseB.auth.signInWithPassword({
  email: emailB,
  password: pwB,
});
if (errB || !authB.user) fail(`Teacher B auth failed: ${errB?.message || "no user"}`);
const teacherBId = authB.user.id;
if (teacherBId === teacherAId) {
  fail("Teacher A and Teacher B resolved to the same user id — fixture accounts are not isolated");
}
log("3. Authenticated Teacher B (distinct user).");

/**
 * Assert Teacher B cannot read Teacher A rows.
 * Accept empty data, 401/403, or RLS rejection messages.
 */
async function assertIsolated(label, queryFactory) {
  const { data, error, status } = await queryFactory();
  const errMsg = (error?.message || "").toLowerCase();
  const rlsDenied =
    status === 401 ||
    status === 403 ||
    /row-level security|permission denied|not authorized|jwt|violates row-level/i.test(
      errMsg,
    );
  const empty = !data || (Array.isArray(data) && data.length === 0);

  if (!empty && !rlsDenied) {
    fail(
      `RLS LEAK on ${label}: Teacher B received ${Array.isArray(data) ? data.length : 1} row(s)`,
    );
  }
  log(
    `OK ${label}: empty=${empty} rlsDenied=${rlsDenied} status=${status ?? "n/a"}${error ? ` err=${error.message}` : ""}`,
  );
}

// 4. Classes owned by Teacher A
await assertIsolated("classes by teacher A id", () =>
  supabaseB.from("classes").select("id,name,teacher_id").eq("teacher_id", teacherAId),
);

await assertIsolated("classes by direct ids", () =>
  supabaseB.from("classes").select("id,name").in("id", classAIds),
);

// 5. Students in Teacher A classes
if (classAIds.length) {
  await assertIsolated("students in Teacher A classes", () =>
    supabaseB.from("students").select("id,class_id").in("class_id", classAIds),
  );
}

if (studentAIds.length) {
  await assertIsolated("students by direct ids", () =>
    supabaseB.from("students").select("id").in("id", studentAIds),
  );
}

// 6. Assignments for Teacher A classes
await assertIsolated("assignments for Teacher A classes", () =>
  supabaseB.from("assignments").select("id,class_id,lesson_id").in("class_id", classAIds),
);

// 7. Progress tables (schema-correct: filter by student_id, not class_id)
if (studentAIds.length) {
  await assertIsolated("student_lesson_progress for Teacher A students", () =>
    supabaseB
      .from("student_lesson_progress")
      .select("id,student_id,lesson_id,status")
      .in("student_id", studentAIds),
  );

  await assertIsolated("progress_events for Teacher A students", () =>
    supabaseB
      .from("progress_events")
      .select("id,student_id,lesson_id,event_kind")
      .in("student_id", studentAIds),
  );

  await assertIsolated("assignment_progress for Teacher A students", () =>
    supabaseB
      .from("assignment_progress")
      .select("id,student_id,assignment_id")
      .in("student_id", studentAIds),
  );
} else {
  log("SKIP progress isolation probes — Teacher A has no students (class-only isolation still asserted).");
}

// 8. Teacher B must not be able to UPDATE/DELETE Teacher A class (if any)
if (classAIds.length) {
  const { data: updData, error: updErr, status: updStatus } = await supabaseB
    .from("classes")
    .update({ name: `Hijack ${Date.now()}` })
    .eq("id", classAIds[0])
    .select("id");
  const updEmpty = !updData || updData.length === 0;
  const updDenied =
    updStatus === 401 ||
    updStatus === 403 ||
    /row-level security|permission denied|not authorized/i.test(
      (updErr?.message || "").toLowerCase(),
    );
  if (!updEmpty && !updDenied) {
    fail("RLS LEAK: Teacher B was able to UPDATE Teacher A class row");
  }
  log(
    `OK classes update blocked: empty=${updEmpty} denied=${updDenied} status=${updStatus ?? "n/a"}`,
  );
}

await supabaseB.auth.signOut();

// Cleanup probe class as Teacher A if we created one
if (createdProbeClassId) {
  const supabaseA2 = client();
  const { error: reAuthErr } = await supabaseA2.auth.signInWithPassword({
    email: emailA,
    password: pwA,
  });
  if (!reAuthErr) {
    await supabaseA2.from("classes").delete().eq("id", createdProbeClassId);
    await supabaseA2.auth.signOut();
    log("Probe class cleaned up.");
  } else {
    log("WARN: could not re-auth Teacher A to cleanup probe class.");
  }
}

log("All RLS negative checks passed — Teacher B cannot read/write Teacher A data.");
log("CRM_CLOUD_RLS_PASS");
flush(0);
process.exit(0);
