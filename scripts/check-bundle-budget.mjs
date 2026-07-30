import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const MAX_INITIAL_JS_BYTES = Number(process.env.CARTILLA_INITIAL_JS_BUDGET_BYTES ?? 1200 * 1024);

// "Initial JS" is exactly what a browser fetches on first paint of "/": the
// entry <script> plus every <link rel="modulepreload"> Vite emitted for it.
// A filename-substring heuristic (the previous approach: exclude anything
// with "lazy"/"teacher"/"admin" in its name) has to be re-calibrated by hand
// every time a chunk gets renamed or split differently — it silently
// undercounted a ~1 MB monolithic "route-teacher" chunk that was actually
// preloaded from root (verified via index.html), and would silently
// overcount genuinely-lazy per-route chunks that just don't happen to have
// "teacher" in their name. Reading the real dependency graph Vite already
// computed avoids both failure modes.
const html = readFileSync(join(DIST, "index.html"), "utf8");
const scriptSrcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+\.js)"/g)].map((m) => m[1]);
const preloadHrefs = [
  ...html.matchAll(/<link[^>]*\srel="modulepreload"[^>]*\shref="([^"]+\.js)"/g),
].map((m) => m[1]);

const initialFiles = [...new Set([...scriptSrcs, ...preloadHrefs])];
const initialBytes = initialFiles.reduce(
  (sum, href) => sum + statSync(join(DIST, href.replace(/^\//, ""))).size,
  0,
);

console.log(`Initial JavaScript estimate: ${initialBytes} bytes`);
console.log(`Budget: ${MAX_INITIAL_JS_BYTES} bytes`);
for (const f of initialFiles.sort()) {
  console.log(`  ${f} (${statSync(join(DIST, f.replace(/^\//, ""))).size} bytes)`);
}

if (initialBytes > MAX_INITIAL_JS_BYTES) {
  console.error(
    `Initial JavaScript budget exceeded: ${initialBytes} > ${MAX_INITIAL_JS_BYTES}. Lazy-load heavy teacher/admin/PDF routes before merging.`,
  );
  process.exit(1);
}
