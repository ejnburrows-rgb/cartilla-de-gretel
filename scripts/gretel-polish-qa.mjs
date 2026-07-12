/**
 * Worker E polish QA screenshots — mobile 390x844 + desktop 1440x900
 * Edge preferred: C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = [
  path.join(root, "generated", "gretel-qa"),
  path.join(root, "generated", "polish-qa"),
];
for (const d of dirs) fs.mkdirSync(d, { recursive: true });

const BASE = (process.env.QA_BASE_URL || "http://127.0.0.1:4173").trim().replace(/\/$/, "");

const ROUTES = [
  { id: "splash", path: "/cartilla" },
  { id: "ayuda", path: "/cartilla/ayuda" },
  { id: "ayuda-teacher-tab", path: "/cartilla/ayuda" },
  { id: "lecciones", path: "/cartilla/lecciones" },
  { id: "leccion-1", path: "/cartilla/leccion/1" },
  { id: "teacher-crm", path: "/cartilla/teacher/crm" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  `${process.env.USERPROFILE}\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe`;
const launchOpts = fs.existsSync(edgePath)
  ? { headless: true, executablePath: edgePath }
  : fs.existsSync(chromiumPath)
    ? { headless: true, executablePath: chromiumPath }
    : { headless: true, channel: "msedge" };

const results = [];
const browser = await chromium.launch(launchOpts);

for (const outDir of dirs) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      let status = "ok";
      let error = null;
      try {
        const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(1000);
        if (route.id === "ayuda-teacher-tab") {
          const teacherTab = page.getByRole("tab", { name: /Docente|Teacher/i });
          if (await teacherTab.count()) {
            await teacherTab.first().click();
            await page.waitForTimeout(400);
          }
        }
        if (resp && resp.status() >= 400) status = `http_${resp.status()}`;
        const shot = path.join(outDir, `${vp.name}-${route.id}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        results.push({
          dir: path.relative(root, outDir).replace(/\\/g, "/"),
          viewport: vp.name,
          route: route.path,
          id: route.id,
          status,
          screenshot: path.relative(root, shot).replace(/\\/g, "/"),
        });
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        status = "error";
        results.push({
          dir: path.relative(root, outDir).replace(/\\/g, "/"),
          viewport: vp.name,
          route: route.path,
          id: route.id,
          status,
          error,
        });
      }
    }
    await context.close();
  }
}

await browser.close();

const report = {
  base: BASE,
  generatedAt: new Date().toISOString(),
  launch: launchOpts.executablePath || launchOpts.channel || "default",
  results,
};
const reportPath = path.join(root, "generated", "polish-qa", "browser-qa.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(root, "generated", "gretel-qa", "browser-qa.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      reportPath: path.relative(root, reportPath).replace(/\\/g, "/"),
      count: results.length,
      failures: results.filter((r) => r.status !== "ok"),
    },
    null,
    2,
  ),
);
process.exit(results.some((r) => r.status === "error") ? 1 : 0);
