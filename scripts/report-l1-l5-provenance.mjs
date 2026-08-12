#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const layouts = read("src/data/page-layouts.json").pages ?? {};
const manifest = read("public/cartilla/art/faithful/manifest.json");
const meta = new Map(manifest.filter((x) => x?.src).map((x) => [x.src, x]));
const replacements = new Map([
  ["/cartilla/art/faithful/leccion-1/ola.webp", "/cartilla/art/faithful/vocal-o/ola.webp"],
  ["/cartilla/art/faithful/leccion-1/traje.webp", "/cartilla/art/faithful/vocal-u/uniforme.webp"],
  ["/cartilla/art/faithful/leccion-3/ardilla.webp", "/cartilla/art/faithful/vocal-a/ardilla.webp"],
  ["/cartilla/art/faithful/leccion-4/erizo.webp", "/cartilla/art/faithful/vocal-e/erizo.webp"],
  ["/cartilla/art/faithful/leccion-5/igual.webp", "/cartilla/art/faithful/vocal-i/igual.webp"],
  ["/cartilla/art/faithful/leccion-5/iguana.webp", "/cartilla/art/faithful/vocal-i/iguana.webp"],
]);
const srcs = new Set();
const add = (s) => { if (typeof s === "string" && s.startsWith("/cartilla/art/")) srcs.add(replacements.get(s) ?? s); };
for (let p = 1; p <= 15; p++) {
  const page = layouts[String(p)];
  const regions = Array.isArray(page) ? page : page?.regions ?? [];
  for (const r of regions) {
    add(r.illustrationSrc);
    for (const c of r.cells ?? []) add(c.illustrationSrc);
    for (const row of r.vowelRows ?? []) for (const c of row.cells ?? []) add(c.illustrationSrc);
    for (const c of r.vowelPairs ?? []) add(c.illustrationSrc);
    for (const row of r.matchRows ?? []) for (const c of row) add(c.illustrationSrc);
    for (const i of r.fillItems ?? []) add(i.illustrationSrc);
  }
}
const rows = [...srcs].sort().map((src) => {
  const m = meta.get(src) ?? {};
  const abs = path.join(root, "public", src.replace(/^\//, ""));
  const sha256 = fs.existsSync(abs) ? crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex") : null;
  return { src, sha256, sourceFlipchartPage: m.sourceFlipchartPage ?? null, source: m.source ?? null, cropBox: m.cropBox ?? null, provenanceStatus: m.provenanceStatus ?? null, note: m.note ?? null };
});
const digest = crypto.createHash("sha256").update(rows.map((r) => `${r.src}:${r.sha256}`).join("\n")).digest("hex");
console.log("L1_L5_PROVENANCE " + JSON.stringify({ count: rows.length, runtimeArtDigest: digest, rows }));
