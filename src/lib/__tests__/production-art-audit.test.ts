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

  it("verifies native Flip Chart artwork only with affirmative deterministic source evidence", () => {
    expect(audit.nativeAudit.length).toBe(167);
    expect(
      audit.nativeAudit.every(
        (item: any) =>
          item.classification === "PASS" &&
          item.exists === true &&
          item.verified === true &&
          item.sourcePageMatches === true &&
          item.hasCropEvidence === true &&
          item.sourceMaterialExists === true &&
          item.hasValidSourceCrop === true &&
          typeof item.sourceMaterialFile === "string" &&
          item.missingEvidence === null,
      ),
    ).toBe(true);
  });

  it("reproduces the committed audit and locks the native evidence schema", () => {
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
            typeof item.sourceMaterialExists === "boolean" &&
            typeof item.hasValidSourceCrop === "boolean",
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
