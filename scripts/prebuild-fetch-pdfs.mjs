#!/usr/bin/env node
// Vercel build-time PDF fetcher with self-diagnostic.
// Runs as `npm run prebuild` before `vite build`. HARD rule: NEVER fail the build. exit(0) always.

import fs from "node:fs";
import path from "node:path";

const JSON_CONFIG = ".cartilla-import/targets.json";
const TXT_CONFIG = ".cartilla-import/notion-url.txt";
const ROBOTS_PATH = "public/robots.txt";

const diagStartedAt = new Date().toISOString();
const diagCommit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.COMMIT_SHA ||
  "unknown";
const diagBranch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "unknown";
const diagTargets = [];

function readTargets() {
  if (fs.existsSync(JSON_CONFIG)) {
    try {
      const arr = JSON.parse(fs.readFileSync(JSON_CONFIG, "utf8"));
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      console.log("[prebuild] failed to parse", JSON_CONFIG, ":", e.message);
    }
  }
  if (fs.existsSync(TXT_CONFIG)) {
    const lines = fs
      .readFileSync(TXT_CONFIG, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const out = [];
    for (let i = 0; i + 1 < lines.length; i += 2) {
      out.push({ pageId: lines[i], outPath: lines[i + 1] });
    }
    return out;
  }
  return [];
}

const NOTION_HOST = "www.notion.so";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const NCV = "23.13.0.3686";

const FILE_URL_RE =
  /https:\/\/(?:prod-files-secure[^"\s\\<>]+|[^"\s\\<>]+\.pdf[^"\s\\<>]*|file\.notion\.so[^"\s\\<>]+|www\.notion\.so\/signed[^"\s\\<>]+|s3\.us-west-2\.amazonaws\.com\/secure\.notion-static\.com[^"\s\\<>]+|s3-us-west-2\.amazonaws\.com\/secure\.notion-static\.com[^"\s\\<>]+|attachments\.notion[^"\s\\<>]+)/gi;

function normalizeId(raw) {
  const stripped = raw
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/[?#].*$/, "")
    .replace(/.*-/, "");
  const idNoDash = stripped.replace(/-/g, "");
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
      : stripped;
  return { idNoDash, idDashed };
}

function normalizeUuid(s) {
  return (s || "").toLowerCase().replace(/-/g, "");
}

async function htmlCandidates(idNoDash, diag) {
  try {
    const res = await fetch("https://" + NOTION_HOST + "/" + idNoDash, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    diag.htmlStatus = res.status;
    if (!res.ok) return [];
    const html = await res.text();
    diag.htmlBytes = html.length;
    const urls = [...new Set([...html.matchAll(FILE_URL_RE)].map((m) => m[0]))];
    return urls.map((url) => ({ url, blockId: null, source: "html" }));
  } catch (e) {
    diag.htmlError = e.message;
    return [];
  }
}

async function chunkCandidates(idDashed, diag) {
  try {
    const res = await fetch("https://" + NOTION_HOST + "/api/v3/loadPageChunk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Notion-Client-Version": NCV,
      },
      body: JSON.stringify({
        pageId: idDashed,
        limit: 200,
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      }),
    });
    diag.chunkStatus = res.status;
    if (!res.ok) return [];
    const data = await res.json();
    diag.chunkBlockCount = Object.keys(
      (data && data.recordMap && data.recordMap.block) || {},
    ).length;
    const out = [];
    const blocks = (data && data.recordMap && data.recordMap.block) || {};
    for (const k in blocks) {
      const b = blocks[k] && blocks[k].value;
      if (!b) continue;
      const src = b.properties && b.properties.source;
      if (Array.isArray(src)) {
        for (const item of src) {
          if (Array.isArray(item)) {
            for (const v of item) {
              if (typeof v === "string" && /^https?:\/\//.test(v)) {
                out.push({ url: v, blockId: k, source: "chunk:source" });
              }
            }
          }
        }
      }
      if (b.format && b.format.display_source) {
        out.push({ url: b.format.display_source, blockId: k, source: "chunk:display_source" });
      }
    }
    // Wide net: stringify full recordMap, scan for any file URL.
    try {
      const recordMap = (data && data.recordMap) || {};
      const recordMapStr = JSON.stringify(recordMap);
      diag.recordMapBytes = recordMapStr.length;
      const seen = new Set();
      for (const m of recordMapStr.matchAll(FILE_URL_RE)) {
        const url = m[0];
        if (seen.has(url)) continue;
        seen.add(url);
        out.push({ url, blockId: null, source: "chunk:recordmap" });
      }
      diag.recordMapHits = seen.size;
    } catch (e) {
      diag.recordMapError = e.message;
    }
    return out;
  } catch (e) {
    diag.chunkError = e.message;
    return [];
  }
}

async function downloadAndWrite(url, outPath) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return { ok: false, why: "http " + res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4096) return { ok: false, why: "too small " + buf.length };
    const hdr = buf.slice(0, 5).toString("ascii");
    if (!hdr.startsWith("%PDF-")) return { ok: false, why: "not pdf: " + JSON.stringify(hdr) };
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    return { ok: true, bytes: buf.length };
  } catch (e) {
    return { ok: false, why: "err " + e.message };
  }
}

function urlContainsName(url, needle) {
  if (!needle) return false;
  const hay = (url || "").toLowerCase();
  const want = needle.toLowerCase();
  return hay.includes(want) || hay.includes(encodeURIComponent(want).toLowerCase());
}

function matchesFilter(cand, target) {
  const { fileBlockUuid, fileNameContains } = target;
  if (!fileBlockUuid && !fileNameContains) return true;
  if (fileBlockUuid) {
    const wanted = normalizeUuid(fileBlockUuid);
    if (cand.blockId && normalizeUuid(cand.blockId) === wanted) return true;
    if (cand.url && normalizeUuid(cand.url).includes(wanted)) return true;
  }
  if (fileNameContains && urlContainsName(cand.url, fileNameContains)) return true;
  return false;
}

async function fetchOne(target) {
  const diag = {
    label: target.label || target.pageId,
    pageId: target.pageId,
    outPath: target.outPath,
    fileBlockUuid: target.fileBlockUuid || null,
    fileNameContains: target.fileNameContains || null,
  };
  diagTargets.push(diag);

  const { idNoDash, idDashed } = normalizeId(target.pageId);
  const seen = new Map();
  for (const c of await htmlCandidates(idNoDash, diag)) {
    if (!seen.has(c.url)) seen.set(c.url, c);
  }
  for (const c of await chunkCandidates(idDashed, diag)) {
    if (!seen.has(c.url)) seen.set(c.url, c);
  }
  const all = [...seen.values()];
  diag.candidateCount = all.length;

  const filtered = all.filter((c) => matchesFilter(c, target));
  diag.filteredCount = filtered.length;

  const wantedNorm = normalizeUuid(target.fileBlockUuid || "");
  diag.candidates = all.slice(0, 20).map((c) => ({
    url: c.url.slice(0, 140),
    blockId: c.blockId || null,
    source: c.source,
    matched: matchesFilter(c, target),
    urlContainsUuid: !!(wantedNorm && normalizeUuid(c.url).includes(wantedNorm)),
  }));

  const useFilter = !!(target.fileBlockUuid || target.fileNameContains);
  const ordered = useFilter && filtered.length > 0 ? filtered : all;
  diag.usedFallback = useFilter && filtered.length === 0 && all.length > 0;

  for (const cand of ordered) {
    const result = await downloadAndWrite(cand.url, target.outPath);
    if (result.ok) {
      diag.wrote = { url: cand.url.slice(0, 140), bytes: result.bytes };
      return true;
    }
    diag.lastFailure = result.why + " on " + cand.url.slice(0, 80);
  }
  diag.wrote = null;
  return false;
}

function writeDiagnostic() {
  const lines = [
    "# La Cartilla de Gretel",
    "User-agent: *",
    "Allow: /",
    "",
    "# === Prebuild diagnostic ===",
    "# startedAt: " + diagStartedAt,
    "# finishedAt: " + new Date().toISOString(),
    "# commit: " + diagCommit,
    "# branch: " + diagBranch,
  ];
  for (const t of diagTargets) {
    lines.push("#");
    lines.push("# target: " + t.label + " -> " + t.outPath);
    lines.push("#   filterBlockUuid: " + t.fileBlockUuid);
    lines.push("#   filterFileName: " + t.fileNameContains);
    lines.push("#   htmlStatus: " + t.htmlStatus + ", htmlBytes: " + t.htmlBytes);
    lines.push("#   chunkStatus: " + t.chunkStatus + ", chunkBlocks: " + t.chunkBlockCount);
    if (t.recordMapBytes != null) {
      lines.push("#   recordMapBytes: " + t.recordMapBytes + ", recordMapHits: " + t.recordMapHits);
    }
    if (t.htmlError) lines.push("#   htmlError: " + t.htmlError);
    if (t.chunkError) lines.push("#   chunkError: " + t.chunkError);
    if (t.recordMapError) lines.push("#   recordMapError: " + t.recordMapError);
    lines.push(
      "#   candidates: " +
        t.candidateCount +
        ", filtered: " +
        t.filteredCount +
        (t.usedFallback ? " (used fallback: all)" : ""),
    );
    if (t.wrote) lines.push("#   WROTE: " + t.wrote.bytes + " bytes from " + t.wrote.url);
    else lines.push("#   WROTE: nothing");
    if (t.lastFailure) lines.push("#   lastFailure: " + t.lastFailure);
    for (const c of t.candidates || []) {
      lines.push(
        "#   - [" +
          (c.matched ? "MATCH" : "     ") +
          "] block=" +
          (c.blockId ? c.blockId.slice(0, 8) : "none    ") +
          " uuidInUrl=" +
          (c.urlContainsUuid ? "Y" : "N") +
          " src=" +
          c.source +
          " :: " +
          c.url,
      );
    }
  }
  lines.push("");
  try {
    fs.writeFileSync(ROBOTS_PATH, lines.join("\n") + "\n");
    console.log("[prebuild] wrote diagnostic to", ROBOTS_PATH);
  } catch (e) {
    console.log("[prebuild] failed to write diagnostic:", e.message);
  }
}

const targets = readTargets();
if (targets.length === 0) {
  console.log("[prebuild] no targets configured");
  writeDiagnostic();
  process.exit(0);
}

let anySuccess = false;
for (const target of targets) {
  try {
    const ok = await fetchOne(target);
    if (ok) anySuccess = true;
  } catch (e) {
    console.log("[prebuild] unexpected error for", target.pageId, e.message);
  }
}

writeDiagnostic();
if (!anySuccess) console.log("[prebuild] no PDFs fetched");
process.exit(0);
