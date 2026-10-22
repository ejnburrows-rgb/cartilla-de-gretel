import { test, expect } from "@playwright/test";
import path from "node:path";

// Mount TeacherCrmShell, not the student-detail route's separate handler.
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`actual CRM shell keeps rejected notes and persists keyboard retry ${viewport.width}`, async ({ page }) => {
    // A cold Windows Vite transform of the full shell can exceed 30 seconds.
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    const faults: string[] = [];
    page.on("pageerror", error => faults.push(error.message));
    page.on("console", message => { if (message.type() === "error") faults.push(message.text()); });
    await page.route("**/src/lib/teacher.functions.ts*", route => route.fulfill({
      contentType: "application/javascript",
      body: `const cls={id:'synthetic-class',name:'Clase sintética',join_code:'DEMO01',student_count:1};
        export async function listClasses(){return [cls]}
        export async function getClass(){return {class:cls,students:[{id:'synthetic-student',display_name:'Alumno sintético',student_code:'SYN01',lessons:0,lastSeen:null,teacher_notes:localStorage.getItem('synthetic.savedNotes') || 'Nota anterior sintética'}]}}
        export async function updateStudent({data}){
          window.noteCalls=(window.noteCalls || 0)+1;
          await new Promise(resolve=>setTimeout(resolve,600));
          if(!window.notesRecovery) throw new Error('Error sintético al guardar');
          localStorage.setItem('synthetic.savedNotes',data.teacherNotes);return {ok:true};
        }
        export async function getWeeklyActivity(){return []}
        export async function createClass(){} export async function addStudents(){}`,
    }));
    await page.route("**/src/lib/assignments.functions.ts*", route => route.fulfill({
      contentType: "application/javascript",
      body: "export async function listAssignments(){return []} export async function createAssignment(){} export async function deleteAssignment(){}",
    }));
    await page.goto("/tests/e2e/support/crm-shell-notes.html", { waitUntil: "domcontentloaded" });
    const notes = page.getByRole("textbox", { name: "Notas del alumno" });
    await expect(notes).toHaveValue("Nota anterior sintética");
    await notes.fill("Nota nueva sintética");
    const save = page.getByRole("button", { name: "Guardar Notas" });
    await save.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Guardando…" })).toBeDisabled();
    await expect(notes).toBeDisabled();
    await expect(page.getByRole("alert")).toContainText("No se pudieron guardar las notas");
    await expect(notes).toHaveValue("Nota nueva sintética");
    await expect(notes).toBeEnabled(); await expect(save).toBeVisible();
    await notes.scrollIntoViewIfNeeded();
    for (const control of [notes, page.getByRole("alert")]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    }
    await page.screenshot({ path: path.join("tests/e2e/proofs/crm-notes-recovery", `error-${viewport.width}.png`) });
    expect(await page.evaluate(() => (window as any).noteCalls)).toBe(1);
    await page.evaluate(() => { (window as any).notesRecovery = true; });
    await save.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Guardando…" })).toHaveCount(0);
    await expect(notes).toBeEnabled();
    await expect(save).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).noteCalls)).toBe(2);
    expect(await page.evaluate(() => localStorage.getItem("synthetic.savedNotes"))).toBe("Nota nueva sintética");
    await page.screenshot({ path: path.join("tests/e2e/proofs/crm-notes-recovery", `success-${viewport.width}.png`) });
    await page.reload();
    await expect(notes).toHaveValue("Nota nueva sintética");
    await expect(save).toHaveCount(0);
    expect(faults).toEqual([]);
  });
}
