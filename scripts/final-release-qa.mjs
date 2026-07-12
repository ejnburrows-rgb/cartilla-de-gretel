#!/usr/bin/env node
/**
 * Final release QA orchestrator (Worker F).
 *
 * Prep phase: this script is ready to run after swarm integration.
 * It does NOT invent pass/fail for unreleased work — it measures what is live
 * at QA_BASE_URL and writes evidence under generated/final-release-qa/results/.
 *
 * Usage:
 *   set QA_BASE_URL=http://127.0.0.1:4173
 *   node scripts/final-release-qa.mjs
 *
 *   set QA_BASE_URL=https://cartilla-de-gretel-<hash>-ejns-projects-1b938dd2.vercel.app
 *   node scripts/final-release-qa.mjs
 *
 * Flags:
 *   --skip-browser   asset checks only
 *   --skip-assets    browser only
 *   --list-routes    print route checklist and exit 0
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { FINAL_QA_ROUTES, VIEWPORTS, smokeRoutes } from "./validation/routes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsDir = path.join(root, "generated", "final-release-qa", "results");
const shotDir = path.join(resultsDir, "screenshots");
fs.mkdirSync(shotDir, { recursive: true });

const args = new Set(process.argv.slice(2));
if (args.has("--list-routes")) {
  console.log(JSON.stringify({ viewports: VIEWPORTS, routes: FINAL_QA_ROUTES }, null, 2));
  process.exit(0);
}

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const skipBrowser = args.has("--skip-browser");
const skipAssets = args.has("--skip-assets");

function runNode(scriptRel) {
  const script = path.join(root, scriptRel);
  const r = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  return {
    script: scriptRel,
    status: r.status,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
  };
}

const assetRuns = [];
if (!skipAssets) {
  assetRuns.push(runNode("scripts/validation/check-asset-integrity.mjs"));
  assetRuns.push(runNode("scripts/validation/check-missing-references.mjs"));
}

/** @type {any[]} */
let browserResults = [];
let browserError = null;

if (!skipBrowser) {
  try {
    const { chromium } = await import("playwright");
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const chromiumPath =
      process.env.PLAYWRIGHT_CHROMIUM_PATH ||
      path.join(
        process.env.USERPROFILE || "",
        "AppData",
        "Local",
        "ms-playwright",
        "chromium-1228",
        "chrome-win64",
        "chrome.exe",
      );
    const launchOpts = fs.existsSync(edgePath)
      ? { headless: true, executablePath: edgePath }
      : fs.existsSync(chromiumPath)
        ? { headless: true, executablePath: chromiumPath }
        : { headless: true, channel: "msedge" };

    const routes = smokeRoutes();
    const browser = await chromium.launch(launchOpts);
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      for (const route of routes) {
        const url = `${BASE}${route.path}`;
        let status = "ok";
        let title = "";
        let httpStatus = null;
        let error = null;
        try {
          const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForTimeout(700);
          title = await page.title();
          httpStatus = resp ? resp.status() : null;
          if (httpStatus && httpStatus >= 400) status = `http_${httpStatus}`;
          const shot = path.join(shotDir, `${vp.name}-${route.id}.png`);
          await page.screenshot({ path: shot, fullPage: false });
          browserResults.push({
            viewport: vp.name,
            id: route.id,
            group: route.group,
            path: route.path,
            status,
            httpStatus,
            title,
            auth: Boolean(route.auth),
            screenshot: path.relative(root, shot).replace(/\\/g, "/"),
          });
        } catch (e) {
          error = e instanceof Error ? e.message : String(e);
          browserResults.push({
            viewport: vp.name,
            id: route.id,
            group: route.group,
            path: route.path,
            status: "error",
            httpStatus,
            title,
            auth: Boolean(route.auth),
            error,
          });
        }
      }
      await context.close();
    }
    await browser.close();
  } catch (e) {
    browserError = e instanceof Error ? e.message : String(e);
  }
}

const hardBrowserFails = browserResults.filter((r) => r.status === "error");
const assetFail = assetRuns.some((r) => r.status !== 0);

const report = {
  generatedAt: new Date().toISOString(),
  phase: "final-release-qa",
  terminalPrep: "FINAL_VALIDATION_PREP_COMPLETE",
  // Verdict is only PASS/FAIL when this script is intentionally executed post-integration.
  // Prep commit may run with no server — treat browser connectivity errors as incomplete, not release fail claims.
  baseUrl: BASE,
  viewports: VIEWPORTS,
  routeCatalogCount: FINAL_QA_ROUTES.length,
  smokeRouteCount: smokeRoutes().length,
  assets: assetRuns.map((r) => ({
    script: r.script,
    status: r.status,
    stdout: r.stdout.slice(0, 2000),
    stderr: r.stderr.slice(0, 1000),
  })),
  browserError,
  browser: {
    count: browserResults.length,
    failures: hardBrowserFails,
    results: browserResults,
  },
  summary: {
    assetOk: !assetFail,
    browserOk: !browserError && hardBrowserFails.length === 0,
    incomplete: Boolean(browserError) || (skipBrowser && skipAssets),
  },
  csvNote:
    "CSV export is a UI action (src/lib/csv-export.ts) on /cartilla/teacher/reportes — not a dedicated URL; verify manually after auth.",
  familyReportPath:
    "/cartilla/teacher/crm/$classId/$studentId/reporte — requires live class/student ids",
  productionAlias: "https://cartilla-de-gretel.vercel.app",
  previewPattern: "https://cartilla-de-gretel-<hash>-ejns-projects-1b938dd2.vercel.app",
};

const reportPath = path.join(resultsDir, "browser-qa.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(
  JSON.stringify(
    {
      reportPath: path.relative(root, reportPath).replace(/\\/g, "/"),
      baseUrl: BASE,
      assetOk: report.summary.assetOk,
      browserOk: report.summary.browserOk,
      incomplete: report.summary.incomplete,
      browserResults: browserResults.length,
      hardBrowserFails: hardBrowserFails.length,
      browserError,
    },
    null,
    2,
  ),
);

// Exit: 0 if complete and clean; 1 if measured failures; 2 if incomplete (e.g. no server)
if (report.summary.incomplete) process.exit(2);
if (!report.summary.assetOk || !report.summary.browserOk) process.exit(1);
process.exit(0);
