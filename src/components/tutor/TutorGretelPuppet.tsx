/**
 * TutorGretelPuppet — Torso-up Gretel Tutor avatar (Milestone 5 / spec §2, §6, §17).
 *
 * Visual safety:
 * - Renders `gretel-approved-master.png` (1086×1448) at 1:1 native pixel scale
 *   through a torso-up SVG viewBox (`TORSO_UP_VIEWBOX`) by default so Gretel's
 *   red bow, wavy hair, face, and upper pinafore fill video-call / split / PiP
 *   frames cleanly without stretching or modifying the approved master.
 * - Never activates unapproved face art: `public/cartilla/images/gretel/layers/manifest.json`
 *   remains the sole production gate. Once the owner approves pieces in
 *   `docs/tutor/AVATAR-APPROVAL-PREVIEW.html` and registers them in the manifest,
 *   blink / brows / Rhubarb A–G/X mouth / expression / wave / point layers turn
 *   on automatically with pixel-exact 1086×1448 registration.
 *
 * Animation & lip-sync:
 * - Playback-time-locked Rhubarb A–G/X lip-sync driven from real `audio.currentTime`
 *   (syncs play, pause, replay, mute, interrupt, cancel). Amplitude fallback is
 *   explicitly labeled `data-lipsync-source="amplitude-fallback"`.
 * - Independent subtle channels: breathing, blinking, eye gaze, eyebrows,
 *   listening tilt, thinking, smiling, encouragement, nods, pointing, farewell.
 * - Zero bouncing, zero mouth-scaling, zero exaggerated gestures.
 * - Strict `prefers-reduced-motion: reduce` gating.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { TutorChalkboardStage } from "@/components/tutor/TutorChalkboardStage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { TutorLayoutMode } from "@/lib/tutor-session";
import {
  computePuppetChannels,
  expressionFromState,
  getPuppetViewBox,
  loadPuppetLayers,
  MASTER_CANVAS,
  PUPPET_CHANNEL_LIMITS,
  resolveLipSync,
  type PuppetFraming,
  type PuppetLayer,
  type TutorGazeTarget,
  type TutorPuppetExpression,
  type VisemeCue,
  type VisemeShape,
} from "@/lib/tutor-puppet-layers";
import type { GretelState } from "@/components/gretel/gretelMachine";

export interface TutorGretelPuppetProps {
  /** Current `gretelMachine` state — backward-compatible primary driver. */
  state: GretelState;
  /**
   * Optional controlled Rhubarb viseme (A–H or X). Used when no `visemeTimeline`
   * / `audioElement` is supplied.
   */
  viseme?: string;
  /** Native-pixel-scale framing: `"torso-up"` (default for tutor call) or `"full"`. */
  framing?: PuppetFraming;
  /**
   * Live HTMLAudioElement driving playback-time-locked Rhubarb lip-sync from
   * real `audio.currentTime` (handles play, pause, replay, mute, interrupt, cancel).
   */
  audioElement?: HTMLAudioElement | null;
  /**
   * Alternative controlled media time in seconds (from `TutorPlaybackPosition`)
   * when the caller owns the `<audio>` element externally.
   */
  playbackTime?: number | null;
  /** Explicit speaking flag (defaults to `state === "talking"`). */
  isSpeaking?: boolean;
  /** True when active playback is paused or interrupted. */
  isPaused?: boolean;
  /** True when audio output is muted. */
  isMuted?: boolean;
  /** Rhubarb viseme timeline for the active recording. */
  visemeTimeline?: readonly VisemeCue[];
  /**
   * Normalized audio amplitude (0..1). Used ONLY as an explicitly labeled
   * fallback (`data-lipsync-source="amplitude-fallback"`) when `visemeTimeline`
   * is empty while audio is playing.
   */
  audioAmplitude?: number | null;
  /** Independent calm expression channel (defaults to `expressionFromState(state)`). */
  expression?: TutorPuppetExpression;
  /** Independent subtle eye-gaze channel. */
  gazeTarget?: TutorGazeTarget;
  /** Optional container className. */
  className?: string;
  /** Preview opt-in ONLY: renders decomposed chalkboard stage before manifest activation. */
  previewChalkboardRig?: boolean;
  /** Active Cartilla target word displayed/demonstrated on the chalkboard. */
  lessonWord?: string;
  /** Focus letter or phoneme to underline/circle on the chalkboard. */
  focusLetter?: string;
  /** Active presentation mode (`call`, `split`, `flipchart-pip`, `practice`). */
  layoutMode?: TutorLayoutMode;
  onError?: () => void;
}

type PuppetMode = "loading" | "master" | "layered";

function layerVisible(
  layer: PuppetLayer,
  options: {
    state: GretelState;
    viseme: VisemeShape;
    isBlinking: boolean;
    smileActive: boolean;
    pointingActive: boolean;
    farewellActive: boolean;
    browLiftPx: number;
  },
): boolean {
  switch (layer.role) {
    case "static":
      return true;
    case "blink":
      return options.isBlinking || options.state === "blinking";
    case "brows":
      return options.browLiftPx !== 0;
    case "mouth":
      return layer.shapes?.includes(options.viseme) ?? false;
    case "expression":
      return options.smileActive || options.state === "cheering";
    case "arm-wave":
      return options.farewellActive || options.state === "waving";
    case "arm-point":
      return options.pointingActive || options.state === "pointing";
    default:
      return false;
  }
}

export function TutorGretelPuppet({
  state,
  viseme = "X",
  framing = "torso-up",
  audioElement = null,
  playbackTime = null,
  isSpeaking,
  isPaused = false,
  isMuted = false,
  visemeTimeline,
  audioAmplitude = null,
  expression,
  gazeTarget = "student",
  className,
  previewChalkboardRig = false,
  lessonWord = "",
  focusLetter,
  layoutMode = "call",
  onError,
}: TutorGretelPuppetProps) {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<PuppetMode>("loading");
  const [composition, setComposition] = useState<"overlay" | "complete">("overlay");
  const [layers, setLayers] = useState<readonly PuppetLayer[]>([]);
  const [layerFailed, setLayerFailed] = useState(false);
  const [isAutoBlinking, setIsAutoBlinking] = useState(false);
  const [mediaClock, setMediaClock] = useState<{
    currentTime: number | null;
    playing: boolean;
    paused: boolean;
    muted: boolean;
  }>({
    currentTime: null,
    playing: false,
    paused: false,
    muted: false,
  });

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Resolve master vs approved layered pack once per mount. Failures → master, never broken.
  useEffect(() => {
    let alive = true;
    const resolveLayers = async () => {
      try {
        const resolution = await loadPuppetLayers();
        if (!alive) return;
        if (resolution.mode === "layered") {
          await Promise.all(
            resolution.layers.map(
              (layer) =>
                new Promise<void>((resolve, reject) => {
                  const image = new Image();
                  image.onload = () =>
                    image.naturalWidth === MASTER_CANVAS.width &&
                    image.naturalHeight === MASTER_CANVAS.height
                      ? resolve()
                      : reject(new Error("Layer canvas does not match Gretel"));
                  image.onerror = () => reject(new Error("Layer image unavailable"));
                  image.src = layer.src;
                }),
            ),
          );
          if (!alive) return;
          setLayers(resolution.layers);
          setComposition(resolution.composition);
          setMode("layered");
        } else {
          setMode("master");
        }
      } catch {
        if (alive) {
          setMode("master");
          onErrorRef.current?.();
        }
      }
    };
    void resolveLayers();
    return () => {
      alive = false;
    };
  }, []);

  // Playback-time-locked media clock bound directly to real `audio.currentTime`.
  useEffect(() => {
    if (!audioElement) {
      setMediaClock({ currentTime: null, playing: false, paused: false, muted: false });
      return;
    }

    let rafId = 0;

    const readAudio = () => {
      const hasSource = Boolean(audioElement.currentSrc || audioElement.getAttribute("src"));
      const active = hasSource && !audioElement.paused && !audioElement.ended;
      const muted = audioElement.muted || audioElement.volume === 0;
      setMediaClock({
        currentTime:
          hasSource && Number.isFinite(audioElement.currentTime) ? audioElement.currentTime : null,
        playing: active,
        paused: audioElement.paused || audioElement.ended || !hasSource,
        muted,
      });
      return active;
    };

    const tick = () => {
      if (readAudio() && !reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (readAudio() && !reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      readAudio();
    };

    audioElement.addEventListener("play", startLoop);
    audioElement.addEventListener("playing", startLoop);
    audioElement.addEventListener("seeked", readAudio);
    audioElement.addEventListener("timeupdate", readAudio);
    audioElement.addEventListener("volumechange", readAudio);
    audioElement.addEventListener("pause", stopLoop);
    audioElement.addEventListener("ended", stopLoop);
    audioElement.addEventListener("emptied", stopLoop);
    audioElement.addEventListener("abort", stopLoop);

    // Sync immediately in case playback is already active on mount/handoff.
    startLoop();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      audioElement.removeEventListener("play", startLoop);
      audioElement.removeEventListener("playing", startLoop);
      audioElement.removeEventListener("seeked", readAudio);
      audioElement.removeEventListener("timeupdate", readAudio);
      audioElement.removeEventListener("volumechange", readAudio);
      audioElement.removeEventListener("pause", stopLoop);
      audioElement.removeEventListener("ended", stopLoop);
      audioElement.removeEventListener("emptied", stopLoop);
      audioElement.removeEventListener("abort", stopLoop);
    };
  }, [audioElement, reducedMotion]);

  const resolvedExpression = expression ?? expressionFromState(state);

  const channels = useMemo(
    () =>
      computePuppetChannels({
        state,
        expression: resolvedExpression,
        gazeTarget,
        reducedMotion,
      }),
    [state, resolvedExpression, gazeTarget, reducedMotion],
  );

  // Independent subtle blink channel (3.2–5.8 s cadence, 130 ms close; disabled in reduced motion).
  useEffect(() => {
    if (reducedMotion || !channels.blinkEnabled) {
      setIsAutoBlinking(false);
      return;
    }
    let openTimer = 0;
    let nextTimer = 0;
    let alive = true;

    const scheduleBlink = () => {
      const span =
        PUPPET_CHANNEL_LIMITS.blinkMaxIntervalMs - PUPPET_CHANNEL_LIMITS.blinkMinIntervalMs;
      const delay = PUPPET_CHANNEL_LIMITS.blinkMinIntervalMs + Math.round(Math.random() * span);
      nextTimer = window.setTimeout(() => {
        if (!alive) return;
        setIsAutoBlinking(true);
        openTimer = window.setTimeout(() => {
          if (!alive) return;
          setIsAutoBlinking(false);
          scheduleBlink();
        }, PUPPET_CHANNEL_LIMITS.blinkDurationMs);
      }, delay);
    };

    scheduleBlink();
    return () => {
      alive = false;
      window.clearTimeout(nextTimer);
      window.clearTimeout(openTimer);
    };
  }, [reducedMotion, channels.blinkEnabled]);

  const effectiveSpeaking =
    audioElement !== null ? mediaClock.playing : (isSpeaking ?? state === "talking");
  const effectivePaused = audioElement !== null ? mediaClock.paused || isPaused : isPaused;
  const effectiveMuted = isMuted || mediaClock.muted;
  const effectiveTime = audioElement !== null ? mediaClock.currentTime : playbackTime;

  const lipSync = useMemo(
    () =>
      resolveLipSync({
        currentTime: effectiveTime,
        timeline: visemeTimeline,
        isSpeaking: effectiveSpeaking,
        isPaused: effectivePaused,
        isMuted: effectiveMuted,
        reducedMotion,
        amplitude: audioAmplitude,
        propViseme: viseme,
      }),
    [
      effectiveTime,
      visemeTimeline,
      effectiveSpeaking,
      effectivePaused,
      effectiveMuted,
      reducedMotion,
      audioAmplitude,
      viseme,
    ],
  );

  const showMaster =
    composition === "overlay" ||
    mode === "master" ||
    mode === "loading" ||
    (mode === "layered" && layerFailed);

  const clipId = `gretel-framing-clip-${useId().replaceAll(":", "")}`;
  const viewBox = getPuppetViewBox(framing);
  const viewBoxAttr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  const yAnimation = channels.nodSequenceY ? [...channels.nodSequenceY] : channels.headShiftY;

  if (previewChalkboardRig) {
    return (
      <div
        data-tutor-puppet=""
        data-puppet-mode="chalkboard-rig-preview"
        data-puppet-framing={framing}
        data-puppet-state={state}
        data-puppet-expression={resolvedExpression}
        data-puppet-gaze={gazeTarget}
        data-puppet-viseme={lipSync.shape}
        data-lipsync-source={lipSync.source}
        data-lipsync-fallback={lipSync.isFallback ? "true" : "false"}
        data-reduced-motion={reducedMotion ? "true" : "false"}
        className={className ? `relative h-full w-full ${className}` : "relative h-full w-full"}
      >
        <TutorChalkboardStage
          state={state}
          playbackTime={effectiveTime}
          isSpeaking={effectiveSpeaking}
          isPaused={effectivePaused}
          isMuted={effectiveMuted}
          visemeTimeline={visemeTimeline}
          propViseme={viseme}
          lessonWord={lessonWord}
          focusLetter={focusLetter}
          chalkboardMode={
            state === "cheering"
              ? "celebrate"
              : state === "gentle-error"
                ? "correction"
                : state === "help"
                  ? "hint"
                  : "model"
          }
          layoutMode={layoutMode}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <motion.div
      data-tutor-puppet=""
      data-puppet-mode={mode === "layered" && !layerFailed ? composition : "master"}
      data-puppet-framing={framing}
      data-puppet-state={state}
      data-puppet-expression={resolvedExpression}
      data-puppet-gaze={gazeTarget}
      data-puppet-viseme={lipSync.shape}
      data-lipsync-source={lipSync.source}
      data-lipsync-fallback={lipSync.isFallback ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={className ? `relative h-full w-full ${className}` : "relative h-full w-full"}
      style={{ originX: 0.5, originY: 0.78 }}
      animate={
        reducedMotion
          ? { rotate: 0, x: 0, y: 0 }
          : {
              rotate: channels.headTiltDeg,
              x: channels.headShiftX + channels.gazeOffsetX * 0.45,
              y: yAnimation,
            }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              duration: channels.transitionDurationSec,
              ease: channels.transitionEase,
            }
      }
    >
      {/* Independent breathing channel: calm 4.0 s subtle chest lift (never bounces). */}
      <motion.div
        className="h-full w-full"
        style={{ originX: 0.5, originY: 0.92 }}
        animate={
          reducedMotion || !channels.breathingEnabled
            ? { scaleY: 1 }
            : { scaleY: [1, channels.breathingScaleY, 1] }
        }
        transition={
          reducedMotion || !channels.breathingEnabled
            ? { duration: 0 }
            : {
                duration: channels.breathingDurationSec,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <svg
          viewBox={viewBoxAttr}
          role="img"
          aria-label="Gretel"
          preserveAspectRatio="xMidYMid meet"
          className="tutor-puppet-svg absolute inset-0 h-full w-full overflow-hidden"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {showMaster ? (
              <image
                data-puppet-part="approved-master"
                href={GRETEL_APPROVED_MASTER_SRC}
                x="0"
                y="0"
                width={MASTER_CANVAS.width}
                height={MASTER_CANVAS.height}
                preserveAspectRatio="xMidYMid meet"
                onError={() => onErrorRef.current?.()}
              />
            ) : null}
            {mode === "layered" &&
              !layerFailed &&
              layers.map((layer) => {
                const visible = layerVisible(layer, {
                  state,
                  viseme: lipSync.shape,
                  isBlinking: isAutoBlinking,
                  smileActive: channels.smileActive,
                  pointingActive: channels.pointingActive,
                  farewellActive: channels.farewellActive,
                  browLiftPx: channels.browLiftPx,
                });
                const browTransform =
                  layer.role === "brows" && !reducedMotion && channels.browLiftPx !== 0
                    ? `translate(0, ${channels.browLiftPx})`
                    : undefined;
                return (
                  <image
                    key={layer.id}
                    data-puppet-layer={layer.id}
                    data-puppet-role={layer.role}
                    href={layer.src}
                    x="0"
                    y="0"
                    width={MASTER_CANVAS.width}
                    height={MASTER_CANVAS.height}
                    preserveAspectRatio="xMidYMid meet"
                    transform={browTransform}
                    style={{
                      opacity: visible ? 1 : 0,
                      transition: reducedMotion
                        ? "none"
                        : layer.role === "mouth"
                          ? "opacity 75ms linear"
                          : layer.role === "blink"
                            ? "opacity 42ms ease-out"
                            : "opacity 220ms ease-out",
                      pointerEvents: "none",
                    }}
                    onError={() => {
                      // Any layer that fails to load: back to the intact master.
                      setLayerFailed(true);
                      onErrorRef.current?.();
                    }}
                  />
                );
              })}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default TutorGretelPuppet;
