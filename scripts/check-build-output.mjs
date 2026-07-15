#!/usr/bin/env node
// check-build-output.mjs — post-build verifier.
// After `vite build`, confirm key static assets shipped. If any required
// asset is missing, fail the build so we never deploy a half-built bundle.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const DIST = path.join(root, "dist");

function must(rel, minBytes = 0, headerPrefix = null) {
  const p = path.join(DIST, rel);
  if (!fs.existsSync(p)) {
    console.error(`\u274c missing: dist/${rel}`);
    process.exit(1);
  }
  const stat = fs.statSync(p);
  if (stat.size < minBytes) {
    console.error(`\u274c too small: dist/${rel} (${stat.size}B, need \u2265 ${minBytes}B)`);
    process.exit(1);
  }
  if (headerPrefix) {
    const head = fs.readFileSync(p).subarray(0, headerPrefix.length).toString("utf8");
    if (head !== headerPrefix) {
      console.error(
        `\u274c bad header: dist/${rel} starts with "${head}", expected "${headerPrefix}"`,
      );
      process.exit(1);
    }
  }
  console.log(`\u2705 dist/${rel} (${stat.size}B)`);
}

if (!fs.existsSync(DIST)) {
  console.error("\u274c dist/ does not exist \u2014 build did not run.");
  process.exit(1);
}

must("index.html", 500);
must("book/book.pdf", 50_000, "%PDF-");
must("manifest.webmanifest", 50);

console.log("\n\ud83c\udf89 check-build-output passed.");
