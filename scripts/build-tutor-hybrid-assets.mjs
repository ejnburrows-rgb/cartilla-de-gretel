#!/usr/bin/env node
/**
 * Builds the multi-angle pose cutouts, painted articulated arm/chalk/eraser
 * layers, Google Flow clean reference frames, and `pose-approval-sheet.png`
 * for the $0 Hybrid Gretel Animation System from recovered owner-approved art.
 *
 * Outputs (in `public/cartilla/images/gretel/tutor/hybrid-candidates/`):
 * - poses/pose-front.png          : Clean front torso-up cutout (1024x662)
 * - poses/pose-3q-right.png         : Clean 3/4-right torso-up cutout aligned to front scale (1024x662)
 * - poses/pose-3q-left.png          : Mirrored 3/4-left torso-up cutout facing chalkboard (1024x662)
 * - poses/arm-upper.png             : Authentic upper arm & orange sleeve (180x260, shoulder pivot)
 * - poses/arm-forearm-chalk.png     : Forearm & hand gripping white chalk stick (240x320, elbow pivot)
 * - poses/arm-forearm-eraser.png    : Forearm & hand holding wood-and-felt eraser (240x320, elbow pivot)
 * - poses/pose-approval-sheet.png   : 6-tile QA contact sheet over deep-green slate
 * - flow-refs/ref-*.png             : Consistent green-chalkboard reference frames for Google Flow
 * - hybrid-manifest.json            : Coordinates, bone pivots, and `approved: false`
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CALL_PORTRAIT_REL = "public/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-call.jpg";
const CALL_CUTOUT_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/gretel-face-base.png";
const CALL_IRIS_L_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/iris-left.png";
const CALL_IRIS_R_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/iris-right.png";
const CALL_LASHES_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/eyelashes-frame.png";
const CALL_BROW_L_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/brow-left.png";
const CALL_BROW_R_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/brow-right.png";
const CALL_MOUTH_X_REL = "public/cartilla/images/gretel/tutor/chalkboard-candidates/mouth-X.png";
const POSE_3Q_RIGHT_REL = "public/cartilla/images/gretel/tutor/reference/poses/gretel-pose-3q-right.jpg";
const PRESENTING_REL = "public/cartilla/images/gretel/tutor/reference/gretel-tutor-portrait-presenting.jpg";
const OUT_ROOT = join(REPO_ROOT, "public/cartilla/images/gretel/tutor/hybrid-candidates");
const POSES_DIR = join(OUT_ROOT, "poses");
const FLOW_REFS_DIR = join(OUT_ROOT, "flow-refs");

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
 * Segments Gretel cleanly from a uniform neutral #dbdbdb / #e6e6e6 gray studio background
 * via boundary-seeded flood-fill + largest connected component + anti-aliased edge decontamination.
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
    if (isBg[p]) return;
    if (!isGrayWall(x, y)) return;
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

  // Retain largest connected foreground component (center character)
  const fg = new Uint8Array(sw * sh);
  const q2 = new Int32Array(sw * sh);
  let h2 = 0;
  let t2 = 0;
  const sp = Math.round(sh * 0.5) * sw + Math.round(sw * 0.5);
  if (!isBg[sp]) {
    fg[sp] = 1;
    q2[t2++] = sp;
  }
  while (h2 < t2) {
    const p = q2[h2++];
    const x = p % sw;
    const y = (p - x) / sw;
    if (x > 0 && !isBg[p - 1] && !fg[p - 1]) {
      fg[p - 1] = 1;
      q2[t2++] = p - 1;
    }
    if (x + 1 < sw && !isBg[p + 1] && !fg[p + 1]) {
      fg[p + 1] = 1;
      q2[t2++] = p + 1;
    }
    if (y > 0 && !isBg[p - sw] && !fg[p - sw]) {
      fg[p - sw] = 1;
      q2[t2++] = p - sw;
    }
    if (y + 1 < sh && !isBg[p + sw] && !fg[p + sw]) {
      fg[p + sw] = 1;
      q2[t2++] = p + sw;
    }
  }

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const p = y * sw + x;
      const i = p * 4;
      if (!fg[p]) {
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
          if (!fg[ny * sw + nx]) {
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) minDist = dist;
          }
        }
      }
      const a = minDist >= 3.2 ? 1.0 : smoothstep(0.75, 2.35, minDist);
      if (a < 0.995) {
        d[i] = clamp(Math.round((d[i] - (1 - a) * bgRgb[0] * 0.45) / (0.55 + 0.45 * a)), 0, 255);
        d[i + 1] = clamp(Math.round((d[i + 1] - (1 - a) * bgRgb[1] * 0.45) / (0.55 + 0.45 * a)), 0, 255);
        d[i + 2] = clamp(Math.round((d[i + 2] - (1 - a) * bgRgb[2] * 0.45) / (0.55 + 0.45 * a)), 0, 255);
      }
      d[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return srcCanvas;
}

/**
 * Extracts Gretel's authentic hand-painted forearm + hand from `gretel-tutor-portrait-presenting.jpg`
 * via boundary-seeded BFS against the cream bedroom wall (`lum > 188, sat < 52`) and keeps
 * only the single connected arm component, mirrored neatly to reach LEFT onto the chalkboard.
 */
function extractPaintedPresentingArm(presImg) {
  const full = createCanvas(1024, 1024);
  const fctx = full.getContext("2d");
  fctx.drawImage(presImg, 0, 0, 1024, 1024);
  const fd = fctx.getImageData(0, 0, 1024, 1024).data;

  // Crop region enclosing elbow -> wrist -> hand (x: 775..1015, y: 495..825 -> 240x330)
  const cw = 240;
  const ch = 330;
  const ox0 = 775;
  const oy0 = 495;
  const isBg = new Uint8Array(cw * ch);

  function isWallOrHairCut(x, y) {
    const gx = ox0 + x;
    const gy = oy0 + y;
    // Left cut separating forearm/elbow from hanging hair curls
    const cutX = gy < 655 ? 824 : gy < 735 ? 806 : 792;
    if (gx < cutX) return true;
    // Below elbow curve (y > 806)
    if (gy > 808) return true;
    const i = (gy * 1024 + gx) * 4;
    const r = fd[i];
    const g = fd[i + 1];
    const b = fd[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Painted dark-brown ink border stops flood-fill; pale cream wall lets flood-fill pass
    const isInkOutline = lum < 186 && r >= b - 10;
    const isSkinOrOrange = (r - b > 44 && g < 236) || (r > 180 && g > 120 && r - b > 48);
    if (isInkOutline || isSkinOrOrange) return false;
    return true;
  }

  const queue = new Int32Array(cw * ch);
  let head = 0;
  let tail = 0;
  function trySeed(x, y) {
    if (x < 0 || x >= cw || y < 0 || y >= ch) return;
    const p = y * cw + x;
    if (isBg[p]) return;
    if (!isWallOrHairCut(x, y)) return;
    isBg[p] = 1;
    queue[tail++] = p;
  }

  for (let x = 0; x < cw; x++) {
    trySeed(x, 0);
    trySeed(x, ch - 1);
  }
  for (let y = 0; y < ch; y++) {
    trySeed(0, y);
    trySeed(cw - 1, y);
  }
  // Seed inner nook between thumb base and palm corner (~gx 855, gy 560)
  for (let y = 55; y <= 110; y++) {
    for (let x = 55; x <= 90; x++) {
      if (isWallOrHairCut(x, y)) trySeed(x, y);
    }
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % cw;
    const y = (p - x) / cw;
    if (x > 0) trySeed(x - 1, y);
    if (x + 1 < cw) trySeed(x + 1, y);
    if (y > 0) trySeed(x, y - 1);
    if (y + 1 < ch) trySeed(x, y + 1);
  }

  // Keep ONLY largest connected foreground component seeded inside forearm (~gx 895, gy 640 -> lx 120, ly 145)
  const fg = new Uint8Array(cw * ch);
  const q2 = new Int32Array(cw * ch);
  let h2 = 0;
  let t2 = 0;
  const sp = 145 * cw + 120;
  if (!isBg[sp]) {
    fg[sp] = 1;
    q2[t2++] = sp;
  }
  while (h2 < t2) {
    const p = q2[h2++];
    const x = p % cw;
    const y = (p - x) / cw;
    if (x > 0 && !isBg[p - 1] && !fg[p - 1]) {
      fg[p - 1] = 1;
      q2[t2++] = p - 1;
    }
    if (x + 1 < cw && !isBg[p + 1] && !fg[p + 1]) {
      fg[p + 1] = 1;
      q2[t2++] = p + 1;
    }
    if (y > 0 && !isBg[p - cw] && !fg[p - cw]) {
      fg[p - cw] = 1;
      q2[t2++] = p - cw;
    }
    if (y + 1 < ch && !isBg[p + cw] && !fg[p + cw]) {
      fg[p + cw] = 1;
      q2[t2++] = p + cw;
    }
  }

  const rawArm = createCanvas(cw, ch);
  const rctx = rawArm.getContext("2d");
  const out = rctx.createImageData(cw, ch);
  const dst = out.data;

  // Center of forearm bottom elbow cap inside unflipped cw=240,ch=330 space (around x=64, y=268)
  const capCx = 66;
  const capCy = 264;
  const capR = 46;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const p = y * cw + x;
      if (!fg[p]) continue;

      // Round off the bottom elbow cleanly into a circular joint cap so rotating at any angle never shows a flat cut!
      let jointMask = 1.0;
      if (y > capCy) {
        const dy = y - capCy;
        const dx = x - capCx;
        const rDist = Math.hypot(dx, dy);
        if (rDist > capR) continue;
        jointMask = 1 - smoothstep(capR - 6, capR, rDist);
      }
      // Trim tiny stray hair speck near x < 42 above elbow
      if (x < 42 && y > 210) continue;

      let minDist = 4.0;
      for (let dy = -3; dy <= 3; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= ch) continue;
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= cw) continue;
          if (!fg[ny * cw + nx]) {
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) minDist = dist;
          }
        }
      }
      const a = (minDist >= 3.2 ? 1.0 : smoothstep(1.15, 2.6, minDist)) * jointMask;
      const gi = ((oy0 + y) * 1024 + (ox0 + x)) * 4;
      const oi = p * 4;
      dst[oi] = fd[gi];
      dst[oi + 1] = fd[gi + 1];
      dst[oi + 2] = fd[gi + 2];
      dst[oi + 3] = Math.round(a * 255);
    }
  }
  rctx.putImageData(out, 0, 0);

  // Return neatly mirrored arm (elbow pivot rounded at bottom-right (174, 264), hand reaching UP-LEFT)
  const flipped = createCanvas(cw, ch);
  const flCtx = flipped.getContext("2d");
  flCtx.translate(cw, 0);
  flCtx.scale(-1, 1);
  flCtx.drawImage(rawArm, 0, 0);
  return flipped;
}

/** Paint a matching storybook upper arm + striped orange sleeve (180x260, shoulder pivot at (85, 36)). */
function buildUpperArmCanvas() {
  const c = createCanvas(180, 260);
  const ctx = c.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Forearm-matching skin base (upper arm from shoulder (85,36) down to elbow (92,216))
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(46, 114);
  ctx.quadraticCurveTo(44, 178, 50, 218);
  ctx.arc(92, 216, 44, Math.PI, 0, true);
  ctx.quadraticCurveTo(136, 174, 128, 114);
  ctx.closePath();
  const skinGrad = ctx.createLinearGradient(46, 114, 134, 224);
  skinGrad.addColorStop(0, "#ffe0b6");
  skinGrad.addColorStop(0.7, "#fed099");
  skinGrad.addColorStop(1, "#eeb073");
  ctx.fillStyle = skinGrad;
  ctx.fill();
  ctx.strokeStyle = "#a86122";
  ctx.lineWidth = 3.0;
  ctx.stroke();
  ctx.restore();

  // Matching striped orange short sleeve covering top half cleanly without overhanging tips
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(40, 48);
  ctx.quadraticCurveTo(85, 8, 132, 46);
  ctx.lineTo(135, 122);
  ctx.quadraticCurveTo(88, 138, 39, 122);
  ctx.closePath();
  const sleeveGrad = ctx.createLinearGradient(34, 24, 144, 134);
  sleeveGrad.addColorStop(0, "#f57c28");
  sleeveGrad.addColorStop(1, "#da5515");
  ctx.fillStyle = sleeveGrad;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "#fdc285";
  ctx.lineWidth = 5;
  for (let sy = 26; sy <= 136; sy += 22) {
    ctx.beginPath();
    ctx.moveTo(20, sy - 6);
    ctx.quadraticCurveTo(86, sy + 8, 152, sy - 4);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "#8a2c08";
  ctx.lineWidth = 3.4;
  ctx.stroke();
  ctx.restore();

  return c;
}

/** Draw clean green slate backdrop helper for QA & Flow reference frames. */
function drawGreenChalkboardBackdrop(ctx, w, h) {
  const grad = ctx.createRadialGradient(w * 0.42, h * 0.44, 30, w * 0.42, h * 0.44, w * 0.72);
  grad.addColorStop(0, "#234735");
  grad.addColorStop(0.62, "#193426");
  grad.addColorStop(1, "#11241a");
  ctx.fillStyle = "#5e371b";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = grad;
  ctx.fillRect(22, 22, w - 44, h - 86);
  // Wooden chalk ledge
  ctx.fillStyle = "#8b5932";
  ctx.fillRect(20, h - 66, w - 40, 12);
  ctx.fillStyle = "#633a1d";
  ctx.fillRect(16, h - 54, w - 32, 34);
  // White chalk & felt eraser on lower left ledge
  ctx.fillStyle = "#2c2e33";
  ctx.fillRect(88, h - 76, 98, 12);
  ctx.fillStyle = "#8d5a34";
  ctx.fillRect(84, h - 88, 106, 14);
  ctx.fillStyle = "#f7f5eb";
  ctx.fillRect(216, h - 75, 58, 9);
  ctx.fillStyle = "#f4e08e";
  ctx.fillRect(284, h - 74, 42, 9);
}

async function main() {
  mkdirSync(POSES_DIR, { recursive: true });
  mkdirSync(FLOW_REFS_DIR, { recursive: true });

  const [callCutout, irisL, irisR, lashes, browL, browR, mouthX, pose3qRaw, presImg] = await Promise.all([
    loadImage(join(REPO_ROOT, CALL_CUTOUT_REL)),
    loadImage(join(REPO_ROOT, CALL_IRIS_L_REL)),
    loadImage(join(REPO_ROOT, CALL_IRIS_R_REL)),
    loadImage(join(REPO_ROOT, CALL_LASHES_REL)),
    loadImage(join(REPO_ROOT, CALL_BROW_L_REL)),
    loadImage(join(REPO_ROOT, CALL_BROW_R_REL)),
    loadImage(join(REPO_ROOT, CALL_MOUTH_X_REL)),
    loadImage(join(REPO_ROOT, POSE_3Q_RIGHT_REL)),
    loadImage(join(REPO_ROOT, PRESENTING_REL)),
  ]);

  const savedParts = [];
  function writePng(subDir, filename, canvas, role, meta = {}) {
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
      ...meta,
    });
    return canvas;
  }

  // 1. Pose Front (complete halo-free front torso-up portrait with eyes, brows & gentle rest smile)
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

  // 2. Cut out 3/4 right pose against neutral #dbdbdb gray and normalize torso-up scale 1:1 with front
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

  // 3. Pose 3/4 Left (mirrored cleanly toward left chalkboard teaching area)
  const pose3qLeft = createCanvas(W, H);
  const plCtx = pose3qLeft.getContext("2d");
  plCtx.translate(W, 0);
  plCtx.scale(-1, 1);
  plCtx.drawImage(pose3qRight, 0, 0);
  writePng(POSES_DIR, "pose-3q-left.png", pose3qLeft, "pose-3q-left");

  // 4. Articulated painted arm + chalk hand + eraser hand (elbow at ~(176, 286), hand up-left)
  const armUpper = writePng(POSES_DIR, "arm-upper.png", buildUpperArmCanvas(), "arm-upper", {
    pivot: { x: 85, y: 36 },
    elbow: { x: 92, y: 216 },
  });

  const baseForearm = extractPaintedPresentingArm(presImg);

  // Forearm holding white chalk stick (extending neatly up-left past thumb & index finger)
  const chalkForearm = createCanvas(240, 330);
  const cfCtx = chalkForearm.getContext("2d");
  cfCtx.drawImage(baseForearm, 0, 0);
  // White storybook chalk stick held neatly by upper fingertips
  cfCtx.save();
  cfCtx.translate(64, 72);
  cfCtx.rotate(-0.55);
  cfCtx.fillStyle = "#f7f5eb";
  cfCtx.strokeStyle = "#8a8274";
  cfCtx.lineWidth = 2.2;
  cfCtx.beginPath();
  cfCtx.roundRect(-8, -46, 15, 58, 5);
  cfCtx.fill();
  cfCtx.stroke();
  cfCtx.restore();
  // Thumb/finger curl overlap holding the chalk stem cleanly
  cfCtx.save();
  cfCtx.fillStyle = "#ffd6a3";
  cfCtx.strokeStyle = "#a86122";
  cfCtx.lineWidth = 2.4;
  cfCtx.beginPath();
  cfCtx.ellipse(76, 86, 15, 11, -0.3, 0, Math.PI * 2);
  cfCtx.fill();
  cfCtx.stroke();
  cfCtx.restore();
  writePng(POSES_DIR, "arm-forearm-chalk.png", chalkForearm, "arm-forearm-chalk", {
    elbowPivot: { x: 174, y: 264 },
    chalkTip: { x: 38, y: 32 },
  });

  // Forearm holding traditional wood-and-felt chalkboard eraser
  const eraserForearm = createCanvas(240, 330);
  const efCtx = eraserForearm.getContext("2d");
  efCtx.drawImage(baseForearm, 0, 0);
  efCtx.save();
  efCtx.translate(82, 68);
  efCtx.rotate(-0.22);
  efCtx.fillStyle = "#2c2e33";
  efCtx.fillRect(-44, -22, 88, 14);
  efCtx.fillStyle = "#8d5a34";
  efCtx.strokeStyle = "#462611";
  efCtx.lineWidth = 2.4;
  efCtx.beginPath();
  efCtx.roundRect(-48, -8, 96, 22, 5);
  efCtx.fill();
  efCtx.stroke();
  efCtx.restore();
  writePng(POSES_DIR, "arm-forearm-eraser.png", eraserForearm, "arm-forearm-eraser", {
    elbowPivot: { x: 174, y: 264 },
    eraserCenter: { x: 76, y: 52 },
  });

  // 5. Generate clean Google Flow start/end reference frames on the deep-green chalkboard
  const flowSpecs = [
    ["ref-listening.png", frontCanvas, null],
    ["ref-turn-left.png", pose3qLeft, null],
    ["ref-writing.png", pose3qLeft, chalkForearm],
    ["ref-erasing.png", pose3qLeft, eraserForearm],
  ];
  for (const [fname, poseC, toolArm] of flowSpecs) {
    const fc = createCanvas(1280, 800);
    const flc = fc.getContext("2d");
    drawGreenChalkboardBackdrop(flc, 1280, 800);
    if (toolArm) {
      // Shoulder emerges cleanly behind torso edge toward left chalkboard
      flc.save();
      flc.translate(820, 420);
      flc.rotate(0.48);
      flc.drawImage(armUpper, -85, -36, 150, 220);
      flc.restore();
    }
    flc.drawImage(poseC, 465, 22, 920, 595);
    if (toolArm) {
      flc.save();
      flc.translate(730, 540);
      flc.rotate(-0.52);
      flc.drawImage(toolArm, -174, -264);
      flc.restore();
    }
    writePng(FLOW_REFS_DIR, fname, fc, "flow-reference");
  }

  // 6. Build 6-tile visual QA sheet `pose-approval-sheet.png` over deep-green slate
  const qa = createCanvas(1260, 760);
  const qctx = qa.getContext("2d");
  const tiles = [
    ["1. Front Cutout", (ctx, ox, oy, tw, th) => ctx.drawImage(frontCanvas, 80, 0, 780, H, ox + 20, oy + 12, tw - 40, th - 20)],
    ["2. 3/4 Turn Left (Board)", (ctx, ox, oy, tw, th) => ctx.drawImage(pose3qLeft, 120, 0, 780, H, ox + 20, oy + 12, tw - 40, th - 20)],
    ["3. 3/4 Turn Right", (ctx, ox, oy, tw, th) => ctx.drawImage(pose3qRight, 120, 0, 780, H, ox + 20, oy + 12, tw - 40, th - 20)],
    ["4. Upper Arm + Chalk Hand", (ctx, ox, oy, tw, th) => {
      ctx.drawImage(armUpper, ox + 205, oy + 135, 115, 165);
      ctx.drawImage(chalkForearm, ox + 75, oy + 35, 190, 260);
    }],
    ["5. Forearm + Eraser Hand", (ctx, ox, oy, tw, th) => {
      ctx.drawImage(armUpper, ox + 205, oy + 135, 115, 165);
      ctx.drawImage(eraserForearm, ox + 75, oy + 35, 190, 260);
    }],
    ["6. 3/4 Left + IK Writing Pose", (ctx, ox, oy, tw, th) => {
      // Shoulder emerges cleanly from her left shoulder reaching out onto the chalkboard!
      ctx.save();
      ctx.translate(ox + 195, oy + 260);
      ctx.rotate(0.55);
      ctx.drawImage(armUpper, -45, -18, 86, 130);
      ctx.restore();
      ctx.drawImage(pose3qLeft, 150, 0, 780, H, ox + 84, oy + 16, tw - 76, th - 22);
      ctx.save();
      ctx.translate(ox + 148, oy + 332);
      ctx.rotate(-0.56);
      ctx.drawImage(chalkForearm, -135, -205, 185, 252);
      ctx.restore();
    }],
  ];

  tiles.forEach(([label, drawTile], idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const tw = 420;
    const th = 380;
    const ox = col * tw;
    const oy = row * th;
    const g = qctx.createRadialGradient(ox + tw * 0.5, oy + th * 0.45, 20, ox + tw * 0.5, oy + th * 0.45, tw * 0.7);
    g.addColorStop(0, "#234735");
    g.addColorStop(1, "#11241a");
    qctx.fillStyle = g;
    qctx.fillRect(ox, oy, tw, th);
    qctx.strokeStyle = "#5e371b";
    qctx.lineWidth = 4;
    qctx.strokeRect(ox + 2, oy + 2, tw - 4, th - 4);
    drawTile(qctx, ox, oy, tw, th);
    qctx.fillStyle = "rgba(18, 28, 22, 0.86)";
    qctx.fillRect(ox + 12, oy + th - 36, 250, 24);
    qctx.fillStyle = "#f4efe2";
    qctx.font = "bold 14px sans-serif";
    qctx.fillText(label, ox + 20, oy + th - 19);
  });

  writeFileSync(join(POSES_DIR, "pose-approval-sheet.png"), qa.toBuffer("image/png"));

  writeFileSync(
    join(OUT_ROOT, "hybrid-manifest.json"),
    JSON.stringify(
      {
        version: 1,
        status: "pending-owner-approval",
        approved: false,
        note: "rive-cli is Apple Silicon only on macOS (x86_64 unsupported); native WebGL/Canvas 2D mesh skinning + 2-bone IK + Google Flow drop-in hybrid rig used cleanly at $0.",
        parts: savedParts,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`Generated ${savedParts.length} hybrid rig assets + pose-approval-sheet.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
