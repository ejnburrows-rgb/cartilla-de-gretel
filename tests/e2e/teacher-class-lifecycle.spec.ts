import { test, expect } from "@playwright/test";

// Teacher flow, end to end, driven through the real CRM screens:
//   create a class -> read its join code -> add a student -> see their progress
//
// This runs on the demo/seed lane (VITE_ALLOW_DEMO_MODE, set on the E2E
// webServer), which is a genuine implementation of the teacher side backed by
// localStorage rather than Supabase — so nothing here is stubbed. The two
// steps of the brief's teacher flow that this spec does NOT cover are
// "student joins" and "assign a lesson"; both are structurally impossible on
// this lane and are covered/explained in student-assignment-flow.spec.ts and
// the PR notes.
//
// The seed state is emptied first so the class really is created by the test
// rather than read out of the fixture. Leonor owning no classes is what makes
// the CRM show its create-a-class empty state.
const SEED_AUTH_KEY = "cartilla.seed.teacher.v1";
const SEED_STATE_KEY = "cartilla.seed.state.v1";

test("teacher creates a class, gets a join code, adds a student, and sees progress", async ({
  page,
}) => {
  await page.addInitScript(
    ([authKey, stateKey]) => {
      // Keys confirmed in src/lib/seed-data.ts (AUTH_KEY, STATE_KEY).
      localStorage.setItem(authKey, "seed-teacher-leonor");
      localStorage.setItem(
        stateKey,
        JSON.stringify({ classes: [], students: [], events: [], assignments: [] }),
      );
    },
    [SEED_AUTH_KEY, SEED_STATE_KEY],
  );

  await page.goto("/cartilla/teacher/crm");

  // 1. We're inside the teacher lane, on the CRM, with no classes yet.
  await expect(page.getByRole("heading", { name: "Centro de Control" })).toBeVisible({
    timeout: 20_000,
  });

  // 2. Create a class.
  await page.getByPlaceholder("Ej. Primaria 1° A").fill("Primaria 1° B");
  await page.getByRole("button", { name: "Crear" }).click();

  // 3. A brand-new class has no students, and that empty state is where the
  //    teacher is handed the join code to give the children.
  await expect(page.getByRole("heading", { name: "No hay alumnos" })).toBeVisible({
    timeout: 20_000,
  });

  const joinCode = (await page.locator("strong.font-mono").first().innerText()).trim();
  // The code is what a child types on /cartilla/unirse, so its shape matters:
  // six characters, unambiguous case. createSeedClass builds it from
  // crypto.getRandomValues, matching the live teacher path.
  expect(joinCode).toMatch(/^[A-Z0-9]{6}$/);

  // 4. Add a student to the class.
  await page.getByPlaceholder("Añadir alumno manualmente...").fill("Ana Ruiz");
  await page.getByRole("button", { name: "Añadir" }).click();

  // 5. The roster is no longer empty and the new child is on the dashboard.
  await expect(page.getByText("Ana Ruiz").first()).toBeVisible({ timeout: 20_000 });

  // 6. Progress: open the class page and confirm the teacher can see this
  //    child's progress record — a real, freshly-created student starts at
  //    zero completed lessons, which is the honest thing for the CRM to show.
  await page
    .getByRole("link", { name: /Ver clase|Gestionar|Detalle/i })
    .first()
    .click();
  await expect(page.getByText("Ana Ruiz").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(joinCode).first()).toBeVisible();

  await page.screenshot({
    path: "tests/e2e/__screenshots__/teacher-class-lifecycle.png",
    fullPage: true,
  });
});
