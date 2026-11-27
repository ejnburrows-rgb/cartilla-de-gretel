/**
 * TutorHybridStage — Clean 60fps Soft-Body Mesh + Synchronized Chalkboard + Optional Google Flow Clips.
 *
 * Implements the warm, child-friendly $0 Hybrid Animation Architecture:
 * - Zero detached limbs, zero pasted fingers, zero uncanny double-head fades.
 * - Canvas 2D textured triangle mesh (`deformGretelMesh`) deforming smoothly across chest
 *   breathing, gentle 2.5D head gaze turns toward the board, and phase-lagged golden curls.
 * - Live front facial rig: movable clipped cobalt-blue irises, 5-stage painted eyelids,
 *   continuous eyebrows, and coarticulated Rhubarb phonetic mouths (`A–G` + `X`) driven by audio time.
 * - Interactive oak-framed deep-green "Cartilla de Gretel" chalkboard where a crisp storybook
 *   chalk stick writes/underlines/circles syllables in sync, and the wooden felt eraser lifts cleanly
 *   from the chalk ledge to wipe scratch notes before gliding back down.
 * - Automatic seamless `<video>` drop-in layer for free Google Flow full-body clips
 *   (`turn-and-write.mp4`, `turn-and-erase.mp4`) whenever added to `/cartilla/images/gretel/tutor/flow-clips/`.
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
  GOOGLE_FLOW_CLIP_SLOTS,
  type HybridDirectorFrame,
} from "@/lib/tutor-hybrid-director";
import {
  buildGretelBodyMesh,
  deformGretelMesh,
} from "@/lib/tutor-mesh-rig";
import type { VisemeCue } from "@/lib/tutor-puppet-layers";
import type { GretelState } from "@/components/gretel/gretelMachine";
import type { TutorLayoutMode } from "@/lib/tutor-session";

const RIG_ASSET_BASE = "/cartilla/images/gretel/tutor/chalkboard-candidates";

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
  img: CanvasImageSource,
  mesh: ReturnType<typeof buildGretelBodyMesh>,
  coords: Float32Array,
  originX: number,
  originY: number,
  scale: number,
): void {
  const { vertices, indices } = mesh;
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    const v0 = vertices[i0];
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    drawTexturedTriangle(
      ctx,
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
}

function drawInteractiveBoardTool(
  ctx: CanvasRenderingContext2D,
  frame: HybridDirectorFrame,
): void {
  if (frame.activeTool === "none" || frame.armRaise <= 0.05) return;
  const { x, y } = frame.ikTargetStage;
  const alpha = Math.min(1, frame.armRaise * 1.35);

  if (frame.activeTool === "chalk") {
    // Soft chalk dust glow directly at the writing contact tip
    if (frame.phase === "write_demonstrate") {
      ctx.save();
      const dustGrad = ctx.createRadialGradient(x, y, 2, x, y, 28);
      dustGrad.addColorStop(0, "rgba(255, 252, 235, 0.34)");
      dustGrad.addColorStop(1, "rgba(255, 252, 235, 0)");
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Crisp classic white chalk stick tilted comfortably toward upper-right
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(-0.58);
    ctx.shadowColor = "rgba(8, 20, 14, 0.45)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#f7f5eb";
    ctx.strokeStyle = "#d5d0be";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-8, -68, 16, 68, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -3, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (frame.activeTool === "eraser") {
    // Soft chalk eraser dust cloud
    ctx.save();
    const dustGrad = ctx.createRadialGradient(x, y, 4, x, y, 60);
    dustGrad.addColorStop(0, "rgba(244, 241, 228, 0.25)");
    dustGrad.addColorStop(1, "rgba(244, 241, 228, 0)");
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Traditional wood-and-felt eraser swept cleanly along the board
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(-0.08);
    ctx.shadowColor = "rgba(8, 20, 14, 0.45)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#2c2e33";
    ctx.fillRect(-64, 4, 128, 15);
    ctx.fillStyle = "#8d5a34";
    ctx.strokeStyle = "#4c2c13";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-68, -14, 136, 20, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(182, 130, 86, 0.55)";
    ctx.fillRect(-60, -10, 120, 5);
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
 * Composites Gretel's live animated portrait onto a 1024×662 offscreen canvas
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

  // Left iris clipped inside aperture
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(442, 300);
  ctx.quadraticCurveTo(464, 282, 489, 299);
  ctx.quadraticCurveTo(467, 315, 442, 300);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(assets.irisL, rigFrame.pupilX, rigFrame.pupilY);
  ctx.restore();

  // Right iris clipped inside aperture
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(555, 316);
  ctx.quadraticCurveTo(579, 298, 604, 314);
  ctx.quadraticCurveTo(581, 330, 555, 316);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(assets.irisR, rigFrame.pupilX, rigFrame.pupilY);
  ctx.restore();

  ctx.drawImage(assets.lashes, 0, 0);

  const lidImg = lidImageForStage(assets, rigFrame.lidStage);
  if (lidImg) {
    ctx.drawImage(lidImg, 0, 0);
  }

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
  const [flowClipsReady, setFlowClipsReady] = useState<{ write: boolean; erase: boolean }>({
    write: false,
    erase: false,
  });
  const [boardState, setBoardState] = useState<HybridDirectorFrame>(() =>
    evaluateHybridDirectorAtTime({
      timeSec: 0.4,
      word: lessonWord || "abeja",
      reducedMotion,
    }),
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flowVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeClipUrlRef = useRef<string | null>(null);
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

  // Detect optional drop-in silent Google Flow clips if placed in /cartilla/images/gretel/tutor/flow-clips/
  useEffect(() => {
    let alive = true;
    const checkClip = async (url: string): Promise<boolean> => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const ct = res.headers.get("content-type") || "";
        return res.ok && ct.includes("video");
      } catch {
        return false;
      }
    };
    Promise.all([
      checkClip(GOOGLE_FLOW_CLIP_SLOTS.write_demonstrate),
      checkClip(GOOGLE_FLOW_CLIP_SLOTS.erase_board),
    ]).then(([hasWrite, hasErase]) => {
      if (alive) setFlowClipsReady({ write: hasWrite, erase: hasErase });
    });
    return () => {
      alive = false;
    };
  }, []);

  // Preload front rig layers cleanly
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
        setAssets(Object.fromEntries(loaded) as LoadedAssets);
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

    let rafId = 0;

    const step = (nowMs: number) => {
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
        const isWritingState = p.state === "teaching" || p.state === "pointing";
        if (isWritingState) {
          if (liveTeachStartRef.current === null) {
            liveTeachStartRef.current = nowMs;
          }
          const elapsed = ((nowMs - liveTeachStartRef.current) / 1000) % 5.6;
          frame = evaluateHybridDirectorAtTime({
            timeSec: 2.5 + Math.min(3.6, elapsed),
            word: activeWord,
            reducedMotion: p.reducedMotion,
          });
        } else {
          liveTeachStartRef.current = null;
          const syllables = splitSpanishSyllables(activeWord);
          const expr = p.expression ?? mapStateToRigExpression(p.state, p.isSpeaking);
          const gaze: ChalkboardGazeTarget =
            p.gazeTarget ?? (p.state === "help" ? "flipchart-right" : "student");
          frame = {
            phase: p.isSpeaking ? "speak_rhubarb" : "listen_1",
            phaseLabelEs: p.isSpeaking ? "Hablando" : "Escuchando",
            turnBlend: 0,
            expression: expr,
            gazeTarget: gaze,
            armRaise: 0,
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

      if (nowMs - boardSyncTickRef.current > 32) {
        boardSyncTickRef.current = nowMs;
        setBoardState(frame);
      }

      // Sync optional seamless Google Flow clip overlay when present
      const vidEl = flowVideoRef.current;
      if (vidEl) {
        const wantWrite =
          (frame.phase === "turn_to_board" || frame.phase === "write_demonstrate") &&
          flowClipsReady.write;
        const wantErase =
          (frame.phase === "erase_board" || frame.phase === "turn_back") &&
          flowClipsReady.erase;
        const targetUrl = wantWrite
          ? GOOGLE_FLOW_CLIP_SLOTS.write_demonstrate
          : wantErase
            ? GOOGLE_FLOW_CLIP_SLOTS.erase_board
            : null;
        if (targetUrl && !p.reducedMotion) {
          if (activeClipUrlRef.current !== targetUrl) {
            activeClipUrlRef.current = targetUrl;
            vidEl.src = targetUrl;
            vidEl.play().catch(() => {});
          }
          vidEl.style.opacity = "1";
        } else {
          if (activeClipUrlRef.current) {
            activeClipUrlRef.current = null;
            vidEl.pause();
          }
          vidEl.style.opacity = "0";
        }
      }

      const mainCanvas = canvasRef.current;
      const frontCanvas = frontCanvasRef.current;
      if (mainCanvas && frontCanvas) {
        const fctx = frontCanvas.getContext("2d");
        const mctx = mainCanvas.getContext("2d");
        if (fctx && mctx) {
          renderFrontFaceCanvas(fctx, assets, rigFrame, viseme);
          mctx.clearRect(0, 0, STAGE_W, STAGE_H);

          const scale = 1.12;
          const centerX = 1040;
          const originX = centerX - (POSE_W * scale) * 0.5;
          const originY = 900 - POSE_H * scale + 14;

          const meshCoords = deformGretelMesh(meshRef.current, {
            breathePhase: p.reducedMotion ? 0 : Math.sin((clockSec * 2 * Math.PI) / 4.1),
            headTiltDeg: rigFrame.headTiltDeg,
            headYaw: -frame.turnBlend * 0.32,
            headNodPx: frame.expression === "encouraging" ? Math.sin(clockSec * 5.2) * 3.0 : 0,
            hairSwayLeftDeg: rigFrame.hairLeftDeg,
            hairSwayRightDeg: rigFrame.hairRightDeg,
          });

          // Soft slate drop shadow grounding Gretel in front of the green chalkboard
          mctx.save();
          const shadowGrad = mctx.createRadialGradient(
            centerX + 24,
            610,
            70,
            centerX + 24,
            610,
            440,
          );
          shadowGrad.addColorStop(0, "rgba(7, 22, 14, 0.42)");
          shadowGrad.addColorStop(1, "rgba(7, 22, 14, 0)");
          mctx.fillStyle = shadowGrad;
          mctx.fillRect(centerX - 430, 150, 900, 750);
          mctx.restore();

          // Pure warm front-portrait mesh (ZERO double faces, ZERO creepy pasted arms)
          drawDeformedMesh(
            mctx,
            frontCanvas,
            meshRef.current,
            meshCoords,
            originX,
            originY,
            scale,
          );

          // Animated chalk stick / lifting wooden eraser synchronized to slate trajectory
          drawInteractiveBoardTool(mctx, frame);
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
  }, [assets, reducedMotion, flowClipsReady]);

  const syllables = useMemo(
    () => splitSpanishSyllables(lessonWord || "abeja"),
    [lessonWord],
  );
  const displayWord = (lessonWord || "abeja").trim();
  const focusTarget = (focusLetter || syllables[0] || displayWord.slice(0, 1)).trim();
  const syllableText = syllables.join("   ");
  const eraserLifted = boardState.activeTool === "eraser";

  return (
    <div
      data-tutor-hybrid-stage=""
      data-hybrid-phase={boardState.phase}
      data-hybrid-turn={boardState.turnBlend.toFixed(2)}
      data-hybrid-tool={boardState.activeTool}
      data-layout-mode={layoutMode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={
        className
          ? `relative h-full w-full overflow-hidden bg-[#10251c] ${className}`
          : "relative h-full w-full overflow-hidden bg-[#10251c]"
      }
    >
      {/* Vintage Oak-Framed Chalkboard Layer */}
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

        <rect x="0" y="0" width="1600" height="1000" rx="22" fill="#5e371b" />
        <rect x="10" y="10" width="1580" height="980" rx="16" fill="none" stroke="#8a5630" strokeWidth="18" />
        <rect x="22" y="22" width="1556" height="956" rx="10" fill="none" stroke="#462611" strokeWidth="8" />

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

        <g data-chalkboard-ledge="">
          <rect x="24" y="896" width="1552" height="16" rx="3" fill="#8b5932" />
          <rect x="20" y="910" width="1560" height="44" rx="5" fill="#633a1d" stroke="#3f220e" strokeWidth="3" />
          <line x1="26" y1="912" x2="1574" y2="912" stroke="#a67248" strokeWidth="2.5" opacity="0.7" />
          <g transform="translate(110, 868)" opacity={eraserLifted ? 0 : 1}>
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

      {/* Foreground 60fps Soft-Body Mesh Animated Portrait & Chalk/Eraser Tool Canvas */}
      <canvas
        ref={canvasRef}
        width={STAGE_W}
        height={STAGE_H}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />

      {/* Optional Seamless Silent Google Flow Clip Overlay (activates when local .mp4 clips exist) */}
      <video
        ref={flowVideoRef}
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
