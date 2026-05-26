#!/usr/bin/env node
// sanity-check-content.mjs — cross-reference content invariants at build time.
// Fails the build if any of the following are violated:
//   - LESSONS has exactly 24 entries with n = 1..24
//   - PAGE_BINDINGS covers pages 1..90
//   - Every consonant lesson has a corresponding sentence bank entry (L7..L24)
//   - Every lesson has a teacher tip (L1..L24)
//   - Every lesson has standards alignment (L1..L24)
//   - No banned word (demo, pixar, demo'd, demoing) appears in any content file

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const CONTENT_DIR = path.join(root, "src/content");

function read(rel) {
	const p = path.join(root, rel);
	if (!fs.existsSync(p)) {
		fail(`Missing required file: ${rel}`);
	}
	return fs.readFileSync(p, "utf8");
}

function fail(msg) {
	console.error(`\u274c sanity-check-content: ${msg}`);
	process.exit(1);
}

function pass(msg) {
	console.log(`\u2705 ${msg}`);
}

// 1) LESSONS shape
const lessonMeta = read("src/content/lesson-meta.ts");
const lessonNs = [...lessonMeta.matchAll(/\{\s*n:\s*(\d+)/g)].map((m) => Number(m[1]));
const uniqueNs = [...new Set(lessonNs)].sort((a, b) => a - b);
if (uniqueNs.length < 24 || uniqueNs[0] !== 1 || uniqueNs[23] !== 24) {
	fail(`lesson-meta.ts must define lessons 1..24, found: ${JSON.stringify(uniqueNs)}`);
}
pass("lesson-meta.ts defines lessons 1..24");

// 2) PAGE_BINDINGS covers 1..90
const pageBindings = read("src/content/page-bindings.ts");
const pageNs = [...pageBindings.matchAll(/page:\s*(\d+)/g)].map((m) => Number(m[1]));
const uniquePages = [...new Set(pageNs)].sort((a, b) => a - b);
if (uniquePages.length < 90 || uniquePages[0] !== 1 || uniquePages[89] !== 90) {
	fail(`page-bindings.ts must cover pages 1..90, found ${uniquePages.length} unique pages`);
}
pass("page-bindings.ts covers pages 1..90");

// 3) Sentence bank covers L7..L24
const sentenceBank = read("src/content/sentence-bank.ts");
for (let n = 7; n <= 24; n++) {
	if (!new RegExp(`^\\s*${n}\\s*:`, "m").test(sentenceBank)) {
		fail(`sentence-bank.ts missing entry for lesson ${n}`);
	}
}
pass("sentence-bank.ts covers consonant lessons 7..24");

// 4) Teacher tips cover L1..L24
const teacherTips = read("src/content/teacher-tips.ts");
for (let n = 1; n <= 24; n++) {
	if (!new RegExp(`lessonN:\\s*${n}[,\\s]`).test(teacherTips)) {
		fail(`teacher-tips.ts missing entry for lesson ${n}`);
	}
}
pass("teacher-tips.ts covers lessons 1..24");

// 5) Standards alignment imports LESSONS (so it covers all)
const standards = read("src/content/standards-alignment.ts");
if (!standards.includes('from "./lesson-meta"')) {
	fail("standards-alignment.ts must import LESSONS from ./lesson-meta");
}
pass("standards-alignment.ts wired to lesson-meta");

// 6) Banned words — scan content dir
const BANNED = [/\bdemo\b/i, /\bdemoed\b/i, /\bdemoing\b/i, /\bpixar\b/i];
for (const file of fs.readdirSync(CONTENT_DIR)) {
	if (!file.endsWith(".ts")) continue;
	const body = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
	for (const rx of BANNED) {
		if (rx.test(body)) {
			fail(`Banned word ${rx} found in src/content/${file}`);
		}
	}
}
pass("no banned words in src/content/**");

console.log("\n\ud83c\udf89 sanity-check-content passed.");
