/**
 * TutorChalkboardStage — Unified layered SVG classroom stage & anatomical Gretel rig.
 *
 * Renders:
 * 1. Classic deep-green vintage chalkboard (`#1c382a` -> `#12261d`) with natural
 *    slate grain, faint erased chalk dust, and an authentic mitered oak wooden frame.
 * 2. Handwritten "Cartilla de Gretel" in the upper-left corner using the self-hosted
 *    Caveat script font + porous SVG dry-chalk displacement texture.
 * 3. Interactive synchronized chalk teaching zone (write, syllable bridges,
 *    underline, circle, and felt-eraser wipe) locked to real `audio.currentTime`.
 * 4. Vintage wooden chalk ledge along the bottom with white & pastel colored chalk
 *    sticks and a traditional wood-and-felt school eraser.
 * 5. Prominent right-of-center torso-up anatomical Gretel rig cut cleanly from the
 *    recovered approved portrait (`gretel-tutor-portrait-call.jpg`):
 *    - Independent clipped cobalt-blue irises + micro-saccades + pedagogical gaze
 *    - Independent 5-stage painted eyelids (`lid-25`..`lid-100`) & asymmetric blinks
 *    - Independent continuous left/right painted eyebrows
 *    - Flicker-free color-matched Rhubarb phonetic mouths (`A–G` + `X`) with coarticulation
 *    - Natural torso breathing & phase-lagged secondary hair-curl sway
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  buildChalkboardSequence,
  evaluateChalkboardAtTime,
  type ChalkboardFrameState,
} from "@/lib/tutor-chalkboard";
import {
  computeChalkboardRigFrame,
  resolveCoarticulatedViseme,
  type ChalkboardGazeTarget,
  type ChalkboardRigExpression,
  type EyelidStage,
} from "@/lib/tutor-chalkboard-rig";
import type { VisemeCue, VisemeShape } from "@/lib/tutor-puppet-layers";
import type { GretelState } from "@/components/gretel/gretelMachine";
import type { TutorLayoutMode } from "@/lib/tutor-session";

const RIG_ASSET_BASE = "/cartilla/images/gretel/tutor/chalkboard-candidates";
const ALL_RIG_PART_SRCS = [
  `${RIG_ASSET_BASE}/gretel-face-base.png`,
  `${RIG_ASSET_BASE}/iris-left.png`,
  `${RIG_ASSET_BASE}/iris-right.png`,
  `${RIG_ASSET_BASE}/eyelashes-frame.png`,
  `${RIG_ASSET_BASE}/lid-25.png`,
  `${RIG_ASSET_BASE}/lid-50.png`,
  `${RIG_ASSET_BASE}/lid-75.png`,
  `${RIG_ASSET_BASE}/lid-100.png`,
  `${RIG_ASSET_BASE}/brow-left.png`,
  `${RIG_ASSET_BASE}/brow-right.png`,
  `${RIG_ASSET_BASE}/hair-curl-left.png`,
  `${RIG_ASSET_BASE}/hair-curl-right.png`,
  `${RIG_ASSET_BASE}/mouth-X.png`,
  `${RIG_ASSET_BASE}/mouth-A.png`,
  `${RIG_ASSET_BASE}/mouth-B.png`,
  `${RIG_ASSET_BASE}/mouth-C.png`,
  `${RIG_ASSET_BASE}/mouth-D.png`,
  `${RIG_ASSET_BASE}/mouth-E.png`,
  `${RIG_ASSET_BASE}/mouth-F.png`,
  `${RIG_ASSET_BASE}/mouth-G.png`,
];

export interface TutorChalkboardStageProps {
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

function getStageViewBox(layoutMode: TutorLayoutMode | undefined): string {
  if (layoutMode === "flipchart-pip") {
    // Tighter framing on Gretel + right slate edge inside small PiP overlay
    return "620 18 920 880";
  }
  return "0 0 1600 1000";
}

function resolveLidSrc(stage: EyelidStage): string | null {
  switch (stage) {
    case 25:
      return `${RIG_ASSET_BASE}/lid-25.png`;
    case 50:
      return `${RIG_ASSET_BASE}/lid-50.png`;
    case 75:
      return `${RIG_ASSET_BASE}/lid-75.png`;
    case 100:
      return `${RIG_ASSET_BASE}/lid-100.png`;
    default:
      return null;
  }
}

export function TutorChalkboardStage({
  state,
  playbackTime = null,
  isSpeaking = false,
  isPaused = false,
  isMuted = false,
  visemeTimeline,
  propViseme = "X",
  lessonWord = "",
  focusLetter,
  chalkboardMode = "model",
  expression,
  gazeTarget,
  layoutMode = "call",
  className,
  onReady,
  onError,
}: TutorChalkboardStageProps) {
  const reducedMotion = useReducedMotion();
  const uid = useId().replaceAll(":", "");

  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsFailed, setAssetsFailed] = useState(false);
  const [clockSec, setClockSec] = useState(0);
  const [blinkElapsedMs, setBlinkElapsedMs] = useState(-1);

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Preload all 20 decomposed PNG parts cleanly once so zero pop or flicker occurs during speech
  useEffect(() => {
    let alive = true;
    Promise.all(
      ALL_RIG_PART_SRCS.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => (img.naturalWidth > 0 ? resolve() : reject(new Error(src)));
            img.onerror = () => reject(new Error(src));
            img.src = src;
          }),
      ),
    )
      .then(() => {
        if (!alive) return;
        setAssetsReady(true);
        onReadyRef.current?.();
      })
      .catch(() => {
        if (!alive) return;
        setAssetsFailed(true);
        onErrorRef.current?.();
      });
    return () => {
      alive = false;
    };
  }, []);

  // Continuous 60fps life clock for pupils, breathing, hair-curl lag, and listening nods
  useEffect(() => {
    if (reducedMotion) {
      setClockSec(0);
      return;
    }
    let raf = 0;
    const startMs = performance.now();
    const tick = (now: number) => {
      setClockSec((now - startMs) / 1000);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Natural irregular blink scheduler (2.6s–5.4s cadence + occasional double blink)
  useEffect(() => {
    if (reducedMotion) {
      setBlinkElapsedMs(-1);
      return;
    }
    let alive = true;
    let blinkRaf = 0;
    let nextTimer = 0;

    const runBlink = (andDouble: boolean) => {
      if (!alive) return;
      const bStart = performance.now();
      const step = (now: number) => {
        if (!alive) return;
        const elapsed = now - bStart;
        if (elapsed <= 200) {
          setBlinkElapsedMs(elapsed);
          blinkRaf = window.requestAnimationFrame(step);
        } else {
          setBlinkElapsedMs(-1);
          if (andDouble) {
            nextTimer = window.setTimeout(() => runBlink(false), 180);
          } else {
            scheduleNext();
          }
        }
      };
      blinkRaf = window.requestAnimationFrame(step);
    };

    const scheduleNext = () => {
      const waitMs = 2600 + Math.random() * 2800;
      nextTimer = window.setTimeout(() => runBlink(Math.random() < 0.14), waitMs);
    };

    scheduleNext();
    return () => {
      alive = false;
      window.clearTimeout(nextTimer);
      window.cancelAnimationFrame(blinkRaf);
    };
  }, [reducedMotion]);

  // Build deterministic interactive chalkboard sequence from current Cartilla word
  const sequence = useMemo(
    () =>
      buildChalkboardSequence({
        text: lessonWord,
        focusLetter,
        durationSec:
          visemeTimeline && visemeTimeline.length > 0
            ? Math.max(1.5, visemeTimeline[visemeTimeline.length - 1].end)
            : 1.85,
        mode: lessonWord ? chalkboardMode : "idle",
      }),
    [lessonWord, focusLetter, visemeTimeline, chalkboardMode],
  );

  // Sync chalkboard stroke progression to media time while speaking, or hold full word cleanly
  const boardTimeSec = useMemo(() => {
    if (typeof playbackTime === "number" && Number.isFinite(playbackTime) && playbackTime >= 0) {
      return playbackTime;
    }
    return isSpeaking ? clockSec % sequence.durationSec : sequence.durationSec * 0.9;
  }, [playbackTime, isSpeaking, clockSec, sequence.durationSec]);

  const boardFrame: ChalkboardFrameState = useMemo(
    () => evaluateChalkboardAtTime(sequence, boardTimeSec, reducedMotion),
    [sequence, boardTimeSec, reducedMotion],
  );

  const effectiveExpression = expression ?? mapStateToRigExpression(state, isSpeaking);
  const effectiveGaze =
    gazeTarget ?? (isSpeaking ? boardFrame.recommendedGaze : state === "help" ? "thinking-up" : "student");

  const rigFrame = useMemo(
    () =>
      computeChalkboardRigFrame({
        timeSec: clockSec,
        expression: effectiveExpression,
        gazeTarget: effectiveGaze,
        isSpeaking,
        blinkElapsedMs,
        reducedMotion,
      }),
    [clockSec, effectiveExpression, effectiveGaze, isSpeaking, blinkElapsedMs, reducedMotion],
  );

  const viseme = useMemo(() => {
    const co = resolveCoarticulatedViseme({
      currentTime: playbackTime,
      timeline: visemeTimeline,
      isSpeaking,
      isPaused,
      isMuted,
      reducedMotion,
    });
    if (!visemeTimeline?.length && isSpeaking && propViseme && /^[A-GX]$/.test(propViseme)) {
      return {
        primaryShape: propViseme as VisemeShape,
        secondaryShape: null,
        primaryOpacity: 1,
        secondaryOpacity: 0,
        cueIndex: null,
        source: "rhubarb-coarticulated" as const,
      };
    }
    return co;
  }, [playbackTime, visemeTimeline, isSpeaking, isPaused, isMuted, reducedMotion, propViseme]);

  if (assetsFailed) {
    return null;
  }

  const leftEyeClipId = `chalk-eye-l-${uid}`;
  const rightEyeClipId = `chalk-eye-r-${uid}`;
  const chalkFilterId = `chalk-texture-${uid}`;
  const slateGradId = `chalk-slate-grad-${uid}`;
  const slateNoiseId = `chalk-slate-noise-${uid}`;
  const writeClipId = `chalk-write-clip-${uid}`;
  const eraseClipId = `chalk-erase-clip-${uid}`;

  // Layout coordinates for teaching zone syllables (left side: x = 110..670)
  const wordDisplay = boardFrame.syllables.join(" · ");
  const syllableCount = Math.max(1, boardFrame.syllables.length);
  const sylZoneX0 = 115;
  const sylZoneW = Math.min(540, Math.max(220, syllableCount * 120));
  const sylStep = sylZoneW / syllableCount;
  const focusCx = sylZoneX0 + (boardFrame.focusIndex + 0.5) * sylStep;
  const lidSrc = resolveLidSrc(rigFrame.lidStage);

  return (
    <div
      data-tutor-chalkboard-stage=""
      data-assets-ready={assetsReady ? "true" : "false"}
      data-expression={effectiveExpression}
      data-gaze={effectiveGaze}
      data-viseme={viseme.primaryShape}
      data-chalk-action={boardFrame.activeAction}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={className ? `relative h-full w-full ${className}` : "relative h-full w-full"}
    >
      <svg
        viewBox={getStageViewBox(layoutMode)}
        role="img"
        aria-label="Gretel frente a su pizarra verde clásica de Cartilla de Gretel"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full select-none"
      >
        <defs>
          {/* Classic deep-green heritage chalkboard gradient */}
          <radialGradient id={slateGradId} cx="42%" cy="44%" r="68%">
            <stop offset="0%" stopColor="#234735" />
            <stop offset="62%" stopColor="#193426" />
            <stop offset="100%" stopColor="#11241a" />
          </radialGradient>

          {/* Subtle dry-chalk displacement & slate dust grain */}
          <filter id={chalkFilterId} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.68"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.1" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <filter id={slateNoiseId} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="12" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.92  0 0 0 0 0.95  0 0 0 0 0.9  0 0 0 0.055 0"
            />
          </filter>

          {/* Progressive left-to-right chalk write reveal */}
          <clipPath id={writeClipId}>
            <rect
              x="95"
              y="220"
              width={620 * boardFrame.writeProgress}
              height="360"
            />
          </clipPath>

          {/* Felt eraser swipe clip (wipes from left to right cleanly) */}
          <clipPath id={eraseClipId}>
            <rect
              x={95 + 620 * boardFrame.eraseProgress}
              y="210"
              width={Math.max(0, 620 * (1 - boardFrame.eraseProgress))}
              height="390"
            />
          </clipPath>

          {/* Eye-socket aperture <clipPath> strictly inside upper/lower lashes (1024x662 coords) */}
          <clipPath id={leftEyeClipId}>
            <path d="M 442 300 Q 464 282 489 299 Q 467 315 442 300 Z" />
          </clipPath>
          <clipPath id={rightEyeClipId}>
            <path d="M 555 316 Q 579 298 604 314 Q 581 330 555 316 Z" />
          </clipPath>
        </defs>

        {/* 1. Authentic Vintage Mitered Oak Wood Outer Frame */}
        <rect x="0" y="0" width="1600" height="1000" rx="22" fill="#5e371b" />
        <rect
          x="10"
          y="10"
          width="1580"
          height="980"
          rx="16"
          fill="none"
          stroke="#8a5630"
          strokeWidth="18"
        />
        <rect
          x="22"
          y="22"
          width="1556"
          height="956"
          rx="10"
          fill="none"
          stroke="#462611"
          strokeWidth="8"
        />

        {/* 2. Deep-Green Slate Surface + Chalk Dust Texture */}
        <rect x="28" y="28" width="1544" height="872" rx="6" fill={`url(#${slateGradId})`} />
        <rect x="28" y="28" width="1544" height="872" rx="6" filter={`url(#${slateNoiseId})`} />

        {/* Subtle chalk dust clouds & faint school guidelines */}
        <ellipse cx="360" cy="430" rx="260" ry="120" fill="rgba(235, 240, 228, 0.032)" />
        <ellipse cx="260" cy="790" rx="180" ry="45" fill="rgba(235, 240, 228, 0.04)" />
        <line
          x1="96"
          y1="520"
          x2="680"
          y2="520"
          stroke="rgba(238, 242, 228, 0.09)"
          strokeWidth="2"
          strokeDasharray="10 10"
        />

        {/* 3. Permanent Upper-Left Handwritten "Cartilla de Gretel" Header */}
        <g filter={`url(#${chalkFilterId})`}>
          <text
            x="92"
            y="124"
            fill="#f4f1e4"
            fillOpacity="0.94"
            fontFamily="'Caveat', cursive"
            fontSize="74"
            fontWeight="700"
            letterSpacing="0.01em"
          >
            Cartilla de Gretel
          </text>
          <path
            d="M 94 146 Q 275 138 518 148"
            fill="none"
            stroke="#f0d98b"
            strokeOpacity="0.72"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* 4. Synchronized Interactive Chalk Teaching Zone (Left Slate) */}
        {boardFrame.word ? (
          <g clipPath={`url(#${eraseClipId})`} filter={`url(#${chalkFilterId})`}>
            {/* Progressive chalk writing of active word */}
            <g clipPath={`url(#${writeClipId})`}>
              <text
                x="110"
                y="362"
                fill="#faf7ed"
                fillOpacity="0.96"
                fontFamily="'Andika', 'Nunito', sans-serif"
                fontSize={boardFrame.word.length > 10 ? "56" : "82"}
                fontWeight="700"
                letterSpacing="0.02em"
              >
                {boardFrame.word}
              </text>

              {/* Syllabic reading breakdown below main word */}
              {boardFrame.syllables.length > 1 ? (
                <text
                  x="112"
                  y="458"
                  fill="#d9efe2"
                  fillOpacity="0.9"
                  fontFamily="'Caveat', cursive"
                  fontSize="58"
                  fontWeight="700"
                >
                  {wordDisplay}
                </text>
              ) : null}
            </g>

            {/* Warm pastel-yellow chalk underline under focus sound */}
            {boardFrame.underlineProgress > 0.01 ? (
              <path
                d={`M 108 384 Q ${108 + Math.min(360, boardFrame.word.length * 44) * 0.5} 392 ${
                  108 + Math.min(380, boardFrame.word.length * 46)
                } 382`}
                fill="none"
                stroke="#f5db7f"
                strokeWidth="5.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - boardFrame.underlineProgress)}
              />
            ) : null}

            {/* Chalk loop circling focus syllable / letter */}
            {boardFrame.circleProgress > 0.01 ? (
              <ellipse
                cx={focusCx - 36}
                cy="442"
                rx="46"
                ry="34"
                fill="none"
                stroke="#f7b79c"
                strokeOpacity="0.88"
                strokeWidth="4.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - boardFrame.circleProgress)}
              />
            ) : null}

            {/* Syllabic demonstration reading-bridge arcs */}
            {boardFrame.syllableArcProgress.map((p, i) => {
              if (p <= 0.01) return null;
              const ax0 = sylZoneX0 + i * 92;
              const ax1 = ax0 + 74;
              const mid = (ax0 + ax1) / 2;
              const active = i === boardFrame.activeSyllableIndex;
              return (
                <path
                  key={`arc-${i}`}
                  d={`M ${ax0} 488 Q ${mid} 516 ${ax1} 488`}
                  fill="none"
                  stroke={active ? "#f7de83" : "#b8e2cb"}
                  strokeOpacity={active ? 0.96 : 0.72}
                  strokeWidth={active ? 5 : 3.5}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100 * (1 - p)}
                />
              );
            })}
          </g>
        ) : null}

        {/* Moving animated chalk eraser visual during erase action */}
        {boardFrame.eraseProgress > 0.01 && boardFrame.eraseProgress < 0.99 ? (
          <g
            transform={`translate(${88 + 560 * boardFrame.eraseProgress}, 295) rotate(-8)`}
            opacity="0.92"
          >
            <rect x="0" y="0" width="96" height="44" rx="6" fill="#6f4324" stroke="#422510" strokeWidth="2" />
            <rect x="4" y="34" width="88" height="14" rx="3" fill="#2c2d30" />
            <ellipse cx="48" cy="52" rx="52" ry="8" fill="rgba(244, 241, 228, 0.25)" />
          </g>
        ) : null}

        {/* 5. Prominent Right-of-Center Torso-Up Anatomical Gretel Rig */}
        {/* Placed at x=605, y=42, scale=1.34 => span x: 605..1977 (visible character body center x ~ 1215), bottom y=929 behind wooden chalk ledge */}
        <g transform="translate(612, 34) scale(1.34)">
          <g
            style={{
              transformOrigin: "512px 620px",
              transform: `scaleY(${rigFrame.breathingScaleY})`,
            }}
          >
            <g
              style={{
                transformOrigin: "512px 510px",
                transform: `translate3d(${rigFrame.headShiftX}px, ${rigFrame.headShiftY}px, 0) rotate(${rigFrame.headTiltDeg}deg)`,
              }}
            >
              {/* Consistent single painted face & torso cutout (zero flicker, clean sclera & brow underpaint) */}
              <image
                href={`${RIG_ASSET_BASE}/gretel-face-base.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
              />

              {/* Secondary lagged hair curls for gentle pendular sway */}
              <image
                href={`${RIG_ASSET_BASE}/hair-curl-left.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
                style={{
                  transformOrigin: "260px 390px",
                  transform: `rotate(${rigFrame.hairLeftDeg}deg)`,
                }}
              />
              <image
                href={`${RIG_ASSET_BASE}/hair-curl-right.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
                style={{
                  transformOrigin: "650px 410px",
                  transform: `rotate(${rigFrame.hairRightDeg}deg)`,
                }}
              />

              {/* Movable painted cobalt-blue irises clipped strictly inside eye apertures */}
              <g clipPath={`url(#${leftEyeClipId})`}>
                <image
                  data-rig-iris="left"
                  href={`${RIG_ASSET_BASE}/iris-left.png`}
                  x="0"
                  y="0"
                  width="1024"
                  height="662"
                  style={{
                    transform: `translate3d(${rigFrame.pupilX}px, ${rigFrame.pupilY}px, 0)`,
                  }}
                />
              </g>
              <g clipPath={`url(#${rightEyeClipId})`}>
                <image
                  data-rig-iris="right"
                  href={`${RIG_ASSET_BASE}/iris-right.png`}
                  x="0"
                  y="0"
                  width="1024"
                  height="662"
                  style={{
                    transform: `translate3d(${rigFrame.pupilX}px, ${rigFrame.pupilY}px, 0)`,
                  }}
                />
              </g>

              {/* Crisp upper & lower lashes layered OVER movable irises */}
              <image
                href={`${RIG_ASSET_BASE}/eyelashes-frame.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
              />

              {/* 5-Stage independent painted eyelid blink layer */}
              {lidSrc ? (
                <image
                  data-rig-lid={rigFrame.lidStage}
                  href={lidSrc}
                  x="0"
                  y="0"
                  width="1024"
                  height="662"
                />
              ) : null}

              {/* Independent continuous left & right painted eyebrows */}
              <image
                data-rig-brow="left"
                href={`${RIG_ASSET_BASE}/brow-left.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
                style={{
                  transformOrigin: "474px 232px",
                  transform: `translate3d(0px, ${rigFrame.leftBrowY}px, 0) rotate(${rigFrame.leftBrowTiltDeg}deg)`,
                }}
              />
              <image
                data-rig-brow="right"
                href={`${RIG_ASSET_BASE}/brow-right.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
                style={{
                  transformOrigin: "598px 248px",
                  transform: `translate3d(0px, ${rigFrame.rightBrowY}px, 0) rotate(${rigFrame.rightBrowTiltDeg}deg)`,
                }}
              />

              {/* Coarticulated Rhubarb phonetic mouths (dual layer cross-fade, zero flicker) */}
              <image
                data-rig-mouth={viseme.primaryShape}
                href={`${RIG_ASSET_BASE}/mouth-${viseme.primaryShape}.png`}
                x="0"
                y="0"
                width="1024"
                height="662"
                opacity={viseme.primaryOpacity}
              />
              {viseme.secondaryShape ? (
                <image
                  data-rig-mouth-next={viseme.secondaryShape}
                  href={`${RIG_ASSET_BASE}/mouth-${viseme.secondaryShape}.png`}
                  x="0"
                  y="0"
                  width="1024"
                  height="662"
                  opacity={viseme.secondaryOpacity}
                />
              ) : null}
            </g>
          </g>
        </g>

        {/* 6. Vintage Oak Chalk Ledge + Chalk Sticks + Traditional School Eraser */}
        <g data-chalkboard-ledge="">
          {/* Ledge top bevel & front molding */}
          <rect x="24" y="896" width="1552" height="16" rx="3" fill="#8b5932" />
          <rect x="20" y="910" width="1560" height="44" rx="5" fill="#633a1d" stroke="#3f220e" strokeWidth="3" />
          <line x1="26" y1="912" x2="1574" y2="912" stroke="#a67248" strokeWidth="2.5" opacity="0.7" />
          <line x1="26" y1="950" x2="1574" y2="950" stroke="#381d0a" strokeWidth="3" />

          {/* Traditional Wood & Felt Classroom Eraser (lower-left ledge) */}
          <g transform="translate(110, 868)">
            <rect x="4" y="20" width="128" height="14" rx="2" fill="#2c2e33" />
            <rect x="0" y="6" width="136" height="16" rx="4" fill="#8d5a34" stroke="#4c2c13" strokeWidth="2" />
            <rect x="6" y="8" width="124" height="5" rx="2" fill="#ad774d" opacity="0.65" />
            <ellipse cx="68" cy="24" rx="54" ry="3" fill="rgba(244, 241, 228, 0.25)" />
          </g>

          {/* White Chalk Stick (long + shorter piece) */}
          <g transform="translate(278, 886) rotate(-2)">
            <rect x="0" y="0" width="76" height="12" rx="5" fill="#f7f5eb" stroke="#d5d1c0" strokeWidth="1.5" />
            <ellipse cx="73" cy="6" rx="3.5" ry="5.5" fill="#e2ded0" />
          </g>
          <g transform="translate(368, 888) rotate(3.5)">
            <rect x="0" y="0" width="52" height="11" rx="4.5" fill="#f4e08e" stroke="#cfba67" strokeWidth="1.5" />
          </g>

          {/* Soft Pastel Chalk Sticks (coral + sky blue) */}
          <g transform="translate(436, 885) rotate(-5)">
            <rect x="0" y="0" width="60" height="11" rx="4.5" fill="#f5b8a4" stroke="#cf937e" strokeWidth="1.5" />
          </g>
          <g transform="translate(508, 888) rotate(1.5)">
            <rect x="0" y="0" width="46" height="11" rx="4.5" fill="#b7deec" stroke="#8cb6c7" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default TutorChalkboardStage;
