import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const deliveryManifestPath = path.join(
  rootDir,
  "public",
  "cartilla",
  "art",
  "delivery",
  "manifest.json",
);

describe("Ardilla Cryptographic Tamper Resistance (scripts/prepare-art-assets.mjs)", () => {
  let originalManifestContent: string;
  let verifyFinishedArt: () => Promise<any>;

  beforeEach(async () => {
    originalManifestContent = fs.readFileSync(deliveryManifestPath, "utf8");
    const module = await import("../prepare-art-assets.mjs");
    verifyFinishedArt = module.verifyFinishedArt;
  });

  afterEach(() => {
    // Strictly restore original authentic manifest after every test
    fs.writeFileSync(deliveryManifestPath, originalManifestContent, "utf8");
  });

  it("passes cleanly when ardilla asset manifest is authentic and unmodified", async () => {
    const report = await verifyFinishedArt();
    expect(report).toBeDefined();
    expect(report.assets).toBeDefined();

    const ardilla = report.assets.find(
      (a: any) => a.canonicalSrc === "/cartilla/art/faithful/vocal-a/ardilla.webp",
    );
    expect(ardilla).toBeDefined();
    expect(ardilla.canonical.sha256).toBe(
      createHash("sha256").update(fs.readFileSync(path.join(rootDir, "public/cartilla/art/faithful/vocal-a/ardilla.webp"))).digest("hex"),
    );
    expect(ardilla.canonical.bytes).toBe(fs.statSync(path.join(rootDir, "public/cartilla/art/faithful/vocal-a/ardilla.webp")).size);
  });

  it("fails fatally if manifest canonical sha256 for ardilla is tampered", async () => {
    const manifest = JSON.parse(originalManifestContent);
    const item = manifest.assets.find(
      (a: any) => a.canonicalSrc === "/cartilla/art/faithful/vocal-a/ardilla.webp",
    );
    expect(item).toBeDefined();
    item.canonical.sha256 = "0000000000000000000000000000000000000000000000000000000000000000";

    fs.writeFileSync(deliveryManifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    await expect(verifyFinishedArt()).rejects.toThrow(
      "Finished canonical changed: /cartilla/art/faithful/vocal-a/ardilla.webp",
    );
  });

  it("fails fatally if manifest 384px derivative byte size for ardilla is tampered", async () => {
    const manifest = JSON.parse(originalManifestContent);
    const item = manifest.assets.find(
      (a: any) => a.canonicalSrc === "/cartilla/art/faithful/vocal-a/ardilla.webp",
    );
    expect(item).toBeDefined();
    const d384 = item.derivatives.find((d: any) => d.widthTier === 384);
    expect(d384).toBeDefined();
    d384.bytes = 99999; // Intentionally invalid byte count

    fs.writeFileSync(deliveryManifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    await expect(verifyFinishedArt()).rejects.toThrow(
      "Finished delivery metadata mismatch: /cartilla/art/delivery/faithful/384/vocal-a/ardilla.webp",
    );
  });

  it("fails fatally if manifest 768px derivative byte size for ardilla is tampered", async () => {
    const manifest = JSON.parse(originalManifestContent);
    const item = manifest.assets.find(
      (a: any) => a.canonicalSrc === "/cartilla/art/faithful/vocal-a/ardilla.webp",
    );
    expect(item).toBeDefined();
    const d768 = item.derivatives.find((d: any) => d.widthTier === 768);
    expect(d768).toBeDefined();
    d768.bytes = 12345; // Intentionally invalid byte count

    fs.writeFileSync(deliveryManifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    await expect(verifyFinishedArt()).rejects.toThrow(
      "Finished delivery metadata mismatch: /cartilla/art/delivery/faithful/768/vocal-a/ardilla.webp",
    );
  });

  it("fails fatally if manifest derivative dimensions for ardilla are tampered", async () => {
    const manifest = JSON.parse(originalManifestContent);
    const item = manifest.assets.find(
      (a: any) => a.canonicalSrc === "/cartilla/art/faithful/vocal-a/ardilla.webp",
    );
    expect(item).toBeDefined();
    const d384 = item.derivatives.find((d: any) => d.widthTier === 384);
    expect(d384).toBeDefined();
    d384.width = 512; // Mismatched dimension

    fs.writeFileSync(deliveryManifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    await expect(verifyFinishedArt()).rejects.toThrow(
      "Finished delivery metadata mismatch: /cartilla/art/delivery/faithful/384/vocal-a/ardilla.webp",
    );
  });
});
