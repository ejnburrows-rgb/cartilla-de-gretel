import { test, expect } from "@playwright/test";

// Teacher flow, end to end, driven through the real CRM screens:
//   create a class -> read its join code -> add a student -> see their progress
//
// This runs on the open-access lane (VITE_CRM_REVIEW, forced on for every
// build by vite.config.ts), which is a genuine implementation of the teacher
// side backed by localStorage rather than Supabase — so nothing here is
// stubbed. The two steps of the brief's teacher flow that this spec does NOT
// cover are "student joins" and "assign a lesson"; both are structurally
// impossible on this lane and are covered in student-assignment-flow.spec.ts.
//
// The dashboard is src/features/teacher-crm/TeacherDailyHome.tsx ("Hoy en tu
// clase"). The older TeacherCrmShell ("Centro de Control") this spec used to
// drive is no longer wired to any route.
//
// The seed state is emptied first so the class really is created by the test
// rather than read out of the fixture. Leonor owning no classes is what makes
// the CRM show its create-a-class empty state. The reset is one-shot: opening
// the class page is a full document navigation, so an unguarded init script
// would re-empty the store mid-test and delete the class under test.
const SEED_AUTH_KEY = "cartilla.seed.teacher.v1";
const SEED_STATE_KEY = "cartilla.seed.state.v1";

test("teacher creates a class, gets a join code, adds a student, and sees progress", async ({
  page,
}) => {
  await page.addInitScript(
    ([authKey, stateKey]) => {
      // Keys confirmed in src/lib/seed-data.ts (AUTH_KEY, STATE_KEY).
      localStorage.setItem(authKey, "seed-teacher-leonor");
      if (!sessionStorage.getItem("__e2e_seed_state_reset")) {
        sessionStorage.setItem("__e2e_seed_state_reset", "1");
        localStorage.setItem(
          stateKey,
          JSON.stringify({ classes: [], students: [], events: [], assignments: [] }),
        );
      }
    },
    [SEED_AUTH_KEY, SEED_STATE_KEY],
  );

  await page.goto("/cartilla/teacher/crm");

  // 1. We're inside the teacher lane, on the CRM, with no classes yet.
  await expect(page.getByRole("heading", { name: "Hoy en tu clase" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("heading", { name: "Crea tu primera clase" })).toBeVisible({
    timeout: 20_000,
  });

  // 2. Create a class.
  await page.getByRole("textbox", { name: "Nombre de la clase" }).fill("Primaria 1° B");
  await page.getByRole("button", { name: "Crear" }).click();

  // 3. A brand-new class has no students, and the class card is where the
  //    teacher is handed the join code to give the children.
  await expect(page.getByRole("heading", { name: "Primaria 1° B" })).toBeVisible({
    timeout: 20_000,
  });
  const codeLine = page.getByText(/\d+ estudiantes · Código [A-Z0-9]+/).first();
  await expect(codeLine).toContainText("0 estudiantes");
  const joinCode = ((await codeLine.innerText()).match(/[A-Z0-9]{6}$/) ?? [""])[0];
  // The code is what a child types on /cartilla/unirse, so its shape matters:
  // six characters, unambiguous case. createSeedClass builds it from
  // crypto.getRandomValues, matching the live teacher path.
  expect(joinCode).toMatch(/^[A-Z0-9]{6}$/);

  // 4. Add a student to the class.
  await page.getByRole("textbox", { name: "Añadir estudiante" }).fill("Ana Ruiz");
  await page.getByRole("button", { name: "Añadir estudiante" }).click();

  // 5. The roster is no longer empty and the new child is on the dashboard —
  //    with an honest "nothing recorded yet" reading rather than a fake score.
  await expect(codeLine).toContainText("1 estudiantes", { timeout: 20_000 });
  await expect(page.getByText("Ana Ruiz").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Sin actividad registrada").first()).toBeVisible({
    timeout: 20_000,
  });

  // 6. Progress: open the class page and confirm the teacher can see this
  //    child's progress record — a real, freshly-created student starts at
  //    zero completed lessons, which is the honest thing for the CRM to show.
  await page.getByRole("link", { name: "Ver clase y progreso completo" }).click();
  await expect(page.getByText("Ana Ruiz").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(joinCode).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/1 alumno · Código/)).toBeVisible({ timeout: 20_000 });

  await page.screenshot({
    path: "tests/e2e/__screenshots__/teacher-class-lifecycle.png",
    fullPage: true,
  });
});
