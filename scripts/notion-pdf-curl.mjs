#!/usr/bin/env node
// Curl-style PDF fetcher: hits Notion's internal endpoints directly.
// No browser, no dependencies, completes in ~10 seconds.
//
// Strategies (run in sequence; first to yield a valid PDF wins):
//   1. GET the public page HTML and grep for prod-files-secure / *.pdf URLs.
//   2. POST to /api/v3/loadPageChunk and walk recordMap.block for file blocks.
//   3. For S3 URLs missing a signature, ask /api/v3/getSignedFileUrls.
//
// Diagnostics written to $DEBUG_DIR (default .cartilla-import/debug):
//   curl-summary-<id>.json, curl-html-<id>.txt, curl-chunk-<id>.json
//
// Exit codes: 0 ok | 1 args | 2 no valid PDF

import fs from "node:fs";
import path from "node:path";

const DEBUG_DIR = process.env.DEBUG_DIR || ".cartilla-import/debug";
fs.mkdirSync(DEBUG_DIR, { recursive: true });

const [arg, outPath] = process.argv.slice(2);
if (!arg || !outPath) {
  console.error("usage: node notion-pdf-curl.mjs <id|url> <outPath>");
  process.exit(1);
}

const raw = arg
  .replace(/^https?:\/\/[^/]+\//, "")
  .replace(/[?#].*$/, "")
  .replace(/.*-/, "");
const idNoDash = raw.replace(/-/g, "");
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
    : raw;

const NOTION_HOST = "www.notion.so";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const summary = {
  startedAt: new Date().toISOString(),
  idNoDash,
  idDashed,
  attempts: [],
  discoveredUrls: [],
  picked: null,
  exitCode: null,
  exitReason: null,
};
function finish(code, reason) {
  summary.exitCode = code;
  summary.exitReason = reason;
  summary.endedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(DEBUG_DIR, `curl-summary-${idNoDash}.json`),
    JSON.stringify(summary, null, 2),
  );
  process.exit(code);
}

async function tryHtmlScrape() {
  const url = "https://" + NOTION_HOST + "/" + idNoDash;
  summary.attempts.push({ kind: "html", url });
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    const html = await res.text();
    fs.writeFileSync(path.join(DEBUG_DIR, `curl-html-${idNoDash}.txt`), html.slice(0, 300000));
    const re =
      /https:\/\/(?:prod-files-secure[^"\s\\<>]+|[^"\s\\<>]+\.pdf[^"\s\\<>]*|file\.notion\.so[^"\s\\<>]+|www\.notion\.so\/signed[^"\s\\<>]+)/gi;
    const ms = [...html.matchAll(re)].map((m) => m[0]);
    return [...new Set(ms)];
  } catch (e) {
    summary.attempts.push({ kind: "html", error: e.message });
    return [];
  }
}

async function tryLoadPageChunk() {
  const url = "https://" + NOTION_HOST + "/api/v3/loadPageChunk";
  summary.attempts.push({ kind: "loadPageChunk", url });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Notion-Client-Version": "23.13.0.3686",
      },
      body: JSON.stringify({
        pageId: idDashed,
        limit: 200,
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      }),
    });
    const text = await res.text();
    fs.writeFileSync(path.join(DEBUG_DIR, `curl-chunk-${idNoDash}.json`), text.slice(0, 500000));
    if (!res.ok) {
      summary.attempts.push({ kind: "loadPageChunk", status: res.status });
      return [];
    }
    const data = JSON.parse(text);
    const urls = new Set();
    const blocks = (data && data.recordMap && data.recordMap.block) || {};
    for (const id in blocks) {
      const b = blocks[id] && blocks[id].value;
      if (!b) continue;
      const src = b.properties && b.properties.source;
      if (Array.isArray(src)) {
        for (const item of src) {
          if (Array.isArray(item)) {
            for (const v of item) {
              if (typeof v === "string" && /^https?:\/\//.test(v)) urls.add(v);
            }
          }
        }
      }
      if (b.format && b.format.display_source) urls.add(b.format.display_source);
    }
    return [...urls];
  } catch (e) {
    summary.attempts.push({ kind: "loadPageChunk", error: e.message });
    return [];
  }
}

async function trySign(url, blockId) {
  try {
    const res = await fetch("https://" + NOTION_HOST + "/api/v3/getSignedFileUrls", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({
        urls: [{ url, permissionRecord: { table: "block", id: blockId } }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data && data.signedUrls && data.signedUrls[0]) || null;
  } catch {
    return null;
  }
}

async function downloadAndVerify(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) {
      console.log("   http", res.status);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4096) {
      console.log("   too small:", buf.length);
      return false;
    }
    const hdr = buf.slice(0, 5).toString("ascii");
    if (!hdr.startsWith("%PDF-")) {
      console.log("   not PDF header:", JSON.stringify(hdr));
      return false;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log("   wrote", buf.length, "bytes to", outPath);
    return true;
  } catch (e) {
    console.log("   error:", e.message);
    return false;
  }
}

const all = new Set();
for (const u of await tryHtmlScrape()) all.add(u);
for (const u of await tryLoadPageChunk()) all.add(u);
summary.discoveredUrls = [...all];
console.log("discovered", all.size, "candidate URLs");

for (const u of all) {
  console.log("trying", u);
  if (await downloadAndVerify(u)) {
    summary.picked = u;
    finish(0, "success direct");
  }
  const uuidMatch = u.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//);
  if (uuidMatch) {
    console.log("   signing for block", uuidMatch[1]);
    const signed = await trySign(u, uuidMatch[1]);
    if (signed && (await downloadAndVerify(signed))) {
      summary.picked = signed;
      finish(0, "success via getSignedFileUrls");
    }
  }
}

finish(2, "no candidate yielded a valid PDF");
