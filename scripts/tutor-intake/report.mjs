import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function formatIntakeReportMarkdown(report) {
  const lines = [];
  lines.push(`# Tutor Recording Intake Report — ${report.batchId} (${report.date})`);
  lines.push("");
  lines.push(`- **Mode:** \`${report.dryRun ? "dry-run" : "apply"}\``);
  lines.push(`- **Authorization:** \`${report.authorized ? "authorized" : "unapproved-hold"}\``);
  lines.push(`- **Private Originals Directory:** \`${report.privateDir}\``);
  lines.push(`- **Repository Guard:** \`${report.guard?.ok ? "PASS" : "FAIL"}\``);
  if (report.matchedBatch) {
    lines.push(
      `- **Matched Batch:** \`${report.matchedBatch.batchId}\` (score=${report.matchedBatch.score}, coverage=${report.matchedBatch.matchedLinesCount}/${report.matchedBatch.totalLinesCount})`,
    );
  }
  lines.push("");

  lines.push("## 1. Source Checksums & Deduplication");
  lines.push("");
  lines.push("| Source | Status | Dedup | Bytes | SHA-256 (first 16) | Notes |");
  lines.push("| :--- | :--- | :--- | ---: | :--- | :--- |");
  for (const s of report.sources ?? []) {
    const shaShort = s.sha256 ? `\`${s.sha256.slice(0, 16)}\`` : "—";
    const notes = s.reasons?.length ? s.reasons.join("; ") : (s.privateOriginalPath ?? "ok");
    lines.push(
      `| \`${s.sourceName}\` | ${s.status} | ${s.dedupStatus} | ${s.bytes ?? 0} | ${shaShort} | ${notes} |`,
    );
  }
  lines.push("");

  if (report.alignment) {
    const sum = report.alignment.summary;
    lines.push("## 2. Transcript Matching & Needleman-Wunsch Alignment");
    lines.push("");
    lines.push(`- Expected lines: **${sum.expectedCount}**`);
    lines.push(`- Heard segments: **${sum.heardCount}**`);
    lines.push(`- Matched primary: **${sum.matchedCount}**`);
    lines.push(`- Missing lines: **${sum.missingCount}**`);
    lines.push(`- Repeated lines: **${sum.repeatedCount}**`);
    lines.push(`- Reordered lines: **${sum.reorderedCount}**`);
    lines.push(`- Wrong / deviated segments: **${sum.wrongCount}**`);
    lines.push("");

    if (report.alignment.missing.length > 0) {
      lines.push("### Missing Lines");
      for (const m of report.alignment.missing) {
        lines.push(`- \`${m.lineId}\`: ${m.text}`);
      }
      lines.push("");
    }
    if (report.alignment.repeated.length > 0) {
      lines.push("### Repeated Lines");
      for (const r of report.alignment.repeated) {
        lines.push(
          `- \`${r.lineId}\`: ${r.count} takes (segments ${r.segmentIndices.join(", ")}; chosen #${r.chosenSegmentIndex})`,
        );
      }
      lines.push("");
    }
    if (report.alignment.reordered.length > 0) {
      lines.push("### Reordered Lines");
      for (const o of report.alignment.reordered) {
        lines.push(
          `- \`${o.lineId}\` (segment #${o.segmentIndex}, expected index ${o.expectedIndex} appeared after ${o.previousMaxExpectedIndex})`,
        );
      }
      lines.push("");
    }
  }

  lines.push("## 3. Cut Points, QC, Visemes & Manifest Gate");
  lines.push("");
  lines.push(
    "| Line ID | Cut Window | QC | Peak (dBFS) | Noise (dBFS) | SNR (dB) | Visemes | Manifest |",
  );
  lines.push("| :--- | :--- | :--- | ---: | ---: | ---: | :--- | :--- |");
  for (const item of report.items ?? []) {
    const win =
      item.cutStartSec != null && item.cutEndSec != null
        ? `${item.cutStartSec.toFixed(3)}s–${item.cutEndSec.toFixed(3)}s`
        : "—";
    const qcText = item.qc?.passed ? "PASS" : `FAIL (${(item.qc?.failures ?? []).join(", ")})`;
    const m = item.qc?.metrics ?? {};
    lines.push(
      `| \`${item.lineId ?? "(unmapped)"}\` | ${win} | ${qcText} | ${m.peakDb ?? "—"} | ${m.noiseFloorDb ?? "—"} | ${m.snrDb ?? "—"} | ${item.visemesStatus ?? "—"} | ${item.manifestStatus ?? "—"} |`,
    );
  }
  lines.push("");

  if (report.manifestResult) {
    lines.push("## 4. Manifest Update Summary");
    lines.push("");
    lines.push(`- Applied updates: **${report.manifestResult.applied.length}**`);
    lines.push(`- Skipped / gated updates: **${report.manifestResult.skipped.length}**`);
    if (report.manifestResult.skipped.length > 0) {
      lines.push("");
      for (const sk of report.manifestResult.skipped) {
        lines.push(`- Skipped \`${sk.lineId}\`: ${sk.reasons.join("; ")}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function writeIntakeReport({ repoRoot, date, batchId, report }) {
  const safeDate = String(date || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, "");
  const safeBatch = String(batchId || "batch").replace(/[^A-Za-z0-9._-]+/g, "-");
  const outPath = join(repoRoot, "docs/tutor/intake", `${safeDate}-${safeBatch}.md`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, formatIntakeReportMarkdown(report) + "\n");
  return outPath;
}
