import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import {
  identifyTargetSlots,
  verifySuppliedImage,
  processOwnerArtIntake,
  rootDir,
} from "../scripts/validate-owner-art-package.mjs";

describe("Owner Art Intake Pipeline", () => {
  let tempDir;

  sharp.cache(false);

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), "cartilla-intake-test-" + Math.random().toString(36).slice(2));
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
      } catch {
        /* ignore Windows cleanup file lock */
      }
    }
  });

  async function createValidTestPng(filePath, width = 100, height = 100) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toFile(filePath);
  }

  async function createTransparentPng(filePath, width = 100, height = 100) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toFile(filePath);
  }

  it("identifies target slots and distinguishes pending vs verified slots", () => {
    const slots = identifyTargetSlots(rootDir);
    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);

    const pending = slots.filter((s) => !s.isVerified);
    const verified = slots.filter((s) => s.isVerified);

    expect(pending.length).toBeGreaterThan(0);
    expect(verified.length).toBeGreaterThan(0);

    for (const slot of slots) {
      expect(slot).toHaveProperty("src");
      expect(slot).toHaveProperty("word");
      expect(slot).toHaveProperty("isVerified");
      expect(slot).toHaveProperty("classification");
    }
  });

  it("validates image sanity correctly (decode, dimensions, alpha/crop)", async () => {
    const validPng = path.join(tempDir, "valid.png");
    await createValidTestPng(validPng, 128, 128);

    const targetSlot = {
      src: "/cartilla/art/faithful/leccion-1/manzana.webp",
      isVerified: false,
      classification: "PENDING NO VERIFIED SOURCE",
    };

    const validCheck = await verifySuppliedImage(validPng, targetSlot, { root: rootDir });
    expect(validCheck.valid).toBe(true);
    expect(validCheck.metadata.width).toBe(128);
    expect(validCheck.metadata.height).toBe(128);

    // Test non-existent file
    const missingCheck = await verifySuppliedImage(path.join(tempDir, "missing.png"), targetSlot);
    expect(missingCheck.valid).toBe(false);
    expect(missingCheck.reason).toBe("FILE_NOT_FOUND");

    // Test zero/small dimensions
    const smallPng = path.join(tempDir, "small.png");
    await createValidTestPng(smallPng, 10, 10);
    const smallCheck = await verifySuppliedImage(smallPng, targetSlot);
    expect(smallCheck.valid).toBe(false);
    expect(smallCheck.reason).toBe("FAILED_DIMENSIONS");

    // Test completely transparent image
    const transparentPng = path.join(tempDir, "transparent.png");
    await createTransparentPng(transparentPng, 100, 100);
    const transCheck = await verifySuppliedImage(transparentPng, targetSlot);
    expect(transCheck.valid).toBe(false);
    expect(transCheck.reason).toBe("FAILED_TRANSPARENCY_CROP");

    // Test unsafe target path
    const unsafeSlot = {
      src: "/cartilla/art/../../src/data/hacked.webp",
      isVerified: false,
      classification: "PENDING NO VERIFIED SOURCE",
    };
    const unsafeCheck = await verifySuppliedImage(validPng, unsafeSlot, { root: rootDir });
    expect(unsafeCheck.valid).toBe(false);
    expect(unsafeCheck.reason).toBe("UNSAFE_TARGET_PATH");
  });

  it("prevents silent overwriting of verified assets unless explicitly allowed", async () => {
    const validPng = path.join(tempDir, "valid.png");
    await createValidTestPng(validPng, 100, 100);

    const verifiedSlot = {
      src: "/cartilla/art/faithful/leccion-1/abrigo.webp",
      isVerified: true,
      classification: "PASS",
    };

    // Default: blocked
    const blockedCheck = await verifySuppliedImage(validPng, verifiedSlot, {
      allowOverwriteVerified: false,
      root: rootDir,
    });
    expect(blockedCheck.valid).toBe(false);
    expect(blockedCheck.reason).toBe("BLOCKED_VERIFIED_OVERWRITE");

    // Allowed when force flag is true
    const allowedCheck = await verifySuppliedImage(validPng, verifiedSlot, {
      allowOverwriteVerified: true,
      root: rootDir,
    });
    expect(allowedCheck.valid).toBe(true);
  });

  it("runs dry-run intake with explicit mapping without modifying disk", async () => {
    const packageDir = path.join(tempDir, "owner-package");
    const suppliedImage = path.join(packageDir, "manzana_new.png");
    await createValidTestPng(suppliedImage, 128, 128);

    const mapping = [
      {
        file: "manzana_new.png",
        slot: "/cartilla/art/faithful/leccion-1/manzana.webp",
      },
    ];

    const targetFile = path.join(
      rootDir,
      "public",
      "cartilla",
      "art",
      "faithful",
      "leccion-1",
      "manzana.webp",
    );
    const origMtime = fs.existsSync(targetFile) ? fs.statSync(targetFile).mtimeMs : null;

    const report = await processOwnerArtIntake({
      packagePath: packageDir,
      explicitMappings: mapping,
      dryRun: true,
      root: rootDir,
    });

    expect(report.status).toBe("dry-run");
    expect(report.plan.length).toBe(1);
    expect(report.plan[0].action).toBe("WOULD_IMPORT");
    expect(report.plan[0].sanity.valid).toBe(true);
    expect(report.filesChanged.length).toBe(0);
    expect(report.derivativesGenerated.length).toBe(0);

    // Verify disk was untouched
    if (origMtime !== null) {
      expect(fs.statSync(targetFile).mtimeMs).toBe(origMtime);
    }
  });

  it("requires explicit mapping when filename is ambiguous", async () => {
    const packageDir = path.join(tempDir, "ambiguous-package");
    const monoImage = path.join(packageDir, "mono.png");
    await createValidTestPng(monoImage, 100, 100);

    const report = await processOwnerArtIntake({
      packagePath: packageDir,
      dryRun: true,
      root: rootDir,
    });

    expect(report.ambiguousMappings.length).toBeGreaterThan(0);
    expect(report.plan.length).toBe(0);
  });

  it("executes actual intake, updates target file and manifest, and generates delivery derivatives", async () => {
    // Create mock root environment in tempDir to test actual import safely
    const mockRoot = path.join(tempDir, "mock-repo");
    const faithfulDir = path.join(mockRoot, "public", "cartilla", "art", "faithful");
    fs.mkdirSync(faithfulDir, { recursive: true });

    const sampleManifest = [
      {
        slug: "manzana",
        word: "manzana",
        lessonNumber: 1,
        pageNumber: 1,
        src: "/cartilla/art/faithful/leccion-1/manzana.webp",
        provenanceStatus: "PROVENANCE-UNKNOWN",
        note: "Needs verification",
      },
    ];

    fs.writeFileSync(
      path.join(faithfulDir, "manifest.json"),
      JSON.stringify(sampleManifest, null, 2),
    );

    const packageDir = path.join(tempDir, "import-pkg");
    const suppliedFile = path.join(packageDir, "manzana.png");
    await createValidTestPng(suppliedFile, 128, 128);

    const report = await processOwnerArtIntake({
      packagePath: packageDir,
      explicitMappings: [
        { file: "manzana.png", slot: "/cartilla/art/faithful/leccion-1/manzana.webp" },
      ],
      dryRun: false,
      root: mockRoot,
    });

    expect(report.status).toBe("imported");
    expect(report.filesChanged).toContain("/cartilla/art/faithful/leccion-1/manzana.webp");
    expect(report.derivativesGenerated).toContain(
      "/cartilla/art/delivery/faithful/384/leccion-1/manzana.webp",
    );
    expect(report.derivativesGenerated).toContain(
      "/cartilla/art/delivery/faithful/768/leccion-1/manzana.webp",
    );

    // Verify canonical target and derivatives exist on disk in mock root
    const canonicalTarget = path.join(
      mockRoot,
      "public",
      "cartilla",
      "art",
      "faithful",
      "leccion-1",
      "manzana.webp",
    );
    const d384 = path.join(
      mockRoot,
      "public",
      "cartilla",
      "art",
      "delivery",
      "faithful",
      "384",
      "leccion-1",
      "manzana.webp",
    );
    const d768 = path.join(
      mockRoot,
      "public",
      "cartilla",
      "art",
      "delivery",
      "faithful",
      "768",
      "leccion-1",
      "manzana.webp",
    );

    expect(fs.existsSync(canonicalTarget)).toBe(true);
    expect(fs.existsSync(d384)).toBe(true);
    expect(fs.existsSync(d768)).toBe(true);

    // Verify manifest provenance update
    const updatedManifest = JSON.parse(
      fs.readFileSync(path.join(faithfulDir, "manifest.json"), "utf8"),
    );
    expect(updatedManifest[0].provenanceStatus).toMatch(/^VERIFIED-OWNER-INTAKE-/);
  });
});
