import { test, expect } from "@playwright/test";
import path from "node:path";

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`rename failure, pending guard, keyboard retry and cancel ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const faults: string[] = [];
    page.on("pageerror", error => faults.push(error.message));
    page.on("console", message => { if (message.type() === "error") faults.push(message.text()); });
    await page.route("**/src/lib/teacher.functions.ts*", route => route.fulfill({
      contentType: "application/javascript",
      body: `const cls={id:'synthetic-class',name:'Clase sintética',join_code:'DEMO01',student_count:1};
        export async function listClasses(){return [cls]}
        export async function getClass(){return {class:cls,students:[{id:'synthetic-student',display_name:localStorage.getItem('synthetic.savedName') || 'Alumno sintético',student_code:'SYN01',lessons:0,lastSeen:null}]}}
        export async function updateStudent({data}){
          window.renameCalls=(window.renameCalls || 0)+1;
          await new Promise(resolve=>setTimeout(resolve,700));
          if(!window.renameRecovery) throw new Error('Error sintético al guardar');
          localStorage.setItem('synthetic.savedName',data.displayName); return {ok:true};
        }
        export async function createClass(){} export async function addStudents(){}
        export async function deleteStudent(){} export async function archiveStudent(){} export async function restoreStudent(){}`,
    }));
    await page.goto("/tests/e2e/support/roster-recovery.html");
    await page.getByRole("button", { name: "Alumno sintético", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Nombre del alumno" });
    await input.fill("Nombre corregido");
    await input.press("Enter");
    await expect(input).toHaveAttribute("readonly", "");
    // await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Guardando…" })).toBeVisible();
    await input.press("Enter");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("alert")).toContainText("Error sintético al guardar");
    await expect(input).toHaveValue("Nombre corregido");
    await expect(input).not.toHaveAttribute("readonly", "");
    expect(await page.evaluate(() => (window as any).renameCalls)).toBe(1);
    await page.screenshot({ path: path.join("tests/e2e/proofs/roster-recovery", `error-${viewport.width}.png`) });
    await page.evaluate(() => { (window as any).renameRecovery = true; });
    await input.focus();
    await input.press("Enter");
    await expect(page.getByRole("button", { name: "Nombre corregido", exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as any).renameCalls)).toBe(2);
    await page.screenshot({ path: path.join("tests/e2e/proofs/roster-recovery", `success-${viewport.width}.png`) });
    await page.reload();
    await page.getByRole("button", { name: "Nombre corregido", exact: true }).click();
    await input.fill("No guardar");
    await input.press("Escape");
    await expect(page.getByRole("button", { name: "Nombre corregido", exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as any).renameCalls || 0)).toBe(0);
    expect(faults).toEqual([]);
  });
}
