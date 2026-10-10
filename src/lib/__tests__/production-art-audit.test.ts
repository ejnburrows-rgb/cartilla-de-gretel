import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const audit = JSON.parse(
  readFileSync(path.join(root, "docs/production-art-classification-audit.json"), "utf8"),
);

const bySrc = new Map(audit.faithfulAudit.map((item: any) => [item.src, item]));

// Rows whose optimized output is a deterministic pixel match to its declared
// HD source-page crop. Every other row must stay PENDING.
const deterministicallyVerifiedNative = [
  "/cartilla/art/optimized/flipchart-native/p018-tapa.webp",
  "/cartilla/art/optimized/flipchart-native/p018-tipi.webp",
  "/cartilla/art/optimized/flipchart-native/p018-tomate.webp",
  "/cartilla/art/optimized/flipchart-native/p018-topo.webp",
  "/cartilla/art/optimized/flipchart-native/p018-tuto.webp",
  "/cartilla/art/optimized/flipchart-native/p024-lata.webp",
  "/cartilla/art/optimized/flipchart-native/p024-loma.webp",
  "/cartilla/art/optimized/flipchart-native/p024-luli.webp",
  "/cartilla/art/optimized/flipchart-native/p024-maleta.webp",
];

describe("production foreground art audit truthfulness", () => {
  it("keeps the five owner-approved Page-1 assets present on disk", () => {
    const required = [
      "/cartilla/art/faithful/leccion-1/abrigo.webp",
      "/cartilla/art/faithful/vocal-e/escuela.webp",
      "/cartilla/art/faithful/leccion-1/ojos.webp",
      "/cartilla/art/faithful/leccion-1/maiz.webp",
      "/cartilla/art/faithful/vocal-a/abeja.webp",
    ];
    for (const src of required) {
      expect(existsSync(path.join(root, "public", src.replace(/^\//, "")))).toBe(true);
    }
  });

  it("keeps missing mono and sapo blink slots explicitly pending instead of inventing files", () => {
    for (const src of [
      "/cartilla/art/faithful/leccion-7-m/mono-blink.webp",
      "/cartilla/art/faithful/leccion-9-s/sapo-blink.webp",
    ]) {
      const item = bySrc.get(src) as any;
      expect(item?.classification).toBe("PENDING NO VERIFIED SOURCE");
      expect(item?.bytes).toBe(0);
      expect(existsSync(path.join(root, "public", src.replace(/^\//, "")))).toBe(false);
    }
  });

  it("certifies native Flip Chart artwork only from a deterministic crop match", () => {
    expect(audit.nativeAudit.length).toBe(167);

    const passed = audit.nativeAudit
      .filter((item: any) => item.classification === "PASS")
      .map((item: any) => item.src)
      .sort();
    expect(passed).toEqual([...deterministicallyVerifiedNative].sort());

    for (const item of audit.nativeAudit) {
      if (item.classification === "PASS") {
        expect(item.exists).toBe(true);
        expect(item.cropMatch).toBe(true);
        expect(item.aspectMatch).toBe(true);
        expect(item.evidence).toMatch(/deterministic crop correspondence/);
        expect(item.pendingReason).toBeNull();
      } else {
        expect(item.classification).toBe("PENDING NO VERIFIED SOURCE");
        expect(item.cropMatch).toBe(false);
        expect(item.evidence).toBeNull();
        expect(typeof item.pendingReason).toBe("string");
        expect(item.pendingReason.length).toBeGreaterThan(0);
      }
    }
  });

  it("never approves a native row merely because its declared metadata is present", () => {
    // Rows carrying declared source-page/crop metadata but no pixel match must
    // stay pending: presence of metadata is not proof of provenance.
    const metadataOnly = audit.nativeAudit.filter(
      (item: any) =>
        item.exists && item.sourcePageMatches && item.hasCropEvidence && item.classification !== "PASS",
    );
    expect(metadataOnly.length).toBeGreaterThan(0);
    expect(metadataOnly.every((item: any) => item.cropMatch === false)).toBe(true);
  });

  it("reproduces the committed audit and locks the native evidence schema", { timeout: 30000 }, () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "cartilla-art-audit-"));
    const output = path.join(tempDir, "audit.json");
    try {
      execFileSync(process.execPath, [path.join(root, "scripts", "audit-foreground-art.mjs")], {
        cwd: root,
        env: { ...process.env, ART_AUDIT_OUTPUT: output },
        stdio: "pipe",
      });
      const generated = JSON.parse(readFileSync(output, "utf8"));
      const committed = structuredClone(audit);
      delete generated.timestamp;
      delete committed.timestamp;
      expect(generated).toEqual(committed);
      expect(
        generated.nativeAudit.every(
          (item: any) =>
            !("approvedInput" in item) &&
            "sourcePage" in item &&
            Array.isArray(item.crop) &&
            typeof item.verified === "boolean" &&
            typeof item.sourcePageMatches === "boolean" &&
            typeof item.hasCropEvidence === "boolean" &&
            typeof item.cropMatch === "boolean" &&
            typeof item.aspectMatch === "boolean" &&
            (item.matchScore === null || typeof item.matchScore === "number") &&
            (item.meanDiff === null || typeof item.meanDiff === "number") &&
            (item.evidence === null || typeof item.evidence === "string") &&
            (item.classification === "PASS"
              ? item.pendingReason === null
              : typeof item.pendingReason === "string"),
        ),
      ).toBe(true);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not misclassify backfilled source crops as verified color transfers", () => {
    for (const src of [
      "/cartilla/art/faithful/leccion-1/dulce.webp",
      "/cartilla/art/faithful/leccion-1/libro.webp",
      "/cartilla/art/faithful/leccion-1/pajaro.webp",
    ]) {
      const item = bySrc.get(src) as any;
      expect(item?.provenance).toMatch(/^BACKFILLED-/);
      expect(item?.classification).not.toBe("VERIFIED COLOR TRANSFER");
    }
  });
});
