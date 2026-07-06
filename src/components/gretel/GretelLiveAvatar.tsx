import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/lib/speak";
import { useGretelAnimation } from "./useGretelAnimation";
import { getGretelPoseFrames } from "./gretelPoses";
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

/* ── Per-state animation configs ── */
function getBodyAnimation(state: string) {
  switch (state) {
    case "cheering":
      return {
        y: [0, -28, -10, -28, 0],
        scale: [1, 1.12, 1.05, 1.12, 1],
        rotate: [0, -6, 6, -4, 0],
      };
    case "waving":
      return {
        y: [0, -4, 0, -4, 0],
        scale: [1, 1.02, 1, 1.02, 1],
        rotate: [0, -3, 3, -2, 0],
      };
    case "talking":
      return {
        y: [0, -3, 0, -2, 0],
        scale: [1, 1.015, 1, 1.01, 1],
        rotate: [0, -1, 1, 0, 0],
      };
    case "pointing":
      return {
        y: [0, -5, 0],
        scale: [1, 1.03, 1],
        rotate: [0, 2, 0],
      };
    default: // idle, blinking, boot
      return {
        y: [0, -5, 0],
        scale: [1, 1.015, 1],
        rotate: [-0.5, 0.5, -0.5],
      };
  }
}

function getBodyTransition(state: string) {
  switch (state) {
    case "cheering":
      return { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const };
    case "waving":
      return { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const };
    case "talking":
      return { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const };
    case "pointing":
      return { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const };
    default:
      return { duration: 4, repeat: Infinity, ease: "easeInOut" as const };
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
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
    const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);
    const [frameIndex, setFrameIndex] = useState(0);
    const sparkleIdCounter = useRef(0);

    /* ── Frame Cycling for Array Poses ── */
    const frames = getGretelPoseFrames(machineState);

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
    }, [frames, machineState]);

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

    /* ── Bubble positioning ── */
    const bubbleClasses = {
      left: "right-full mr-4 bottom-6",
      right: "left-full ml-4 bottom-6",
      top: "bottom-full mb-4 left-1/2 -translate-x-1/2",
    };

    const bubbleArrowClasses = {
      left: "right-[-8px] bottom-6 border-l-amber-100 border-t-transparent border-b-transparent border-r-transparent border-y-[8px] border-l-[8px]",
      right: "left-[-8px] bottom-6 border-r-amber-100 border-t-transparent border-b-transparent border-l-transparent border-y-[8px] border-r-[8px]",
      top: "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-amber-100 border-x-transparent border-b-transparent border-y-[8px] border-t-[8px] border-x-[8px]",
    };

    return (
      <div className={`relative flex items-center justify-center ${className}`}>

        {/* ── Warm halo glow behind Gretel ── */}
        <motion.div
          animate={getShadowAnimation(machineState)}
          transition={{ duration: machineState === "cheering" ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full"
          style={{ width: "70%", height: "70%", background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)" }}
        />

        {/* ── Sparkle particles ── */}
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

        {/* ── Floating hearts (on encourage) ── */}
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

        {/* ── Speech bubble ── */}
        <AnimatePresence>
          {bubbleText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 14 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`absolute z-30 max-w-[220px] w-56 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 text-sm font-black text-amber-900 shadow-2xl border-2 border-amber-200 select-none ${bubbleClasses[bubblePosition]}`}
            >
              <div className={`absolute w-0 h-0 border-solid ${bubbleArrowClasses[bubblePosition]}`} />
              {/* Animated text typing feel */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="leading-relaxed text-center text-base"
              >
                {bubbleText}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Gretel's body — the living, breathing avatar ── */}
        <motion.div
          animate={getBodyAnimation(machineState)}
          transition={getBodyTransition(machineState)}
          className={`relative ${SIZES[size]} origin-bottom select-none`}
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" }}
        >
          {/* Inner subtle secondary motion layer — slight skew for liveliness */}
          <motion.div
            animate={{
              skewX: machineState === "cheering" ? [-1, 1, -1] : [-0.3, 0.3, -0.3],
              skewY: machineState === "talking" ? [-0.5, 0.5, -0.5] : [0, 0, 0],
            }}
            transition={{
              duration: machineState === "cheering" ? 0.4 : 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-full"
          >
            <div className="relative aspect-[3/4] h-full mx-auto">
              <motion.img
                src={activeSrc}
                alt="Gretel"
                initial={{ opacity: 0.7, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full object-contain"
                draggable={false}
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
