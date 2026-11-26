import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import restored from "../../../docs/proofs/m7-m8-m9-verification/continuation/lesson4-ground-restoration.json";
import nativeAssets from "@/data/flipchart-native-assets.json";
import proof from "../../../docs/proofs/m7-m8-m9-verification/continuation/lesson4-source-provenance.json";

const root = process.cwd();
describe("Lesson 4 full source replacements", () => {
  it("binds all seven installed PNGs to the independently reproduced derivative chain", () => {
    expect(proof.sourcePdfSha256).toBe("d7fb3dff4e63caf3443226e57a9ef700f8974acd4ad8f08f44e2792e13cc4930");
    expect(proof.sourcePdfPage).toBe(6);
    expect(proof.allSevenVisibleRgbChainsMatch).toBe(true);
    // JPEG quality-95 decoding changes source RGB. Do not certify exact original pixels.
    expect(proof.originalRgbPreservedExactly).toBe(false);
    expect(proof.assets).toHaveLength(7);
    expect(restored.baselineHead).toBe(proof.candidateHead);
    expect(restored.unchangedPixelsAboveBand).toBe(true);
    expect(restored.restoredBandExactRgbaToSourceIntermediate).toBe(true);
    expect(restored.sourceOriginalRgbExact).toBe(false);
    for (const asset of proof.assets) {
      const installed = readFileSync(path.join(root, asset.destination));
      // Keep the baseline receipt immutable; the separately verified alpha repair
      // supersedes only the scene output, preserving all seven source chains.
      const currentHash = (restored.outputs as Record<string, string>)[asset.destination] ?? asset.sha256;
      expect(createHash("sha256").update(installed).digest("hex"), asset.destination).toBe(currentHash);
      expect(asset.rgbMatchVisibleToIntermediate).toBe(true);
    }
  });
  it("holds every replaced scene and picture still until new motion geometry is reviewed", () => {
    expect(nativeAssets["6"]).toHaveLength(7);
    expect(nativeAssets["6"].map(asset => asset.src).sort()).toEqual(proof.assets.map(asset => asset.destination.replace(/^public/, "")).sort());
    for (const asset of nativeAssets["6"]) expect(asset.motionDisabled, asset.src).toBe(true);
  });
});
