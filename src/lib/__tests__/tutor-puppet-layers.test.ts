/**
 * tutor-puppet-layers tests (spec §17 / blocker B5).
 *
 * The manifest is EMPTY today: layers land only after the owner approves
 * each piece side-by-side (docs/gretel/LAYER-PACK-SPEC.md Step C). These
 * tests lock the gate: nothing without an approval reference or outside the
 * layers directory can ever reach the puppet, and the empty/absent manifest
 * always resolves to the approved-master fallback.
 */
import { describe, expect, it, vi } from "vitest";
import {
  PUPPET_LAYERS_DIR,
  PUPPET_LAYERS_MANIFEST_URL,
  validatePuppetLayers,
  loadPuppetLayers,
} from "../tutor-puppet-layers";

// Overrides are intentionally untyped: the validator must be fed raw,
// possibly-invalid manifest shapes exactly like a real fetch would.
function makeLayer(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "hair-back",
    role: "static",
    src: `${PUPPET_LAYERS_DIR}hair-back.png`,
    approval: "owner side-by-side Yes — 2026-10-21 chat",
    ...overrides,
  };
}

describe("validatePuppetLayers", () => {
  it("accepts the empty manifest (today's real state) with zero layers", () => {
    expect(validatePuppetLayers({ layers: [] })).toEqual([]);
  });

  it("malformed manifests yield no layers (master fallback, never an error)", () => {
    expect(validatePuppetLayers(null)).toEqual([]);
    expect(validatePuppetLayers({})).toEqual([]);
    expect(validatePuppetLayers({ layers: "nope" })).toEqual([]);
    expect(validatePuppetLayers({ layers: [42, "x", null] })).toEqual([]);
  });

  it("accepts a fully valid layered manifest, preserving stack order", () => {
    const layers = [
      makeLayer(),
      makeLayer({
        id: "mouth-open",
        role: "mouth",
        src: `${PUPPET_LAYERS_DIR}mouth-open.png`,
        shapes: ["C", "D"],
      }),
      makeLayer({
        id: "blink-closed",
        role: "blink",
        src: `${PUPPET_LAYERS_DIR}blink-closed.webp`,
      }),
    ];
    const valid = validatePuppetLayers({ layers });
    expect(valid).toHaveLength(3);
    expect(valid.map((l) => l.id)).toEqual(["hair-back", "mouth-open", "blink-closed"]);
    expect(valid[1].shapes).toEqual(["C", "D"]);
  });

  it("drops any layer without an owner approval reference (LAYER-PACK-SPEC Step C)", () => {
    expect(validatePuppetLayers({ layers: [makeLayer({ approval: "" })] })).toEqual([]);
    expect(validatePuppetLayers({ layers: [makeLayer({ approval: undefined })] })).toEqual([]);
    expect(validatePuppetLayers({ layers: [makeLayer({ approval: "   " })] })).toEqual([]);
  });

  it("drops layers with unknown roles", () => {
    expect(validatePuppetLayers({ layers: [makeLayer({ role: "talking-mouth-2" })] })).toEqual([]);
    expect(validatePuppetLayers({ layers: [makeLayer({ role: 7 })] })).toEqual([]);
  });

  it("only allows same-origin layer-directory png/webp sources, no traversal", () => {
    expect(
      validatePuppetLayers({ layers: [makeLayer({ src: "https://evil.example/layers/x.png" })] }),
    ).toEqual([]);
    expect(
      validatePuppetLayers({
        layers: [makeLayer({ src: "/cartilla/images/gretel/gretel-approved-master.png" })],
      }),
    ).toEqual([]);
    expect(
      validatePuppetLayers({ layers: [makeLayer({ src: `${PUPPET_LAYERS_DIR}../master.png` })] }),
    ).toEqual([]);
    expect(
      validatePuppetLayers({ layers: [makeLayer({ src: `${PUPPET_LAYERS_DIR}mouth-open.jpg` })] }),
    ).toEqual([]);
  });

  it("drops duplicate ids (first occurrence wins, deterministically)", () => {
    const layers = [
      makeLayer({ id: "bow", src: `${PUPPET_LAYERS_DIR}bow.png` }),
      makeLayer({ id: "bow", src: `${PUPPET_LAYERS_DIR}bow-2.png` }),
    ];
    const valid = validatePuppetLayers({ layers });
    expect(valid).toHaveLength(1);
    expect(valid[0].src).toBe(`${PUPPET_LAYERS_DIR}bow.png`);
  });

  it("mouth layers must carry at least one known Rhubarb shape (A–H, X)", () => {
    expect(
      validatePuppetLayers({
        layers: [makeLayer({ id: "mouth-open", role: "mouth", shapes: [] })],
      }),
    ).toEqual([]);
    expect(
      validatePuppetLayers({
        layers: [makeLayer({ id: "mouth-open", role: "mouth", shapes: ["Z"] })],
      }),
    ).toEqual([]);
    expect(
      validatePuppetLayers({
        layers: [makeLayer({ id: "mouth-open", role: "mouth", shapes: ["C", "X"] })],
      }),
    ).toHaveLength(1);
  });

  it("non-mouth layers must not claim viseme shapes", () => {
    expect(
      validatePuppetLayers({
        layers: [makeLayer({ id: "hair-front", role: "static", shapes: ["A"] })],
      }),
    ).toEqual([]);
  });

  it("keeps only the valid entries when a manifest mixes good and bad pieces", () => {
    const layers = [
      makeLayer({ id: "good-1" }),
      makeLayer({ id: "bad-no-approval", approval: "" }),
      makeLayer({ id: "good-2", role: "blink" }),
    ];
    expect(validatePuppetLayers({ layers }).map((l) => l.id)).toEqual(["good-1", "good-2"]);
  });
});

describe("loadPuppetLayers", () => {
  it("resolves master mode for the empty manifest (today's shipped state)", async () => {
    const fetchJson = vi.fn(async () => ({ layers: [] }));
    await expect(loadPuppetLayers(fetchJson)).resolves.toEqual({ mode: "master" });
    expect(fetchJson).toHaveBeenCalledWith(PUPPET_LAYERS_MANIFEST_URL);
  });

  it("resolves master mode when the manifest is missing or the fetch fails", async () => {
    await expect(loadPuppetLayers(vi.fn(async () => null))).resolves.toEqual({ mode: "master" });
    await expect(
      loadPuppetLayers(
        vi.fn(async () => {
          throw new Error("offline");
        }),
      ),
    ).resolves.toEqual({
      mode: "master",
    });
  });

  it("resolves layered mode when the manifest carries valid approved layers", async () => {
    const fetchJson = vi.fn(async () => ({
      composition: "overlay",
      width: 1086,
      height: 1448,
      compositionApproval: "test approval",
      layers: [
        makeLayer({
          id: "mouth-rest",
          role: "mouth",
          src: `${PUPPET_LAYERS_DIR}mouth-rest.png`,
          shapes: ["X"],
        }),
        makeLayer({ id: "hair-front-left", src: `${PUPPET_LAYERS_DIR}hair-front-left.png` }),
      ],
    }));
    await expect(loadPuppetLayers(fetchJson)).resolves.toEqual({
      mode: "layered",
      composition: "overlay",
      layers: [
        {
          id: "mouth-rest",
          role: "mouth",
          src: `${PUPPET_LAYERS_DIR}mouth-rest.png`,
          shapes: ["X"],
          approval: "owner side-by-side Yes — 2026-10-21 chat",
        },
        {
          id: "hair-front-left",
          role: "static",
          src: `${PUPPET_LAYERS_DIR}hair-front-left.png`,
          approval: "owner side-by-side Yes — 2026-10-21 chat",
        },
      ],
    });
  });

  it("falls back to master when every layer fails validation", async () => {
    const fetchJson = vi.fn(async () => ({ layers: [makeLayer({ approval: "" })] }));
    await expect(loadPuppetLayers(fetchJson)).resolves.toEqual({ mode: "master" });
  });
  it.each(["blink", "mouth", "static"])(
    "partial %s pack can never replace the body",
    async (role) => {
      const raw = {
        composition: "complete",
        width: 1086,
        height: 1448,
        compositionApproval: "test",
        layers: [makeLayer({ role, ...(role === "mouth" ? { shapes: ["X"] } : {}) })],
      };
      expect(await loadPuppetLayers(async () => raw)).toEqual({ mode: "master" });
    },
  );
  it("only a complete, registered, approved base can replace the master", async () => {
    const ids = [
      "hair-back",
      "legs",
      "skirt",
      "torso",
      "neck",
      "head-skin",
      "eyes-open",
      "brows",
      "hair-front-left",
      "hair-front-right",
      "bow",
    ];
    const raw = {
      composition: "complete",
      width: 1086,
      height: 1448,
      compositionApproval: "test",
      layers: [
        ...ids.map((id) => makeLayer({ id })),
        makeLayer({ id: "mouth-rest", role: "mouth", shapes: ["X"] }),
      ],
    };
    expect(await loadPuppetLayers(async () => raw)).toMatchObject({
      mode: "layered",
      composition: "complete",
    });
    raw.width = 1000;
    expect(await loadPuppetLayers(async () => raw)).toEqual({ mode: "master" });
  });
});
