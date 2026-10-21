import { test, expect } from "@playwright/test";

test("CRM Notes Save: failed save leaves editor open with text and error, successful save closes editor", async ({ page }) => {
  await page.goto("/cartilla/teacher/crm");

  await expect(page.getByText(/Panel del Docente/i).first()).toBeVisible({
    timeout: 20_000,
  });

  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cartilla.seed.state.v1") || "{}"),
  );
  const classId = "seed-class-demo";
  const studentId = state.students.find((s: any) => s.class_id === classId).id;

  await page.goto(`/cartilla/teacher/crm/${classId}/${studentId}`);

  const notesTextarea = page.getByRole('textbox', { name: 'Notas del alumno' });
  await expect(notesTextarea).toBeVisible();

  await notesTextarea.fill("Notas de prueba");

  const saveButton = page.getByRole('button', { name: 'Guardar Notas' });
  await expect(saveButton).toBeVisible();

  await page.evaluate(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === "cartilla.seed.state.v1") {
        throw new Error("Simulated storage error");
      }
      originalSetItem.call(this, key, value);
    };
    (window as any).originalSetItem = originalSetItem;
  });

  await saveButton.click();

  const errorMessage = page.locator('text=No se pudieron guardar las notas');
  await expect(errorMessage).toBeVisible();

  await expect(notesTextarea).toHaveValue("Notas de prueba");
  await expect(saveButton).toBeVisible();

  await page.screenshot({ path: 'teacher-crm-notes-error.png' });

  await page.evaluate(() => {
    localStorage.setItem = (window as any).originalSetItem;
  });

  await notesTextarea.fill("Success notes");
  await saveButton.click();

  await expect(saveButton).not.toBeVisible();
  await expect(errorMessage).not.toBeVisible();
  await expect(notesTextarea).toHaveValue("Success notes");
});
