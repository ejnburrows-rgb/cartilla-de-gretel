import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { speak } from "@/lib/speak";
import { useGretelAnimation } from "./useGretelAnimation";
import { getGretelPoseFrames, getGretelStaticPose } from "./gretelPoses";
import { Sparkles, Star } from "lucide-react";

export interface GretelLiveAvatarRef {
  celebrate: (customText?: string) => Promise<void>;
  speakMessage: (text: string) => Promise<void>;
  encourage: () => Promise<void>;
}

interface GretelLiveAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  bubblePosition?: "left" | "right" | "top";
}

const CONGRATULATIONS = [
  "¡Muy bien!",
  "¡Excelente trabajo!",
  "¡Increíble, lo lograste!",
  "¡Qué gran esfuerzo!",
  "¡Fantástico!",
  "¡Súper bien hecho!",
];

const ENCOURAGEMENTS = [
  "¡Tú puedes hacerlo!",
  "¡Sigue intentándolo!",
  "¡Vamos a practicar juntos!",
  "¡Vas por muy buen camino!",
];

/* ── Size presets ── */
const SIZES = {
  sm: "h-24 w-24 sm:h-28 sm:w-28",
  md: "h-32 w-32 sm:h-44 sm:w-44",
  lg: "h-44 w-44 sm:h-56 sm:w-56",
};

/* ── Per-state animation configs ──
 * Each state gets its own motion signature instead of reusing one
 * vertical-bounce loop everywhere — a real celebratory jump should look
 * different from calm idle breathing, which should look different from a
 * head-tilt while talking. Only "cheering" is meant to read as a bounce;
 * every other state avoids net vertical translation. */
function getBodyAnimation(state: string) {
  switch (state) {
    case "cheering":
      // The one state that should actually look like a jump.
      return {
        y: [0, -28, -10, -28, 0],
        scale: [1, 1.12, 1.05, 1.12, 1],
        rotate: [0, -6, 6, -4, 0],
      };
    case "waving":
      // Side-to-side sway, like the arm swing is carrying through the body.
      return {
        y: 0,
        scale: [1, 1.01, 1],
        rotate: [0, -4, 4, -3, 0],
      };
    case "talking":
      // Small head-tilt nod, not a bounce — mouth frames already carry the motion.
      return {
        y: 0,
        scale: [1, 1.008, 1],
        rotate: [0, -1.5, 1.5, 0],
      };
    case "pointing":
      // Lean into the point and settle, rather than loop-bouncing.
      return {
        y: 0,
        scale: [1, 1.02, 1.01],
        rotate: [0, 2, 1.5],
      };
    case "blinking":
      // Hold still — the pose swap alone should read as the blink.
      return { y: 0, scale: 1, rotate: 0 };
    default: // idle, boot
      // Calm breathing: scale only, no net vertical travel.
      return {
        y: 0,
        scale: [1, 1.008, 1],
        rotate: [-0.3, 0.3, -0.3],
      };
  }
}

function getBodyTransition(state: string) {
  switch (state) {
    case "cheering":
      return { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const };
    case "waving":
      return { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const };
    case "talking":
      return { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const };
    case "pointing":
      return { duration: 0.4, ease: "easeOut" as const };
    case "blinking":
      return { duration: 0.1, ease: "linear" as const };
    default:
      return { duration: 6, repeat: Infinity, ease: "easeInOut" as const };
  }
}

/* ── Shadow glow animation per state ── */
function getShadowAnimation(state: string) {
  switch (state) {
    case "cheering":
      return {
        boxShadow: [
          "0 0 20px 8px rgba(251,191,36,0.0)",
          "0 0 40px 16px rgba(251,191,36,0.4)",
          "0 0 60px 24px rgba(251,191,36,0.6)",
          "0 0 40px 16px rgba(251,191,36,0.4)",
          "0 0 20px 8px rgba(251,191,36,0.0)",
        ],
      };
    case "talking":
      return {
        boxShadow: [
          "0 0 12px 4px rgba(251,191,36,0.0)",
          "0 0 20px 8px rgba(251,191,36,0.25)",
          "0 0 12px 4px rgba(251,191,36,0.0)",
        ],
      };
    default:
      return {
        boxShadow: [
          "0 0 10px 4px rgba(251,191,36,0.0)",
          "0 0 15px 6px rgba(251,191,36,0.12)",
          "0 0 10px 4px rgba(251,191,36,0.0)",
        ],
      };
  }
}

export const GretelLiveAvatar = forwardRef<GretelLiveAvatarRef, GretelLiveAvatarProps>(
  ({ className = "", size = "md", bubblePosition = "top" }, ref) => {
    const { machineState, send } = useGretelAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [bubbleText, setBubbleText] = useState<string | null>(null);
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
    const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);
    const [frameIndex, setFrameIndex] = useState(0);
    const sparkleIdCounter = useRef(0);
    // bubblePosition reserved for future non-blocking layout variants
    void bubblePosition;

    /* ── Frame Cycling for Array Poses (disabled when reduced-motion) ── */
    const frames = prefersReducedMotion
      ? getGretelStaticPose(machineState)
      : getGretelPoseFrames(machineState);

    useEffect(() => {
      if (prefersReducedMotion) {
        setFrameIndex(0);
        return;
      }
      if (Array.isArray(frames)) {
        // Gentle source-frame cycle — not a vertical bounce loop
        let speed = 150;
        if (machineState === "waving") speed = 200;
        if (machineState === "cheering") speed = 150;
        if (machineState === "talking") speed = 120;

        const interval = setInterval(() => {
          setFrameIndex((prev) => (prev + 1) % frames.length);
        }, speed);
        return () => clearInterval(interval);
      }
      setFrameIndex(0);
    }, [frames, machineState, prefersReducedMotion]);

    const activeSrc = Array.isArray(frames) ? frames[frameIndex] : frames;

    /* ── Sparkle burst ── */
    const generateSparkles = () => {
      const colors = ["#fbbf24", "#f59e0b", "#fb923c", "#f97316", "#fcd34d", "#fef08a"];
      const newSparkles = Array.from({ length: 12 }).map(() => ({
        id: sparkleIdCounter.current++,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setSparkles((prev) => [...prev, ...newSparkles]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !newSparkles.find((ns) => ns.id === s.id)));
      }, 1500);
    };

    /* ── Hearts float up on encourage ── */
    const generateHearts = () => {
      const newHearts = Array.from({ length: 5 }).map((_, i) => ({
        id: sparkleIdCounter.current++,
        x: (Math.random() - 0.5) * 120,
        delay: i * 0.15,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
      }, 2000);
    };

    /* ── Core actions ── */
    const speakMessage = async (text: string) => {
      setBubbleText(text);
      await speak(text);
      setBubbleText(null);
    };

    const celebrate = async (customText?: string) => {
      const text = customText || CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)];
      send({ type: "CHEER" });
      generateSparkles();
      await speakMessage(text);
      send({ type: "IDLE" });
    };

    const encourage = async () => {
      const text = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      send({ type: "POINT" });
      generateHearts();
      await speakMessage(text);
      send({ type: "IDLE" });
    };

    useImperativeHandle(ref, () => ({
      celebrate,
      speakMessage,
      encourage,
    }));

    /* ── Listen for global gretel:celebrate events ── */
    useEffect(() => {
      if (typeof window === "undefined") return;
      const handleCelebrate = (e: Event) => {
        const detail = (e as CustomEvent<{ text?: string }>).detail;
        celebrate(detail?.text);
      };
      window.addEventListener("gretel:celebrate", handleCelebrate);
      return () => window.removeEventListener("gretel:celebrate", handleCelebrate);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const bodyAnim = prefersReducedMotion ? { y: 0, scale: 1, rotate: 0 } : getBodyAnimation(machineState);
    const bodyTrans = prefersReducedMotion
      ? { duration: 0 }
      : getBodyTransition(machineState);

    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        role="img"
        aria-label="Gretel, la guía de lectura"
      >

        {/* ── Warm halo glow behind Gretel ── */}
        {!prefersReducedMotion && (
          <motion.div
            animate={getShadowAnimation(machineState)}
            transition={{ duration: machineState === "cheering" ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full"
            style={{ width: "70%", height: "70%", background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
        )}

        {/* ── Sparkle particles ── */}
        {!prefersReducedMotion && (
          <AnimatePresence>
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.4, 0],
                  opacity: [0.9, 1, 0],
                  x: s.x,
                  y: s.y,
                  rotate: [0, 180, 360],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute pointer-events-none z-20"
                style={{ color: s.color }}
                aria-hidden="true"
              >
                <Sparkles className="w-5 h-5 fill-current" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* ── Floating stars (on encourage) — decorative only ── */}
        {!prefersReducedMotion && (
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 0, x: h.x, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.5, 1, 0.8, 0.6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, delay: h.delay, ease: "easeOut" }}
                className="absolute pointer-events-none z-20 text-rose-400"
                aria-hidden="true"
              >
                <Star className="w-4 h-4 fill-current" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Feedback is spoken via TTS — no visible bubble that blocks content. */}
        {bubbleText && (
          <span className="sr-only" aria-live="polite">
            {bubbleText}
          </span>
        )}

        {/* ── Gretel's body — living avatar; static when reduced-motion ── */}
        <motion.div
          animate={bodyAnim}
          transition={bodyTrans}
          className={`relative ${SIZES[size]} origin-bottom select-none`}
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? { skewX: 0, skewY: 0 }
                : {
                    skewX: machineState === "cheering" ? [-1, 1, -1] : [-0.3, 0.3, -0.3],
                    skewY: machineState === "talking" ? [-0.5, 0.5, -0.5] : [0, 0, 0],
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : machineState === "cheering" ? 0.4 : 5,
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-full"
          >
            <div className="relative aspect-[3/4] h-full mx-auto">
              <img
                src={activeSrc}
                alt=""
                width={256}
                height={341}
                className="h-full w-full object-contain"
                draggable={false}
                decoding="async"
                // Decorative when parent has aria-label; empty alt avoids double-announce
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

GretelLiveAvatar.displayName = "GretelLiveAvatar";

/* ── Convenience hook ── */
export function useGretelLive() {
  const avatarRef = useRef<GretelLiveAvatarRef>(null);

  const triggerCelebration = (text?: string) => {
    avatarRef.current?.celebrate(text);
  };

  const triggerEncouragement = () => {
    avatarRef.current?.encourage();
  };

  return {
    avatarRef,
    triggerCelebration,
    triggerEncouragement,
  };
}
