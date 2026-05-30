import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type GretelPose = "welcome" | "point" | "read" | "celebrate" | "think" | "wave";

interface GretelMascotProps {
  pose?: GretelPose;
  text?: string;
  className?: string;
  bubblePosition?: "left" | "right" | "top";
  showCloseButton?: boolean;
}

const POSE_DIR = "/cartilla/images/gretel/poses";
const BASE_DIR = "/cartilla/images/gretel";

const framesByPose: Record<string, string[]> = {
  welcome: [
    `${POSE_DIR}/pose7-wave-0.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
    `${POSE_DIR}/pose7-wave-2.webp`,
  ],
  wave: [
    `${POSE_DIR}/pose7-wave-0.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
    `${POSE_DIR}/pose7-wave-2.webp`,
  ],
  point: [
    `${POSE_DIR}/point.webp`,
  ],
  read: [
    `${POSE_DIR}/pose7-talk-0.webp`,
    `${POSE_DIR}/pose7-talk-1.webp`,
    `${POSE_DIR}/pose7-talk-2.webp`,
  ],
  celebrate: [
    `${POSE_DIR}/pose7-cheer-0.webp`,
    `${POSE_DIR}/pose7-cheer-1.webp`,
  ],
  think: [
    `${BASE_DIR}/thinking.webp`,
  ],
  idle: [
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-2.webp`,
    `${POSE_DIR}/idle-2.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/idle-1.webp`,
    `${POSE_DIR}/pose7-blink.webp`,
  ],
};

const FRAME_INTERVAL = 140; // ~7 fps

const fallbackByPose: Record<string, string> = {
  welcome: `${BASE_DIR}/happy.webp`,
  wave: `${BASE_DIR}/happy.webp`,
  point: `${BASE_DIR}/encouraging.webp`,
  read: `${BASE_DIR}/idle-1.webp`,
  celebrate: `${BASE_DIR}/cheer.webp`,
  think: `${BASE_DIR}/thinking.webp`,
  idle: `${BASE_DIR}/idle-1.webp`,
};

const variants: Variants = {
  welcome: {
    y: [0, -8, 0],
    rotate: [0, 3, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  point: {
    x: [0, 5, 0],
    scale: 1.05,
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  read: {
    y: [0, -3, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    y: [0, -25, 0, -12, 0],
    scale: [1, 1.12, 0.98, 1.05, 1],
    rotate: [0, 8, -8, 4, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" },
  },
  think: {
    y: [0, -6, 0],
    rotate: [0, -4, 4, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  wave: {
    rotate: [0, 6, -6, 6, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};

export function GretelMascot({
  pose,
  text,
  className = "",
  bubblePosition = "left",
  showCloseButton = false,
}: GretelMascotProps) {
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const activePose = pose || "idle";
  const frames = framesByPose[activePose] || framesByPose.idle;

  useEffect(() => {
    setFrameIndex(0);
    setUseFallback(false);
    if (frames.length <= 1 || shouldReduceMotion) return;
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, FRAME_INTERVAL);
    return () => clearInterval(id);
  }, [frames, shouldReduceMotion]);

  const currentSrc = useFallback ? (fallbackByPose[activePose] || fallbackByPose.idle) : frames[frameIndex];

  const bubbleClasses = {
    left: "right-full mr-4 bottom-6",
    right: "left-full ml-4 bottom-6",
    top: "bottom-full mb-4 left-1/2 -translate-x-1/2",
  };

  const bubbleArrowClasses = {
    left: "right-[-8px] bottom-6 border-l-stone-100 border-t-transparent border-b-transparent border-r-transparent border-y-[8px] border-l-[8px]",
    right:
      "left-[-8px] bottom-6 border-r-stone-100 border-t-transparent border-b-transparent border-l-transparent border-y-[8px] border-r-[8px]",
    top: "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-stone-100 border-x-transparent border-b-transparent border-y-[8px] border-t-[8px] border-x-[8px]",
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {text && bubbleOpen && (
        <div
          className={`absolute z-30 max-w-[200px] sm:max-w-[240px] w-56 rounded-2xl bg-stone-100 p-3 sm:p-4 text-xs sm:text-sm font-bold text-stone-800 shadow-xl border border-stone-200/65 select-none animate-fade-in ${bubbleClasses[bubblePosition]}`}
        >
          <div className={`absolute w-0 h-0 border-solid ${bubbleArrowClasses[bubblePosition]}`} />

          {showCloseButton && (
            <button
              onClick={() => setBubbleOpen(false)}
              className="absolute top-1.5 right-1.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5 rounded-full hover:bg-stone-200 transition"
              aria-label="Cerrar mensaje"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <p className="leading-relaxed whitespace-pre-line pr-2">{text}</p>
        </div>
      )}

      <motion.div
        animate={pose || "welcome"}
        variants={variants}
        className="relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none"
      >
        <img
          src={currentSrc}
          alt={`Gretel - Pose: ${activePose}`}
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => setUseFallback(true)}
        />
      </motion.div>
    </div>
  );
}

export default GretelMascot;
