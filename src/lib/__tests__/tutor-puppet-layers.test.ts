/**
 * tutor-puppet-layers tests (Milestone 5 / spec §2, §6, §17 / blocker B5).
 *
 * Verifies:
 * 1. Manifest safety gate: nothing without an approval reference or outside
 *    the layers directory can ever reach the puppet, and the empty/absent
 *    manifest always resolves to the approved-master fallback.
 * 2. Native-pixel-scale torso-up framing (zero stretching, exact registration).
 * 3. Playback-time-locked Rhubarb A–G/X lip sync driven from real `audio.currentTime`
 *    (play, pause, replay, mute, interrupt/cancel, explicitly labeled amplitude
 *    fallback, and strict reduced-motion gating).
 * 4. Independent subtle motion channels (breathing, blinking, gaze, brows,
 *    listening tilt, thinking, smiling, encouragement, nods, pointing, farewell)
 *    with zero bouncing, zero mouth-scaling, zero exaggerated gestures, and
 *    strict `prefers-reduced-motion: reduce` zeroing.
 */
import { describe, expect, it, vi } from "vitest";
import {
  CORE_VISEME_SHAPES,
  MASTER_CANVAS,
  PUPPET_CHANNEL_LIMITS,
  PUPPET_LAYERS_DIR,
  PUPPET_LAYERS_MANIFEST_URL,
  TORSO_UP_VIEWBOX,
  computePuppetChannels,
  expressionFromState,
  getPuppetViewBox,
  loadPuppetLayers,
  normalizeVisemeShape,
  resolveLipSync,
  validatePuppetLayers,
  visemeFromAmplitude,
  type TutorGazeTarget,
  type TutorPuppetExpression,
  type VisemeCue,
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
      makeLayer({
        id: "brows-lift",
        role: "brows",
        src: `${PUPPET_LAYERS_DIR}brows-lift.png`,
      }),
    ];
    const valid = validatePuppetLayers({ layers });
    expect(valid).toHaveLength(4);
    expect(valid.map((l) => l.id)).toEqual([
      "hair-back",
      "mouth-open",
      "blink-closed",
      "brows-lift",
    ]);
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

describe("native torso-up framing", () => {
  it("frames torso-up inside the 1086×1448 master canvas without exceeding bounds or stretching", () => {
    const torso = getPuppetViewBox("torso-up");
    expect(torso).toEqual(TORSO_UP_VIEWBOX);
    expect(torso.x).toBeGreaterThanOrEqual(0);
    expect(torso.y).toBe(0);
    expect(torso.x + torso.width).toBeLessThanOrEqual(MASTER_CANVAS.width);
    expect(torso.y + torso.height).toBeLessThanOrEqual(MASTER_CANVAS.height);
    // Full framing preserves exact approved master dimensions.
    expect(getPuppetViewBox("full")).toEqual({
      x: 0,
      y: 0,
      width: MASTER_CANVAS.width,
      height: MASTER_CANVAS.height,
    });
  });
});

describe("playback-time-locked Rhubarb A–G/X lip sync", () => {
  const timeline: VisemeCue[] = [
    { start: 0.0, end: 0.12, shape: "A" },
    { start: 0.12, end: 0.25, shape: "B" },
    { start: 0.25, end: 0.4, shape: "C" },
    { start: 0.4, end: 0.55, shape: "D" },
    { start: 0.55, end: 0.7, shape: "E" },
    { start: 0.7, end: 0.85, shape: "F" },
    { start: 0.85, end: 1.0, shape: "G" },
    { start: 1.0, end: 1.15, shape: "X" },
  ];

  it("locks every Rhubarb A–G and X cue strictly to real audio.currentTime", () => {
    const sampleTimes = [0.05, 0.18, 0.3, 0.48, 0.62, 0.78, 0.92, 1.08];
    const resolved = sampleTimes.map((currentTime) =>
      resolveLipSync({ currentTime, timeline, isSpeaking: true }),
    );
    expect(resolved.map((r) => r.shape)).toEqual([...CORE_VISEME_SHAPES]);
    expect(resolved.every((r) => r.source === "rhubarb-timeline" && !r.isFallback)).toBe(true);
  });

  it("resets immediately to rest (X) on pause, interrupt/cancel, or mute", () => {
    expect(
      resolveLipSync({ currentTime: 0.45, timeline, isSpeaking: true, isPaused: true }),
    ).toEqual({ shape: "X", source: "rest", cueIndex: null, isFallback: false });

    expect(
      resolveLipSync({ currentTime: 0.45, timeline, isSpeaking: false }),
    ).toEqual({ shape: "X", source: "rest", cueIndex: null, isFallback: false });

    expect(
      resolveLipSync({ currentTime: 0.45, timeline, isSpeaking: true, isMuted: true }),
    ).toEqual({ shape: "X", source: "muted", cueIndex: null, isFallback: false });
  });

  it("re-locks cleanly on replay when currentTime seeks back to 0", () => {
    const mid = resolveLipSync({ currentTime: 0.62, timeline, isSpeaking: true });
    expect(mid.shape).toBe("E");
    const replay = resolveLipSync({ currentTime: 0.02, timeline, isSpeaking: true });
    expect(replay.shape).toBe("A");
    expect(replay.cueIndex).toBe(0);
  });

  it("explicitly labels amplitude fallback when no Rhubarb timeline is available", () => {
    const res = resolveLipSync({
      currentTime: 0.3,
      timeline: [],
      isSpeaking: true,
      amplitude: 0.5,
    });
    expect(res.source).toBe("amplitude-fallback");
    expect(res.isFallback).toBe(true);
    expect(res.shape).toBe("C");

    expect(visemeFromAmplitude(0)).toBe("X");
    expect(visemeFromAmplitude(0.1)).toBe("A");
    expect(visemeFromAmplitude(0.25)).toBe("B");
    expect(visemeFromAmplitude(0.5)).toBe("C");
    expect(visemeFromAmplitude(0.85)).toBe("D");
  });

  it("locks mouth to X under prefers-reduced-motion: reduce", () => {
    expect(
      resolveLipSync({
        currentTime: 0.45,
        timeline,
        isSpeaking: true,
        reducedMotion: true,
      }),
    ).toEqual({ shape: "X", source: "reduced-motion", cueIndex: null, isFallback: false });
  });

  it("normalizes unknown shapes safely to X", () => {
    expect(normalizeVisemeShape("d")).toBe("D");
    expect(normalizeVisemeShape("invalid")).toBe("X");
    expect(normalizeVisemeShape(undefined)).toBe("X");
  });
});

describe("independent subtle motion channels & reduced-motion gating", () => {
  const allExpressions: TutorPuppetExpression[] = [
    "neutral",
    "listening",
    "thinking",
    "smiling",
    "encouraging",
    "nodding",
    "pointing",
    "farewell",
    "gentle-error",
  ];
  const allGazeTargets: TutorGazeTarget[] = [
    "center",
    "student",
    "board-left",
    "board-right",
    "down-notes",
  ];

  it("enforces zero bouncing, zero mouth-scaling, and calm bounds across all expressions", () => {
    expect(PUPPET_CHANNEL_LIMITS.mouthScale).toBe(1);
    expect(PUPPET_CHANNEL_LIMITS.maxBouncePx).toBe(0);

    for (const expression of allExpressions) {
      const pose = computePuppetChannels({
        state: "idle",
        expression,
        gazeTarget: "student",
        reducedMotion: false,
      });
      expect(Math.abs(pose.headTiltDeg)).toBeLessThanOrEqual(PUPPET_CHANNEL_LIMITS.maxTiltDeg);
      expect(Math.abs(pose.headShiftX)).toBeLessThanOrEqual(PUPPET_CHANNEL_LIMITS.maxShiftXPx);
      expect(Math.abs(pose.headShiftY)).toBeLessThanOrEqual(PUPPET_CHANNEL_LIMITS.maxShiftYPx);
      expect(pose.breathingScaleY).toBeLessThanOrEqual(PUPPET_CHANNEL_LIMITS.maxBreathingScaleY);
      expect(pose.breathingDurationSec).toBeGreaterThanOrEqual(
        PUPPET_CHANNEL_LIMITS.minBreathingDurationSec,
      );
      // Zero bouncing: nod sequences only move downward (>= 0), never upward hop (< 0).
      if (pose.nodSequenceY) {
        expect(pose.nodSequenceY.every((y) => y >= 0 && y <= PUPPET_CHANNEL_LIMITS.maxShiftYPx)).toBe(
          true,
        );
      }
    }
  });

  it("drives distinct subtle offsets for eye gaze targets", () => {
    const poses = allGazeTargets.map((gazeTarget) =>
      computePuppetChannels({ state: "idle", gazeTarget, reducedMotion: false }),
    );
    expect(poses.find((_, i) => allGazeTargets[i] === "board-left")!.gazeOffsetX).toBeLessThan(0);
    expect(poses.find((_, i) => allGazeTargets[i] === "board-right")!.gazeOffsetX).toBeGreaterThan(
      0,
    );
    expect(poses.find((_, i) => allGazeTargets[i] === "down-notes")!.gazeOffsetY).toBeGreaterThan(0);
  });

  it("strictly zeroes all motion channels when prefers-reduced-motion: reduce is active", () => {
    for (const expression of allExpressions) {
      const pose = computePuppetChannels({
        state: "cheering",
        expression,
        gazeTarget: "board-left",
        reducedMotion: true,
      });
      expect(pose.headTiltDeg).toBe(0);
      expect(pose.headShiftX).toBe(0);
      expect(pose.headShiftY).toBe(0);
      expect(pose.gazeOffsetX).toBe(0);
      expect(pose.gazeOffsetY).toBe(0);
      expect(pose.browLiftPx).toBe(0);
      expect(pose.breathingEnabled).toBe(false);
      expect(pose.breathingScaleY).toBe(1);
      expect(pose.blinkEnabled).toBe(false);
      expect(pose.nodSequenceY).toBeNull();
      expect(pose.transitionDurationSec).toBe(0);
    }
  });

  it("maps legacy gretelMachine states to calm expressions", () => {
    expect(expressionFromState("listening")).toBe("listening");
    expect(expressionFromState("help")).toBe("thinking");
    expect(expressionFromState("cheering")).toBe("encouraging");
    expect(expressionFromState("pointing")).toBe("pointing");
    expect(expressionFromState("waving")).toBe("farewell");
    expect(expressionFromState("exiting")).toBe("farewell");
    expect(expressionFromState("gentle-error")).toBe("gentle-error");
    expect(expressionFromState("idle")).toBe("neutral");
  });
});
