import { describe, expect, it } from "vitest";
import {
  attachGeneratedResult,
  buildArtFactoryCsv,
  buildGenerationPackage,
  buildIntegrationManifest,
  buildLockedCartillaPrompt,
  createAsset,
  createEmptyArtFactoryProject,
  matchGeneratedFilename,
  normalizeMappingPages,
  parseProject,
  serializeProject,
  setPageMapping,
} from "@/lib/cartilla-art-factory";

const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nXsAAAAASUVORK5CYII=";

describe("Cartilla Art Factory", () => {
  it("keeps explicit mapping ordered, unique, and in range", () => {
    expect(normalizeMappingPages([8, 3, 3, 0, 63, 5], 62)).toEqual([3, 5, 8]);
  });

  it("does not assume workbook page equals Flip Chart page", () => {
    let project = createEmptyArtFactoryProject();
    project = {
      ...project,
      flipchart: { name: "flipchart.pdf", pageCount: 62 },
    };
    project = setPageMapping(project, 9, [15, 16, 17]);
    expect(project.mappings["9"]).toEqual([15, 16, 17]);
    expect(project.mappings["9"]).not.toContain(9);
  });

  it("creates deterministic integration jobs with the locked visual prompt", () => {
    let project = createEmptyArtFactoryProject();
    project = {
      ...project,
      flipchart: { name: "flipchart.pdf", pageCount: 62 },
    };
    project = setPageMapping(project, 9, [15, 16]);
    const asset = createAsset(project, {
      studentPage: 9,
      sourceCrop: { page: 9, x: 0.1, y: 0.2, width: 0.3, height: 0.4, dataUrl: pixel },
      referenceCrops: [
        { page: 15, x: 0.2, y: 0.2, width: 0.2, height: 0.2, dataUrl: pixel },
      ],
      category: "animal",
      subject: "sapo",
      preservationNotes: "Preserve pose and count.",
    });

    expect(asset.id).toBe("caf-p009-a01");
    expect(asset.expectedFilename).toBe("caf-p009-a01-sapo-gretel2.png");
    expect(asset.referencePages).toEqual([15, 16]);
    expect(asset.status).toBe("READY");
    expect(asset.prompt).toContain("PLACEMENT ONLY");
    expect(asset.prompt).toContain("Do not generate, redraw, recolor, optimize");
  });

  it("matches generated results by exact filename or stable asset id", () => {
    const project = createEmptyArtFactoryProject();
    const asset = createAsset(project, {
      studentPage: 4,
      sourceCrop: { page: 4, x: 0, y: 0, width: 1, height: 1, dataUrl: pixel },
      category: "human",
      subject: "Ana",
      preservationNotes: "",
    });
    expect(matchGeneratedFilename(asset.expectedFilename, [asset])?.id).toBe(asset.id);
    expect(matchGeneratedFilename("result-" + asset.id + ".png", [asset])?.id).toBe(asset.id);
  });

  it("imports generated output without an owner approval state", () => {
    const project = createEmptyArtFactoryProject();
    const asset = createAsset(project, {
      studentPage: 4,
      sourceCrop: { page: 4, x: 0, y: 0, width: 1, height: 1, dataUrl: pixel },
      category: "human",
      subject: "Ana",
      preservationNotes: "",
    });
    const next = attachGeneratedResult(asset, {
      name: asset.expectedFilename,
      dataUrl: pixel,
      importedAt: "2026-09-28T00:00:00.000Z",
    });
    expect(next.status).toBe("GENERATED");
    expect(next.generatedResult?.name).toBe(asset.expectedFilename);
  });

  it("exports CSV, manifest round-trip, and a real ZIP payload", async () => {
    let project = createEmptyArtFactoryProject();
    const asset = createAsset(project, {
      studentPage: 3,
      sourceCrop: { page: 3, x: 0, y: 0, width: 1, height: 1, dataUrl: pixel },
      category: "object",
      subject: "aro",
      preservationNotes: "Keep geometry.",
    });
    project = { ...project, assets: [asset] };

    expect(buildArtFactoryCsv(project)).toContain("caf-p003-a01");
    expect(parseProject(serializeProject(project)).assets).toHaveLength(1);

    const zip = buildGenerationPackage(project);
    expect(zip.type).toBe("application/zip");
    expect(zip.size).toBeGreaterThan(100);
    const header = new Uint8Array(await zip.slice(0, 4).arrayBuffer());
    expect(Array.from(header)).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });

  it("exports only integration-ready generated assets in the replacement manifest", () => {
    let project = createEmptyArtFactoryProject();
    let asset = createAsset(project, {
      studentPage: 5,
      sourceCrop: { page: 5, x: 0, y: 0, width: 1, height: 1, dataUrl: pixel },
      category: "object",
      subject: "ala",
      preservationNotes: "Preserve silhouette.",
    });
    asset = attachGeneratedResult(asset, {
      name: asset.expectedFilename,
      dataUrl: pixel,
      importedAt: "2026-09-28T00:00:00.000Z",
    });
    asset = { ...asset, status: "READY FOR INTEGRATION" };
    project = { ...project, assets: [asset] };

    const manifest = buildIntegrationManifest(project);
    expect(manifest.policy.ownerApprovalGate).toBe(false);
    expect(manifest.replacements).toHaveLength(1);
    expect(manifest.replacements[0]?.productionDestination).toContain(
      "public/cartilla/art/generated/",
    );
  });

  it("locks the source-image and placement-only instructions in every prompt", () => {
    const prompt = buildLockedCartillaPrompt({
      assetId: "caf-p001-a01",
      studentPage: 1,
      referencePages: [],
      category: "object",
      subject: "object",
      preservationNotes: "",
    });
    expect(prompt).toContain("PLACEMENT ONLY");
    expect(prompt).toContain("existing approved image unchanged");
    expect(prompt).toContain("CARTILLA_SOURCE_OF_TRUTH.md");
  });
});
