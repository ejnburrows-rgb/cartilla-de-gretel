#!/usr/bin/env node
// print-routes.mjs — enumerate every route declared in cartilla-routes.ts.
// Diagnostic. Runs at build time to confirm route surface area.

import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(path.join(process.cwd(), "src/lib/cartilla-routes.ts"), "utf8");
const lines = src.split("\n");

const routes = [];
for (const line of lines) {
	const m = line.match(/^\s*(\w+):\s*\(([^)]*)\)\s*=>\s*[`"]([^`"]+)[`"]/);
	if (m) {
		routes.push({ name: m[1], params: m[2].trim(), path: m[3] });
	}
}

console.log(`\n\ud83d\udcdc cartilla routes (${routes.length}):\n`);
for (const r of routes) {
	const params = r.params ? `(${r.params})` : "()";
	console.log(`  ${r.name.padEnd(22)} ${params.padEnd(18)} \u2192 ${r.path}`);
}
console.log();
