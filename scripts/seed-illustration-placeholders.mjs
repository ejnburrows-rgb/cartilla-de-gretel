#!/usr/bin/env node
// seed-illustration-placeholders.mjs
// Generates a minimal SVG placeholder for every consonant + vowel letter so
// picture-catalog fallback URLs never 404 during early development.
// Runs in prebuild. Idempotent — only writes files that do not already exist.
//
// Output: public/illustrations/<letter>/placeholder.svg

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = path.join(ROOT, "public/illustrations");

const LETTERS = [
  { letter: "o", color: "#2f80ed" },
  { letter: "a", color: "#e63946" },
  { letter: "e", color: "#f28c28" },
  { letter: "i", color: "#2a9d8f" },
  { letter: "u", color: "#8338ec" },
  { letter: "m", color: "#E63946" },
  { letter: "p", color: "#F4A261" },
  { letter: "s", color: "#2A9D8F" },
  { letter: "t", color: "#264653" },
  { letter: "d", color: "#8338EC" },
  { letter: "l", color: "#E63946" },
  { letter: "n", color: "#F4A261" },
  { letter: "\u00f1", color: "#2A9D8F" },
  { letter: "b", color: "#264653" },
  { letter: "v", color: "#8338EC" },
  { letter: "r", color: "#E63946" },
  { letter: "g", color: "#2A9D8F" },
  { letter: "f", color: "#264653" },
  { letter: "j", color: "#8338EC" },
  { letter: "c", color: "#E63946" },
  { letter: "y", color: "#F4A261" },
  { letter: "z", color: "#2A9D8F" },
];

function svgFor(letter, color) {
  const display = letter.toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Letra ${display}">
  <rect width="200" height="200" rx="24" fill="${color}" fill-opacity="0.10"/>
  <rect x="6" y="6" width="188" height="188" rx="20" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.35"/>
  <text x="100" y="128" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="700" text-anchor="middle" fill="${color}">${display}</text>
</svg>
`;
}

let written = 0;
let skipped = 0;

for (const { letter, color } of LETTERS) {
  const safe = letter === "\u00f1" ? "n-tilde" : letter;
  const dir = path.join(BASE, safe);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "placeholder.svg");
  if (fs.existsSync(file)) {
    skipped++;
    continue;
  }
  fs.writeFileSync(file, svgFor(letter, color), "utf8");
  written++;
}

// Generic fallback at the top level
const rootFallback = path.join(BASE, "placeholder.svg");
if (!fs.existsSync(rootFallback)) {
  fs.mkdirSync(BASE, { recursive: true });
  fs.writeFileSync(rootFallback, svgFor("?", "#c98c4f"), "utf8");
  written++;
}

console.log(`\u2705  illustration placeholders: ${written} written, ${skipped} kept`);
process.exit(0);
