import { test, expect } from "@playwright/test";
import { installFakeSupabase } from "./support/fake-supabase";
import { completePage } from "./support/complete-page";

// Student flow, end to end, driven through the real student screens:
//   join with the class code AND the personal student code (secure two-code
//   enrollment) -> open the assigned lesson -> finish it -> the progress is
//   saved -> it survives a page reload
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
  // Finishing lesson 1 means completing its real page activities, which takes
  // far longer than the default 30s test budget.
  test.setTimeout(300_000);
  const backend = await installFakeSupabase(page, CLASS);

  // Start with no local progress so lesson 1 is the open one.
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("__e2e_progress_seeded")) {
      sessionStorage.setItem("__e2e_progress_seeded", "1");
      localStorage.setItem(key, JSON.stringify([]));
    }
  }, LESSON_PROGRESS_KEY);

  // ---- 1. Join the class with the two codes the teacher handed out. ----
  await page.goto("/cartilla/unirse");
  await expect(page.getByRole("heading", { name: "Soy estudiante" })).toBeVisible({
    timeout: 20_000,
  });

  const enter = page.getByRole("button", { name: "Entrar" });
  // Secure two-code enrollment: the class code alone must not be enough —
  // Entrar stays disabled until the personal student code is present, and the
  // roster is never exposed from the join code alone.
  await page.locator("#join-code").fill(CLASS.joinCode);
  await expect(enter).toBeDisabled();

  // ---- 2. A wrong personal code is rejected; the child is not let in. ----
  await page.locator("#student-code").fill("XXXX0");
  await expect(enter).toBeEnabled();
  await enter.click();
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/cartilla\/unirse/);

  // ---- 3. The right pair of codes lets Ana in. ----
  await page.locator("#student-code").fill(CLASS.students[0].code);
  await enter.click();

  // Entering the class lands the child on their lesson index as Ana Ruiz.
  await expect(page).toHaveURL(/\/cartilla\/lecciones/, { timeout: 20_000 });

  // ---- 4. Open the lesson the teacher assigned. The old "Tarea asignada"
  //         banner was deliberately removed in the book-page-screen redesign
  //         (#426), so there is no banner to assert; what must still hold is
  //         that the lesson view loads THIS student's assignments from the
  //         backend with their real two-code identity.
  await page.goto("/cartilla/leccion/1");
  await expect
    .poll(() => backend.callsTo("get_student_assignments").length, { timeout: 20_000 })
    .toBeGreaterThan(0);
  expect(backend.callsTo("get_student_assignments")[0]).toMatchObject({
    p_class_id: CLASS.classId,
    p_student_id: CLASS.students[0].id,
    p_student_code: CLASS.students[0].code,
  });

  await page.screenshot({ path: "tests/e2e/__screenshots__/student-assignment-lesson.png" });

  // ---- 5. Finish the lesson. There is no "mark done" shortcut: the child
  //         completes each page's real activities, then turns with Siguiente /
  //         Terminar lección (the viewer's own forward control).
  const reader = page.locator(".native-lesson-viewer");
  await expect(reader).toBeVisible({ timeout: 30_000 });
  for (let guard = 0; guard < 8 && !/\/cartilla\/leccion\/2/.test(page.url()); guard++) {
    const printed = await reader.getAttribute("data-native-page");
    if (printed === null) continue;
    await completePage(page, Number(printed));
    // A finished page turns by itself after a short idle beat; only the last
    // page of the lesson waits for the child to press "Terminar lección".
    const finish = reader.getByRole("button", { name: "Terminar lección" });
    if (await finish.count()) {
      await expect(finish).toBeEnabled({ timeout: 20_000 });
      await finish.click();
    } else {
      await expect(reader).not.toHaveAttribute("data-native-page", printed, { timeout: 30_000 });
    }
  }

  // Finishing lesson 1 moves the child on to lesson 2, which was locked until
  // now — so the unlock rule is exercised too, not just the save.
  await expect(page).toHaveURL(/\/cartilla\/leccion\/2/, { timeout: 20_000 });

  // ---- 6. The save really went to the backend, with the right shape.
  //         Exercise events flush first; wait specifically for the
  //         lesson_completed row instead of racing the queue. ----
  await expect
    .poll(
      () =>
        backend
          .callsTo("log_student_progress")
          .filter((c) => c.p_event_kind === "lesson_completed").length,
      { timeout: 20_000 },
    )
    .toBe(1);

  const completions = backend
    .callsTo("log_student_progress")
    .filter((c) => c.p_event_kind === "lesson_completed");
  expect(completions[0]).toMatchObject({
    p_student_id: CLASS.students[0].id,
    p_student_code: CLASS.students[0].code,
    p_lesson_id: "1",
    p_event_kind: "lesson_completed",
  });

  // ---- 7. A real started lesson stays distinct from both completed and
  //         pending. Spend enough time in lesson 2 to create the backend's
  //         authoritative "started" row, then leave through the real header.
  await page.waitForTimeout(5_200);
  await page.getByRole("link", { name: /Mis lecciones/i }).click();
  await expect(page).toHaveURL(/\/cartilla\/lecciones/, { timeout: 20_000 });
  await expect
    .poll(
      () =>
        backend
          .callsTo("log_student_progress")
          .some((c) => c.p_lesson_id === "2" && c.p_event_kind === "time"),
      { timeout: 10_000 },
    )
    .toBe(true);

  // ---- 8. Survives a reload — and specifically from the backend, not from
  //         the browser. Wiping the local progress keys first means the only
  //         way Mi progreso can still show lesson 1 completed and lesson 2 in
  //         progress is the real get_student_progress fetch. (The lessons
  //         index is local-only by design since the lean rewrite; the
  //         backend-backed student view is /cartilla/mi-progreso.)
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    localStorage.removeItem("cartilla.page-completion.v1");
  }, LESSON_PROGRESS_KEY);
  await page.goto("/cartilla/mi-progreso");
  await page.reload();

  const lessonOne = page.locator("a").filter({ hasText: /Las vocales: A E I O U/ }).first();
  await expect(lessonOne).toContainText("Completada", { timeout: 20_000 });
  const lessonTwo = page.locator("a").filter({ hasText: /La vocal O/ }).first();
  await expect(lessonTwo).toContainText("En progreso", { timeout: 20_000 });
  expect(backend.callsTo("get_student_progress").length).toBeGreaterThan(0);

  await page.screenshot({
    path: "tests/e2e/__screenshots__/student-progress-after-reload.png",
    fullPage: true,
  });
});
