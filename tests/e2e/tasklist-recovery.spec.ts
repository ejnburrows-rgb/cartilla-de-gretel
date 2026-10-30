import { test, expect } from "@playwright/test";
import path from "node:path";

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`assignment error and keyboard retry ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const faults: string[] = [];
    page.on("pageerror", error => faults.push(error.message));
    page.on("console", message => { if (message.type() === "error") faults.push(message.text()); });
    await page.route("**/src/lib/assignments.functions.ts*", route => route.fulfill({
      contentType: "application/javascript",
      body: `export async function listAssignments() {
        window.assignmentCalls = (window.assignmentCalls || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, 400));
        if (!window.assignmentRecovery) throw new Error('Synthetic request failure');
        return [{id:'synthetic-task', lesson_id:'1', title:'Tarea de prueba', due_at:null, time_limit_seconds:null}];
      }
      export async function createAssignment() {}
      export async function deleteAssignment() {}`,
    }));
    await page.goto("/tests/e2e/support/tasklist-recovery.html");
    await expect(page.getByRole("alert")).toContainText("Error al cargar asignaciones");
    await expect(page.getByText("¡No hay tareas!")).toHaveCount(0);
    await page.screenshot({ path: path.join("tests/e2e/proofs/tasklist-recovery", `error-${viewport.width}.png`) });
    await page.evaluate(() => { (window as any).assignmentRecovery = true; });
    const retry = page.getByRole("button", { name: "Reintentar" });
    await retry.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Cargando asignaciones…")).toBeVisible();
    await expect(page.getByText("Tarea de prueba")).toBeVisible();
    expect(await page.evaluate(() => (window as any).assignmentCalls)).toBe(2);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.screenshot({ path: path.join("tests/e2e/proofs/tasklist-recovery", `success-${viewport.width}.png`) });
    expect(faults).toEqual([]);
  });
}
