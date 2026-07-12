#!/usr/bin/env node
/**
 * Activities sprint browser QA — sample student lesson routes + no-crash check.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "generated", "activities-qa");
fs.mkdirSync(outDir, { recursive: true });

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:4175";
const LESSONS = [1, 2, 6, 7, 8, 9, 16, 17, 18, 24];

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const launchOpts = fs.existsSync(edgePath)
  ? { headless: true, executablePath: edgePath }
  : { headless: true, channel: "msedge" };

const browser = await chromium.launch(launchOpts);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const results = [];

// Unlock all lessons (isLessonUnlocked needs prior lesson completed)
await page.addInitScript(() => {
  try {
    const completed = [];
    for (let i = 1; i <= 24; i++) completed.push(i);
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(completed));
  } catch {
    /* ignore */
  }
});

for (const n of LESSONS) {
  const url = `${BASE}/cartilla/leccion/${n}`;
  let status = "ok";
  let error = null;
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1200);
    if (resp && resp.status() >= 400) status = `http_${resp.status()}`;
    const bodyText = await page.locator("body").innerText().catch(() => "");
    if (/Something went wrong|Application error|Unexpected Application Error/i.test(bodyText)) {
      status = "crash_ui";
    }
    const shot = path.join(outDir, `lesson-${String(n).padStart(2, "0")}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    results.push({
      lesson: n,
      path: `/cartilla/leccion/${n}`,
      status,
      screenshot: path.relative(root, shot).replace(/\\/g, "/"),
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    status = "error";
    results.push({ lesson: n, path: `/cartilla/leccion/${n}`, status, error });
  }
}

// Also capture lecciones index
try {
  await page.goto(`${BASE}/cartilla/lecciones`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);
  const shot = path.join(outDir, "lecciones-index.png");
  await page.screenshot({ path: shot, fullPage: false });
  results.push({
    lesson: null,
    path: "/cartilla/lecciones",
    status: "ok",
    screenshot: path.relative(root, shot).replace(/\\/g, "/"),
  });
} catch (e) {
  results.push({
    lesson: null,
    path: "/cartilla/lecciones",
    status: "error",
    error: e instanceof Error ? e.message : String(e),
  });
}

await browser.close();
const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  results,
  ok: results.every((r) => r.status === "ok"),
};
fs.writeFileSync(path.join(outDir, "browser-qa.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
