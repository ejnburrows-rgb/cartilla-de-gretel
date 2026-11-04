import fs from "fs";
import path from "path";
import zlib from "zlib";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");
const PROOFS_DIR = path.join(ROOT_DIR, "docs", "proofs", "performance-budget");

/**
 * Repeatable performance budget thresholds. Sizes in bytes.
 */
export const BUDGET_LIMITS = {
  // Fresh-build baseline of current main, verified 2026-10-10. The previous
  // baseline was measured against a stale pre-existing dist/ and underreported
  // react-vendor by ~40%; React 19.2.6 bundles ~395 KB raw / ~118 KB gzip.
  // Budgets are fresh measured values plus ~6-8% headroom.
  entryJsRawMax: 500 * 1024,      // ~445.7 KB fresh baseline
  entryJsGzipMax: 125 * 1024,     // ~109.6 KB fresh baseline
  entryCssRawMax: 300 * 1024,     // ~256 KB fresh baseline
  entryCssGzipMax: 50 * 1024,     // ~42 KB fresh baseline
  reactVendorRawMax: 430 * 1024,  // ~385.7 KB fresh baseline (react+react-dom-client+scheduler, React 19.2.6)
  reactVendorGzipMax: 130 * 1024, // ~115.2 KB fresh baseline
  tanstackRouterRawMax: 110 * 1024, // ~94.3 KB fresh baseline
  tanstackRouterGzipMax: 40 * 1024, // ~30.2 KB fresh baseline
  totalFirstPaintJsRawMax: 980 * 1024, // ~925.5 KB fresh baseline combined (index + vendors)
  totalFirstPaintJsGzipMax: 270 * 1024, // ~255.1 KB fresh baseline combined
};

function getAssetSizes(fileName) {
  const filePath = path.join(ASSETS_DIR, fileName);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return {
    raw: buffer.length,
    gzip: zlib.gzipSync(buffer).length,
    brotli: zlib.brotliCompressSync(buffer).length,
  };
}

export function runPerformanceBudgetCheck(options = {}) {
  const { autoBuild = true, writeReports = true } = options;

  // 1. Always measure a FRESH production build of current source. Reusing a
  // pre-existing dist/ produced the original phantom baseline (a stale build
  // reported react-vendor at ~40% under its real size), so an existing dist is
  // never trusted here.
  if (autoBuild) {
    console.log("Building production assets for performance budget measurement...");
    execSync("pnpm exec vite build", { cwd: ROOT_DIR, stdio: "inherit" });
  } else if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("dist/index.html not found. Run vite build first.");
  }

  const htmlContent = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");

  // 2. Discover entry assets from index.html
  const scriptMatch = htmlContent.match(/src="\/assets\/([^"]+\.js)"/);
  const cssMatch = htmlContent.match(/href="\/assets\/([^"]+\.css)"/);
  const preloadMatches = [...htmlContent.matchAll(/href="\/assets\/([^"]+\.js)"/g)].map(
    (m) => m[1],
  );

  if (!scriptMatch) {
    throw new Error("Could not find main entry script in dist/index.html");
  }
  if (!cssMatch) {
    throw new Error("Could not find main entry CSS in dist/index.html");
  }

  const entryJsFile = scriptMatch[1];
  const entryCssFile = cssMatch[1];
  const preloadedJsFiles = preloadMatches.filter((f) => f !== entryJsFile);

  const entryJsSizes = getAssetSizes(entryJsFile);
  const entryCssSizes = getAssetSizes(entryCssFile);

  const vendorSizes = {};
  let totalPreloadedJsRaw = 0;
  let totalPreloadedJsGzip = 0;

  for (const pFile of preloadedJsFiles) {
    const sizes = getAssetSizes(pFile);
    vendorSizes[pFile] = sizes;
    if (sizes) {
      totalPreloadedJsRaw += sizes.raw;
      totalPreloadedJsGzip += sizes.gzip;
    }
  }

  const totalFirstPaintJsRaw = entryJsSizes.raw + totalPreloadedJsRaw;
  const totalFirstPaintJsGzip = entryJsSizes.gzip + totalPreloadedJsGzip;

  // 3. Inspect dist/assets directory for all chunk files
  const assetFiles = fs.readdirSync(ASSETS_DIR);

  // 4. Verify Teacher Route Lazy Chunking
  const requiredTeacherLazyChunks = [
    "flipchart.lazy",
    "admin.lazy",
    "reportes.lazy",
    "roster.lazy",
    "crm.artwork.lazy",
    "crm.index.lazy",
    "route.lazy",
    "guia._n.lazy",
  ];

  const teacherChunkMap = {};
  for (const prefix of requiredTeacherLazyChunks) {
    const matched = assetFiles.find(
      (f) => f.startsWith(prefix) && f.endsWith(".js") && !f.endsWith(".gz") && !f.endsWith(".br"),
    );
    if (matched) {
      teacherChunkMap[prefix] = {
        fileName: matched,
        sizes: getAssetSizes(matched),
      };
    } else {
      teacherChunkMap[prefix] = null;
    }
  }

  // Check that teacher lazy route chunks exist
  const missingTeacherChunks = Object.keys(teacherChunkMap).filter(
    (k) => !teacherChunkMap[k],
  );

  // Inspect entry JS code to ensure heavy teacher-specific symbols or code are not bundled
  const entryJsCode = fs.readFileSync(path.join(ASSETS_DIR, entryJsFile), "utf8");

  // Symbols/strings that MUST NOT be present in entry JS
  const forbiddenEntrySymbols = [
    { name: "TeacherFlipchartPage", pattern: "TeacherFlipchartPage" },
    { name: "CRMArtwork", pattern: "CRMArtwork" },
  ];

  const entryLeakages = forbiddenEntrySymbols.filter((sym) =>
    entryJsCode.includes(sym.pattern),
  );

  // 5. Route Group Isolation Verification
  // Heavy assets/workers MUST NOT be preloaded in dist/index.html
  const forbiddenIndexPreloads = [
    "crm.artwork.lazy",
    "flipchart-native",
    "pdf.worker",
  ];

  const indexPreloadViolations = forbiddenIndexPreloads.filter((item) =>
    htmlContent.includes(item),
  );

  // 6. Build Violations List
  const violations = [];

  if (entryJsSizes.raw > BUDGET_LIMITS.entryJsRawMax) {
    violations.push(
      `Entry JS raw size (${(entryJsSizes.raw / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.entryJsRawMax / 1024).toFixed(1)} KB)`,
    );
  }
  if (entryJsSizes.gzip > BUDGET_LIMITS.entryJsGzipMax) {
    violations.push(
      `Entry JS gzip size (${(entryJsSizes.gzip / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.entryJsGzipMax / 1024).toFixed(1)} KB)`,
    );
  }
  if (entryCssSizes.raw > BUDGET_LIMITS.entryCssRawMax) {
    violations.push(
      `Entry CSS raw size (${(entryCssSizes.raw / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.entryCssRawMax / 1024).toFixed(1)} KB)`,
    );
  }
  if (entryCssSizes.gzip > BUDGET_LIMITS.entryCssGzipMax) {
    violations.push(
      `Entry CSS gzip size (${(entryCssSizes.gzip / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.entryCssGzipMax / 1024).toFixed(1)} KB)`,
    );
  }
  if (totalFirstPaintJsRaw > BUDGET_LIMITS.totalFirstPaintJsRawMax) {
    violations.push(
      `Total First-Paint JS raw size (${(totalFirstPaintJsRaw / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.totalFirstPaintJsRawMax / 1024).toFixed(1)} KB)`,
    );
  }
  if (totalFirstPaintJsGzip > BUDGET_LIMITS.totalFirstPaintJsGzipMax) {
    violations.push(
      `Total First-Paint JS gzip size (${(totalFirstPaintJsGzip / 1024).toFixed(1)} KB) exceeds budget (${(BUDGET_LIMITS.totalFirstPaintJsGzipMax / 1024).toFixed(1)} KB)`,
    );
  }

  if (missingTeacherChunks.length > 0) {
    violations.push(
      `Missing required teacher lazy route chunks: ${missingTeacherChunks.join(", ")}`,
    );
  }

  if (entryLeakages.length > 0) {
    violations.push(
      `Teacher symbols leaked into main entry bundle: ${entryLeakages.map((e) => e.name).join(", ")}`,
    );
  }

  if (indexPreloadViolations.length > 0) {
    violations.push(
      `Heavy route assets/workers preloaded in index.html: ${indexPreloadViolations.join(", ")}`,
    );
  }

  // 7. Generate Baseline Report Data
  const reportData = {
    timestamp: new Date().toISOString(),
    entryJs: {
      file: entryJsFile,
      sizes: entryJsSizes,
      budget: { rawMax: BUDGET_LIMITS.entryJsRawMax, gzipMax: BUDGET_LIMITS.entryJsGzipMax },
    },
    entryCss: {
      file: entryCssFile,
      sizes: entryCssSizes,
      budget: { rawMax: BUDGET_LIMITS.entryCssRawMax, gzipMax: BUDGET_LIMITS.entryCssGzipMax },
    },
    preloadedVendors: vendorSizes,
    totalFirstPaintJs: {
      raw: totalFirstPaintJsRaw,
      gzip: totalFirstPaintJsGzip,
      budget: {
        rawMax: BUDGET_LIMITS.totalFirstPaintJsRawMax,
        gzipMax: BUDGET_LIMITS.totalFirstPaintJsGzipMax,
      },
    },
    teacherChunks: teacherChunkMap,
    isolation: {
      forbiddenIndexPreloadsChecked: forbiddenIndexPreloads,
      violations: indexPreloadViolations,
    },
    passed: violations.length === 0,
    violations,
  };

  // 8. Write Proof Artifacts if requested
  if (writeReports) {
    if (!fs.existsSync(PROOFS_DIR)) {
      fs.mkdirSync(PROOFS_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(PROOFS_DIR, "baseline-report.json"),
      JSON.stringify(reportData, null, 2),
      "utf8",
    );

    const markdownReport = `# Local Performance Budget & Route-Chunk Baseline Report

**Generated:** ${reportData.timestamp}
**Status:** ${reportData.passed ? "PASSED" : "FAILED"}

## Entry Assets (First Paint)

| Asset Type | File Name | Raw Size | Gzip Size | Raw Budget Limit | Gzip Budget Limit | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **Entry JS** | \`${entryJsFile}\` | ${(entryJsSizes.raw / 1024).toFixed(1)} KB | ${(entryJsSizes.gzip / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.entryJsRawMax / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.entryJsGzipMax / 1024).toFixed(1)} KB | ${entryJsSizes.raw <= BUDGET_LIMITS.entryJsRawMax && entryJsSizes.gzip <= BUDGET_LIMITS.entryJsGzipMax ? "PASS" : "FAIL"} |
| **Entry CSS** | \`${entryCssFile}\` | ${(entryCssSizes.raw / 1024).toFixed(1)} KB | ${(entryCssSizes.gzip / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.entryCssRawMax / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.entryCssGzipMax / 1024).toFixed(1)} KB | ${entryCssSizes.raw <= BUDGET_LIMITS.entryCssRawMax && entryCssSizes.gzip <= BUDGET_LIMITS.entryCssGzipMax ? "PASS" : "FAIL"} |
| **Total First-Paint JS** | Entry + Preloaded Vendors | ${(totalFirstPaintJsRaw / 1024).toFixed(1)} KB | ${(totalFirstPaintJsGzip / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.totalFirstPaintJsRawMax / 1024).toFixed(1)} KB | ${(BUDGET_LIMITS.totalFirstPaintJsGzipMax / 1024).toFixed(1)} KB | ${totalFirstPaintJsRaw <= BUDGET_LIMITS.totalFirstPaintJsRawMax && totalFirstPaintJsGzip <= BUDGET_LIMITS.totalFirstPaintJsGzipMax ? "PASS" : "FAIL"} |

## Teacher Route Lazy Chunking Protection

| Teacher Route Prefix | Lazy Chunk File | Raw Size | Gzip Size | Status |
| --- | --- | --- | --- | --- |
${Object.entries(teacherChunkMap)
  .map(([prefix, info]) => {
    if (!info) return `| \`${prefix}\` | *MISSING* | - | - | **FAIL** |`;
    return `| \`${prefix}\` | \`${info.fileName}\` | ${(info.sizes.raw / 1024).toFixed(1)} KB | ${(info.sizes.gzip / 1024).toFixed(1)} KB | **PASS** |`;
  })
  .join("\n")}

## Route Group Isolation & Preload Verification

- **Checked Forbidden Preloads in Entry HTML:** ${forbiddenIndexPreloads.join(", ")}
- **Preload Violations Found:** ${indexPreloadViolations.length === 0 ? "None (Pass)" : indexPreloadViolations.join(", ")}
- **Teacher Symbols in Entry Bundle:** ${entryLeakages.length === 0 ? "None (Pass)" : entryLeakages.map((e) => e.name).join(", ")}

## Budget Violations
${violations.length === 0 ? "*No violations found. Build complies with performance budget.*" : violations.map((v) => `- ${v}`).join("\n")}
`;

    fs.writeFileSync(path.join(PROOFS_DIR, "PERFORMANCE_BUDGET.md"), markdownReport, "utf8");
  }

  return reportData;
}

// If invoked directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const result = runPerformanceBudgetCheck({ autoBuild: true, writeReports: true });
    console.log("==========================================");
    console.log("  LOCAL PERFORMANCE BUDGET VERIFICATION");
    console.log("==========================================");
    console.log(`Status: ${result.passed ? "PASSED" : "FAILED"}`);
    console.log(`Entry JS: ${(result.entryJs.sizes.raw / 1024).toFixed(1)} KB (gzip: ${(result.entryJs.sizes.gzip / 1024).toFixed(1)} KB)`);
    console.log(`Entry CSS: ${(result.entryCss.sizes.raw / 1024).toFixed(1)} KB (gzip: ${(result.entryCss.sizes.gzip / 1024).toFixed(1)} KB)`);
    console.log(`Total First-Paint JS: ${(result.totalFirstPaintJs.raw / 1024).toFixed(1)} KB (gzip: ${(result.totalFirstPaintJs.gzip / 1024).toFixed(1)} KB)`);
    console.log("------------------------------------------");
    if (result.violations.length > 0) {
      console.error("Violations:");
      result.violations.forEach((v) => console.error(` - ${v}`));
      process.exit(1);
    } else {
      console.log("All performance budget and route chunking checks passed!");
      process.exit(0);
    }
  } catch (err) {
    console.error("Performance budget verification error:", err);
    process.exit(1);
  }
}
