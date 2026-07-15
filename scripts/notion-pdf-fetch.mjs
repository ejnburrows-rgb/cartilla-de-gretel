#!/usr/bin/env node
// v2 — aggressive PDF discovery from a public Notion page, with diagnostics.
//
// Usage:
//   node notion-pdf-fetch.mjs <page-url-or-id> <output-path>
//
// Diagnostics (written to $DEBUG_DIR, default '.cartilla-import/debug'):
//   network.log     — every response URL the page made
//   anchors.log     — every <a href> visible in the DOM
//   summary.json    — page title, attempted URLs, candidate count, exit reason
//   page.png        — full-page screenshot
//   page.html       — fully rendered DOM HTML
//
// Exit codes: 0 ok | 1 args | 2 no candidate | 3 candidates but none valid PDF

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const DEBUG_DIR = process.env.DEBUG_DIR || ".cartilla-import/debug";
fs.mkdirSync(DEBUG_DIR, { recursive: true });

const networkLog = fs.createWriteStream(path.join(DEBUG_DIR, "network.log"));
const summary = {
  startedAt: new Date().toISOString(),
  argv: process.argv.slice(2),
  attemptedUrls: [],
  candidates: [],
  picked: null,
  exitCode: null,
  exitReason: null,
  errors: [],
};
function finish(code, reason) {
  summary.exitCode = code;
  summary.exitReason = reason;
  summary.endedAt = new Date().toISOString();
  fs.writeFileSync(path.join(DEBUG_DIR, "summary.json"), JSON.stringify(summary, null, 2));
  networkLog.end();
  process.exit(code);
}
process.on("uncaughtException", (e) => {
  summary.errors.push({ kind: "uncaught", message: e.message, stack: e.stack });
  finish(99, "uncaughtException");
});

const [arg1, outPath] = process.argv.slice(2);
if (!arg1 || !outPath) {
  console.error("Usage: node notion-pdf-fetch.mjs <page-url-or-id> <output-path>");
  finish(1, "bad args");
}

const NOTION_HOST = "www.notion.so";

function urlVariants(s) {
  if (/^https?:\/\//i.test(s)) return [s];
  const idNoDash = s.replace(/-/g, "");
  const idDashed =
    idNoDash.length === 32
      ? idNoDash.slice(0, 8) +
        "-" +
        idNoDash.slice(8, 12) +
        "-" +
        idNoDash.slice(12, 16) +
        "-" +
        idNoDash.slice(16, 20) +
        "-" +
        idNoDash.slice(20)
      : s;
  return ["https://" + NOTION_HOST + "/" + idNoDash, "https://" + NOTION_HOST + "/" + idDashed];
}

const attempts = urlVariants(arg1);
summary.attemptedUrls = attempts;
console.log("[v2] attempted URL variants:", attempts);

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({
  acceptDownloads: true,
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 1800 },
});
const page = await ctx.newPage();

const candidates = new Set();
function consider(u, source) {
  if (!u || typeof u !== "string") return;
  const lower = u.toLowerCase();
  const looksPdf =
    /\.pdf(?:\?|$|#)/.test(lower) || lower.includes("content-type=application%2fpdf");
  const looksNotionFile =
    lower.includes("prod-files-secure") ||
    lower.includes("file.notion.so") ||
    lower.includes("www.notion.so/signed") ||
    lower.includes("s3.us-west-2.amazonaws.com");
  if (looksPdf || looksNotionFile) {
    if (!candidates.has(u)) {
      candidates.add(u);
      summary.candidates.push({ url: u, source });
      console.log("[v2] candidate (" + source + "):", u);
    }
  }
}
page.on("response", (res) => {
  const u = res.url();
  try {
    networkLog.write(res.status() + " " + u + "\n");
  } catch {}
  consider(u, "response");
});
page.on("request", (req) => consider(req.url(), "request"));

let loadedUrl = null;
for (const target of attempts) {
  console.log("[v2] navigating to", target);
  try {
    const resp = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 90000 });
    if (resp && resp.status() < 500) {
      loadedUrl = target;
      break;
    }
    summary.errors.push({ url: target, status: resp ? resp.status() : null });
  } catch (e) {
    summary.errors.push({ url: target, message: e.message });
  }
}

if (!loadedUrl) {
  await browser.close();
  finish(2, "all URL variants failed to load");
}

try {
  await page.waitForLoadState("networkidle", { timeout: 60000 });
} catch {}

// Aggressive scrolling to trigger lazy file-block loading.
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let pass = 0; pass < 3; pass++) {
    const h = document.body ? document.body.scrollHeight : 4000;
    for (let y = 0; y < h; y += 300) {
      window.scrollTo(0, y);
      await sleep(120);
    }
    window.scrollTo(0, h);
    await sleep(2000);
  }
  window.scrollTo(0, 0);
});

await page.waitForTimeout(3000);

// Click any file/download-looking element to trigger network fetch.
try {
  const handles = await page.$$('[role="button"], button, a[href]');
  for (const h of handles.slice(0, 40)) {
    try {
      const t = (await h.innerText()).slice(0, 60);
      if (/download|pdf|workbook|cartilla/i.test(t)) {
        console.log("[v2] clicking element with text:", t);
        await h.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
      }
    } catch {}
  }
} catch (e) {
  summary.errors.push({ kind: "click", message: e.message });
}

await page.waitForTimeout(2000);

// DOM sweep
try {
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
  fs.writeFileSync(path.join(DEBUG_DIR, "anchors.log"), hrefs.join("\n"));
  for (const h of hrefs) consider(h, "dom");
} catch (e) {
  summary.errors.push({ kind: "anchors", message: e.message });
}

// Save full page state
try {
  await page.screenshot({
    path: path.join(DEBUG_DIR, "page.png"),
    fullPage: true,
  });
} catch (e) {
  summary.errors.push({ kind: "screenshot", message: e.message });
}
try {
  const html = await page.content();
  fs.writeFileSync(path.join(DEBUG_DIR, "page.html"), html);
} catch (e) {
  summary.errors.push({ kind: "html", message: e.message });
}

try {
  summary.pageTitle = await page.title();
  summary.finalUrl = page.url();
} catch {}

console.log("[v2] total candidates:", candidates.size);

if (candidates.size === 0) {
  await browser.close();
  finish(2, "no PDF candidate found after full diagnostic pass");
}

let wrote = false;
let pickedUrl = null;
for (const u of candidates) {
  console.log("[v2] downloading candidate:", u);
  try {
    const r = await ctx.request.get(u, { timeout: 240000 });
    if (!r.ok()) {
      console.log("   HTTP", r.status());
      continue;
    }
    const buf = await r.body();
    if (buf.length < 4096) {
      console.log("   too small:", buf.length);
      continue;
    }
    const header = buf.slice(0, 5).toString("ascii");
    if (!header.startsWith("%PDF-")) {
      console.log("   not PDF header:", JSON.stringify(header));
      continue;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log("[v2] wrote", buf.length, "bytes to", outPath);
    pickedUrl = u;
    wrote = true;
    break;
  } catch (e) {
    console.log("   error:", (e && e.message) || e);
  }
}

summary.picked = pickedUrl;
await browser.close();
finish(wrote ? 0 : 3, wrote ? "success" : "candidates found but none yielded valid PDF bytes");
