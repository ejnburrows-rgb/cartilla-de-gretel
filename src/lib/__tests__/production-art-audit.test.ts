import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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

  it("does not certify native Flip Chart artwork from file existence alone", () => {
    expect(audit.nativeAudit.length).toBeGreaterThan(0);
    expect(audit.nativeAudit.every((item: any) => item.classification === "PENDING NO VERIFIED SOURCE")).toBe(true);
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
