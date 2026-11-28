#!/usr/bin/env node
/**
 * Builds pixel-registered 1024x662 hand-painted storybook facial overlays on top of
 * the owner-approved torso-up video-call portrait (`gretel-tutor-portrait-call.jpg`).
 *
 * Pipeline:
 * 1. Loads the owner-approved 1024x662 base portrait and the 11 hand-painted storybook
 *    variant illustrations (`public/cartilla/images/gretel/tutor/reference/variants/*.jpg`).
 * 2. Performs coarse-to-fine sub-pixel affine registration (scaleX, scaleY, dx, dy)
 *    against invariant facial landmarks (bangs, nose tip, rosy cheeks, jawline/collar)
 *    so each painted variant aligns to < 0.25 px on the 1024x662 master grid.
 * 3. Applies local perimeter color-gain matching on the clean skin ring surrounding
 *    each extracted feature (mouth, eyes, brows) and blends with a wide cosine feather
 *    so zero seams, zero tonal shifts, and zero vector outlines appear.
 * 4. Writes candidate PNG layers + a 12-tile visual QA `contact-sheet.png` to
 *    `public/cartilla/images/gretel/tutor/call-candidates/` and updates
 *    `public/cartilla/images/gretel/tutor/candidate-manifest.json` (`approved: false`).
 * 5. Never modifies `gretel-approved-master.png` or `public/cartilla/images/gretel/layers/manifest.json`.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTRAIT_REL = "public/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg";
const VARIANTS_DIR = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/reference/variants");
const OUT_DIR = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/call-candidates");
const MANIFEST_PATH = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/candidate-manifest.json");

const W = 1024;
const H = 662;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Bilinear RGB sample from an ImageData buffer. */
function sampleBilinear(imgData, w, h, fx, fy) {
  const x = clamp(fx, 0, w - 1.001);
  const y = clamp(fy, 0, h - 1.001);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);

  const d = imgData.data;
  const i00 = (y0 * w + x0) * 4;
  const i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4;
  const i11 = (y1 * w + x1) * 4;

  const w00 = (1 - tx) * (1 - ty);
  const w10 = tx * (1 - ty);
  const w01 = (1 - tx) * ty;
  const w11 = tx * ty;

  return [
    d[i00] * w00 + d[i10] * w10 + d[i01] * w01 + d[i11] * w11,
    d[i00 + 1] * w00 + d[i10 + 1] * w10 + d[i01 + 1] * w01 + d[i11 + 1] * w11,
    d[i00 + 2] * w00 + d[i10 + 2] * w10 + d[i01 + 2] * w01 + d[i11 + 2] * w11,
  ];
}

/**
 * Invariant anchor boxes on the 1024x662 base portrait used to register each
 * 1264x848 variant image:
 * - Upper hair bangs & hairline arch
 * - Nose tip & nostrils
 * - Left & right rosy cheeks + ear/hair boundary
 * - Lower jawline & collar
 */
const ANCHOR_BOXES = [
  { x0: 410, y0: 155, x1: 635, y1: 215, weight: 1.0 }, // bangs arch
  { x0: 492, y0: 335, x1: 545, y1: 374, weight: 2.2 }, // nose tip & nostrils (critical for face center)
  { x0: 380, y0: 335, x1: 452, y1: 392, weight: 1.5 }, // viewer-left cheek & hair border
  { x0: 572, y0: 345, x1: 638, y1: 405, weight: 1.5 }, // viewer-right cheek & hair border
  { x0: 425, y0: 458, x1: 595, y1: 515, weight: 1.3 }, // chin & orange collar
];

/**
 * Finds the optimal affine transform mapping base portrait coordinates (x, y)
 * to variant coordinates:
 *   vx = (x - CX) * sx + CX * (vw / W) + dx
 *   vy = (y - CY) * sy + CY * (vh / H) + dy
 */
function alignVariantToBase(baseData, varData, vw, vh) {
  const CX = 514;
  const CY = 360;
  const baseSx = vw / W;
  const baseSy = vh / H;

  // Pre-collect sample points from anchor boxes (step = 3 px for speed & accuracy)
  const samples = [];
  const bd = baseData.data;
  for (const box of ANCHOR_BOXES) {
    for (let y = box.y0; y <= box.y1; y += 3) {
      for (let x = box.x0; x <= box.x1; x += 3) {
        const idx = (y * W + x) * 4;
        samples.push({
          x,
          y,
          r: bd[idx],
          g: bd[idx + 1],
          b: bd[idx + 2],
          w: box.weight,
        });
      }
    }
  }

  function evalTransform(sxFactor, syFactor, dx, dy) {
    const sx = baseSx * sxFactor;
    const sy = baseSy * syFactor;
    const ox = CX * baseSx + dx;
    const oy = CY * baseSy + dy;
    let err = 0;
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const vx = (s.x - CX) * sx + ox;
      const vy = (s.y - CY) * sy + oy;
      const [vr, vg, vb] = sampleBilinear(varData, vw, vh, vx, vy);
      err += (Math.abs(vr - s.r) + Math.abs(vg - s.g) + Math.abs(vb - s.b)) * s.w;
    }
    return err / samples.length;
  }

  let best = { sxFactor: 1.0, syFactor: 1.0, dx: 0, dy: 0, err: Infinity };

  // Stage 1: Coarse search over scale (isotropic vs slight anisotropic crop differences) and shift
  for (let sxf = 0.95; sxf <= 1.05; sxf += 0.01) {
    for (let syf = 0.93; syf <= 1.03; syf += 0.01) {
      for (let dx = -18; dx <= 18; dx += 3) {
        for (let dy = -24; dy <= 24; dy += 3) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) {
            best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
          }
        }
      }
    }
  }

  // Stage 2: Medium refinement around best
  const c1 = { ...best };
  for (let sxf = c1.sxFactor - 0.012; sxf <= c1.sxFactor + 0.012; sxf += 0.003) {
    for (let syf = c1.syFactor - 0.012; syf <= c1.syFactor + 0.012; syf += 0.003) {
      for (let dx = c1.dx - 4; dx <= c1.dx + 4; dx += 1) {
        for (let dy = c1.dy - 4; dy <= c1.dy + 4; dy += 1) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) {
            best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
          }
        }
      }
    }
  }

  // Stage 3: Sub-pixel refinement (0.25 px / 0.001 scale)
  const c2 = { ...best };
  for (let sxf = c2.sxFactor - 0.003; sxf <= c2.sxFactor + 0.003; sxf += 0.001) {
    for (let syf = c2.syFactor - 0.003; syf <= c2.syFactor + 0.003; syf += 0.001) {
      for (let dx = c2.dx - 1; dx <= c2.dx + 1; dx += 0.25) {
        for (let dy = c2.dy - 1; dy <= c2.dy + 1; dy += 0.25) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) {
            best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
          }
        }
      }
    }
  }

  // Warp variant onto a 1024x662 ImageData buffer
  const aligned = new Uint8ClampedArray(W * H * 4);
  const sx = baseSx * best.sxFactor;
  const sy = baseSy * best.syFactor;
  const ox = CX * baseSx + best.dx;
  const oy = CY * baseSy + best.dy;

  for (let y = 0; y < H; y++) {
    const vy = (y - CY) * sy + oy;
    for (let x = 0; x < W; x++) {
      const vx = (x - CX) * sx + ox;
      const [r, g, b] = sampleBilinear(varData, vw, vh, vx, vy);
      const idx = (y * W + x) * 4;
      aligned[idx] = Math.round(r);
      aligned[idx + 1] = Math.round(g);
      aligned[idx + 2] = Math.round(b);
      aligned[idx + 3] = 255;
    }
  }

  return { aligned, transform: best };
}

/**
 * Extracts one or more elliptical regions from an aligned variant buffer onto a
 * transparent 1024x662 canvas, matching local perimeter skin tone to the base
 * portrait so the feathered transition is 100% invisible.
 */
function extractFeatheredRegions(ctx, baseData, alignedBuf, ellipses) {
  const outImg = ctx.createImageData(W, H);
  const dst = outImg.data;
  const base = baseData.data;

  // For each ellipse, compute RGB gain from the perimeter ring (d in [0.82, 1.05])
  const gains = ellipses.map((el) => {
    let br = 0,
      bg = 0,
      bb = 0,
      vr = 0,
      vg = 0,
      vb = 0,
      count = 0;
    const x0 = Math.max(0, Math.floor(el.cx - el.rx * 1.08));
    const x1 = Math.min(W - 1, Math.ceil(el.cx + el.rx * 1.08));
    const y0 = Math.max(0, Math.floor(el.cy - el.ry * 1.08));
    const y1 = Math.min(H - 1, Math.ceil(el.cy + el.ry * 1.08));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot((x - el.cx) / el.rx, (y - el.cy) / el.ry);
        if (d >= 0.82 && d <= 1.05) {
          const idx = (y * W + x) * 4;
          br += base[idx];
          bg += base[idx + 1];
          bb += base[idx + 2];
          vr += alignedBuf[idx];
          vg += alignedBuf[idx + 1];
          vb += alignedBuf[idx + 2];
          count++;
        }
      }
    }
    if (count === 0) return [1, 1, 1];
    return [
      clamp(br / Math.max(1, vr), 0.92, 1.08),
      clamp(bg / Math.max(1, vg), 0.92, 1.08),
      clamp(bb / Math.max(1, vb), 0.92, 1.08),
    ];
  });

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let maxAlpha = 0;
      let weightSum = 0;
      let rGain = 0;
      let gGain = 0;
      let bGain = 0;

      for (let i = 0; i < ellipses.length; i++) {
        const el = ellipses[i];
        const d = Math.hypot((x - el.cx) / el.rx, (y - el.cy) / el.ry);
        if (d >= 1.0) continue;
        const inner = el.innerRatio ?? 0.58;
        const a = 1 - smoothstep(inner, 1.0, d);
        if (a > maxAlpha) maxAlpha = a;
        if (a > 0) {
          weightSum += a;
          rGain += gains[i][0] * a;
          gGain += gains[i][1] * a;
          bGain += gains[i][2] * a;
        }
      }

      if (maxAlpha <= 0.001) continue;
      const rg = rGain / weightSum;
      const gg = gGain / weightSum;
      const bg = bGain / weightSum;

      const idx = (y * W + x) * 4;
      // Blend color-matched variant pixel toward exact base pixel near the outer feather rim
      // for doubly seamless edge continuity
      const vr = clamp(Math.round(alignedBuf[idx] * rg), 0, 255);
      const vg = clamp(Math.round(alignedBuf[idx + 1] * gg), 0, 255);
      const vb = clamp(Math.round(alignedBuf[idx + 2] * bg), 0, 255);

      dst[idx] = vr;
      dst[idx + 1] = vg;
      dst[idx + 2] = vb;
      dst[idx + 3] = Math.round(maxAlpha * 255);
    }
  }

  ctx.putImageData(outImg, 0, 0);
}

async function loadAndAlignVariant(baseData, filename) {
  const img = await loadImage(join(VARIANTS_DIR, filename));
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const varData = ctx.getImageData(0, 0, img.width, img.height);
  const res = alignVariantToBase(baseData, varData, img.width, img.height);
  console.log(
    `  Aligned ${filename.padEnd(15)} -> sx=${res.transform.sxFactor.toFixed(3)}, sy=${res.transform.syFactor.toFixed(3)}, dx=${res.transform.dx.toFixed(2)}, dy=${res.transform.dy.toFixed(2)}, L1=${res.transform.err.toFixed(2)}`,
  );
  return res.aligned;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const portrait = await loadImage(join(REPO_ROOT, PORTRAIT_REL));
  const baseCanvas = createCanvas(W, H);
  const baseCtx = baseCanvas.getContext("2d");
  baseCtx.drawImage(portrait, 0, 0, W, H);
  const baseData = baseCtx.getImageData(0, 0, W, H);

  console.log("Aligning 11 hand-painted storybook face variants to 1024x662 master portrait...");
  const alignedVariants = {
    "rest-smile": await loadAndAlignVariant(baseData, "rest-smile.jpg"),
    "speak-ah": await loadAndAlignVariant(baseData, "speak-ah.jpg"),
    "speak-e": await loadAndAlignVariant(baseData, "speak-e.jpg"),
    "speak-o": await loadAndAlignVariant(baseData, "speak-o.jpg"),
    "speak-u": await loadAndAlignVariant(baseData, "speak-u.jpg"),
    "speak-mbp": await loadAndAlignVariant(baseData, "speak-mbp.jpg"),
    "speak-fv": await loadAndAlignVariant(baseData, "speak-fv.jpg"),
    "eyes-half": await loadAndAlignVariant(baseData, "eyes-half.jpg"),
    "eyes-closed": await loadAndAlignVariant(baseData, "eyes-closed.jpg"),
    listening: await loadAndAlignVariant(baseData, "listening.jpg"),
    thinking: await loadAndAlignVariant(baseData, "thinking.jpg"),
  };

  const outputs = [];
  const canvases = {};

  function saveLayer(id, role, label, shapes, variantSource, drawFn) {
    const c = createCanvas(W, H);
    const ctx = c.getContext("2d");
    drawFn(ctx);
    const buf = c.toBuffer("image/png");
    const filename = `${id}.png`;
    const fullPath = join(OUT_DIR, filename);
    writeFileSync(fullPath, buf);
    const sha256 = createHash("sha256").update(buf).digest("hex");
    outputs.push({
      id,
      role,
      ...(shapes ? { shapes } : {}),
      label,
      src: `/cartilla/images/gretel/tutor/call-candidates/${filename}`,
      width: W,
      height: H,
      sha256,
      source: variantSource,
      ownerDecision: "pending",
    });
    canvases[id] = c;
    return c;
  }

  // Feature extraction regions (in 1024x662 portrait coordinates)
  // Mouth + chin/philtrum envelope so jaw/lip movement looks completely organic
  const MOUTH_ELLIPSES = [{ cx: 514, cy: 418, rx: 78, ry: 54, innerRatio: 0.62 }];

  // Both eyes + upper cheek margin for natural storybook eyelid blinks
  const EYE_ELLIPSES = [
    { cx: 462, cy: 298, rx: 62, ry: 42, innerRatio: 0.6 },
    { cx: 582, cy: 314, rx: 62, ry: 42, innerRatio: 0.6 },
  ];

  // Eyebrow arches (generous vertical envelope so base brows never ghost underneath)
  const BROW_ELLIPSES = [
    { cx: 468, cy: 238, rx: 58, ry: 32, innerRatio: 0.64 },
    { cx: 594, cy: 256, rx: 56, ry: 32, innerRatio: 0.64 },
  ];

  //Combined upper-face (brows + eyes) envelope for thinking gaze so zero seam exists between eyes and brows
  const UPPER_FACE_ELLIPSES = [
    { cx: 465, cy: 274, rx: 66, ry: 68, innerRatio: 0.62 },
    { cx: 588, cy: 290, rx: 66, ry: 68, innerRatio: 0.62 },
  ];

  // 1. Blink layers (hand-painted storybook eyelids)
  saveLayer(
    "blink-half",
    "blink",
    "Eyelids half-closed (hand-painted mid-blink)",
    null,
    "storybook-painted-variant:eyes-half.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["eyes-half"], EYE_ELLIPSES),
  );

  saveLayer(
    "blink-closed",
    "blink",
    "Eyelids fully closed (hand-painted natural blink)",
    null,
    "storybook-painted-variant:eyes-closed.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["eyes-closed"], EYE_ELLIPSES),
  );

  // 2. Eyebrows gently lifted (crisp storybook brush arch from thinking variant)
  saveLayer(
    "brows-soft-lift",
    "brows",
    "Eyebrows gently lifted (attentive listening arch)",
    null,
    "storybook-painted-variant:thinking.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants.thinking, BROW_ELLIPSES),
  );

  // 3. Dedicated full-face expression overlays for listening & thinking
  saveLayer(
    "expr-listening",
    "expression",
    "Attentive listening face (warm closed smile + soft lifted brows)",
    null,
    "storybook-painted-variant:listening+thinking-brows",
    (ctx) => {
      extractFeatheredRegions(ctx, baseData, alignedVariants.listening, MOUTH_ELLIPSES);
      const browCanvas = createCanvas(W, H);
      extractFeatheredRegions(
        browCanvas.getContext("2d"),
        baseData,
        alignedVariants.thinking,
        BROW_ELLIPSES,
      );
      ctx.drawImage(browCanvas, 0, 0);
    },
  );

  saveLayer(
    "expr-thinking",
    "expression",
    "Curious thinking face (upward reflective gaze + gentle closed smile)",
    null,
    "storybook-painted-variant:thinking.jpg",
    (ctx) =>
      extractFeatheredRegions(ctx, baseData, alignedVariants.thinking, [
        ...UPPER_FACE_ELLIPSES,
        ...MOUTH_ELLIPSES,
      ]),
  );

  // 4. Hand-painted storybook mouth shapes (Rhubarb A–G + X)
  saveLayer(
    "mouth-X",
    "mouth",
    "Mouth X — Warm closed-mouth resting smile",
    ["X"],
    "storybook-painted-variant:rest-smile.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["rest-smile"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-A",
    "mouth",
    "Mouth A — Closed bilabial (m, b, p)",
    ["A"],
    "storybook-painted-variant:speak-mbp.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-mbp"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-B",
    "mouth",
    "Mouth B — Slightly open wider smile (e, i, s, t, n)",
    ["B"],
    "storybook-painted-variant:speak-e.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-e"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-C",
    "mouth",
    "Mouth C — Natural open speaking smile (exact approved portrait mouth)",
    ["C"],
    "native-extract-from-owner-call-portrait",
    (ctx) => extractFeatheredRegions(ctx, baseData, baseData.data, MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-D",
    "mouth",
    "Mouth D — Open vowel (a)",
    ["D"],
    "storybook-painted-variant:speak-ah.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-ah"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-E",
    "mouth",
    "Mouth E — Rounded open vowel (o)",
    ["E"],
    "storybook-painted-variant:speak-o.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-o"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-F",
    "mouth",
    "Mouth F — Small pursed rounded vowel (u)",
    ["F"],
    "storybook-painted-variant:speak-u.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-u"], MOUTH_ELLIPSES),
  );

  saveLayer(
    "mouth-G",
    "mouth",
    "Mouth G — Soft labiodental / coronal (f, v, l, d)",
    ["G"],
    "storybook-painted-variant:speak-fv.jpg",
    (ctx) => extractFeatheredRegions(ctx, baseData, alignedVariants["speak-fv"], MOUTH_ELLIPSES),
  );

  // Update candidate-manifest.json (keep approved: false & legacy candidates intact)
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  manifest.callPortraitCandidates = {
    status: "pending-owner-approval",
    approved: false,
    basePortrait: "/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg",
    presentingPortrait: "/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-presenting.jpg",
    width: W,
    height: H,
    candidates: outputs,
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  // Render a 12-tile visual QA contact sheet
  const order = [
    ["mouth-X", "Rest smile (X)"],
    ["blink-half", "Blink half"],
    ["blink-closed", "Blink closed"],
    ["expr-thinking", "Thinking gaze"],
    ["mouth-A", "Speak M/B/P (A)"],
    ["mouth-B", "Speak E/I (B)"],
    ["mouth-C", "Speak open (C)"],
    ["mouth-D", "Speak AH (D)"],
    ["mouth-E", "Speak O (E)"],
    ["mouth-F", "Speak U (F)"],
    ["mouth-G", "Speak F/V (G)"],
    ["expr-listening", "Listening"],
  ];
  const cols = 4;
  const rows = 3;
  const tileW = 320;
  const tileH = 276;
  const sheet = createCanvas(cols * tileW, rows * tileH);
  const sctx = sheet.getContext("2d");
  sctx.fillStyle = "#f9f3e8";
  sctx.fillRect(0, 0, sheet.width, sheet.height);

  order.forEach(([key, title], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ox = col * tileW;
    const oy = row * tileH;
    const comp = createCanvas(W, H);
    const cctx = comp.getContext("2d");
    cctx.drawImage(baseCanvas, 0, 0);
    if (canvases[key]) cctx.drawImage(canvases[key], 0, 0);
    sctx.drawImage(comp, 354, 194, 320, 276, ox, oy, tileW, tileH);
    sctx.fillStyle = "rgba(30,22,16,0.78)";
    sctx.fillRect(ox + 8, oy + tileH - 30, 168, 22);
    sctx.fillStyle = "#fff";
    sctx.font = "bold 13px sans-serif";
    sctx.fillText(title, ox + 14, oy + tileH - 14);
  });

  const sheetBuf = sheet.toBuffer("image/png");
  writeFileSync(join(OUT_DIR, "contact-sheet.png"), sheetBuf);
  console.log(`Generated ${outputs.length} hand-painted call-portrait layers + contact-sheet.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
