import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/lib/speak";
import { useGretelAnimation } from "./useGretelAnimation";
import { getGretelPoseFrames, type GretelPoseKey } from "./gretelPoses";
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
    const { currentPose, machineState, send, isSpeaking } = useGretelAnimation();
    const [bubbleText, setBubbleText] = useState<string | null>(null);
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>(
      [],
    );
    const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);
    const [frameIndex, setFrameIndex] = useState(0);
    const sparkleIdCounter = useRef(0);

    /* Pose key: right-side bubble → point-left (G-04); else machine state. */
    const poseKey: GretelPoseKey =
      machineState === "pointing" && bubblePosition === "right" ? "pointingLeft" : machineState;

    /* ── Frame Cycling for Array Poses ── */
    const frames = getGretelPoseFrames(poseKey);

    useEffect(() => {
      if (Array.isArray(frames)) {
        // Different states might need different frame rates, but 150ms is a good default for talk/wave/cheer
        let speed = 150;
        if (machineState === "waving") speed = 200;
        if (machineState === "cheering") speed = 150;
        if (machineState === "talking") speed = 120;

        const interval = setInterval(() => {
          setFrameIndex((prev) => (prev + 1) % frames.length);
        }, speed);
        return () => clearInterval(interval);
      } else {
        setFrameIndex(0);
      }
    }, [frames, poseKey]);

    const activeSrc = Array.isArray(frames) ? frames[frameIndex % frames.length] : frames;

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
      const text =
        customText || CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)];
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
      const handleExit = () => {
        send({ type: "EXIT" });
      };
      window.addEventListener("gretel:celebrate", handleCelebrate);
      window.addEventListener("gretel:exit", handleExit);
      return () => {
        window.removeEventListener("gretel:celebrate", handleCelebrate);
        window.removeEventListener("gretel:exit", handleExit);
        // Lesson leave: play exit wave frame (G-03)
        send({ type: "EXIT" });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        className={`gretel-grounded gretel-grounded--enter relative flex items-center justify-center ${className}`}
      >
        {/* Soft contact shadow — anchors her to the scene (not a floating sticker) */}
        <span className="gretel-grounded__shadow" aria-hidden="true" />

        {/* Warm ambient glow (behind body, above ground shadow) */}
        <motion.div
          animate={getShadowAnimation(machineState)}
          transition={{
            duration: machineState === "cheering" ? 0.8 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full z-0"
          style={{
            width: "70%",
            height: "55%",
            top: "12%",
            background: "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)",
          }}
        />

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
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 0, x: h.x, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.5, 1, 0.8, 0.6] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, delay: h.delay, ease: "easeOut" }}
              className="absolute pointer-events-none z-20 text-rose-400"
            >
              <Star className="w-4 h-4 fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>

        {bubbleText && (
          <span className="sr-only" aria-live="polite">
            {bubbleText}
          </span>
        )}

        {/* Body: ground-anchored, origin bottom; poses crossfade (no hard swap) */}
        <motion.div
          animate={getBodyAnimation(machineState)}
          transition={getBodyTransition(machineState)}
          className={`gretel-grounded__body relative ${SIZES[size]} origin-bottom select-none`}
        >
          <div className="relative aspect-[3/4] h-full mx-auto">
            <AnimatePresence mode="sync" initial={false}>
              <motion.img
                key={activeSrc}
                src={activeSrc}
                alt="Gretel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="gretel-grounded__pose h-full w-full object-contain object-bottom"
                draggable={false}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  },
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
