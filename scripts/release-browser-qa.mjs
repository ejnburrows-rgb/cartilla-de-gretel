#!/usr/bin/env node
/**
 * Local preview browser QA for release integration.
 * Captures mobile (390x844) and desktop (1440x900) screenshots + route status.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "generated", "release-integration-qa");
fs.mkdirSync(outDir, { recursive: true });

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:4173";

const ROUTES = [
  { id: "splash", path: "/cartilla" },
  { id: "login", path: "/login" },
  { id: "ayuda", path: "/cartilla/ayuda" },
  { id: "lecciones", path: "/cartilla/lecciones" },
  { id: "student-libro", path: "/cartilla/student/libro" },
  { id: "libro-vivo", path: "/cartilla/student/libro-vivo" },
  { id: "mi-progreso", path: "/cartilla/student/mi-progreso" },
  { id: "leccion-1", path: "/cartilla/leccion/1" },
  { id: "teacher-crm", path: "/cartilla/teacher/crm" },
  { id: "teacher-flipchart", path: "/cartilla/presentar/1" },
  { id: "teacher-reportes", path: "/cartilla/teacher/reportes" },
  { id: "dev-workbook-manifest", path: "/dev-workbook-manifest" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const results = [];

const edgePath = "C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe";
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  `${process.env.USERPROFILE}\\\\AppData\\\\Local\\\\ms-playwright\\\\chromium-1228\\\\chrome-win64\\\\chrome.exe`;
const launchOpts = fs.existsSync(edgePath)
  ? { headless: true, executablePath: edgePath }
  : fs.existsSync(chromiumPath)
    ? { headless: true, executablePath: chromiumPath }
    : { headless: true, channel: "msedge" };
const browser = await chromium.launch(launchOpts);
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`;
    let status = "ok";
    let title = "";
    let error = null;
    try {
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(800);
      title = await page.title();
      if (resp && resp.status() >= 400) status = `http_${resp.status()}`;
      const shot = path.join(outDir, `${vp.name}-${route.id}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      results.push({
        viewport: vp.name,
        route: route.path,
        id: route.id,
        status,
        title,
        screenshot: path.relative(root, shot).replace(/\\/g, "/"),
      });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      status = "error";
      results.push({
        viewport: vp.name,
        route: route.path,
        id: route.id,
        status,
        title,
        error,
      });
    }
  }
  await context.close();
}
await browser.close();

const reportPath = path.join(outDir, "browser-qa.json");
fs.writeFileSync(
  reportPath,
  JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), results }, null, 2),
);
console.log(JSON.stringify({ reportPath, count: results.length, failures: results.filter((r) => r.status !== "ok") }, null, 2));
process.exit(results.some((r) => r.status === "error") ? 1 : 0);
