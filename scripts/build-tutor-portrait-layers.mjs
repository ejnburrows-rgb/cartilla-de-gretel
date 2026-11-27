#!/usr/bin/env node
/**
 * Builds pixel-registered 1024x662 candidate facial overlays on top of the
 * owner-approved torso-up video-call portrait (`gretel-tutor-portrait-call.jpg`).
 *
 * - Copies exact portrait pixels for native mouth-C and samples perimeter skin
 *   gradients via bilinear boundary interpolation + feathered alpha masks so
 *   zero overlay rectangles or color seams appear.
 * - Writes ONLY unapproved candidates to `public/cartilla/images/gretel/tutor/call-candidates/`
 *   and updates `public/cartilla/images/gretel/tutor/candidate-manifest.json` (`approved: false`).
 * - Never touches `gretel-approved-master.png` or `public/cartilla/images/gretel/layers/manifest.json`.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTRAIT_REL = "public/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg";
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

/**
 * Creates a seamless skin-tone patch over an elliptical region by bilinearly
 * interpolating pixel colors sampled from the clean skin ring just outside
 * the ellipse, feathered softly into transparency at the edge.
 */
function paintFeatheredSkinEllipse(ctx, baseData, cx, cy, rx, ry, featherPx = 10, samplePad = 5) {
  const x0 = Math.max(0, Math.floor(cx - rx - 2));
  const y0 = Math.max(0, Math.floor(cy - ry - 2));
  const x1 = Math.min(W - 1, Math.ceil(cx + rx + 2));
  const y1 = Math.min(H - 1, Math.ceil(cy + ry + 2));
  const pw = x1 - x0 + 1;
  const ph = y1 - y0 + 1;

  const patch = ctx.createImageData(pw, ph);
  const dst = patch.data;
  const src = baseData.data;

  function sampleAvg(sx, sy) {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const px = clamp(Math.round(sx + dx), 0, W - 1);
        const py = clamp(Math.round(sy + dy), 0, H - 1);
        const idx = (py * W + px) * 4;
        r += src[idx];
        g += src[idx + 1];
        b += src[idx + 2];
        n++;
      }
    }
    return [r / n, g / n, b / n];
  }

  for (let y = y0; y <= y1; y++) {
    const ny = (y - cy) / ry;
    const ny2 = ny * ny;
    for (let x = x0; x <= x1; x++) {
      const nx = (x - cx) / rx;
      const d = Math.hypot(nx, ny);
      if (d >= 1) continue;

      // Sample left/right & top/bottom clean boundary points along ellipse chords
      const chordX = Math.sqrt(Math.max(0.001, 1 - Math.min(0.99, ny2))) * rx;
      const chordY = Math.sqrt(Math.max(0.001, 1 - Math.min(0.99, nx * nx))) * ry;
      const tx = clamp((x - (cx - chordX)) / (2 * chordX), 0, 1);
      const ty = clamp((y - (cy - chordY)) / (2 * chordY), 0, 1);

      const leftC = sampleAvg(cx - chordX - samplePad, y);
      const rightC = sampleAvg(cx + chordX + samplePad, y);
      const topC = sampleAvg(x, cy - chordY - samplePad);
      const botC = sampleAvg(x, cy + chordY + samplePad);

      const hx0 = leftC[0] * (1 - tx) + rightC[0] * tx;
      const hx1 = leftC[1] * (1 - tx) + rightC[1] * tx;
      const hx2 = leftC[2] * (1 - tx) + rightC[2] * tx;

      const vy0 = topC[0] * (1 - ty) + botC[0] * ty;
      const vy1 = topC[1] * (1 - ty) + botC[1] * ty;
      const vy2 = topC[2] * (1 - ty) + botC[2] * ty;

      // Blend horizontal & vertical interpolation smoothly (horizontal-dominant avoids nose shadow bleeding)
      const r = hx0 * 0.8 + vy0 * 0.2;
      const g = hx1 * 0.8 + vy1 * 0.2;
      const b = hx2 * 0.8 + vy2 * 0.2;

      const featherRatio = clamp(1 - featherPx / Math.min(rx, ry), 0.4, 0.88);
      const alpha = 1 - smoothstep(featherRatio, 1, d);
      const outIdx = ((y - y0) * pw + (x - x0)) * 4;
      dst[outIdx] = Math.round(r);
      dst[outIdx + 1] = Math.round(g);
      dst[outIdx + 2] = Math.round(b);
      dst[outIdx + 3] = Math.round(alpha * 255);
    }
  }

  const tmp = createCanvas(pw, ph);
  tmp.getContext("2d").putImageData(patch, 0, 0);
  ctx.drawImage(tmp, x0, y0);
}

/** Draw a painted storybook mouth shape centered at (514, 410). */
function drawMouthShape(ctx, shape) {
  const cx = 514;
  const cy = 408;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const lipOutline = "#9c3c2f";
  const upperLipFill = "#de6c5a";
  const lowerLipFill = "#e88471";
  const lipHighlight = "rgba(255, 224, 210, 0.55)";
  const cavityDark = "#5e1a18";
  const cavityMid = "#8c2b25";
  const tongueColor = "#d96452";
  const toothFill = "#fdf8f2";
  const toothEdge = "#d8c4b5";

  if (shape === "X" || shape === "A") {
    const halfW = shape === "X" ? 34 : 28;
    const dip = shape === "X" ? 7 : 2.5;
    const upperThick = shape === "X" ? 6.5 : 6;
    const lowerThick = shape === "X" ? 9 : 7.5;

    // Upper lip
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy);
    ctx.quadraticCurveTo(cx - halfW * 0.35, cy - upperThick, cx, cy - upperThick * 0.55);
    ctx.quadraticCurveTo(cx + halfW * 0.35, cy - upperThick, cx + halfW, cy);
    ctx.quadraticCurveTo(cx, cy + dip, cx - halfW, cy);
    ctx.closePath();
    ctx.fillStyle = upperLipFill;
    ctx.fill();

    // Lower lip
    ctx.beginPath();
    ctx.moveTo(cx - halfW * 0.85, cy + 1);
    ctx.quadraticCurveTo(cx, cy + dip, cx + halfW * 0.85, cy + 1);
    ctx.quadraticCurveTo(cx, cy + dip + lowerThick, cx - halfW * 0.85, cy + 1);
    ctx.closePath();
    ctx.fillStyle = lowerLipFill;
    ctx.fill();

    // Soft highlight on lower lip
    ctx.beginPath();
    ctx.ellipse(cx, cy + dip + lowerThick * 0.38, halfW * 0.32, 2.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = lipHighlight;
    ctx.fill();

    // Center smile seam
    ctx.beginPath();
    ctx.moveTo(cx - halfW - 2, cy - (shape === "X" ? 2 : 0));
    ctx.quadraticCurveTo(cx, cy + dip + 1, cx + halfW + 2, cy - (shape === "X" ? 2 : 0));
    ctx.strokeStyle = lipOutline;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Soft corners
    ctx.fillStyle = "rgba(156, 60, 47, 0.4)";
    ctx.beginPath();
    ctx.arc(cx - halfW - 2, cy - (shape === "X" ? 2 : 0), 2.2, 0, Math.PI * 2);
    ctx.arc(cx + halfW + 2, cy - (shape === "X" ? 2 : 0), 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Open mouth geometries: B (narrow smile), D (wide open A), E (rounded O/E), F (f/v), G (l/th)
  const specs = {
    B: { halfW: 34, openH: 13, roundness: 0.7, showTeeth: 6.5, tongueLift: 0 },
    D: { halfW: 39, openH: 31, roundness: 0.9, showTeeth: 8.5, tongueLift: 0.35 },
    E: { halfW: 22, openH: 22, roundness: 1.0, showTeeth: 5, tongueLift: 0.2 },
    F: { halfW: 27, openH: 12, roundness: 0.65, showTeeth: 8.5, tongueLift: 0, tuckLower: true },
    G: { halfW: 31, openH: 20, roundness: 0.85, showTeeth: 7.5, tongueLift: 0.72 },
  };
  const s = specs[shape];
  const topY = cy - 2;
  const botY = topY + s.openH;

  // Clip mouth cavity
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - s.halfW, topY);
  ctx.quadraticCurveTo(cx, topY + (s.roundness > 0.95 ? -5 : 2), cx + s.halfW, topY);
  ctx.bezierCurveTo(
    cx + s.halfW * 0.88,
    botY + 4,
    cx - s.halfW * 0.88,
    botY + 4,
    cx - s.halfW,
    topY,
  );
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, topY, cx, botY);
  grad.addColorStop(0, cavityDark);
  grad.addColorStop(1, cavityMid);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.clip();

  // Tongue
  if (s.tongueLift > 0) {
    ctx.beginPath();
    const ty = botY - s.openH * s.tongueLift * 0.45 + 3;
    ctx.ellipse(cx, ty + 6, s.halfW * 0.72, s.openH * 0.46, 0, 0, Math.PI * 2);
    ctx.fillStyle = tongueColor;
    ctx.fill();
  }

  // Upper teeth row
  if (s.showTeeth > 0) {
    ctx.beginPath();
    ctx.moveTo(cx - s.halfW * 0.82, topY - 2);
    ctx.lineTo(cx + s.halfW * 0.82, topY - 2);
    ctx.quadraticCurveTo(cx, topY + s.showTeeth + 3, cx - s.halfW * 0.82, topY - 2);
    ctx.closePath();
    ctx.fillStyle = toothFill;
    ctx.fill();
    ctx.strokeStyle = toothEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();

  // Upper lip arch
  ctx.beginPath();
  ctx.moveTo(cx - s.halfW - 3, topY);
  ctx.quadraticCurveTo(cx - s.halfW * 0.38, topY - 10, cx, topY - 6);
  ctx.quadraticCurveTo(cx + s.halfW * 0.38, topY - 10, cx + s.halfW + 3, topY);
  ctx.quadraticCurveTo(cx, topY + (s.roundness > 0.95 ? -3 : 3), cx - s.halfW - 3, topY);
  ctx.closePath();
  ctx.fillStyle = upperLipFill;
  ctx.fill();

  // Lower lip arch
  const lowerPad = s.tuckLower ? 6 : 9;
  ctx.beginPath();
  ctx.moveTo(cx - s.halfW * 0.92, topY + 2);
  ctx.bezierCurveTo(
    cx - s.halfW * 0.75,
    botY + 2,
    cx + s.halfW * 0.75,
    botY + 2,
    cx + s.halfW * 0.92,
    topY + 2,
  );
  ctx.bezierCurveTo(
    cx + s.halfW * 0.72,
    botY + lowerPad + 2,
    cx - s.halfW * 0.72,
    botY + lowerPad + 2,
    cx - s.halfW * 0.92,
    topY + 2,
  );
  ctx.closePath();
  ctx.fillStyle = lowerLipFill;
  ctx.fill();

  // Lower lip highlight
  ctx.beginPath();
  ctx.ellipse(cx, botY + lowerPad * 0.45, s.halfW * 0.32, 2.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = lipHighlight;
  ctx.fill();

  // Crisp warm outline around cavity
  ctx.beginPath();
  ctx.moveTo(cx - s.halfW - 2, topY - 1);
  ctx.quadraticCurveTo(cx, topY + (s.roundness > 0.95 ? -4 : 3), cx + s.halfW + 2, topY - 1);
  ctx.strokeStyle = lipOutline;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s.halfW, topY);
  ctx.bezierCurveTo(
    cx - s.halfW * 0.85,
    botY + 3,
    cx + s.halfW * 0.85,
    botY + 3,
    cx + s.halfW,
    topY,
  );
  ctx.strokeStyle = lipOutline;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  ctx.restore();
}

/** Draw a tapered, curved painted storybook lash arc (thickest in center, fine ends). */
function drawTaperedArc(ctx, x0, y0, qx, qy, x1, y1, maxWidth, color) {
  const steps = 28;
  const upper = [];
  const lower = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * qx + t * t * x1;
    const y = mt * mt * y0 + 2 * mt * t * qy + t * t * y1;
    const dx = 2 * mt * (qx - x0) + 2 * t * (x1 - qx);
    const dy = 2 * mt * (qy - y0) + 2 * t * (y1 - qy);
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfW = (maxWidth * 0.5) * Math.sin(t * Math.PI);
    upper.push([x + nx * halfW, y + ny * halfW]);
    lower.push([x - nx * halfW, y - ny * halfW]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(upper[0][0], upper[0][1]);
  for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i][0], upper[i][1]);
  for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i][0], lower[i][1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Draw half-closed or fully-closed painted storybook eyelids over both eyes. */
function drawEyelids(ctx, baseData, mode) {
  const eyes = [
    // Viewer-left eye (her right eye): spans x=424..496, y=276..324
    {
      cx: 462,
      cy: 300,
      rx: 54,
      ry: 33,
      // Curved lash endpoints inside the eye socket
      x0: 428,
      y0: mode === "closed" ? 302 : 294,
      qx: 463,
      qy: mode === "closed" ? 320 : 301,
      x1: 495,
      y1: mode === "closed" ? 314 : 309,
      creaseY: 274,
      outerFlickDir: -1,
    },
    // Viewer-right eye (her left eye): spans x=546..620, y=292..338
    {
      cx: 582,
      cy: 316,
      rx: 54,
      ry: 33,
      x0: 546,
      y0: mode === "closed" ? 322 : 319,
      qx: 580,
      qy: mode === "closed" ? 336 : 316,
      x1: 614,
      y1: mode === "closed" ? 324 : 318,
      creaseY: 290,
      outerFlickDir: 1,
    },
  ];

  for (const eye of eyes) {
    if (mode === "closed") {
      // Full seamless skin patch covering eye + original upper lashes completely
      paintFeatheredSkinEllipse(ctx, baseData, eye.cx, eye.cy, eye.rx, eye.ry, 12, 6);
    } else {
      // Half-closed: clip cleanly along a gentle curved lower boundary so lower blue iris peeks out naturally
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(eye.cx - eye.rx - 4, eye.cy - eye.ry - 4);
      ctx.lineTo(eye.cx + eye.rx + 4, eye.cy - eye.ry - 4);
      ctx.lineTo(eye.cx + eye.rx + 4, eye.y1 + 2);
      ctx.quadraticCurveTo(eye.qx, eye.qy + 3, eye.cx - eye.rx - 4, eye.y0 + 2);
      ctx.closePath();
      ctx.clip();
      paintFeatheredSkinEllipse(ctx, baseData, eye.cx, eye.cy - 2, eye.rx, eye.ry, 10, 6);
      ctx.restore();
    }

    // Soft warm eyelid crease above the lid
    ctx.save();
    ctx.strokeStyle = "rgba(182, 118, 78, 0.42)";
    ctx.lineWidth = 2.0;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(eye.x0 + 6, eye.creaseY + 12);
    ctx.quadraticCurveTo(eye.cx, eye.creaseY - 2, eye.x1 - 6, eye.creaseY + 14);
    ctx.stroke();

    // Subtle warm shadow just above the lash line
    ctx.strokeStyle = "rgba(165, 102, 68, 0.25)";
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(eye.x0 + 2, eye.y0 - 2);
    ctx.quadraticCurveTo(eye.qx, eye.qy - 2, eye.x1 - 2, eye.y1 - 2);
    ctx.stroke();
    ctx.restore();

    // Graceful tapered dark-brown lash curve (storybook paint feel)
    drawTaperedArc(ctx, eye.x0, eye.y0, eye.qx, eye.qy, eye.x1, eye.y1, 5.2, "#2c1810");

    // Two delicate outer lash flicks matching original style
    ctx.save();
    ctx.strokeStyle = "#2c1810";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.2;
    if (eye.outerFlickDir < 0) {
      ctx.beginPath();
      ctx.moveTo(eye.x0 + 3, eye.y0 + 1);
      ctx.quadraticCurveTo(eye.x0 - 4, eye.y0 - 1, eye.x0 - 8, eye.y0 - 5);
      ctx.stroke();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(eye.x0 + 7, eye.y0 + 2);
      ctx.quadraticCurveTo(eye.x0, eye.y0 + 1, eye.x0 - 5, eye.y0 - 1);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(eye.x1 - 3, eye.y1 + 1);
      ctx.quadraticCurveTo(eye.x1 + 4, eye.y1 - 1, eye.x1 + 9, eye.y1 - 4);
      ctx.stroke();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(eye.x1 - 7, eye.y1 + 2);
      ctx.quadraticCurveTo(eye.x1, eye.y1 + 2, eye.x1 + 6, eye.y1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Draw gently lifted eyebrows (+5px) over feathered skin patches. */
function drawLiftedBrows(ctx, baseData) {
  const brows = [
    { cx: 470, cy: 235, rx: 36, ry: 15, x0: 445, y0: 238, qx: 472, qy: 220, x1: 496, y1: 240 },
    { cx: 594, cy: 254, rx: 34, ry: 15, x0: 572, y0: 252, qx: 596, qy: 238, x1: 618, y1: 263 },
  ];
  for (const b of brows) {
    paintFeatheredSkinEllipse(ctx, baseData, b.cx, b.cy, b.rx, b.ry, 7, 4);
    ctx.save();
    ctx.strokeStyle = "#5c341d";
    ctx.lineWidth = 3.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(b.x0, b.y0 - 5);
    ctx.quadraticCurveTo(b.qx, b.qy - 6, b.x1, b.y1 - 5);
    ctx.stroke();
    ctx.restore();
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const portrait = await loadImage(join(REPO_ROOT, PORTRAIT_REL));
  const baseCanvas = createCanvas(W, H);
  const baseCtx = baseCanvas.getContext("2d");
  baseCtx.drawImage(portrait, 0, 0, W, H);
  const baseData = baseCtx.getImageData(0, 0, W, H);

  const outputs = [];

  function saveLayer(id, role, label, shapes, drawFn) {
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
      source: id === "mouth-C" ? "native-extract-from-owner-call-portrait" : "pixel-registered-on-owner-call-portrait",
      ownerDecision: "pending",
    });
    return c;
  }

  const canvases = {};

  // Blink & brows
  canvases["blink-half"] = saveLayer("blink-half", "blink", "Eyelids half-closed", null, (ctx) =>
    drawEyelids(ctx, baseData, "half"),
  );
  canvases["blink-closed"] = saveLayer("blink-closed", "blink", "Eyelids fully closed", null, (ctx) =>
    drawEyelids(ctx, baseData, "closed"),
  );
  canvases["brows-soft-lift"] = saveLayer("brows-soft-lift", "brows", "Eyebrows gently lifted", null, (ctx) =>
    drawLiftedBrows(ctx, baseData),
  );

  // Mouth C: exact native open smile from owner's video-call portrait (feathered)
  canvases["mouth-C"] = saveLayer("mouth-C", "mouth", "Mouth C — Native open smile (exact owner portrait pixels)", ["C"], (ctx) => {
    // Transparent overlay (base portrait already has native mouth C!)
    // Store feathered mouth copy so switching layers is deterministic.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(514, 414, 52, 34, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(baseCanvas, 0, 0);
    ctx.restore();
  });

  // Painted mouth shapes on feathered skin underpainting
  const mouthSpecs = [
    ["mouth-X", ["X"], "Mouth X — Resting closed smile"],
    ["mouth-A", ["A"], "Mouth A — Closed bilabial (p, b, m)"],
    ["mouth-B", ["B"], "Mouth B — Narrow smile (s, t, k, n, i, e)"],
    ["mouth-D", ["D"], "Mouth D — Wide open (a)"],
    ["mouth-E", ["E"], "Mouth E — Rounded medium (o, e)"],
    ["mouth-F", ["F"], "Mouth F — Upper teeth over lower lip (f, v)"],
    ["mouth-G", ["G"], "Mouth G — Tongue behind upper teeth (l, d)"],
  ];

  for (const [id, shapes, label] of mouthSpecs) {
    canvases[id] = saveLayer(id, "mouth", label, shapes, (ctx) => {
      paintFeatheredSkinEllipse(ctx, baseData, 514, 413, 62, 35, 7, 4);
      drawMouthShape(ctx, shapes[0]);
    });
  }

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

  // Also render a visual QA contact sheet in /tmp/ (never committed)
  const order = [
    "native",
    "blink-half",
    "blink-closed",
    "brows-soft-lift",
    "mouth-X",
    "mouth-A",
    "mouth-B",
    "mouth-C",
    "mouth-D",
    "mouth-E",
    "mouth-F",
    "mouth-G",
  ];
  const cols = 4;
  const rows = 3;
  const tileW = 300;
  const tileH = 260;
  const sheet = createCanvas(cols * tileW, rows * tileH);
  const sctx = sheet.getContext("2d");
  sctx.fillStyle = "#f9f3e8";
  sctx.fillRect(0, 0, sheet.width, sheet.height);

  order.forEach((key, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ox = col * tileW;
    const oy = row * tileH;
    // Composite full frame then crop face region (360..660, 200..460)
    const comp = createCanvas(W, H);
    const cctx = comp.getContext("2d");
    cctx.drawImage(baseCanvas, 0, 0);
    if (key !== "native") cctx.drawImage(canvases[key], 0, 0);
    sctx.drawImage(comp, 360, 200, 300, 260, ox, oy, tileW, tileH);
    sctx.fillStyle = "rgba(30,22,16,0.75)";
    sctx.fillRect(ox + 6, oy + tileH - 26, 136, 20);
    sctx.fillStyle = "#fff";
    sctx.font = "bold 12px sans-serif";
    sctx.fillText(key, ox + 12, oy + tileH - 12);
  });

  const sheetBuf = sheet.toBuffer("image/png");
  writeFileSync("/tmp/gretel-call-candidates-sheet.png", sheetBuf);
  writeFileSync(join(OUT_DIR, "contact-sheet.png"), sheetBuf);
  console.log(`Generated ${outputs.length} call-portrait candidate layers + contact-sheet.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
