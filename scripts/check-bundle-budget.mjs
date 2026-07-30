import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/assets";
const MAX_INITIAL_JS_BYTES = Number(process.env.CARTILLA_INITIAL_JS_BUDGET_BYTES ?? 1200 * 1024);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const jsFiles = walk(DIST).filter((file) => file.endsWith(".js"));
const initialFiles = jsFiles.filter((file) => !file.includes("lazy") && !file.includes("teacher") && !file.includes("admin"));
const initialBytes = initialFiles.reduce((sum, file) => sum + statSync(file).size, 0);

console.log(`Initial JavaScript estimate: ${initialBytes} bytes`);
console.log(`Budget: ${MAX_INITIAL_JS_BYTES} bytes`);

if (initialBytes > MAX_INITIAL_JS_BYTES) {
  console.error(
    `Initial JavaScript budget exceeded: ${initialBytes} > ${MAX_INITIAL_JS_BYTES}. Lazy-load heavy teacher/admin/PDF routes before merging.`,
  );
  process.exit(1);
}
