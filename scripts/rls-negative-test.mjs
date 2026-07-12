#!/usr/bin/env node
/**
 * B4 Live RLS negative tests — Teacher B must not see Teacher A data.
 *
 * Required env (never printed):
 *   E2E_TEACHER_A_PASSWORD
 *   E2E_TEACHER_B_PASSWORD
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Optional:
 *   E2E_TEACHER_A_EMAIL
 *   E2E_TEACHER_B_EMAIL
 */
import process from "node:process";

const stamp = () => new Date().toISOString();
const log = (msg) => console.log(`[${stamp()}] ${msg}`);
const fail = (msg) => {
  console.error(`[${stamp()}] FATAL: ${msg}`);
  process.exit(1);
};

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const pwA = process.env.E2E_TEACHER_A_PASSWORD;
const pwB = process.env.E2E_TEACHER_B_PASSWORD;
const emailA = process.env.E2E_TEACHER_A_EMAIL || "fixture-teacher-e2e@cartilla.test";
const emailB = process.env.E2E_TEACHER_B_EMAIL || "fixture-teacher-b@cartilla.test";

log("=== B4 RLS Negative Test (Teacher B vs Teacher A) ===");

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

const { data: aClasses, error: aClassErr } = await supabaseA
  .from("classes")
  .select("id,name,teacher_id")
  .eq("teacher_id", teacherAId);
if (aClassErr) fail(`Teacher A class list failed: ${aClassErr.message}`);
if (!aClasses?.length) {
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
}
const classAIds = aClasses.map((c) => c.id);
log(`2. Teacher A fixture class ids count=${classAIds.length}`);

const { data: aStudents } = await supabaseA
  .from("students")
  .select("id,class_id")
  .in("class_id", classAIds);
const studentAIds = (aStudents || []).map((s) => s.id);

await supabaseA.auth.signOut();

const supabaseB = client();
const { data: authB, error: errB } = await supabaseB.auth.signInWithPassword({
  email: emailB,
  password: pwB,
});
if (errB || !authB.user) fail(`Teacher B auth failed: ${errB?.message || "no user"}`);
log("3. Authenticated Teacher B.");

/**
 * Assert Teacher B cannot read Teacher A rows.
 * Accept empty data, 403-like errors, or RLS rejection messages.
 */
async function assertIsolated(label, queryFactory) {
  const { data, error, status } = await queryFactory();
  const errMsg = (error?.message || "").toLowerCase();
  const rlsDenied =
    status === 401 ||
    status === 403 ||
    /row-level security|permission denied|not authorized|jwt/i.test(errMsg);
  const empty = !data || (Array.isArray(data) && data.length === 0);

  if (!empty && !rlsDenied) {
    fail(
      `RLS LEAK on ${label}: Teacher B received ${Array.isArray(data) ? data.length : 1} row(s)`,
    );
  }
  log(
    `OK ${label}: empty=${empty} rlsDenied=${rlsDenied} status=${status ?? "n/a"}`,
  );
}

// 4–7. Attempt reads of Teacher A data as Teacher B
await assertIsolated("classes by teacher A id", () =>
  supabaseB.from("classes").select("id,name,teacher_id").eq("teacher_id", teacherAId),
);

await assertIsolated("classes by direct ids", () =>
  supabaseB.from("classes").select("id,name").in("id", classAIds),
);

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

await assertIsolated("assignments for Teacher A classes", () =>
  supabaseB.from("assignments").select("id,class_id").in("class_id", classAIds),
);

await assertIsolated("progress for Teacher A classes", () =>
  supabaseB.from("student_lesson_progress").select("id,class_id").in("class_id", classAIds),
);

await assertIsolated("progress_events for Teacher A classes", () =>
  supabaseB.from("progress_events").select("id,class_id").in("class_id", classAIds),
);

log("All RLS negative checks passed — Teacher B cannot read Teacher A data.");
log("CRM_CLOUD_RLS_PASS");
await supabaseB.auth.signOut();
process.exit(0);
