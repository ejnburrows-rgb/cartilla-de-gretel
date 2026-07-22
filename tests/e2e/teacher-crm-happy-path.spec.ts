import { test, expect } from "@playwright/test";

// Teacher happy path: the demo/seed teacher opens the CRM and sees their real
// seed class and its students. This is a smoke test for the whole teacher lane
// — the route gate (src/routes/cartilla/teacher/route.tsx), the seed-session
// auth (src/lib/seed-data.ts), and the CRM shell rendering a class + roster.
//
// The teacher lane is gated by isSeedSessionActive(), which needs both
// VITE_ALLOW_DEMO_MODE=true (set on the E2E webServer, see playwright.config.ts)
// and the seed-auth key in localStorage. signInSeedTeacher() sets that key to a
// teacher id; seeding it directly here is exactly what a real demo login does,
// without driving the login form (covered separately by the app's unit tests).
test("demo teacher opens the CRM and sees the seed class and its roster", async ({
  page,
}) => {
  await page.addInitScript(() => {
    // Value + key confirmed in src/lib/seed-data.ts (AUTH_KEY, SEED_TEACHERS[0].id).
    localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
  });

  await page.goto("/cartilla/teacher/crm");

  // 1. The teacher chrome renders (we're inside the lane, not bounced to /login).
  await expect(page.getByText(/Panel del Docente/i).first()).toBeVisible({
    timeout: 20_000,
  });

  // 2. The seed class is present. It renders as an <option> in the class
  //    picker, so it's attached rather than "visible" in Playwright's sense.
  await expect(
    page.locator("option", { hasText: "Clase de Prueba (Demo Local)" }).first(),
  ).toBeAttached({ timeout: 20_000 });

  // 3. At least one seeded student from the roster shows up on-screen.
  await expect(page.getByText(/Sofía Ramírez/i).first()).toBeVisible({
    timeout: 20_000,
  });

  // 4. Proof.
  await page.screenshot({
    path: "tests/e2e/__screenshots__/teacher-crm.png",
  });
});
