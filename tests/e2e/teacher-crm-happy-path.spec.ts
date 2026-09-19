import { test, expect } from "@playwright/test";

// Faculty-demo happy path: open access stays entirely local, seeds exactly the
// intended six students across two teachers, and reaches the teacher CRM without
// a login or a Supabase dependency.
test("open faculty demo shows the normalized six-student local roster", async ({ page }) => {
  await page.goto("/cartilla/teacher/crm");

  await expect(page.getByText(/Panel del Docente/i).first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.locator("option", { hasText: "Clase de Prueba (Demo Local)" }).first(),
  ).toBeAttached({ timeout: 20_000 });

  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cartilla.seed.state.v1") || "{}"),
  );
  expect(state.students).toHaveLength(6);
  expect(state.students.filter((s: { class_id: string }) => s.class_id === "seed-class-demo")).toHaveLength(3);
  expect(state.students.filter((s: { class_id: string }) => s.class_id === "seed-class-emilio")).toHaveLength(3);
  expect(state.students.some((s: { id: string }) => s.id === "seed-student-valentina")).toBe(false);
  expect(state.students.some((s: { id: string }) => s.id === "seed-student-diego")).toBe(false);

  await expect(page.getByText(/Sofía Ramírez/i).first()).toBeVisible({
    timeout: 20_000,
  });

  await page.screenshot({
    path: "tests/e2e/__screenshots__/teacher-crm.png",
  });
});

test("teacher presenter uses clean digital flipchart chrome", async ({ page }) => {
  await page.goto("/cartilla/presentar/7");

  const panel = page.getByTestId("flipchart-hd-panel");
  await expect(panel).toBeVisible({ timeout: 20_000 });
  await expect(panel).toHaveAttribute("data-presenter-mode", "digital");
  await expect(panel).not.toHaveAttribute("data-physical-flipchart", "true");
  await expect(page.locator(".fc-board__binding")).toHaveCount(0);
  await expect(page.locator(".fc-board__ring")).toHaveCount(0);

  await page.screenshot({
    path: "tests/e2e/__screenshots__/teacher-presenter-clean.png",
  });
});
