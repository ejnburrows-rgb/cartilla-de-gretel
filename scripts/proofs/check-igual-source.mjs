import { chromium } from "playwright";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const baseURL = process.argv[2] ?? "http://127.0.0.1:5179";
const proof = path.resolve("docs/proofs/igual-source-2026-10-29");
fs.mkdirSync(proof, { recursive: true });
const expected = "4154199071049f91459ac78dc7b715ea9f96f24f7c59edbd9f0dca2486742979";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: "reduce", recordVideo: { dir: path.join(proof, "video") } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/auth/v1/**", (route) => route.abort());
await page.route("**/rest/v1/**", (route) => route.abort());
const results = [];
try {
  await page.goto(`${baseURL}/cartilla/lecciones`, { waitUntil: "domcontentloaded" });
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [printed, index] of [[13, 0], [14, 1]]) {
      // Seed only the existing resume pointer; no activity completion or answers.
      await page.evaluate((index) => localStorage.setItem("cartilla.learner-resume.v1:5", JSON.stringify({ lesson: 5, page: index })), index);
      await page.goto(`${baseURL}/cartilla/leccion/5`, { waitUntil: "domcontentloaded" });
      await page.locator(`.native-lesson-viewer[data-native-page="${printed}"]`).waitFor();
      const images = page.locator('img[src*="igual.webp"]:visible');
      await images.first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const entries = await images.evaluateAll((els) => els.map((el) => ({ src: el.currentSrc, loaded: el.complete && el.naturalWidth > 0 })));
      assert(entries.length > 0 && entries.every((entry) => entry.loaded));
      for (const entry of entries) {
        const response = await page.request.get(entry.src);
        assert(response.ok());
        entry.sha256 = hash(await response.body());
        assert.equal(entry.sha256, expected);
      }
      await page.screenshot({ path: path.join(proof, `${width}-page-${printed}.png`) });
      results.push({ width, printed, entries });
    }
  }
  assert.deepEqual(errors, []);
} finally {
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(proof, "actual-pages.webm"));
  await browser.close();
  fs.writeFileSync(path.join(proof, "results.json"), JSON.stringify({ baseURL, expected, results, errors }, null, 2));
}
console.log(`IGUAL_SOURCE_RUNTIME_PASS ${results.length} page/view journeys`);
