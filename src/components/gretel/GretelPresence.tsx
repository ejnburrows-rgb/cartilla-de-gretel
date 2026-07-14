/**
 * GretelPresence — full-figure living host using the FULL pose library.
 *
 * Continuous living base (REQUIRED):
 *   - breath / soft sway on figure
 *   - blink layer (closed-idle) when idle
 *   - talk frame cycle while TTS runs
 *   - soft multi-frame idle dwell (idle / talk-0 / settle / talk)
 *
 * Used on lessons AND home hero — never a cheap 3-static-frame swap,
 * never a corner sticker.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  buildHomeIntroLines,
  buildLessonIntroLines,
  buildMissLine,
  buildSuccessLine,
  cancelGretelSpeech,
  isGretelVoiceMuted,
  setGretelVoiceMuted,
  speakAsGretel,
  type IntroCatalogSlice,
} from "@/lib/gretel-voice";
import { onGretelEvent } from "@/lib/gretel-bus";
import { prefersReducedMotion } from "@/lib/living-motion";
import {
  getGretelPose,
  getGretelPoseFrames,
  poseForBusEvent,
  poseFrameMs,
  type GretelPoseKey,
} from "./gretelPoses";

export type GretelPresenceProps = {
  /**
   * Lesson catalog slice for lesson intros. Optional when `variant="home"`.
   */
  lesson?: IntroCatalogSlice;
  /** Optional printed instruction to speak after intro (real book text only). */
  instruction?: string | null;
  className?: string;
  /** Auto-play short intro once on mount. */
  autoIntro?: boolean;
  /**
   * `lesson` (default) = lesson intro lines from catalog.
   * `home` = approved home greeting only (HOME_GREETING).
   */
  variant?: "lesson" | "home";
  /** Hide mute chrome (e.g. minimal home embed). Default false. */
  hideChrome?: boolean;
};

export function GretelPresence({
  lesson,
  instruction,
  className = "",
  autoIntro = true,
  variant = "lesson",
  hideChrome = false,
}: GretelPresenceProps) {
  const [entered, setEntered] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [pose, setPose] = useState<GretelPoseKey>("settling");
  const [frameIdx, setFrameIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const introDone = useRef(false);
  const poseHold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poseRef = useRef<GretelPoseKey>("settling");

  const setPoseHeld = useCallback((next: GretelPoseKey, holdMs?: number) => {
    poseRef.current = next;
    setPose(next);
    setFrameIdx(0);
    if (poseHold.current) clearTimeout(poseHold.current);
    if (holdMs && holdMs > 0) {
      poseHold.current = setTimeout(() => {
        if (poseRef.current === next) {
          poseRef.current = "idle";
          setPose("idle");
          setFrameIdx(0);
        }
      }, holdMs);
    }
  }, []);

  useEffect(() => {
    setMuted(isGretelVoiceMuted());
    setReduced(prefersReducedMotion());
    const t = requestAnimationFrame(() => setEntered(true));
    // Enter: settle → welcome wave → idle (full library)
    setPoseHeld("settling", 700);
    const w = setTimeout(() => setPoseHeld("welcome", reduced ? 600 : 1600), 720);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(w);
      if (poseHold.current) clearTimeout(poseHold.current);
    };
  }, [reduced, setPoseHeld]);

  // Multi-frame cycle for wave / cheer / talk / idle dwell / point-left
  useEffect(() => {
    const frames = getGretelPoseFrames(pose);
    if (!Array.isArray(frames) || frames.length < 2 || reduced) {
      setFrameIdx(0);
      return;
    }
    // While speaking, talk frames cycle fast; idle dwell is slow
    const ms = poseFrameMs(pose);
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, ms);
    return () => clearInterval(id);
  }, [pose, reduced]);

  // Continuous blink layer when idle-family and not speaking
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let schedule: ReturnType<typeof setTimeout> | undefined;
    const loop = () => {
      schedule = setTimeout(() => {
        const idleFamily =
          poseRef.current === "idle" ||
          poseRef.current === "settling" ||
          poseRef.current === "encouraging";
        if (cancelled || speaking || !idleFamily) {
          loop();
          return;
        }
        setBlinking(true);
        hold = setTimeout(() => {
          setBlinking(false);
          loop();
        }, 130);
      }, 2800 + Math.random() * 4200);
    };
    loop();
    return () => {
      cancelled = true;
      if (schedule) clearTimeout(schedule);
      if (hold) clearTimeout(hold);
    };
  }, [reduced, speaking]);

  const runSpeech = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setSpeaking(true);
      setPoseHeld("talking");
      await speakAsGretel(text, {
        onStart: () => {
          setSpeaking(true);
          setPoseHeld("talking");
        },
        onEnd: () => setSpeaking(false),
      });
      setSpeaking(false);
      if (poseRef.current === "talking") setPoseHeld("idle");
    },
    [setPoseHeld],
  );

  // Intro once — home greeting OR lesson catalog lines
  useEffect(() => {
    if (!autoIntro || introDone.current) return;
    if (variant === "lesson" && !lesson) return;
    introDone.current = true;
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      setPoseHeld("welcome", 1200);
      await new Promise((r) => setTimeout(r, reduced ? 400 : 900));
      if (cancelled) return;
      const lines =
        variant === "home"
          ? buildHomeIntroLines()
          : buildLessonIntroLines(lesson!);
      for (const line of lines) {
        if (cancelled) return;
        await runSpeech(line);
      }
      if (variant === "lesson" && instruction?.trim() && !cancelled) {
        setPoseHeld("pointing", 1800);
        await runSpeech(instruction.trim());
      }
      if (!cancelled) setPoseHeld("idle");
    })();
    return () => {
      cancelled = true;
      cancelGretelSpeech();
    };
  }, [autoIntro, lesson, instruction, runSpeech, setPoseHeld, reduced, variant]);

  // Bus: full pose repertoire for real student moments (lesson only)
  useEffect(() => {
    if (variant === "home") return;
    return onGretelEvent((type) => {
      const mapped = poseForBusEvent(type);
      if (type === "answer:correct" || type === "activity:complete" || type === "lesson:complete") {
        setPoseHeld("cheering", 1400);
        void runSpeech(buildSuccessLine());
        return;
      }
      if (type === "answer:wrong") {
        setPoseHeld("encouraging", 1200);
        void runSpeech(buildMissLine());
        return;
      }
      if (type === "hint:show") {
        setPoseHeld("pointing");
        return;
      }
      if (type === "hint:hide" || type === "talk:stop") {
        setPoseHeld("idle");
        return;
      }
      if (type === "page-flip") {
        setPoseHeld("settling", 600);
        return;
      }
      if (type === "lesson:start" || type === "mount") {
        setPoseHeld("welcome", 1400);
        return;
      }
      if (mapped === "talking") {
        setPoseHeld("talking");
        return;
      }
    });
  }, [runSpeech, setPoseHeld, variant]);

  useEffect(() => {
    return () => {
      cancelGretelSpeech();
      poseRef.current = "exiting";
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setGretelVoiceMuted(next);
    if (next) {
      cancelGretelSpeech();
      setSpeaking(false);
    }
  };

  const frames = getGretelPoseFrames(pose);
  const bodySrc = Array.isArray(frames)
    ? frames[frameIdx % frames.length]
    : frames;
  const blinkSrc = getGretelPose("blinking");
  const alive = !reduced;
  const showBlink =
    blinking &&
    !speaking &&
    (pose === "idle" || pose === "settling" || pose === "encouraging");

  return (
    <aside
      className={[
        "gretel-presence",
        entered ? "gretel-presence--in" : "",
        speaking ? "gretel-presence--speaking" : "",
        pose === "cheering" ? "gretel-presence--yes" : "",
        pose === "encouraging" ? "gretel-presence--no" : "",
        pose === "waving" || pose === "welcome" ? "gretel-presence--wave" : "",
        pose === "pointing" || pose === "pointingLeft" ? "gretel-presence--point" : "",
        variant === "home" ? "gretel-presence--home" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Gretel, la guía de la cartilla"
      data-testid={variant === "home" ? "book-hero-gretel" : "gretel-presence"}
      data-sticker="false"
      data-gretel-system="presence"
      data-pose={pose}
      data-pose-src={bodySrc}
      data-variant={variant}
    >
      <div className="gretel-presence__stage">
        <span className="gretel-presence__shadow" aria-hidden />
        <div
          className={[
            "gretel-presence__figure",
            alive ? "gretel-presence__figure--alive" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <img
            key={bodySrc}
            src={bodySrc}
            alt=""
            className="gretel-presence__layer gretel-presence__base gretel-presence__base--pose"
            data-testid={variant === "home" ? "book-hero-gretel-pose" : undefined}
            draggable={false}
          />
          <img
            src={blinkSrc}
            alt=""
            className={[
              "gretel-presence__layer gretel-presence__blink",
              showBlink ? "is-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={false}
          />
        </div>
      </div>

      {!hideChrome ? (
        <div className="gretel-presence__chrome">
          <p className="gretel-presence__name">Gretel</p>
          <button
            type="button"
            onClick={toggleMute}
            className="gretel-presence__mute"
            aria-pressed={muted}
            aria-label={muted ? "Activar voz de Gretel" : "Silenciar voz de Gretel"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muted ? "Sin voz" : "Con voz"}</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}
