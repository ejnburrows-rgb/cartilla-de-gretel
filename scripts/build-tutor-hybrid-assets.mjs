#!/usr/bin/env node
/**
 * Builds clean hybrid animation reference art and turnaround pose sheets from
 * recovered owner-approved artwork ($0, offline, zero creepy detached limbs).
 *
 * Outputs (in `public/cartilla/images/gretel/tutor/hybrid-candidates/`):
 * - poses/pose-front.png             : Clean front torso-up portrait cutout (1024x662)
 * - poses/pose-3q-right.png          : Clean 3/4-right turnaround cutout (1024x662)
 * - poses/pose-3q-left.png           : Clean 3/4-left turnaround cutout (1024x662)
 * - poses/pose-approval-sheet.png    : Clean 3-tile Contact Sheet anchored to oak ledge
 * - flow-refs/ref-stage-master.png   : 1600x1000 Google Flow Frames-to-Video master keyframe
 * - hybrid-manifest.json             : Asset inventory with `approved: false`
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CALL_CUTOUT_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/gretel-face-base.png";
const CALL_IRIS_L_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/iris-left.png";
const CALL_IRIS_R_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/iris-right.png";
const CALL_LASHES_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/eyelashes-frame.png";
const CALL_BROW_L_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/brow-left.png";
const CALL_BROW_R_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/brow-right.png";
const CALL_MOUTH_X_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/mouth-X.png";
const POSE_3Q_RIGHT_REL = "public/cartilla/images/gretel/tutor/reference/poses/gretel-pose-3q-right.jpg";
const OUT_ROOT = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/hybrid-candidates");
const POSES_DIR = join(OUT_ROOT, "poses");
const FLOW_REFS_DIR = join(OUT_ROOT, "flow-refs");
const CAVEAT_FONT_PATH = join(REPO_ROOT, "public/fonts/caveat-latin.woff2");

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
 * Segments Gretel cleanly from a uniform neutral #dbdbdb studio background
 * via boundary flood-fill + anti-aliased edge decontamination.
 */
function cutOutFromNeutralGray(srcCanvas, bgRgb = [219, 219, 219]) {
  const sw = srcCanvas.width;
  const sh = srcCanvas.height;
  const ctx = srcCanvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const d = imgData.data;
  const isBg = new Uint8Array(sw * sh);

  function isGrayWall(x, y) {
    const i = (y * sw + x) * 4;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const diff = Math.abs(r - bgRgb[0]) + Math.abs(g - bgRgb[1]) + Math.abs(b - bgRgb[2]);
    return sat < 22 && diff < 56 && r > 175 && g > 175 && b > 175;
  }

  const queue = new Int32Array(sw * sh);
  let head = 0;
  let tail = 0;
  function seed(x, y) {
    if (x < 0 || x >= sw || y < 0 || y >= sh) return;
    const p = y * sw + x;
    if (isBg[p] || !isGrayWall(x, y)) return;
    isBg[p] = 1;
    queue[tail++] = p;
  }

  for (let x = 0; x < sw; x++) {
    seed(x, 0);
    seed(x, sh - 1);
  }
  for (let y = 0; y < sh; y++) {
    seed(0, y);
    seed(sw - 1, y);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % sw;
    const y = (p - x) / sw;
    if (x > 0) seed(x - 1, y);
    if (x + 1 < sw) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y + 1 < sh) seed(x, y + 1);
  }

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const p = y * sw + x;
      const i = p * 4;
      if (isBg[p]) {
        d[i + 3] = 0;
        continue;
      }
      let minDist = 4.0;
      for (let dy = -3; dy <= 3; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= sh) continue;
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= sw) continue;
          if (isBg[ny * sw + nx]) {
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) minDist = dist;
          }
        }
      }
      if (minDist < 2.2) {
        const factor = smoothstep(0.6, 2.2, minDist);
        d[i + 3] = Math.round(d[i + 3] * factor);
        d[i] = Math.round(clamp(d[i] - bgRgb[0] * (1 - factor) * 0.28, 0, 255));
        d[i + 1] = Math.round(clamp(d[i + 1] - bgRgb[1] * (1 - factor) * 0.28, 0, 255));
        d[i + 2] = Math.round(clamp(d[i + 2] - bgRgb[2] * (1 - factor) * 0.28, 0, 255));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return srcCanvas;
}

/** Draws the museum-grade oak-framed green chalkboard + anchored portrait for Google Flow. */
function drawStageFrame(ctx, w, h, gretelCanvas, showTitle) {
  // 1. Vintage mitered oak frame
  ctx.fillStyle = "#5e371b";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#8a5630";
  ctx.lineWidth = Math.round(w * 0.011);
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.strokeStyle = "#462611";
  ctx.lineWidth = Math.round(w * 0.005);
  ctx.strokeRect(22, 22, w - 44, h - 44);

  // 2. Classic deep-green chalkboard slate
  const sx = Math.round(w * 0.0175);
  const sy = Math.round(h * 0.028);
  const sw = w - sx * 2;
  const ledgeY = Math.round(h * 0.896);
  const grad = ctx.createRadialGradient(w * 0.42, h * 0.44, 30, w * 0.42, h * 0.44, w * 0.68);
  grad.addColorStop(0, "#1b4331");
  grad.addColorStop(0.65, "#143325");
  grad.addColorStop(1, "#0d2319");
  ctx.fillStyle = grad;
  ctx.fillRect(sx, sy, sw, ledgeY - sy + 4);

  // Soft chalk vignette & writing zone guide
  ctx.fillStyle = "rgba(236, 242, 230, 0.032)";
  ctx.beginPath();
  ctx.ellipse(w * 0.206, h * 0.41, w * 0.156, h * 0.125, 0, 0, Math.PI * 2);
  ctx.fill();

  if (showTitle) {
    ctx.save();
    ctx.fillStyle = "rgba(244, 241, 228, 0.94)";
    ctx.font = `700 ${Math.round(h * 0.074)}px 'Caveat', cursive, sans-serif`;
    ctx.fillText("Cartilla de Gretel", Math.round(w * 0.0575), Math.round(h * 0.122));
    ctx.strokeStyle = "rgba(244, 241, 228, 0.48)";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.14);
    ctx.quadraticCurveTo(w * 0.16, h * 0.148, w * 0.278, h * 0.136);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Gretel positioned flush behind oak chalk tray (ZERO floating bottom crop!)
  const gScale = (w / 1600) * 1.12;
  const drawW = W * gScale;
  const drawH = H * gScale;
  const gx = w * 0.65 - drawW * 0.5;
  const gy = ledgeY - drawH + Math.round(h * 0.014);

  ctx.save();
  const sg = ctx.createRadialGradient(w * 0.665, h * 0.61, 40, w * 0.665, h * 0.61, drawW * 0.42);
  sg.addColorStop(0, "rgba(7, 22, 14, 0.44)");
  sg.addColorStop(1, "rgba(7, 22, 14, 0)");
  ctx.fillStyle = sg;
  ctx.fillRect(gx - 40, gy - 30, drawW + 80, drawH + 40);
  ctx.restore();

  ctx.drawImage(gretelCanvas, gx, gy, drawW, drawH);

  // 4. Foreground oak chalk tray ledge overlapping Gretel's bottom edge cleanly
  ctx.fillStyle = "#8b5932";
  ctx.fillRect(Math.round(w * 0.015), ledgeY, w - Math.round(w * 0.03), Math.round(h * 0.016));
  ctx.fillStyle = "#633a1d";
  ctx.fillRect(Math.round(w * 0.0125), ledgeY + Math.round(h * 0.014), w - Math.round(w * 0.025), Math.round(h * 0.044));
  ctx.strokeStyle = "#3f220e";
  ctx.lineWidth = 3;
  ctx.strokeRect(Math.round(w * 0.0125), ledgeY + Math.round(h * 0.014), w - Math.round(w * 0.025), Math.round(h * 0.044));
  ctx.strokeStyle = "rgba(166, 114, 72, 0.7)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.016, ledgeY + Math.round(h * 0.016));
  ctx.lineTo(w * 0.984, ledgeY + Math.round(h * 0.016));
  ctx.stroke();

  // Felt-bottomed wood eraser & chalk sticks on lower-left ledge
  const erX = Math.round(w * 0.0687);
  const erY = Math.round(h * 0.868);
  ctx.fillStyle = "#2c2e33";
  ctx.fillRect(erX + 4, erY + Math.round(h * 0.02), Math.round(w * 0.08), Math.round(h * 0.014));
  ctx.fillStyle = "#8d5a34";
  ctx.strokeStyle = "#4c2c13";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(erX, erY + Math.round(h * 0.006), Math.round(w * 0.085), Math.round(h * 0.016), 4);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(w * 0.174, h * 0.886);
  ctx.rotate(-0.035);
  ctx.fillStyle = "#f7f5eb";
  ctx.strokeStyle = "#d5d1c0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w * 0.0475, h * 0.012, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(w * 0.23, h * 0.888);
  ctx.rotate(0.06);
  ctx.fillStyle = "#f4e08e";
  ctx.strokeStyle = "#cfba67";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w * 0.0325, h * 0.011, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(w * 0.2725, h * 0.887);
  ctx.rotate(-0.025);
  ctx.fillStyle = "#f2aba0";
  ctx.strokeStyle = "#c98076";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w * 0.03, h * 0.011, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

async function main() {
  if (existsSync(CAVEAT_FONT_PATH)) {
    GlobalFonts.registerFromPath(CAVEAT_FONT_PATH, "Caveat");
  }

  // Clean up any stale broken arm/ref files before generating spotless replacements
  for (const stale of [
    join(POSES_DIR, "arm-upper.png"),
    join(POSES_DIR, "arm-forearm-chalk.png"),
    join(POSES_DIR, "arm-forearm-eraser.png"),
    join(FLOW_REFS_DIR, "ref-listening.png"),
    join(FLOW_REFS_DIR, "ref-turn-left.png"),
    join(FLOW_REFS_DIR, "ref-writing.png"),
    join(FLOW_REFS_DIR, "ref-erasing.png"),
  ]) {
    if (existsSync(stale)) rmSync(stale);
  }

  mkdirSync(POSES_DIR, { recursive: true });
  mkdirSync(FLOW_REFS_DIR, { recursive: true });

  const [callCutout, irisL, irisR, lashes, browL, browR, mouthX, pose3qRaw] = await Promise.all([
    loadImage(join(REPO_ROOT, CALL_CUTOUT_REL)),
    loadImage(join(REPO_ROOT, CALL_IRIS_L_REL)),
    loadImage(join(REPO_ROOT, CALL_IRIS_R_REL)),
    loadImage(join(REPO_ROOT, CALL_LASHES_REL)),
    loadImage(join(REPO_ROOT, CALL_BROW_L_REL)),
    loadImage(join(REPO_ROOT, CALL_BROW_R_REL)),
    loadImage(join(REPO_ROOT, CALL_MOUTH_X_REL)),
    loadImage(join(REPO_ROOT, POSE_3Q_RIGHT_REL)),
  ]);

  const savedParts = [];
  function writePng(subDir, filename, canvas, role) {
    const full = join(subDir, filename);
    const buf = canvas.toBuffer("image/png");
    writeFileSync(full, buf);
    const sha256 = createHash("sha256").update(buf).digest("hex");
    savedParts.push({
      id: filename.replace(/\.png$/, ""),
      role,
      src: `/cartilla/images/gretel/tutor/hybrid-candidates/${subDir === POSES_DIR ? "poses" : "flow-refs"}/${filename}`,
      width: canvas.width,
      height: canvas.height,
      sha256,
      ownerDecision: "pending",
    });
    return canvas;
  }

  // 1. Clean front torso-up cutout
  const frontCanvas = createCanvas(W, H);
  const fctx = frontCanvas.getContext("2d");
  fctx.drawImage(callCutout, 0, 0, W, H);
  fctx.drawImage(irisL, 0, 0, W, H);
  fctx.drawImage(irisR, 0, 0, W, H);
  fctx.drawImage(lashes, 0, 0, W, H);
  fctx.drawImage(browL, 0, 0, W, H);
  fctx.drawImage(browR, 0, 0, W, H);
  fctx.drawImage(mouthX, 0, 0, W, H);
  writePng(POSES_DIR, "pose-front.png", frontCanvas, "pose-front");

  // 2. Clean 3/4 right & left turnaround cutouts (no pasted arms)
  const src3q = createCanvas(1024, 1024);
  src3q.getContext("2d").drawImage(pose3qRaw, 0, 0, 1024, 1024);
  const matted3q = cutOutFromNeutralGray(src3q, [219, 219, 219]);

  const pose3qRight = createCanvas(W, H);
  const prCtx = pose3qRight.getContext("2d");
  const scale3q = 0.9;
  const dw = 1024 * scale3q;
  const dh = 1024 * scale3q;
  prCtx.drawImage(matted3q, (W - dw) / 2, -42, dw, dh);
  writePng(POSES_DIR, "pose-3q-right.png", pose3qRight, "pose-3q-right");

  const pose3qLeft = createCanvas(W, H);
  const plCtx = pose3qLeft.getContext("2d");
  plCtx.translate(W, 0);
  plCtx.scale(-1, 1);
  plCtx.drawImage(pose3qRight, 0, 0);
  writePng(POSES_DIR, "pose-3q-left.png", pose3qLeft, "pose-3q-left");

  // 3. Google Flow 1600x1000 Master Keyframe anchored behind oak ledge
  const masterFlowCanvas = createCanvas(1600, 1000);
  drawStageFrame(masterFlowCanvas.getContext("2d"), 1600, 1000, frontCanvas, true);
  writePng(FLOW_REFS_DIR, "ref-stage-master.png", masterFlowCanvas, "flow-master-keyframe");

  // 4. Clean 3-tile Contact Sheet (every tile anchored behind oak ledge, zero floating torsos or arms)
  const qa = createCanvas(1320, 400);
  const qctx = qa.getContext("2d");
  const tiles = [
    ["1. Retrato Frontal (Aprobado)", frontCanvas],
    ["2. Giro Suave 3/4 Izquierda (Pizarra)", pose3qLeft],
    ["3. Giro Suave 3/4 Derecha", pose3qRight],
  ];

  tiles.forEach(([label, poseC], idx) => {
    const tw = 440;
    const th = 400;
    const ox = idx * tw;
    const g = qctx.createRadialGradient(ox + tw * 0.5, th * 0.45, 20, ox + tw * 0.5, th * 0.45, tw * 0.7);
    g.addColorStop(0, "#1b4331");
    g.addColorStop(1, "#0d2319");
    qctx.fillStyle = g;
    qctx.fillRect(ox, 0, tw, th);

    // Draw Gretel centered cleanly BEHIND the lower oak ledge
    const sc = 0.52;
    const gw = W * sc;
    const gh = H * sc;
    qctx.drawImage(poseC, ox + (tw - gw) * 0.5, th - 48 - gh + 10, gw, gh);

    // Oak chalk ledge at tile bottom
    qctx.fillStyle = "#8b5932";
    qctx.fillRect(ox + 6, th - 50, tw - 12, 8);
    qctx.fillStyle = "#633a1d";
    qctx.fillRect(ox + 6, th - 42, tw - 12, 36);

    qctx.strokeStyle = "#5e371b";
    qctx.lineWidth = 5;
    qctx.strokeRect(ox + 2.5, 2.5, tw - 5, th - 5);

    qctx.fillStyle = "rgba(13, 28, 20, 0.9)";
    qctx.beginPath();
    qctx.roundRect(ox + 16, th - 36, 290, 24, 6);
    qctx.fill();
    qctx.fillStyle = "#eef5ee";
    qctx.font = "bold 14px sans-serif";
    qctx.fillText(label, ox + 26, th - 19);
  });

  writeFileSync(join(POSES_DIR, "pose-approval-sheet.png"), qa.toBuffer("image/png"));

  writeFileSync(
    join(OUT_ROOT, "hybrid-manifest.json"),
    JSON.stringify(
      {
        version: 2,
        status: "pending-owner-approval",
        approved: false,
        note: "Clean $0 hybrid rig: front animated soft-body mesh + Rhubarb coarticulation + chalk/eraser slate animations + optional seamless Google Flow full-frame MP4 clips.",
        parts: savedParts,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`Generated ${savedParts.length} clean hybrid assets + pose-approval-sheet.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
