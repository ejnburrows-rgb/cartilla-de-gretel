import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { chromium } from "playwright";

const baseURL = process.argv[2] ?? "http://127.0.0.1:5189";
const proof = path.resolve("docs/proofs/elephant-sheep-motion-2026-10-29");
fs.mkdirSync(proof, { recursive: true });
const manifest = JSON.parse(fs.readFileSync("scripts/living-motion/manifest.json", "utf8"));
const layouts = JSON.parse(fs.readFileSync("src/data/page-layouts.json", "utf8")).pages;
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const firstImage = svg => svg.match(/<image\b[^>]+>/)[0];
const embedded = svg => Buffer.from(firstImage(svg).match(/data:image\/[^;]+;base64,([^"']+)/)[1], "base64");
function bounds(svg) {
  const root = svg.match(/<svg\b[^>]+>/)[0], image = firstImage(svg);
  const attr = (tag, name, fallback = 0) => Number(tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] ?? fallback);
  const [x, y, w, h] = root.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  return [(attr(image, "x") - x) / w, (attr(image, "y") - y) / h, attr(image, "width") / w, attr(image, "height") / h];
}
const targets = [
  ["elefante", 1, 1], ["oveja", 1, 1], ["vocal-o-oveja", 2, 4], ["vocal-e-elefante", 4, 10],
  ["fc_p004_oveja", 2, null], ["fc_p006_elefante", 4, null],
].map(([name, lesson, start]) => ({ name, lesson, start, ...manifest[name] }));
const pixels = [];
for (const entry of targets) {
  const original = fs.readFileSync(entry.still), svg = fs.readFileSync(entry.alive, "utf8");
  const isSvg = entry.still.endsWith(".svg");
  const source = isSvg ? Buffer.from(original.toString("utf8").replace(/\r\n/g, "\n")) : original;
  assert.equal(sha(source), entry.stillSha256, entry.name);
  const a = await sharp(isSvg ? embedded(original.toString("utf8")) : original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(embedded(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(a.info.width, b.info.width); assert.equal(a.info.height, b.info.height);
  assert.deepEqual(a.data, b.data, entry.name);
  const sourceBounds = isSvg ? bounds(original.toString("utf8")) : [0, 0, 1, 1];
  bounds(svg).forEach((value, index) => assert(Math.abs(value - sourceBounds[index]) < 1e-12, `${entry.name} source padding`));
  pixels.push({ name: entry.name, stillSha256: entry.stillSha256, dimensions: [a.info.width, a.info.height], basePixelsEqual: true, sourcePaddingEqual: true });
}
const browser = await chromium.launch(), results = [], errors = [];
try {
  for (const width of [390, 1366]) for (const mode of ["no-preference", "reduce"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: mode, recordVideo: { dir: proof } });
    context.setDefaultTimeout(30_000);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/auth/v1/**", route => route.abort());
    await page.route("**/rest/v1/**", route => route.abort());
    for (const entry of targets) {
      if (entry.start) {
        const printed = Object.entries(layouts).find(([number, layout]) => Number(number) >= entry.start && Number(number) < entry.start + 3 && JSON.stringify(layout).includes(entry.still.replace(/^public/, "")))?.[0];
        assert(printed, entry.name);
        await page.goto(`${baseURL}/cartilla/lecciones`);
        await page.evaluate(({ lesson, index }) => localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, JSON.stringify({ lesson, page: index })), { lesson: entry.lesson, index: Number(printed) - entry.start });
        await page.goto(`${baseURL}/cartilla/leccion/${entry.lesson}`);
      } else await page.goto(`${baseURL}/cartilla/presentar/${entry.lesson}`);
      const src = (mode === "reduce" ? entry.still : entry.alive).replace(/^public/, "");
      const img = page.locator(`img[src$="${src}"]:visible`).first();
      await img.waitFor(); await img.scrollIntoViewIfNeeded(); await img.evaluate(el => el.decode());
      const state = await img.evaluate(el => ({ src: el.getAttribute("src"), currentSrc: el.currentSrc, width: el.naturalWidth, height: el.naturalHeight }));
      const response = await page.request.get(state.currentSrc); assert(response.ok());
      const local = path.join("public", decodeURI(new URL(state.currentSrc).pathname));
      const servedSha256 = sha(await response.body()); assert.equal(servedSha256, sha(fs.readFileSync(local)));
      assert(state.width > 0 && state.height > 0);
      if (mode === "no-preference") await page.waitForTimeout(5_200);
      await page.screenshot({ path: path.join(proof, `${width}-${mode}-${entry.name}.png`) });
      results.push({ name: entry.name, width, mode, route: page.url(), ...state, servedSha256 });
    }
    const video = page.video(); await context.close(); await video.saveAs(path.join(proof, `${width}-${mode}.webm`));
  }
  assert.equal(results.length, 24); assert.deepEqual(errors, []);
} finally {
  await browser.close();
  fs.writeFileSync(path.join(proof, "results.json"), JSON.stringify({ baseURL, pixels, results, errors }, null, 2));
}
console.log(`ELEPHANT_SHEEP_MOTION_PASS ${pixels.length} exact source bases; ${results.length} normal/reduced placements`);
