#!/usr/bin/env node
// One-command end-to-end proof for the class-code + tap-name login flow.
//
// Run the moment the PR #139 migration SQL has been applied to the live
// database:
//
//   VITE_SUPABASE_URL=https://xxx.supabase.co \
//   VITE_SUPABASE_PUBLISHABLE_KEY=xxx \
//   node scripts/e2e-login-test.mjs <REAL_CLASS_JOIN_CODE>
//
// Reports PASS/FAIL per step (not one verdict for the whole flow), so a
// failure at step 3 while 1-2 passed tells you exactly where the migration
// or the RPC logic broke, instead of just "something's wrong."
//
// Step 3 writes ONE real row to exercise_attempt_summary, clearly labeled
// lesson_id "0" / exercise "e2e_test_probe" so it's obviously a test artifact,
// never mistaken for a real lesson. To remove it afterward:
//   delete from exercise_attempt_summary where exercise = 'e2e_test_probe';

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const joinCode = process.argv[2];

if (!URL || !KEY) {
  console.error("FAIL — missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in the environment.");
  process.exit(1);
}
if (!joinCode) {
  console.error("FAIL — usage: node scripts/e2e-login-test.mjs <REAL_CLASS_JOIN_CODE>");
  process.exit(1);
}

async function rpc(name, body) {
  const res = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { ok: res.ok, status: res.status, body: json };
}

let failures = 0;
function report(step, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} — Step ${step}: ${detail}`);
  if (!ok) failures++;
}

async function main() {
  // Step 1 — list_class_students: real roster, no sensitive fields.
  const roster = await rpc("list_class_students", { p_join_code: joinCode });
  const rosterOk = roster.ok && Array.isArray(roster.body) && roster.body.length > 0;
  report(1, rosterOk, `list_class_students returned ${rosterOk ? roster.body.length + " student(s)" : JSON.stringify(roster.body)}`);
  if (!rosterOk) return finish();

  const student = roster.body[0];
  if (!("student_id" in student) || !("display_name" in student) || "student_code" in student) {
    report(1, false, "roster row shape wrong — must be exactly {student_id, display_name}, no student_code");
    return finish();
  }

  // Step 2 — enter_class_as_student: full session shape.
  const enter = await rpc("enter_class_as_student", { p_join_code: joinCode, p_student_id: student.student_id });
  const session = Array.isArray(enter.body) ? enter.body[0] : enter.body;
  const sessionOk =
    enter.ok &&
    session &&
    ["student_id", "student_name", "student_code", "class_id", "class_name"].every((k) => k in session);
  report(2, sessionOk, `enter_class_as_student returned ${sessionOk ? `session for "${session.student_name}"` : JSON.stringify(enter.body)}`);
  if (!sessionOk) return finish();

  // Step 3 — log one clearly-labeled test progress event, then read it back.
  const logRes = await rpc("log_student_progress", {
    p_student_id: session.student_id,
    p_student_code: session.student_code,
    p_lesson_id: "0",
    p_event_kind: "exercise",
    p_score: 1,
    p_total: 1,
    p_time_seconds: null,
    p_meta: { exercise: "e2e_test_probe" },
  });
  report(3, logRes.ok, `log_student_progress ${logRes.ok ? "accepted" : "rejected: " + JSON.stringify(logRes.body)}`);

  const progress = await rpc("get_student_progress", { p_student_id: session.student_id, p_student_code: session.student_code });
  const events = progress.body?.events ?? [];
  const found = Array.isArray(events) && events.some((e) => e.lesson_id === "0" || e.meta?.exercise === "e2e_test_probe");
  report("3b", progress.ok && found, `get_student_progress ${found ? "shows the just-logged test event" : "does NOT show it — " + JSON.stringify(progress.body)}`);

  finish();
}

function finish() {
  console.log("");
  console.log(failures === 0 ? "ALL STEPS PASSED" : `${failures} STEP(S) FAILED — see above`);
  console.log("");
  console.log("Not automated (needs a real logged-in teacher session): open /cartilla/teacher/reportes,");
  console.log("pick this class + student, and confirm the just-logged test attempt appears in the");
  console.log("per-exercise-type table before doing the real in-browser walkthrough.");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("FAIL — unexpected error:", err);
  process.exit(1);
});
