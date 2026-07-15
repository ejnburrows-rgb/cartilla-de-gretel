import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_ASSETS_DIR = path.resolve(__dirname, "../dist/assets");

const BUDGET_TOTAL_JS_KB = 800;
const BUDGET_SINGLE_CHUNK_KB = 250;

function main() {
  console.log("📊 Checking bundle size budgets...");

  if (!fs.existsSync(DIST_ASSETS_DIR)) {
    console.error("❌ Error: dist/assets directory not found. Please run 'npm run build' first.");
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_ASSETS_DIR).filter((file) => file.endsWith(".js"));

  if (files.length === 0) {
    console.error("❌ Error: No JS files found in dist/assets.");
    process.exit(1);
  }

  let totalSizeGzipBytes = 0;
  let hasErrors = false;

  console.log("\n------------------------------------------------------------");
  console.log(`${"File name".padEnd(40)} | ${"Raw Size".padEnd(10)} | ${"Gzip Size".padEnd(10)}`);
  console.log("------------------------------------------------------------");

  files.forEach((file) => {
    const filePath = path.join(DIST_ASSETS_DIR, file);
    const content = fs.readFileSync(filePath);
    const rawSize = content.length;
    const gzipped = zlib.gzipSync(content);
    const gzipSize = gzipped.length;

    totalSizeGzipBytes += gzipSize;

    const rawSizeKb = (rawSize / 1024).toFixed(2);
    const gzipSizeKb = (gzipSize / 1024).toFixed(2);

    console.log(
      `${file.padEnd(40)} | ${`${rawSizeKb} KB`.padEnd(10)} | ${`${gzipSizeKb} KB`.padEnd(10)}`,
    );

    if (gzipSize / 1024 > BUDGET_SINGLE_CHUNK_KB) {
      console.error(
        `   🛑 BUDGET EXCEEDED: ${file} is ${gzipSizeKb} KB gzipped (Limit: ${BUDGET_SINGLE_CHUNK_KB} KB)`,
      );
      hasErrors = true;
    }
  });

  const totalSizeGzipKb = (totalSizeGzipBytes / 1024).toFixed(2);

  console.log("------------------------------------------------------------");
  console.log(`TOTAL JS GZIP SIZE: ${totalSizeGzipKb} KB (Limit: ${BUDGET_TOTAL_JS_KB} KB)`);
  console.log("------------------------------------------------------------\n");

  if (totalSizeGzipBytes / 1024 > BUDGET_TOTAL_JS_KB) {
    console.error(
      `🛑 TOTAL BUDGET EXCEEDED: Total size is ${totalSizeGzipKb} KB (Limit: ${BUDGET_TOTAL_JS_KB} KB)`,
    );
    hasErrors = true;
  }

  if (hasErrors) {
    console.error("❌ Bundle size budget checks FAILED!");
    process.exit(1);
  } else {
    console.log("✅ Bundle size budget checks PASSED!");
    process.exit(0);
  }
}

main();
