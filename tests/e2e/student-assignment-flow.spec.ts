import { test, expect } from "@playwright/test";
import { installFakeSupabase } from "./support/fake-supabase";

// Student flow, end to end, driven through the real student screens:
//   join with the class code -> tap your name -> open the assigned lesson
//   -> finish it -> the progress is saved -> it survives a page reload
//
// Unlike the teacher lane, the student lane has no demo/seed branch:
// src/lib/student.functions.ts always talks to Supabase. So the screens,
// routing, session handling and RPC payloads here are all the real production
// code — only the database behind them is a fixture
// (tests/e2e/support/fake-supabase.ts explains why).

const CLASS = {
  joinCode: "E2E123",
  classId: "3f1c9d6e-3a7a-4c4b-9a1e-7b2d5c8f4a10",
  className: "Primaria 1° B",
  students: [
    { id: "6d2b8f14-0c3e-4a55-9f77-1e8a3b6c2d90", name: "Ana Ruiz", code: "ANARU" },
    { id: "9a4e7c22-5b18-4d63-8e0a-2f7c1d9b3e45", name: "Beto Lima", code: "BETOL" },
  ],
  assignments: [
    { id: "b81f0a53-6c9d-4e27-9a3f-8d5b2c7e1f64", lessonId: "1", title: "Repaso de las vocales" },
  ],
};

const LESSON_PROGRESS_KEY = "cartilla.lesson-progress.v1";

test("student joins a class, opens the assigned lesson, finishes it, and the progress survives a reload", async ({
  page,
}) => {
  const backend = await installFakeSupabase(page, CLASS);

  // Start with no local progress so lesson 1 is the open one.
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("__e2e_progress_seeded")) {
      sessionStorage.setItem("__e2e_progress_seeded", "1");
      localStorage.setItem(key, JSON.stringify([]));
    }
  }, LESSON_PROGRESS_KEY);

  // ---- 1. Join the class with the code the teacher handed out. ----
  await page.goto("/cartilla/unirse");
  await expect(page.getByRole("heading", { name: "Soy estudiante" })).toBeVisible({
    timeout: 20_000,
  });

  await page.locator("#join-code").fill(CLASS.joinCode);
  await page.getByRole("button", { name: "Entrar" }).click();

  // ---- 2. The roster comes back from the join code alone, and the child
  //         taps their own name — no password, which is the point of the flow.
  await expect(page.getByRole("heading", { name: "¡Toca tu nombre!" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("button", { name: "Beto Lima" })).toBeVisible();
  await page.getByRole("button", { name: "Ana Ruiz" }).click();

  // Entering the class lands the child on their lesson index.
  await expect(page).toHaveURL(/\/cartilla\/lecciones/, { timeout: 20_000 });

  // ---- 3. Open the lesson the teacher assigned and confirm the child is
  //         actually told it was assigned to them.
  await page.goto("/cartilla/leccion/1");
  await expect(page.getByText(/Tarea asignada/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Repaso de las vocales/i).first()).toBeVisible();

  await page.screenshot({ path: "tests/e2e/__screenshots__/student-assignment-banner.png" });

  // ---- 4. Finish the lesson. ----
  await page.getByRole("button", { name: /Marcar y siguiente/i }).click();

  // Finishing lesson 1 moves the child on to lesson 2, which was locked until
  // now — so the unlock rule is exercised too, not just the save.
  await expect(page).toHaveURL(/\/cartilla\/leccion\/2/, { timeout: 20_000 });

  // ---- 5. The save really went to the backend, with the right shape —
  //         session token, never the reusable student_code.
  await expect
    .poll(() => backend.callsTo("log_student_progress_secure").length, { timeout: 10_000 })
    .toBeGreaterThan(0);

  const completions = backend
    .callsTo("log_student_progress_secure")
    .filter((c) => c.p_event_kind === "lesson_completed");
  expect(completions).toHaveLength(1);
  expect(completions[0]).toMatchObject({
    p_student_id: CLASS.students[0].id,
    p_class_id: CLASS.classId,
    p_lesson_id: "1",
    p_event_kind: "lesson_completed",
  });
  expect(completions[0].p_session_token).toBeTruthy();
  expect(JSON.stringify(completions[0])).not.toContain("student_code");

  // ---- 6. Survives a reload — and specifically from the backend, not from
  //         the browser. Wiping the local progress key first means the only
  //         way lesson 1 can still read as done is the rehydrate that
  //         /cartilla/lecciones does from get_student_progress_secure.
  await page.evaluate((key) => localStorage.removeItem(key), LESSON_PROGRESS_KEY);
  await page.goto("/cartilla/lecciones");
  await page.reload();

  await expect(page.getByText("1 / 24")).toBeVisible({ timeout: 20_000 });
  expect(backend.callsTo("get_student_progress_secure").length).toBeGreaterThan(0);

  await page.screenshot({
    path: "tests/e2e/__screenshots__/student-progress-after-reload.png",
    fullPage: true,
  });
});
