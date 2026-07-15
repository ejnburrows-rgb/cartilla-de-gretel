#!/usr/bin/env node
// seed-gretel-placeholders.mjs — ensures public/gretel/*.webp paths exist as
// tiny placeholder files so the build never 404s on Gretel art before real
// art is committed by the Antigravity lane.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const DIR = path.join(root, "public", "gretel");

const FILES = [
  "idle-1.webp",
  "idle-2.webp",
  "happy.webp",
  "cheer.webp",
  "thinking.webp",
  "encouraging.webp",
];

// Minimal valid WebP (VP8L 1\u00d71 transparent). 34 bytes. Hex:
// 524946462a000000 57454250 56503820 1e000000 30010050 0500c803 00009d01
// 2a01000100 03c08c0c000fcb2202
const MINIMAL_WEBP = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x2a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
  0x1e, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00,
  0x34, 0x25, 0xa4, 0x00, 0x03, 0x70, 0x00, 0xfe, 0xfb, 0x94, 0x00, 0x00,
]);

fs.mkdirSync(DIR, { recursive: true });
let created = 0;
for (const name of FILES) {
  const p = path.join(DIR, name);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.size > 0) continue;
  }
  fs.writeFileSync(p, MINIMAL_WEBP);
  created++;
  console.log(`\u2705 seeded ${path.relative(root, p)}`);
}
if (created === 0) console.log("\u2705 all gretel placeholders already present.");
console.log(`\n\ud83c\udf89 seed-gretel-placeholders done (${created} new).`);
