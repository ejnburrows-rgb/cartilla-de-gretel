#!/usr/bin/env node
/**
 * Builds the decomposed anatomical rig assets (1024x662 portrait grid) for
 * the Gretel Tutor Chalkboard Stage from the owner-approved video-call
 * portrait (`gretel-tutor-portrait-call.jpg`) and aligned hand-painted
 * storybook variants (`reference/variants/*.jpg`).
 *
 * Outputs (in `public/cartilla/images/gretel/tutor/chalkboard-candidates/`):
 * - gretel-face-base.png   : Organic silhouette cutout (zero beige halo),
 *                            clean inpainted sclera behind movable irises,
 *                            and clean forehead skin under movable eyebrows.
 * - iris-left.png          : Left painted cobalt iris + pupil + catchlight
 * - iris-right.png         : Right painted cobalt iris + pupil + catchlight
 * - eyelashes-frame.png    : Upper/lower lashes & lid rim layered OVER irises
 * - lid-25.png .. lid-100  : 5-stage independent painted eyelid blink pack
 * - brow-left.png          : Left painted eyebrow (movable independently)
 * - brow-right.png         : Right painted eyebrow (movable independently)
 * - hair-curl-left.png     : Left lower hair curls for delayed secondary sway
 * - hair-curl-right.png    : Right lower hair curls for delayed secondary sway
 * - mouth-X, mouth-A..G    : Color-normalized Rhubarb phonetic mouth pack
 * - rig-manifest.json      : Exact coordinates, <clipPath> sockets, `approved: false`
 * - chalkboard-qa-sheet.png: 6-tile diagnostic visual check over deep-green slate
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTRAIT_REL = "public/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg";
const VARIANTS_DIR = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/reference/variants");
const OUT_DIR = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/chalkboard-candidates");

const W = 1024;
const H = 662;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Bilinear RGB sample from ImageData. */
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

const ANCHOR_BOXES = [
  { x0: 410, y0: 155, x1: 635, y1: 215, weight: 1.0 },
  { x0: 492, y0: 335, x1: 545, y1: 374, weight: 2.2 },
  { x0: 380, y0: 335, x1: 452, y1: 392, weight: 1.5 },
  { x0: 572, y0: 345, x1: 638, y1: 405, weight: 1.5 },
  { x0: 425, y0: 458, x1: 595, y1: 515, weight: 1.3 },
];

function alignVariantToBase(baseData, varData, vw, vh) {
  const CX = 514;
  const CY = 360;
  const baseSx = vw / W;
  const baseSy = vh / H;

  const samples = [];
  const bd = baseData.data;
  for (const box of ANCHOR_BOXES) {
    for (let y = box.y0; y <= box.y1; y += 3) {
      for (let x = box.x0; x <= box.x1; x += 3) {
        const idx = (y * W + x) * 4;
        samples.push({ x, y, r: bd[idx], g: bd[idx + 1], b: bd[idx + 2], w: box.weight });
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

  for (let sxf = 0.96; sxf <= 1.04; sxf += 0.01) {
    for (let syf = 0.94; syf <= 1.02; syf += 0.01) {
      for (let dx = -16; dx <= 16; dx += 3) {
        for (let dy = -20; dy <= 20; dy += 3) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
        }
      }
    }
  }

  const c1 = { ...best };
  for (let sxf = c1.sxFactor - 0.012; sxf <= c1.sxFactor + 0.012; sxf += 0.003) {
    for (let syf = c1.syFactor - 0.012; syf <= c1.syFactor + 0.012; syf += 0.003) {
      for (let dx = c1.dx - 4; dx <= c1.dx + 4; dx += 1) {
        for (let dy = c1.dy - 4; dy <= c1.dy + 4; dy += 1) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
        }
      }
    }
  }

  const c2 = { ...best };
  for (let sxf = c2.sxFactor - 0.003; sxf <= c2.sxFactor + 0.003; sxf += 0.001) {
    for (let syf = c2.syFactor - 0.003; syf <= c2.syFactor + 0.003; syf += 0.001) {
      for (let dx = c2.dx - 1; dx <= c2.dx + 1; dx += 0.25) {
        for (let dy = c2.dy - 1; dy <= c2.dy + 1; dy += 0.25) {
          const err = evalTransform(sxf, syf, dx, dy);
          if (err < best.err) best = { sxFactor: sxf, syFactor: syf, dx, dy, err };
        }
      }
    }
  }

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
  return aligned;
}

async function loadAndAlignVariant(baseData, filename) {
  const img = await loadImage(join(VARIANTS_DIR, filename));
  const c = createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const varData = ctx.getImageData(0, 0, img.width, img.height);
  return alignVariantToBase(baseData, varData, img.width, img.height);
}

/**
 * Computes an organic alpha matte (0..1 per pixel) separating Gretel from
 * the background room/window/plant/wall without geometric shapes, plus
 * decontaminates semi-transparent hair/bow boundary pixels against beige.
 */
function buildSilhouetteMatte(baseData) {
  const d = baseData.data;
  const isBg = new Uint8Array(W * H);

  function isWallBackgroundPixel(r, g, b) {
    // Cream/beige bedroom wall around bow and upper hair (smooth neutral light tone)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    return lum > 195 && sat < 52 && r > b;
  }

  function isGretelBarrier(x, y) {
    // Hard interior protection: strictly inside face, neck, and lower torso ONLY
    // Never protect sky/wall space above crown/hair or beside bow loops!
    if (x >= 385 && x <= 625 && y >= 215 && y <= 661) return true;
    if (x >= 295 && x <= 675 && y >= 540 && y <= 661) return true;

    const i = (y * W + x) * 4;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);

    // Exclude blurred picture frame & right-side wall completely
    if (x >= 746 && y <= 340) return false;
    // Left window frame, potted plant, and window sill (x < 215):
    // Window sill sits at x < 192, y = 435..518 with muted tan-peach wall/wood pixels.
    if (x < 130 && y < 605) return false;
    if (x < 176 && y < 440) return false;
    if (x < 195 && y >= 430 && y <= 515) {
      // Only stop on unmistakably vivid golden-yellow hair (g > 165 & r - b >= 115) or crisp dark outline
      const isVividGold = g > 165 && r - b >= 115 && r > g + 8;
      if (!isVividGold) return false;
    }

    if (isWallBackgroundPixel(r, g, b)) return false;

    // Dark brown / warm sienna painted storybook ink contour
    if (lum < 178 && r >= b - 10) return true;

    // Bow red pixels
    if (r - g > 50 && r - b > 65) return true;

    // Golden blonde hair pixels (warm yellow-orange saturation)
    if (sat > 55 && r - b > 62 && g - b > 42 && r > g + 4) return true;

    // Orange striped shirt / overalls (lower torso region)
    if (y > 470 && x >= 190 && x <= 748 && (r - b > 60 || b - r > 18)) return true;

    return false;
  }

  // Seed flood-fill along outer frame + guaranteed background wall pockets
  const queue = new Int32Array(W * H);
  let head = 0;
  let tail = 0;
  function trySeed(x, y) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const p = y * W + x;
    if (isBg[p]) return;
    if (isGretelBarrier(x, y)) return;
    isBg[p] = 1;
    queue[tail++] = p;
  }

  for (let x = 0; x < W; x++) trySeed(x, 0);
  for (let y = 0; y < H; y++) {
    trySeed(0, y);
    trySeed(W - 1, y);
  }
  for (let x = 0; x < 165; x++) trySeed(x, H - 1);
  for (let x = 745; x < W; x++) trySeed(x, H - 1);
  // Seed inner background pockets (between left curl hook & sleeve, and between right bow & right hair)
  for (let y = 595; y <= 632; y++) {
    for (let x = 186; x <= 214; x++) trySeed(x, y);
  }
  for (let y = 40; y <= 145; y++) {
    for (let x = 560; x <= 665; x++) trySeed(x, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % W;
    const y = (p - x) / W;
    if (x > 0) trySeed(x - 1, y);
    if (x + 1 < W) trySeed(x + 1, y);
    if (y > 0) trySeed(x, y - 1);
    if (y + 1 < H) trySeed(x, y + 1);
  }

  // Keep ONLY the single largest connected foreground component (eliminates floating dust/leaf specks!)
  const fgLabel = new Int32Array(W * H);
  const compQueue = new Int32Array(W * H);
  const seedX = 512;
  const seedY = 400;
  let ch = 0;
  let ct = 0;
  const startP = seedY * W + seedX;
  if (!isBg[startP]) {
    fgLabel[startP] = 1;
    compQueue[ct++] = startP;
  }
  while (ch < ct) {
    const p = compQueue[ch++];
    const x = p % W;
    const y = (p - x) / W;
    if (x > 0 && !isBg[p - 1] && !fgLabel[p - 1]) {
      fgLabel[p - 1] = 1;
      compQueue[ct++] = p - 1;
    }
    if (x + 1 < W && !isBg[p + 1] && !fgLabel[p + 1]) {
      fgLabel[p + 1] = 1;
      compQueue[ct++] = p + 1;
    }
    if (y > 0 && !isBg[p - W] && !fgLabel[p - W]) {
      fgLabel[p - W] = 1;
      compQueue[ct++] = p - W;
    }
    if (y + 1 < H && !isBg[p + W] && !fgLabel[p + W]) {
      fgLabel[p + W] = 1;
      compQueue[ct++] = p + W;
    }
  }
  for (let p = 0; p < W * H; p++) {
    if (!fgLabel[p]) isBg[p] = 1;
  }

  // Smooth anti-aliased alpha ramp along edge
  const alpha = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (isBg[p]) {
        alpha[p] = 0;
        continue;
      }
      let minBgDist = 4.0;
      for (let dy = -3; dy <= 3; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= H) continue;
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= W) continue;
          if (isBg[ny * W + nx]) {
            const dist = Math.hypot(dx, dy);
            if (dist < minBgDist) minBgDist = dist;
          }
        }
      }
      alpha[p] = minBgDist >= 3.2 ? 1.0 : smoothstep(0.75, 2.4, minBgDist);
    }
  }
  return alpha;
}

/** Smoothly inpaint an ellipse using horizontal/vertical chord skin sampling. */
function inpaintEllipseToImageData(imgData, cx, cy, rx, ry, samplePad = 5) {
  const d = imgData.data;
  const copy = new Uint8ClampedArray(d);

  function sampleAvg(sx, sy) {
    let r = 0,
      g = 0,
      b = 0,
      n = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const px = clamp(Math.round(sx + dx), 0, W - 1);
        const py = clamp(Math.round(sy + dy), 0, H - 1);
        const idx = (py * W + px) * 4;
        r += copy[idx];
        g += copy[idx + 1];
        b += copy[idx + 2];
        n++;
      }
    }
    return [r / n, g / n, b / n];
  }

  const x0 = Math.max(0, Math.floor(cx - rx - 1));
  const x1 = Math.min(W - 1, Math.ceil(cx + rx + 1));
  const y0 = Math.max(0, Math.floor(cy - ry - 1));
  const y1 = Math.min(H - 1, Math.ceil(cy + ry + 1));

  for (let y = y0; y <= y1; y++) {
    const ny = (y - cy) / ry;
    const ny2 = ny * ny;
    for (let x = x0; x <= x1; x++) {
      const nx = (x - cx) / rx;
      const dist = Math.hypot(nx, ny);
      if (dist >= 1.0) continue;

      const chordX = Math.sqrt(Math.max(0.001, 1 - Math.min(0.99, ny2))) * rx;
      const chordY = Math.sqrt(Math.max(0.001, 1 - Math.min(0.99, nx * nx))) * ry;
      const tx = clamp((x - (cx - chordX)) / (2 * chordX), 0, 1);
      const ty = clamp((y - (cy - chordY)) / (2 * chordY), 0, 1);

      const leftC = sampleAvg(cx - chordX - samplePad, y);
      const rightC = sampleAvg(cx + chordX + samplePad, y);
      const topC = sampleAvg(x, cy - chordY - samplePad);
      const botC = sampleAvg(x, cy + chordY + samplePad);

      const r = (leftC[0] * (1 - tx) + rightC[0] * tx) * 0.8 + (topC[0] * (1 - ty) + botC[0] * ty) * 0.2;
      const g = (leftC[1] * (1 - tx) + rightC[1] * tx) * 0.8 + (topC[1] * (1 - ty) + botC[1] * ty) * 0.2;
      const b = (leftC[2] * (1 - tx) + rightC[2] * tx) * 0.8 + (topC[2] * (1 - ty) + botC[2] * ty) * 0.2;

      const blend = 1 - smoothstep(0.65, 1.0, dist);
      const idx = (y * W + x) * 4;
      d[idx] = Math.round(copy[idx] * (1 - blend) + r * blend);
      d[idx + 1] = Math.round(copy[idx + 1] * (1 - blend) + g * blend);
      d[idx + 2] = Math.round(copy[idx + 2] * (1 - blend) + b * blend);
    }
  }
}

/**
 * Reconstruct clean warm-ivory painted sclera inside each eye aperture ONLY,
 * leaving upper/lower dark eyelashes and skin rim completely intact!
 */
function paintCleanScleraIntoSocket(imgData, eye) {
  const d = imgData.data;
  const copy = new Uint8ClampedArray(d);
  // Paint clean sclera wherever pixel is iris-blue or dark pupil or catchlight inside eye interior,
  // while leaving dark brown/warm lash borders and skin untouched.
  for (let y = eye.y0; y <= eye.y1; y++) {
    for (let x = eye.x0; x <= eye.x1; x++) {
      const nx = (x - eye.cx) / eye.rx;
      const ny = (y - eye.cy) / eye.ry;
      if (nx * nx + ny * ny > 1.0) continue;

      const i = (y * W + x) * 4;
      const r = copy[i];
      const g = copy[i + 1];
      const b = copy[i + 2];

      // Is pixel part of upper/lower lash contour or outer skin? Keep outer skin / brown lashes!
      const isBrownSkinOrLash = r > b + 22 && r < 240;
      const isOuterSkin = r > 220 && g > 175 && b < 195 && r - b > 35;
      const isDarkUpperLash = y < eye.lashCutoffY + (x - eye.cx) * eye.lashSlope && r < 110 && g < 100 && b < 100;
      if (isOuterSkin || isDarkUpperLash) continue;
      if (isBrownSkinOrLash && Math.abs(nx) > 0.86) continue;

      // Subtle upper-eyelid cast shadow on top 30% of sclera, bright warm ivory below
      const shadowT = clamp((y - (eye.cy - eye.ry * 0.75)) / (eye.ry * 0.85), 0, 1);
      const sr = Math.round(218 + 34 * shadowT);
      const sg = Math.round(212 + 35 * shadowT);
      const sb = Math.round(206 + 34 * shadowT);

      // Blend smoothly if near edge of dark lash
      d[i] = sr;
      d[i + 1] = sg;
      d[i + 2] = sb;
    }
  }
}

/** Extract clean iris + pupil + specular catchlight onto a transparent 1024x662 canvas. */
function extractIrisLayer(ctx, baseData, eye) {
  const out = ctx.createImageData(W, H);
  const dst = out.data;
  const src = baseData.data;

  for (let y = eye.y0 - 4; y <= eye.y1 + 4; y++) {
    for (let x = eye.x0 - 4; x <= eye.x1 + 4; x++) {
      const dist = Math.hypot((x - eye.irisCx) / eye.irisRx, (y - eye.irisCy) / eye.irisRy);
      if (dist > 1.04) continue;
      const i = (y * W + x) * 4;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      // Only include iris blue, pupil dark core, and white catchlights inside iris circle
      // Exclude pinkish skin at corners or white sclera outside the iris radius
      const isIrisOrPupil = b >= r - 8 || (r < 95 && g < 95 && b < 105) || (r > 230 && g > 230 && b > 230 && dist < 0.72);
      if (!isIrisOrPupil && dist > 0.82) continue;

      const edgeAlpha = 1 - smoothstep(0.86, 1.02, dist);
      dst[i] = r;
      dst[i + 1] = g;
      dst[i + 2] = b;
      dst[i + 3] = Math.round(edgeAlpha * 255);
    }
  }
  ctx.putImageData(out, 0, 0);
}

/** Extract upper/lower eyelashes frame (transparent over sclera & skin) to sit ABOVE irises. */
function extractEyelashesFrame(ctx, baseData, eyeSockets) {
  const out = ctx.createImageData(W, H);
  const dst = out.data;
  const src = baseData.data;

  for (const eye of eyeSockets) {
    for (let y = eye.y0 - 14; y <= eye.y1 + 8; y++) {
      for (let x = eye.x0 - 14; x <= eye.x1 + 14; x++) {
        const i = (y * W + x) * 4;
        const r = src[i];
        const g = src[i + 1];
        const b = src[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Dark brown lash line & corner lid contour ONLY (skip pupil at iris center!)
        const irisDist = Math.hypot((x - eye.irisCx) / (eye.irisRx * 0.75), (y - eye.irisCy) / (eye.irisRy * 0.75));
        if (irisDist < 0.85 && y > eye.lashCutoffY + (x - eye.cx) * eye.lashSlope) continue;
        if (lum < 128 && r >= b - 10) {
          const a = 1 - smoothstep(82, 128, lum);
          dst[i] = r;
          dst[i + 1] = g;
          dst[i + 2] = b;
          dst[i + 3] = Math.round(a * 255);
        }
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}

/** Extract independent eyebrow layer (dark painted brow over clean alpha). */
function extractBrowLayer(ctx, baseData, box) {
  const out = ctx.createImageData(W, H);
  const dst = out.data;
  const src = baseData.data;

  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const i = (y * W + x) * 4;
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      // Exclude golden bangs hair (high saturation warm yellow) above eyebrow
      if (g > 140 && r - b > 85) continue;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 175) {
        const edgeX = Math.min((x - box.x0) / 4, (box.x1 - x) / 4, 1);
        const edgeY = Math.min((y - box.y0) / 4, (box.y1 - y) / 4, 1);
        const a = (1 - smoothstep(115, 175, lum)) * clamp(Math.min(edgeX, edgeY), 0, 1);
        dst[i] = r;
        dst[i + 1] = g;
        dst[i + 2] = b;
        dst[i + 3] = Math.round(a * 255);
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}

/** Extract feathered region(s) from aligned variant with strict perimeter RGB matching. */
function extractFeatheredRegions(ctx, baseData, alignedBuf, ellipses) {
  const outImg = ctx.createImageData(W, H);
  const dst = outImg.data;
  const base = baseData.data;

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
      let rg = 0,
        gg = 0,
        bg = 0;
      for (let i = 0; i < ellipses.length; i++) {
        const el = ellipses[i];
        const d = Math.hypot((x - el.cx) / el.rx, (y - el.cy) / el.ry);
        if (d >= 1.0) continue;
        const a = 1 - smoothstep(el.innerRatio ?? 0.6, 1.0, d);
        if (a > maxAlpha) maxAlpha = a;
        if (a > 0) {
          weightSum += a;
          rg += gains[i][0] * a;
          gg += gains[i][1] * a;
          bg += gains[i][2] * a;
        }
      }
      if (maxAlpha <= 0.001) continue;
      const idx = (y * W + x) * 4;
      dst[idx] = clamp(Math.round(alignedBuf[idx] * (rg / weightSum)), 0, 255);
      dst[idx + 1] = clamp(Math.round(alignedBuf[idx + 1] * (gg / weightSum)), 0, 255);
      dst[idx + 2] = clamp(Math.round(alignedBuf[idx + 2] * (bg / weightSum)), 0, 255);
      dst[idx + 3] = Math.round(maxAlpha * 255);
    }
  }
  ctx.putImageData(outImg, 0, 0);
}

/** Extract feathered hair-curl strip from cutout silhouette for delayed secondary sway. */
function extractHairCurlLayer(ctx, faceCutoutData, box, pivotX, pivotY) {
  const out = ctx.createImageData(W, H);
  const dst = out.data;
  const src = faceCutoutData.data;

  for (let y = box.y0; y <= box.y1; y++) {
    const topFade = smoothstep(box.y0, box.y0 + 36, y);
    for (let x = box.x0; x <= box.x1; x++) {
      const innerFade =
        box.side === "left"
          ? 1 - smoothstep(box.x1 - 36, box.x1, x)
          : smoothstep(box.x0, box.x0 + 36, x);
      const mask = topFade * innerFade;
      if (mask <= 0.002) continue;

      const idx = (y * W + x) * 4;
      const a = (src[idx + 3] / 255) * mask;
      if (a <= 0.002) continue;
      dst[idx] = src[idx];
      dst[idx + 1] = src[idx + 1];
      dst[idx + 2] = src[idx + 2];
      dst[idx + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(out, 0, 0);
  return { pivotX, pivotY };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const portrait = await loadImage(join(REPO_ROOT, PORTRAIT_REL));
  const baseCanvas = createCanvas(W, H);
  const baseCtx = baseCanvas.getContext("2d");
  baseCtx.drawImage(portrait, 0, 0, W, H);
  const baseData = baseCtx.getImageData(0, 0, W, H);

  console.log("1. Extracting organic silhouette alpha matte (zero beige halo)...");
  const silhouetteAlpha = buildSilhouetteMatte(baseData);

  // Build consistent gretel-face-base with clean sclera & forehead skin underpaint
  const faceCanvas = createCanvas(W, H);
  const faceCtx = faceCanvas.getContext("2d");
  faceCtx.drawImage(portrait, 0, 0, W, H);
  const faceData = faceCtx.getImageData(0, 0, W, H);

  const eyeSockets = [
    {
      name: "left",
      cx: 465,
      cy: 300,
      rx: 26,
      ry: 16,
      x0: 440,
      x1: 492,
      y0: 282,
      y1: 316,
      irisCx: 468,
      irisCy: 300,
      irisRx: 17,
      irisRy: 14,
      lashCutoffY: 291,
      lashSlope: 0.14,
    },
    {
      name: "right",
      cx: 580,
      cy: 315,
      rx: 27,
      ry: 16,
      x0: 554,
      x1: 606,
      y0: 297,
      y1: 332,
      irisCx: 580,
      irisCy: 315,
      irisRx: 17,
      irisRy: 14,
      lashCutoffY: 306,
      lashSlope: -0.05,
    },
  ];

  // Clean sclera inside sockets on faceData
  for (const eye of eyeSockets) {
    paintCleanScleraIntoSocket(faceData, eye);
  }

  // Clean forehead skin under both eyebrows on faceData
  inpaintEllipseToImageData(faceData, 474, 232, 30, 13, 4);
  inpaintEllipseToImageData(faceData, 600, 250, 29, 14, 4);

  // Apply organic cutout alpha & background color decontamination
  const fd = faceData.data;
  const bd = baseData.data;
  for (let p = 0; p < W * H; p++) {
    const a = silhouetteAlpha[p];
    const i = p * 4;
    if (a <= 0.002) {
      fd[i + 3] = 0;
    } else if (a < 0.995) {
      // Decontaminate subtle warm wall spill on outer hair edge
      const bgR = 236;
      const bgG = 216;
      const bgB = 198;
      fd[i] = clamp(Math.round((fd[i] - (1 - a) * bgR * 0.45) / (0.55 + 0.45 * a)), 0, 255);
      fd[i + 1] = clamp(Math.round((fd[i + 1] - (1 - a) * bgG * 0.45) / (0.55 + 0.45 * a)), 0, 255);
      fd[i + 2] = clamp(Math.round((fd[i + 2] - (1 - a) * bgB * 0.45) / (0.55 + 0.45 * a)), 0, 255);
      fd[i + 3] = Math.round(a * 255);
    } else {
      fd[i + 3] = 255;
    }
  }
  faceCtx.putImageData(faceData, 0, 0);

  // Keep opaque full cutout too (useful backup / comparison)
  const bodyCanvas = createCanvas(W, H);
  const bodyCtx = bodyCanvas.getContext("2d");
  const bodyData = bodyCtx.createImageData(W, H);
  for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    bodyData.data[i] = bd[i];
    bodyData.data[i + 1] = bd[i + 1];
    bodyData.data[i + 2] = bd[i + 2];
    bodyData.data[i + 3] = fd[i + 3];
  }
  bodyCtx.putImageData(bodyData, 0, 0);

  console.log("2. Aligning 11 hand-painted storybook variants...");
  const aligned = {
    "rest-smile": await loadAndAlignVariant(baseData, "rest-smile.jpg"),
    "speak-ah": await loadAndAlignVariant(baseData, "speak-ah.jpg"),
    "speak-e": await loadAndAlignVariant(baseData, "speak-e.jpg"),
    "speak-o": await loadAndAlignVariant(baseData, "speak-o.jpg"),
    "speak-u": await loadAndAlignVariant(baseData, "speak-u.jpg"),
    "speak-mbp": await loadAndAlignVariant(baseData, "speak-mbp.jpg"),
    "speak-fv": await loadAndAlignVariant(baseData, "speak-fv.jpg"),
    "eyes-half": await loadAndAlignVariant(baseData, "eyes-half.jpg"),
    "eyes-closed": await loadAndAlignVariant(baseData, "eyes-closed.jpg"),
  };

  const parts = {};
  const manifestAssets = [];

  function savePng(id, role, description, drawFn, extra = {}) {
    const c = createCanvas(W, H);
    const ctx = c.getContext("2d");
    drawFn(ctx);
    const buf = c.toBuffer("image/png");
    const filename = `${id}.png`;
    writeFileSync(join(OUT_DIR, filename), buf);
    const sha256 = createHash("sha256").update(buf).digest("hex");
    parts[id] = c;
    manifestAssets.push({
      id,
      role,
      description,
      src: `/cartilla/images/gretel/tutor/chalkboard-candidates/${filename}`,
      width: W,
      height: H,
      sha256,
      ownerDecision: "pending",
      ...extra,
    });
    return c;
  }

  // Save base face cutout (sclera + clean forehead)
  savePng(
    "gretel-face-base",
    "base",
    "Consistent organic cutout with clean sclera & forehead skin underpaint",
    (ctx) => ctx.drawImage(faceCanvas, 0, 0),
  );

  // Save movable irises + eyelashes frame
  savePng("iris-left", "iris-left", "Left painted cobalt iris + catchlight", (ctx) =>
    extractIrisLayer(ctx, baseData, eyeSockets[0]),
  );
  savePng("iris-right", "iris-right", "Right painted cobalt iris + catchlight", (ctx) =>
    extractIrisLayer(ctx, baseData, eyeSockets[1]),
  );
  savePng("eyelashes-frame", "eyelashes", "Crisp upper/lower eyelashes drawn above moving irises", (ctx) =>
    extractEyelashesFrame(ctx, baseData, eyeSockets),
  );

  // Save independent left & right painted eyebrows
  savePng("brow-left", "brow-left", "Independent left painted eyebrow", (ctx) =>
    extractBrowLayer(ctx, baseData, { x0: 444, x1: 505, y0: 218, y1: 245 }),
  );
  savePng("brow-right", "brow-right", "Independent right painted eyebrow", (ctx) =>
    extractBrowLayer(ctx, baseData, { x0: 570, x1: 632, y0: 228, y1: 266 }),
  );

  // Save hair curl layers for delayed secondary sway
  savePng(
    "hair-curl-left",
    "hair-curl",
    "Left hanging golden curls (secondary sway)",
    (ctx) => extractHairCurlLayer(ctx, faceData, { x0: 120, x1: 315, y0: 360, y1: H - 1, side: "left" }, 260, 390),
    { pivot: { x: 260, y: 390 } },
  );
  savePng(
    "hair-curl-right",
    "hair-curl",
    "Right hanging golden curls (secondary sway)",
    (ctx) => extractHairCurlLayer(ctx, faceData, { x0: 615, x1: 775, y0: 380, y1: H - 1, side: "right" }, 650, 410),
    { pivot: { x: 650, y: 410 } },
  );

  // Save 5-stage eyelid pack (25%, 50%, 75%, 100%) strictly scoped to eye aperture ellipses
  const LID_ELLIPSES = [
    { cx: 465, cy: 298, rx: 56, ry: 36, innerRatio: 0.6 },
    { cx: 581, cy: 314, rx: 56, ry: 36, innerRatio: 0.6 },
  ];

  const lid50Canvas = savePng(
    "lid-50",
    "lid",
    "50% eyelid closure (aligned hand-painted eyes-half)",
    (ctx) => extractFeatheredRegions(ctx, baseData, aligned["eyes-half"], LID_ELLIPSES),
    { stage: 50 },
  );
  const lid100Canvas = savePng(
    "lid-100",
    "lid",
    "100% eyelid closure (aligned hand-painted eyes-closed)",
    (ctx) => extractFeatheredRegions(ctx, baseData, aligned["eyes-closed"], LID_ELLIPSES),
    { stage: 100 },
  );

  // Intermediate lid-25 (upper half of lid-50) & lid-75 (smooth blend of lid-50 + lid-100)
  savePng(
    "lid-25",
    "lid",
    "25% eyelid lowering (smooth blink onset)",
    (ctx) => {
      ctx.globalAlpha = 0.52;
      ctx.drawImage(lid50Canvas, 0, -4);
      ctx.globalAlpha = 1;
    },
    { stage: 25 },
  );
  savePng(
    "lid-75",
    "lid",
    "75% eyelid closing (near-complete blink transition)",
    (ctx) => {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(lid50Canvas, 0, 2);
      ctx.globalAlpha = 0.72;
      ctx.drawImage(lid100Canvas, 0, 0);
      ctx.globalAlpha = 1;
    },
    { stage: 75 },
  );

  // Save Rhubarb A-G + X mouth shapes color-matched cleanly to face-base
  const MOUTH_ELLIPSES = [{ cx: 514, cy: 417, rx: 74, ry: 50, innerRatio: 0.62 }];
  const mouthSpecs = [
    ["mouth-X", ["X"], "Warm resting closed smile", aligned["rest-smile"]],
    ["mouth-A", ["A"], "Closed bilabial (m, b, p)", aligned["speak-mbp"]],
    ["mouth-B", ["B"], "Slightly open wider smile (e, i, s, t, n)", aligned["speak-e"]],
    ["mouth-C", ["C"], "Native open speaking smile (exact approved pixels)", baseData.data],
    ["mouth-D", ["D"], "Open wide vowel (a)", aligned["speak-ah"]],
    ["mouth-E", ["E"], "Rounded open vowel (o)", aligned["speak-o"]],
    ["mouth-F", ["F"], "Small pursed rounded vowel (u)", aligned["speak-u"]],
    ["mouth-G", ["G"], "Soft labiodental / coronal (f, v, l, d)", aligned["speak-fv"]],
  ];
  for (const [id, shapes, desc, buf] of mouthSpecs) {
    savePng(id, "mouth", desc, (ctx) => extractFeatheredRegions(ctx, baseData, buf, MOUTH_ELLIPSES), {
      shapes,
    });
  }

  // Exact SVG eye-socket clipPaths (fitted smoothly around sclera inside eyelash aperture)
  const eyeSocketClips = {
    left: "M 442 300 Q 464 282 489 299 Q 467 315 442 300 Z",
    right: "M 555 316 Q 579 298 604 314 Q 581 330 555 316 Z",
  };

  const manifest = {
    version: 1,
    status: "pending-owner-approval",
    approved: false,
    sourcePortrait: {
      src: "/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg",
      width: W,
      height: H,
    },
    eyeSocketClips,
    parts: manifestAssets,
  };
  writeFileSync(join(OUT_DIR, "rig-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  // Build 6-tile QA diagnostic contact sheet composited directly on classic deep-green chalkboard (#1b3629)
  const qaSpecs = [
    { title: "Cutout on Green Slate", dxIris: 0, dyIris: 0, dyBrow: 0, lid: null, mouth: "mouth-X" },
    { title: "Gaze Left + Speak AH", dxIris: -4.2, dyIris: -1.0, dyBrow: -2.2, lid: null, mouth: "mouth-D" },
    { title: "Gaze Up (Thinking)", dxIris: -2.5, dyIris: -2.6, dyBrow: -2.8, lid: null, mouth: "mouth-X" },
    { title: "Lid 50% Mid-Blink", dxIris: 0, dyIris: 0, dyBrow: 0, lid: "lid-50", mouth: "mouth-B" },
    { title: "Lid 100% Closed Blink", dxIris: 0, dyIris: 0, dyBrow: 0, lid: "lid-100", mouth: "mouth-X" },
    { title: "Speak O + Lifted Brows", dxIris: 2.0, dyIris: 0, dyBrow: -3.0, lid: null, mouth: "mouth-E" },
  ];

  const cols = 3;
  const rows = 2;
  const tw = 420;
  const th = 310;
  const sheet = createCanvas(cols * tw, rows * th);
  const sctx = sheet.getContext("2d");

  qaSpecs.forEach((spec, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const ox = col * tw;
    const oy = row * th;

    // Deep green chalkboard fill in tile
    const grad = sctx.createRadialGradient(ox + tw * 0.5, oy + th * 0.45, 20, ox + tw * 0.5, oy + th * 0.45, tw * 0.7);
    grad.addColorStop(0, "#214232");
    grad.addColorStop(1, "#14291f");
    sctx.fillStyle = grad;
    sctx.fillRect(ox, oy, tw, th);

    // Composite anatomical stack onto tile
    const comp = createCanvas(W, H);
    const cctx = comp.getContext("2d");
    cctx.drawImage(parts["gretel-face-base"], 0, 0);

    // Clip and shift irises
    cctx.save();
    cctx.beginPath();
    cctx.ellipse(466, 300, 22, 12.5, 0.08, 0, Math.PI * 2);
    cctx.clip();
    cctx.drawImage(parts["iris-left"], spec.dxIris, spec.dyIris);
    cctx.restore();

    cctx.save();
    cctx.beginPath();
    cctx.ellipse(580, 315, 22.5, 13, -0.05, 0, Math.PI * 2);
    cctx.clip();
    cctx.drawImage(parts["iris-right"], spec.dxIris, spec.dyIris);
    cctx.restore();

    cctx.drawImage(parts["eyelashes-frame"], 0, 0);
    if (spec.lid) cctx.drawImage(parts[spec.lid], 0, 0);
    cctx.drawImage(parts["brow-left"], 0, spec.dyBrow);
    cctx.drawImage(parts["brow-right"], 0, spec.dyBrow);
    cctx.drawImage(parts[spec.mouth], 0, 0);

    // Frame either full cutout (tile 0) or upper-torso zoom (tiles 1..5)
    if (idx === 0) {
      sctx.drawImage(comp, 90, 0, 740, H, ox + 10, oy + 10, tw - 20, th - 20);
    } else {
      sctx.drawImage(comp, 280, 145, 440, 325, ox, oy, tw, th);
    }

    sctx.fillStyle = "rgba(18, 28, 22, 0.84)";
    sctx.fillRect(ox + 10, oy + th - 32, 220, 22);
    sctx.fillStyle = "#f4efe2";
    sctx.font = "bold 13px sans-serif";
    sctx.fillText(spec.title, ox + 18, oy + th - 16);
  });

  writeFileSync(join(OUT_DIR, "chalkboard-qa-sheet.png"), sheet.toBuffer("image/png"));
  console.log(`Generated ${manifestAssets.length} anatomical rig parts + chalkboard-qa-sheet.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
