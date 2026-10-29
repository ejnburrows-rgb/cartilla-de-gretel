import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseURL = process.argv[2] ?? "http://127.0.0.1:5179";
const proof = path.resolve("docs/proofs/roster-rename-route-2026-10-29");
fs.mkdirSync(proof, { recursive: true });
const browser = await chromium.launch(), results = [], errors = [];
try {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, recordVideo: { dir: proof } });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/auth/v1/**", route => route.abort());
    await page.route("**/rest/v1/**", route => route.abort());
    await page.goto(`${baseURL}/cartilla/teacher/roster`);
    await page.getByRole("heading", { name: "Directorio de Alumnos", exact: true }).waitFor();
    await page.waitForFunction(() => document.querySelector("#active-class-select")?.value);
    const classId = await page.getByLabel("Clase Activa").inputValue();
    const saved = await page.evaluate(() => localStorage.getItem("cartilla.seed.state.v1"));
    const seed = JSON.parse(saved), student = seed.students.find(s => s.class_id === classId);
    assert(student, "Expected the app's synthetic example student");
    await page.getByRole("button", { name: student.display_name, exact: true }).click();
    const input = page.getByRole("textbox", { name: "Nombre del alumno", exact: true });
    const name = `Nombre comprobado ${width}`;
    await input.fill(name);
    // Simulate stale local demo data without notifying/replacing the mounted row.
    // No real backend or real student record is touched.
    await page.evaluate(id => {
      const state = JSON.parse(localStorage.getItem("cartilla.seed.state.v1"));
      state.students = state.students.filter(s => s.id !== id);
      localStorage.setItem("cartilla.seed.state.v1", JSON.stringify(state));
    }, student.id);
    await input.press("Enter");
    await page.getByRole("alert").filter({ hasText: "Alumno no encontrado." }).waitFor();
    assert.equal(await input.inputValue(), name);
    await page.screenshot({ path: path.join(proof, `${width}-failed-draft-retained.png`) });
    await page.evaluate(value => localStorage.setItem("cartilla.seed.state.v1", value), saved);
    await input.press("Enter");
    const updated = page.getByRole("button", { name, exact: true });
    await updated.waitFor();
    await page.screenshot({ path: path.join(proof, `${width}-retry-saved.png`) });
    await page.reload();
    await page.getByLabel("Clase Activa").selectOption(classId);
    await updated.waitFor();
    await updated.click();
    await input.fill("No guardar");
    await input.press("Escape");
    await updated.waitFor();
    const persisted = await page.evaluate(id => JSON.parse(localStorage.getItem("cartilla.seed.state.v1")).students.find(s => s.id === id).display_name, student.id);
    assert.equal(persisted, name);
    await page.screenshot({ path: path.join(proof, `${width}-reload-and-cancel.png`) });
    results.push({ width, route: page.url(), checks: ["mounted roster", "failed save retains draft/error", "retry updates actual row", "reload persists", "Escape leaves saved name unchanged"], syntheticOnly: true });
    const video = page.video(); await context.close(); await video.saveAs(path.join(proof, `${width}-roster-recovery.webm`));
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  fs.writeFileSync(path.join(proof, "results.json"), JSON.stringify({ baseURL, results, errors }, null, 2));
}
console.log(`ROSTER_ROUTE_RECOVERY_PASS ${results.length} actual mounted-route journeys`);
