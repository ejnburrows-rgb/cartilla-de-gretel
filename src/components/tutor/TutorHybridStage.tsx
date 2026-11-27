/**
 * TutorHybridStage — 60fps Triangulated Mesh Skinning + 2-Bone IK + Multi-Angle Chalkboard Stage.
 *
 * Implements the $0 Hybrid Animation Architecture:
 * - Authentic vintage oak-framed deep-green chalkboard with subtle grain, faint guide line,
 *   permanent upper-left handwritten "Cartilla de Gretel", chalk sticks, felt eraser, and
 *   dynamic chalk strokes + erase wipes synchronized directly to the moving IK chalk/eraser tip.
 * - Canvas 2D textured triangle mesh (`deformGretelMesh`) deforming smoothly across chest
 *   breathing, head tilts/nods, 2.5D yaw, and lagged golden hair curls (zero boxy bounding swaps).
 * - Smooth cross-dissolve between the live composited front portrait (moving clipped irises,
 *   5-stage eyelids, continuous brows, coarticulated Rhubarb `A–G`/`X` mouths) and the
 *   3/4-left chalkboard-facing pose (`pose-3q-left.png`).
 * - Analytical 2-bone Inverse Kinematics (`solveTwoBoneIK`) driving `arm-upper.png` and
 *   `arm-forearm-chalk.png` / `arm-forearm-eraser.png` from behind her denim strap out to the
 *   live slate coordinates.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { splitSpanishSyllables } from "@/lib/tutor-chalkboard";
import {
  computeChalkboardRigFrame,
  resolveCoarticulatedViseme,
  type ChalkboardGazeTarget,
  type ChalkboardRigExpression,
  type EyelidStage,
} from "@/lib/tutor-chalkboard-rig";
import {
  evaluateHybridDirectorAtTime,
  type HybridDirectorFrame,
} from "@/lib/tutor-hybrid-director";
import {
  buildGretelBodyMesh,
  deformGretelMesh,
  solveTwoBoneIK,
} from "@/lib/tutor-mesh-rig";
import type { VisemeCue } from "@/lib/tutor-puppet-layers";
import type { GretelState } from "@/components/gretel/gretelMachine";
import type { TutorLayoutMode } from "@/lib/tutor-session";

const RIG_ASSET_BASE = "/cartilla/images/gretel/tutor/chalkboard-candidates";
const HYBRID_ASSET_BASE = "/cartilla/images/gretel/tutor/hybrid-candidates/poses";

const REQUIRED_IMAGE_MAP = {
  faceBase: `${RIG_ASSET_BASE}/gretel-face-base.png`,
  irisL: `${RIG_ASSET_BASE}/iris-left.png`,
  irisR: `${RIG_ASSET_BASE}/iris-right.png`,
  lashes: `${RIG_ASSET_BASE}/eyelashes-frame.png`,
  lid25: `${RIG_ASSET_BASE}/lid-25.png`,
  lid50: `${RIG_ASSET_BASE}/lid-50.png`,
  lid75: `${RIG_ASSET_BASE}/lid-75.png`,
  lid100: `${RIG_ASSET_BASE}/lid-100.png`,
  browL: `${RIG_ASSET_BASE}/brow-left.png`,
  browR: `${RIG_ASSET_BASE}/brow-right.png`,
  mouthX: `${RIG_ASSET_BASE}/mouth-X.png`,
  mouthA: `${RIG_ASSET_BASE}/mouth-A.png`,
  mouthB: `${RIG_ASSET_BASE}/mouth-B.png`,
  mouthC: `${RIG_ASSET_BASE}/mouth-C.png`,
  mouthD: `${RIG_ASSET_BASE}/mouth-D.png`,
  mouthE: `${RIG_ASSET_BASE}/mouth-E.png`,
  mouthF: `${RIG_ASSET_BASE}/mouth-F.png`,
  mouthG: `${RIG_ASSET_BASE}/mouth-G.png`,
  pose3qLeft: `${HYBRID_ASSET_BASE}/pose-3q-left.png`,
  armUpper: `${HYBRID_ASSET_BASE}/arm-upper.png`,
  armForearmChalk: `${HYBRID_ASSET_BASE}/arm-forearm-chalk.png`,
  armForearmEraser: `${HYBRID_ASSET_BASE}/arm-forearm-eraser.png`,
} as const;

type AssetKey = keyof typeof REQUIRED_IMAGE_MAP;
type LoadedAssets = Record<AssetKey, HTMLImageElement>;

const MESH_COLS = 14;
const MESH_ROWS = 10;
const POSE_W = 1024;
const POSE_H = 662;
const STAGE_W = 1600;
const STAGE_H = 1000;

export interface TutorHybridStageProps {
  readonly state: GretelState;
  readonly playbackTime?: number | null;
  readonly isSpeaking?: boolean;
  readonly isPaused?: boolean;
  readonly isMuted?: boolean;
  readonly visemeTimeline?: readonly VisemeCue[];
  readonly propViseme?: string;
  readonly lessonWord?: string;
  readonly focusLetter?: string;
  readonly chalkboardMode?: "model" | "hint" | "correction" | "celebrate" | "idle";
  readonly expression?: ChalkboardRigExpression;
  readonly gazeTarget?: ChalkboardGazeTarget;
  readonly layoutMode?: TutorLayoutMode;
  readonly demoTimeSec?: number | null;
  readonly className?: string;
  readonly onReady?: () => void;
  readonly onError?: () => void;
}

function mapStateToRigExpression(
  state: GretelState,
  isSpeaking: boolean,
): ChalkboardRigExpression {
  if (isSpeaking) return "speaking";
  switch (state) {
    case "listening":
      return "listening";
    case "help":
      return "thinking";
    case "cheering":
      return "encouraging";
    case "pointing":
    case "teaching":
      return "demonstrating";
    case "gentle-error":
      return "gentle-error";
    case "waving":
    case "exiting":
      return "smiling";
    default:
      return "neutral";
  }
}

function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx0: number,
  sy0: number,
  sx1: number,
  sy1: number,
  sx2: number,
  sy2: number,
  dx0: number,
  dy0: number,
  dx1: number,
  dy1: number,
  dx2: number,
  dy2: number,
): void {
  const denom = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (Math.abs(denom) < 1e-4) return;

  // Expand clip triangle (1.45px outward from centroid) to eliminate Canvas 2D AA hairlines
  const cx = (dx0 + dx1 + dx2) / 3;
  const cy = (dy0 + dy1 + dy2) / 3;
  const expand = (px: number, py: number): [number, number] => {
    const vx = px - cx;
    const vy = py - cy;
    const len = Math.hypot(vx, vy) || 1;
    return [px + (vx / len) * 1.45, py + (vy / len) * 1.45];
  };
  const [ex0, ey0] = expand(dx0, dy0);
  const [ex1, ey1] = expand(dx1, dy1);
  const [ex2, ey2] = expand(dx2, dy2);

  const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const b = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const c = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const d = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const e =
    (dx0 * (sx1 * sy2 - sx2 * sy1) +
      dx1 * (sx2 * sy0 - sx0 * sy2) +
      dx2 * (sx0 * sy1 - sx1 * sy0)) /
    denom;
  const f =
    (dy0 * (sx1 * sy2 - sx2 * sy1) +
      dy1 * (sx2 * sy0 - sx0 * sy2) +
      dy2 * (sx0 * sy1 - sx1 * sy0)) /
    denom;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ex0, ey0);
  ctx.lineTo(ex1, ey1);
  ctx.lineTo(ex2, ey2);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function drawDeformedMesh(
  ctx: CanvasRenderingContext2D,
  meshScratch: HTMLCanvasElement,
  img: CanvasImageSource,
  mesh: ReturnType<typeof buildGretelBodyMesh>,
  coords: Float32Array,
  originX: number,
  originY: number,
  scale: number,
  alpha: number,
): void {
  if (alpha <= 0.01) return;
  const { vertices, indices } = mesh;
  const targetCtx = alpha >= 0.99 ? ctx : meshScratch.getContext("2d");
  if (!targetCtx) return;
  if (alpha < 0.99) {
    targetCtx.clearRect(0, 0, STAGE_W, STAGE_H);
  }
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    const v0 = vertices[i0];
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    drawTexturedTriangle(
      targetCtx,
      img,
      v0.x0,
      v0.y0,
      v1.x0,
      v1.y0,
      v2.x0,
      v2.y0,
      originX + coords[i0 * 2] * scale,
      originY + coords[i0 * 2 + 1] * scale,
      originX + coords[i1 * 2] * scale,
      originY + coords[i1 * 2 + 1] * scale,
      originX + coords[i2 * 2] * scale,
      originY + coords[i2 * 2 + 1] * scale,
    );
  }
  if (alpha < 0.99) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(meshScratch, 0, 0);
    ctx.restore();
  }
}

function lidImageForStage(
  assets: LoadedAssets,
  stage: EyelidStage,
): HTMLImageElement | null {
  switch (stage) {
    case 25:
      return assets.lid25;
    case 50:
      return assets.lid50;
    case 75:
      return assets.lid75;
    case 100:
      return assets.lid100;
    default:
      return null;
  }
}

function mouthImageForShape(
  assets: LoadedAssets,
  shape: string,
): HTMLImageElement {
  switch (shape) {
    case "A":
      return assets.mouthA;
    case "B":
      return assets.mouthB;
    case "C":
      return assets.mouthC;
    case "D":
      return assets.mouthD;
    case "E":
      return assets.mouthE;
    case "F":
      return assets.mouthF;
    case "G":
      return assets.mouthG;
    default:
      return assets.mouthX;
  }
}

/**
 * Composites Gretel's live animated front portrait onto a 1024×662 offscreen canvas
 * so triangle mesh skinning moves pupils, eyelids, brows, and Rhubarb visemes seamlessly.
 */
function renderFrontFaceCanvas(
  ctx: CanvasRenderingContext2D,
  assets: LoadedAssets,
  rigFrame: ReturnType<typeof computeChalkboardRigFrame>,
  viseme: ReturnType<typeof resolveCoarticulatedViseme>,
): void {
  ctx.clearRect(0, 0, POSE_W, POSE_H);
  ctx.drawImage(assets.faceBase, 0, 0);

  // Left iris clipped to aperture (M 442 300 Q 464 282 489 299 Q 467 315 442 300 Z)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(442, 300);
  ctx.quadraticCurveTo(464, 282, 489, 299);
  ctx.quadraticCurveTo(467, 315, 442, 300);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(assets.irisL, rigFrame.pupilX, rigFrame.pupilY);
  ctx.restore();

  // Right iris clipped to aperture (M 555 316 Q 579 298 604 314 Q 581 330 555 316 Z)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(555, 316);
  ctx.quadraticCurveTo(579, 298, 604, 314);
  ctx.quadraticCurveTo(581, 330, 555, 316);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(assets.irisR, rigFrame.pupilX, rigFrame.pupilY);
  ctx.restore();

  // Crisp upper/lower lash aperture frame
  ctx.drawImage(assets.lashes, 0, 0);

  // 5-stage painted eyelid blink overlay
  const lidImg = lidImageForStage(assets, rigFrame.lidStage);
  if (lidImg) {
    ctx.drawImage(lidImg, 0, 0);
  }

  // Independent continuous eyebrows
  ctx.save();
  ctx.translate(474, 232);
  ctx.rotate((rigFrame.leftBrowTiltDeg * Math.PI) / 180);
  ctx.translate(-474, -232 + rigFrame.leftBrowY);
  ctx.drawImage(assets.browL, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(598, 248);
  ctx.rotate((rigFrame.rightBrowTiltDeg * Math.PI) / 180);
  ctx.translate(-598, -248 + rigFrame.rightBrowY);
  ctx.drawImage(assets.browR, 0, 0);
  ctx.restore();

  // Coarticulated Rhubarb phonetic mouths (dual-layer crossfade, zero flicker)
  ctx.save();
  ctx.globalAlpha = viseme.primaryOpacity;
  ctx.drawImage(mouthImageForShape(assets, viseme.primaryShape), 0, 0);
  ctx.restore();

  if (viseme.secondaryShape && viseme.secondaryOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = viseme.secondaryOpacity;
    ctx.drawImage(mouthImageForShape(assets, viseme.secondaryShape), 0, 0);
    ctx.restore();
  }
}

export function TutorHybridStage({
  state,
  playbackTime = null,
  isSpeaking = false,
  isPaused = false,
  isMuted = false,
  visemeTimeline,
  propViseme = "X",
  lessonWord = "abeja",
  focusLetter,
  expression,
  gazeTarget,
  layoutMode = "call",
  demoTimeSec = null,
  className,
  onReady,
  onError,
}: TutorHybridStageProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId().replaceAll(":", "");
  const slateGradId = `hyb-slate-${baseId}`;
  const slateNoiseId = `hyb-noise-${baseId}`;
  const chalkFilterId = `hyb-chalk-${baseId}`;
  const writeClipId = `hyb-write-${baseId}`;
  const scratchClipId = `hyb-scratch-${baseId}`;

  const [assets, setAssets] = useState<LoadedAssets | null>(null);
  const [boardState, setBoardState] = useState<HybridDirectorFrame>(() =>
    evaluateHybridDirectorAtTime({
      timeSec: 0.4,
      word: lessonWord || "abeja",
      reducedMotion,
    }),
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const meshScratchRef = useRef<HTMLCanvasElement | null>(null);
  const meshRef = useRef(buildGretelBodyMesh(POSE_W, POSE_H, MESH_COLS, MESH_ROWS));

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const propsRef = useRef({
    state,
    playbackTime,
    isSpeaking,
    isPaused,
    isMuted,
    visemeTimeline,
    propViseme,
    lessonWord,
    expression,
    gazeTarget,
    demoTimeSec,
    reducedMotion,
  });
  propsRef.current = {
    state,
    playbackTime,
    isSpeaking,
    isPaused,
    isMuted,
    visemeTimeline,
    propViseme,
    lessonWord,
    expression,
    gazeTarget,
    demoTimeSec,
    reducedMotion,
  };

  // Preload all cutout & articulated hybrid pose/arm sprites before drawing
  useEffect(() => {
    let alive = true;
    const entries = Object.entries(REQUIRED_IMAGE_MAP) as [AssetKey, string][];
    Promise.all(
      entries.map(
        ([key, src]) =>
          new Promise<[AssetKey, HTMLImageElement]>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve([key, img]);
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
          }),
      ),
    )
      .then((loaded) => {
        if (!alive) return;
        const map = Object.fromEntries(loaded) as LoadedAssets;
        setAssets(map);
        onReadyRef.current?.();
      })
      .catch(() => {
        if (!alive) return;
        onErrorRef.current?.();
      });
    return () => {
      alive = false;
    };
  }, []);

  // Smoothed continuous live parameters when driven by regular tutor session states
  const smoothTurnRef = useRef(0);
  const smoothArmRef = useRef(0);
  const liveTeachStartRef = useRef<number | null>(null);
  const boardSyncTickRef = useRef(0);

  useEffect(() => {
    if (!assets) return;
    if (!frontCanvasRef.current) {
      const off = document.createElement("canvas");
      off.width = POSE_W;
      off.height = POSE_H;
      frontCanvasRef.current = off;
    }
    if (!meshScratchRef.current) {
      const scratch = document.createElement("canvas");
      scratch.width = STAGE_W;
      scratch.height = STAGE_H;
      meshScratchRef.current = scratch;
    }

    let rafId = 0;
    let lastClockMs = performance.now();

    const step = (nowMs: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (nowMs - lastClockMs) / 1000));
      lastClockMs = nowMs;
      const p = propsRef.current;
      const activeWord = p.lessonWord?.trim() || "abeja";
      const clockSec = nowMs / 1000;

      let frame: HybridDirectorFrame;
      if (typeof p.demoTimeSec === "number") {
        frame = evaluateHybridDirectorAtTime({
          timeSec: p.demoTimeSec,
          word: activeWord,
          reducedMotion: p.reducedMotion,
        });
      } else {
        // Organic live session state mapping with smooth continuous transitions
        const isWritingState = p.state === "teaching" || p.state === "pointing";
        if (isWritingState) {
          if (liveTeachStartRef.current === null) {
            liveTeachStartRef.current = nowMs;
          }
          const elapsed = ((nowMs - liveTeachStartRef.current) / 1000) % 5.6;
          // Run turn->write->hold cleanly while in teaching state
          frame = evaluateHybridDirectorAtTime({
            timeSec: 2.5 + Math.min(3.6, elapsed),
            word: activeWord,
            reducedMotion: p.reducedMotion,
          });
        } else {
          liveTeachStartRef.current = null;
          const targetTurn = 0;
          smoothTurnRef.current += (targetTurn - smoothTurnRef.current) * Math.min(1, dt * 7);
          smoothArmRef.current += (0 - smoothArmRef.current) * Math.min(1, dt * 7);
          const syllables = splitSpanishSyllables(activeWord);
          const expr = p.expression ?? mapStateToRigExpression(p.state, p.isSpeaking);
          const gaze: ChalkboardGazeTarget =
            p.gazeTarget ?? (p.state === "help" ? "flipchart-right" : "student");
          frame = {
            phase: p.isSpeaking ? "speak_rhubarb" : "listen_1",
            phaseLabelEs: p.isSpeaking ? "Hablando" : "Escuchando",
            turnBlend: smoothTurnRef.current,
            expression: expr,
            gazeTarget: gaze,
            armRaise: smoothArmRef.current,
            activeTool: "none",
            ikTargetStage: { x: 640, y: 740 },
            writeWordProgress: p.state === "talking" || p.state === "cheering" ? 1 : 0,
            underlineProgress: p.state === "talking" || p.state === "cheering" ? 1 : 0,
            circleProgress: p.state === "cheering" ? 1 : 0,
            syllableArcProgress: syllables.map(() => (p.state === "cheering" ? 1 : 0)),
            scratchNoteVisibleProgress: 0,
            scratchEraseProgress: 1,
            audioSpeechTimeSec: p.playbackTime,
            isSpeakingAudio: p.isSpeaking,
          };
        }
      }

      // Compute facial rig + coarticulated Rhubarb mouth shapes
      const activeAudioSec =
        frame.audioSpeechTimeSec !== null ? frame.audioSpeechTimeSec : p.playbackTime;
      const activeSpeaking =
        frame.audioSpeechTimeSec !== null ? frame.isSpeakingAudio : p.isSpeaking;

      const viseme = resolveCoarticulatedViseme({
        currentTime: activeAudioSec,
        timeline: p.visemeTimeline,
        isSpeaking: activeSpeaking,
        isPaused: p.isPaused,
        isMuted: p.isMuted,
        reducedMotion: p.reducedMotion,
      });

      const rigFrame = computeChalkboardRigFrame({
        timeSec: clockSec,
        expression: frame.expression,
        gazeTarget: frame.gazeTarget,
        isSpeaking: activeSpeaking,
        blinkElapsedMs: (clockSec * 1000) % 3900,
        reducedMotion: p.reducedMotion,
      });

      // Sync lightweight SVG chalk progress at ~30 Hz without re-rendering full DOM needlessly
      if (nowMs - boardSyncTickRef.current > 32) {
        boardSyncTickRef.current = nowMs;
        setBoardState(frame);
      }

      // Render animated front face cutout -> mesh deform + pose blend + 2-bone IK onto main canvas
      const mainCanvas = canvasRef.current;
      const frontCanvas = frontCanvasRef.current;
      if (mainCanvas && frontCanvas) {
        const fctx = frontCanvas.getContext("2d");
        const mctx = mainCanvas.getContext("2d");
        if (fctx && mctx) {
          renderFrontFaceCanvas(fctx, assets, rigFrame, viseme);

          mctx.clearRect(0, 0, STAGE_W, STAGE_H);

          const scale = 1.12;
          const leanLeftShift =
            frame.armRaise > 0.05
              ? Math.max(0, 340 - frame.ikTargetStage.x) * 0.25 * frame.armRaise
              : 0;
          const centerX = 1040 - frame.turnBlend * 195 - leanLeftShift;
          const originX = centerX - (POSE_W * scale) * 0.5;
          const originY = 900 - POSE_H * scale + 14 - frame.armRaise * 18;

          const meshCoords = deformGretelMesh(meshRef.current, {
            breathePhase: p.reducedMotion ? 0 : Math.sin((clockSec * 2 * Math.PI) / 4.1),
            headTiltDeg: rigFrame.headTiltDeg,
            headYaw: -frame.turnBlend * 0.85,
            headNodPx: frame.expression === "encouraging" ? Math.sin(clockSec * 5.2) * 3.2 : 0,
            hairSwayLeftDeg: rigFrame.hairLeftDeg,
            hairSwayRightDeg: rigFrame.hairRightDeg,
          });

          // 1. Soft slate drop shadow so Gretel sits realistically in front of the green chalkboard
          mctx.save();
          const shadowGrad = mctx.createRadialGradient(
            centerX + 26,
            610,
            70,
            centerX + 26,
            610,
            450,
          );
          shadowGrad.addColorStop(0, "rgba(7, 22, 14, 0.44)");
          shadowGrad.addColorStop(1, "rgba(7, 22, 14, 0)");
          mctx.fillStyle = shadowGrad;
          mctx.fillRect(centerX - 440, 150, 920, 760);
          mctx.restore();

          // 2. Active articulated 2-bone IK writing / erasing arm reaching behind chest/strap
          if (frame.armRaise > 0.02 && frame.activeTool !== "none") {
            const shoulder = {
              x: originX + 0.355 * POSE_W * scale,
              y: originY + 0.775 * POSE_H * scale,
            };
            const armScale = 1.44;
            const upperLen = 180.1 * armScale;
            const isEraser = frame.activeTool === "eraser";
            const forearmLen = (isEraser ? 233.6 : 268.9) * armScale;

            const ik = solveTwoBoneIK({
              shoulder,
              target: frame.ikTargetStage,
              upperLen,
              forearmLen,
              bendSign: -1,
            });

            // Soft chalk/eraser arm cast shadow onto green slate
            mctx.save();
            mctx.strokeStyle = "rgba(8, 24, 16, 0.32)";
            mctx.lineWidth = 76;
            mctx.lineCap = "round";
            mctx.lineJoin = "round";
            mctx.beginPath();
            mctx.moveTo(shoulder.x + 14, shoulder.y + 18);
            mctx.lineTo(ik.elbow.x + 14, ik.elbow.y + 18);
            mctx.lineTo(ik.hand.x + 12, ik.hand.y + 16);
            mctx.stroke();
            mctx.restore();

            // Upper sleeve + arm rotated from shoulder pivot (85, 36) toward elbow
            mctx.save();
            mctx.globalAlpha = Math.min(1, frame.armRaise * 1.35);
            mctx.translate(shoulder.x, shoulder.y);
            mctx.rotate(ik.upperAngleRad - 1.532);
            mctx.scale(armScale, armScale);
            mctx.drawImage(assets.armUpper, -85, -36);
            mctx.restore();

            // Forearm + chalk or eraser rotated from rounded elbow cap (174, 264) toward hand target
            const forearmImg = isEraser ? assets.armForearmEraser : assets.armForearmChalk;
            const restAngle = isEraser ? -2.0041 : -2.1008;
            mctx.save();
            mctx.globalAlpha = Math.min(1, frame.armRaise * 1.35);
            mctx.translate(ik.elbow.x, ik.elbow.y);
            mctx.rotate(ik.forearmAngleRad - restAngle);
            mctx.scale(armScale, armScale);
            mctx.drawImage(forearmImg, -174, -264);
            mctx.restore();

            // Subtle chalk dust halo strictly under moving chalk tip / felt eraser contact point
            if (frame.phase === "write_demonstrate" || frame.phase === "erase_board") {
              mctx.save();
              const dustGrad = mctx.createRadialGradient(
                ik.hand.x,
                ik.hand.y,
                2,
                ik.hand.x,
                ik.hand.y,
                isEraser ? 52 : 24,
              );
              dustGrad.addColorStop(0, isEraser ? "rgba(244,241,228,0.22)" : "rgba(255,252,235,0.28)");
              dustGrad.addColorStop(1, "rgba(244,241,228,0)");
              mctx.fillStyle = dustGrad;
              mctx.beginPath();
              mctx.arc(ik.hand.x, ik.hand.y, isEraser ? 52 : 24, 0, Math.PI * 2);
              mctx.fill();
              mctx.restore();
            }
          }

          // 3. Smooth mesh-skinned 2.5D turn transition (aligns head & red bow center across crossover so no double-head ghosting occurs)
          const smoothTurn = Math.max(
            0,
            Math.min(1, (frame.turnBlend - 0.25) / 0.5),
          );
          const turnCross = smoothTurn * smoothTurn * (3 - 2 * smoothTurn);
          const frontAlpha = 1 - turnCross;
          const turnAlpha = turnCross;
          const meshScratch = meshScratchRef.current!;
          if (frontAlpha > 0.01) {
            drawDeformedMesh(
              mctx,
              meshScratch,
              frontCanvas,
              meshRef.current,
              meshCoords,
              originX - frame.turnBlend * 28,
              originY,
              scale,
              frontAlpha,
            );
          }
          if (turnAlpha > 0.01) {
            drawDeformedMesh(
              mctx,
              meshScratch,
              assets.pose3qLeft,
              meshRef.current,
              meshCoords,
              originX + (1 - frame.turnBlend) * 34,
              originY,
              scale,
              turnAlpha,
            );
          }
        }
      }

      if (!p.reducedMotion) {
        rafId = requestAnimationFrame(step);
      }
    };

    if (propsRef.current.reducedMotion) {
      step(performance.now());
      return undefined;
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [assets, reducedMotion]);

  const syllables = useMemo(
    () => splitSpanishSyllables(lessonWord || "abeja"),
    [lessonWord],
  );
  const displayWord = (lessonWord || "abeja").trim();
  const focusTarget = (focusLetter || syllables[0] || displayWord.slice(0, 1)).trim();
  const syllableText = syllables.join("   ");

  return (
    <div
      data-tutor-hybrid-stage=""
      data-hybrid-phase={boardState.phase}
      data-hybrid-turn={boardState.turnBlend.toFixed(2)}
      data-hybrid-tool={boardState.activeTool}
      data-layout-mode={layoutMode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={className ? `relative h-full w-full overflow-hidden bg-[#10251c] ${className}` : "relative h-full w-full overflow-hidden bg-[#10251c]"}
    >
      {/* Vintage Oak-Framed Chalkboard Layer (synchronized cleanly at 1600x1000) */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Gretel enseñando junto a su pizarra Cartilla de Gretel"
        className="absolute inset-0 h-full w-full select-none"
      >
        <defs>
          <radialGradient id={slateGradId} cx="42%" cy="44%" r="68%">
            <stop offset="0%" stopColor="#1b4331" />
            <stop offset="65%" stopColor="#143325" />
            <stop offset="100%" stopColor="#0d2319" />
          </radialGradient>
          <filter id={slateNoiseId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="2" seed="7" result="n" />
            <feColorMatrix
              type="matrix"
              in="n"
              values="0 0 0 0 0.92 0 0 0 0 0.96 0 0 0 0 0.90 0 0 0 0.045 0"
            />
          </filter>
          <filter id={chalkFilterId} x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="2" seed="3" result="c" />
            <feDisplacementMap in="SourceGraphic" in2="c" scale="1.6" />
          </filter>
          <clipPath id={writeClipId}>
            <rect x="92" y="275" width={470 * boardState.writeWordProgress} height="130" />
          </clipPath>
          <clipPath id={scratchClipId}>
            <rect
              x={405 + 235 * boardState.scratchEraseProgress}
              y="196"
              width={Math.max(0, 235 * (1 - boardState.scratchEraseProgress))}
              height="86"
            />
          </clipPath>
        </defs>

        {/* Outer vintage oak wooden border */}
        <rect x="0" y="0" width="1600" height="1000" rx="22" fill="#5e371b" />
        <rect x="10" y="10" width="1580" height="980" rx="16" fill="none" stroke="#8a5630" strokeWidth="18" />
        <rect x="22" y="22" width="1556" height="956" rx="10" fill="none" stroke="#462611" strokeWidth="8" />

        {/* Deep green slate surface */}
        <rect x="28" y="28" width="1544" height="872" rx="6" fill={`url(#${slateGradId})`} />
        <rect x="28" y="28" width="1544" height="872" rx="6" filter={`url(#${slateNoiseId})`} />
        <ellipse cx="330" cy="410" rx="250" ry="125" fill="rgba(236, 242, 230, 0.032)" />
        <line
          x1="96"
          y1="478"
          x2="580"
          y2="478"
          stroke="rgba(238, 242, 228, 0.085)"
          strokeWidth="2"
          strokeDasharray="10 10"
        />

        {/* Upper-left handwritten Cartilla de Gretel title */}
        <g filter={`url(#${chalkFilterId})`}>
          <text
            x="92"
            y="122"
            fill="#f4f1e4"
            fillOpacity="0.94"
            fontFamily="'Caveat', cursive"
            fontSize="74"
            fontWeight="700"
          >
            Cartilla de Gretel
          </text>
          <path
            d="M 96 140 Q 256 148 446 136"
            fill="none"
            stroke="#f4f1e4"
            strokeOpacity="0.48"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Auxiliary slate scratch note wiped by physical felt eraser */}
        {boardState.scratchNoteVisibleProgress > 0.02 && boardState.scratchEraseProgress < 0.99 ? (
          <g clipPath={`url(#${scratchClipId})`} filter={`url(#${chalkFilterId})`}>
            <text
              x="418"
              y="248"
              fill="#e4eadf"
              fillOpacity="0.72"
              fontFamily="'Caveat', cursive"
              fontSize="44"
              fontWeight="600"
            >
              práctica: {focusTarget}
            </text>
          </g>
        ) : null}

        {/* Interactive synchronized target word written by Gretel's chalk hand */}
        <g data-chalkboard-teaching="">
          <g clipPath={`url(#${writeClipId})`} filter={`url(#${chalkFilterId})`}>
            <text
              x="120"
              y="356"
              fill="#f7f5ea"
              fillOpacity="0.96"
              fontFamily="'Andika', sans-serif"
              fontSize="78"
              fontWeight="700"
              letterSpacing="0.02em"
            >
              {displayWord}
            </text>
          </g>

          {/* Warm pastel-yellow chalk underline */}
          {boardState.underlineProgress > 0.01 ? (
            <path
              d="M 112 386 Q 246 394 382 384"
              fill="none"
              stroke="#f5db7f"
              strokeWidth="5.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - boardState.underlineProgress)}
              filter={`url(#${chalkFilterId})`}
            />
          ) : null}

          {/* Syllable breakdown row */}
          <g filter={`url(#${chalkFilterId})`}>
            <text
              x="124"
              y="456"
              fill="#d8eee1"
              fillOpacity={Math.min(0.92, (boardState.syllableArcProgress[0] ?? 0) * 1.1)}
              fontFamily="'Caveat', cursive"
              fontSize="54"
              fontWeight="700"
            >
              {syllableText}
            </text>
          </g>

          {/* Chalk oval loop circling target syllable/letter */}
          {boardState.circleProgress > 0.01 ? (
            <ellipse
              cx="142"
              cy="444"
              rx="46"
              ry="32"
              fill="none"
              stroke="#f3a692"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - boardState.circleProgress)}
              filter={`url(#${chalkFilterId})`}
            />
          ) : null}
        </g>

        {/* Bottom vintage oak chalk tray (sits slightly beneath Gretel & foreground chalk) */}
        <g data-chalkboard-ledge="">
          <rect x="24" y="896" width="1552" height="16" rx="3" fill="#8b5932" />
          <rect x="20" y="910" width="1560" height="44" rx="5" fill="#633a1d" stroke="#3f220e" strokeWidth="3" />
          <line x1="26" y1="912" x2="1574" y2="912" stroke="#a67248" strokeWidth="2.5" opacity="0.7" />
          <g transform="translate(110, 868)">
            <rect x="4" y="20" width="128" height="14" rx="2" fill="#2c2e33" />
            <rect x="0" y="6" width="136" height="16" rx="4" fill="#8d5a34" stroke="#4c2c13" strokeWidth="2" />
            <rect x="6" y="8" width="124" height="5" rx="2" fill="#ad774d" opacity="0.65" />
          </g>
          <g transform="translate(278, 886) rotate(-2)">
            <rect x="0" y="0" width="76" height="12" rx="5" fill="#f7f5eb" stroke="#d5d1c0" strokeWidth="1.5" />
          </g>
          <g transform="translate(368, 888) rotate(3.5)">
            <rect x="0" y="0" width="52" height="11" rx="4.5" fill="#f4e08e" stroke="#cfba67" strokeWidth="1.5" />
          </g>
          <g transform="translate(436, 887) rotate(-1.5)">
            <rect x="0" y="0" width="48" height="11" rx="4.5" fill="#f2aba0" stroke="#c98076" strokeWidth="1.5" />
          </g>
        </g>
      </svg>

      {/* Foreground 60fps Mesh-Skinned & 2-Bone IK Animated Gretel Canvas */}
      <canvas
        ref={canvasRef}
        width={STAGE_W}
        height={STAGE_H}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />
    </div>
  );
}
