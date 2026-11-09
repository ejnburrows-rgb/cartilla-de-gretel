import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const baseURL = process.argv[2] ?? "http://127.0.0.1:5179";
const root = "docs/proofs/source-crop-repairs-2026-10-27";
const proof = path.resolve(root, "assembled-2026-10-29/runtime");
fs.mkdirSync(proof, { recursive: true });
const prior = JSON.parse(fs.readFileSync(`${root}/rendered-source-verification.json`, "utf8")).results;
const scene = JSON.parse(fs.readFileSync(`${root}/scene-11/source.json`, "utf8"));
const teacher = prior.filter(r => new URL(r.route).pathname.includes("/presentar/"));
teacher.push({ route: "/cartilla/presentar/7", currentSrc: scene.destination.replace(/^public/, ""), sha256: scene.sha256, dimensions: scene.dimensions });
const results = [], errors = [];
const browser = await chromium.launch();
async function context(width, height) {
  const c = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", recordVideo: { dir: proof } });
  c.setDefaultTimeout(30_000);
  const p = await c.newPage();
  p.on("pageerror", e => errors.push(e.message));
  await p.route("**/auth/v1/**", r => r.abort());
  await p.route("**/rest/v1/**", r => r.abort());
  return { c, p };
}
async function captureImage(p, img, expected, label) {
  await img.evaluate(i => i.decode());
  const state = await img.evaluate(i => ({ currentSrc: i.currentSrc, dimensions: [i.naturalWidth, i.naturalHeight] }));
  const response = await p.request.get(state.currentSrc);
  assert(response.ok(), state.currentSrc);
  const sha256 = createHash("sha256").update(await response.body()).digest("hex");
  assert.equal(sha256, expected.sha256, state.currentSrc);
  assert.deepEqual(state.dimensions, expected.dimensions);
  results.push({ label, route: p.url(), ...state, sha256 });
}
async function finish(c, p, name) {
  const video = p.video();
  await c.close();
  await video.saveAs(path.join(proof, `${name}.webm`));
}
try {
  const { c, p } = await context(1366, 900);
  const routes = [...new Set(teacher.map(r => new URL(r.route, baseURL).pathname))];
  for (const route of routes) {
    const remaining = new Map(teacher.filter(r => new URL(r.route, baseURL).pathname === route).map(r => [new URL(r.currentSrc, baseURL).pathname, r]));
    await p.goto(`${baseURL}${route}`);
    const stage = p.getByTestId("flipchart-stage");
    await stage.waitFor();
    for (let leaf = 0; leaf < 10 && remaining.size; leaf++) {
      for (const [src, expected] of [...remaining]) {
        const img = stage.locator(`img[src$="${src}"]:visible`).first();
        if (await img.count()) { await captureImage(p, img, expected, `teacher-${route.split("/").at(-1)}-${leaf}`); remaining.delete(src); }
      }
      await p.screenshot({ path: path.join(proof, `teacher-${route.split("/").at(-1)}-${leaf}.png`) });
      if (!remaining.size) break;
      const next = p.getByRole("button", { name: "Lámina siguiente", exact: true });
      await next.click();
      await p.waitForTimeout(150);
    }
    assert.equal(remaining.size, 0, `${route}: missing ${[...remaining.keys()].join(", ")}`);
  }
  await finish(c, p, "teacher-all-delivered-crops");
  for (const width of [390, 1366]) {
    const { c, p } = await context(width, 900);
    await p.goto(`${baseURL}/cartilla/lecciones`);
    for (const [printed, names] of [[2, ["indio"]], [3, ["iglesia"]], [10, ["indio"]], [13, ["indio", "invierno"]], [14, ["indio"]]]) {
      await p.evaluate(n => localStorage.setItem("cartilla.workbook-reader-page.v1", String(n)), printed);
      await p.goto(`${baseURL}/cartilla/cuaderno`);
      const board = p.locator(`.native-lesson-viewer[data-native-page="${printed}"]`);
      await board.waitFor();
      for (const name of names) {
        const expected = prior.find(r => new URL(r.currentSrc).pathname.endsWith(`/${name}.webp`));
        const img = board.locator(`img[src$="/${name}.webp"]:visible`).first();
        await img.waitFor();
        await captureImage(p, img, expected, `workbook-${width}-${printed}-${name}`);
      }
      await p.screenshot({ path: path.join(proof, `workbook-${width}-${printed}.png`) });
    }
    await finish(c, p, `workbook-${width}`);
  }
  assert.deepEqual(errors, []);
  assert.equal(results.length, 60); // 48 teacher destinations + 6 WB placements at two widths.
} finally {
  await browser.close();
  fs.writeFileSync(path.join(proof, "results.json"), JSON.stringify({ baseURL, results, errors }, null, 2));
}
console.log(`SOURCE_CROP_RUNTIME_PASS ${results.length} rendered placements and served image hashes`);
