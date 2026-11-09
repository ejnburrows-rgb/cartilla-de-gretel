import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const baseURL = process.argv[2] ?? "http://127.0.0.1:5179";
const proof = path.resolve("docs/proofs/page-gap-2026-10-29");
fs.mkdirSync(proof, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [390, 1366]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, recordVideo: { dir: proof } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/auth/v1/**", route => route.abort());
    await page.route("**/rest/v1/**", route => route.abort());
    await page.goto(`${baseURL}/cartilla/lecciones`);
    // Resume pointer only: no answers or activity completion are seeded.
    await page.evaluate(() => localStorage.setItem("cartilla.workbook-reader-page.v1", "85"));
    await page.goto(`${baseURL}/cartilla/cuaderno`);
    const reader = page.locator(".native-lesson-viewer");
    async function at(printed) {
      await page.locator(`.native-lesson-viewer[data-native-page="${printed}"]`).waitFor();
      assert.equal(await page.locator(".native-lesson-viewer").count(), 1);
      await page.screenshot({ path: path.join(proof, `${width}-page-${printed}.png`) });
      results.push({ width, printed });
    }
    await at(85);
    for (const printed of [88, 89, 90]) {
      await page.getByTestId("button-next").click();
      await at(printed);
    }
    await page.getByTestId("button-prev").click();
    await at(89);
    await page.getByTestId("button-prev").click();
    await at(88);
    await page.getByTestId("button-prev").click();
    await at(85);
    await page.reload();
    await at(85);
    assert.deepEqual(errors, []);
    const video = page.video();
    await context.close();
    await video.saveAs(path.join(proof, `${width}-navigation.webm`));
  }
} finally {
  await browser.close();
  fs.writeFileSync(path.join(proof, "results.json"), JSON.stringify({ baseURL, results }, null, 2));
}
console.log(`PAGE_GAP_RUNTIME_PASS ${results.length} page/view checkpoints`);
