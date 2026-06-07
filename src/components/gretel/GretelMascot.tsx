import { motion, type Variants } from "framer-motion";
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

/**
 * Gretel renders as a SINGLE clean character image per pose. We deliberately do
 * NOT flip between different sketches anymore â€” that looked like swapping paper
 * cutouts. Instead she stays one consistent drawing and is brought to life with
 * smooth, gentle motion (a soft float / breathe / sway) via framer-motion.
 *
 * NOTE: True avatar-quality movement (her, alive, smooth) requires a proper
 * animated asset â€” a rigged Lottie/Rive puppet or a looping clip built from her
 * official art. That is an art-asset task; this component only makes a single
 * still feel calm and alive without the cheap flicker.
 *
 * Pose art lives in: public/cartilla/images/gretel/poses/
 * served at /cartilla/images/gretel/poses/.
 */
const POSE_DIR = "/cartilla/images/gretel/poses";

// One consistent, full-figure drawing per pose (no jarring frame swaps).
const srcByPose: Record<GretelPose, string> = {
  welcome: `${POSE_DIR}/wave.webp`,
  wave: `${POSE_DIR}/wave.webp`,
  point: `${POSE_DIR}/point.webp`,
  read: `${POSE_DIR}/idle-1.webp`,
  celebrate: `${POSE_DIR}/cheer.webp`,
  think: `${POSE_DIR}/idle-1.webp`,
};

// If a pose image is missing, fall back to a safe full-figure idle drawing.
const FALLBACK_SRC = `${POSE_DIR}/idle-1.webp`;

// Smooth, gentle motion that makes a single still feel alive â€” no sketch swapping.
const variants: Variants = {
  welcome: {
    y: [0, -8, 0],
    rotate: [0, 3, -3, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
  wave: {
    rotate: [0, 5, -5, 5, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  point: {
    y: [0, -4, 0],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  read: {
    y: [0, -5, 0],
    scale: [1, 1.015, 1],
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    y: [0, -16, 0, -8, 0],
    scale: [1, 1.06, 0.99, 1.03, 1],
    rotate: [0, 5, -5, 3, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  think: {
    y: [0, -5, 0],
    scale: [1, 1.015, 1],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

export function GretelMascot({
  pose = "welcome",
  text,
  className = "",
  bubblePosition = "left",
  showCloseButton = false,
}: GretelMascotProps) {
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  // Reset the fallback whenever the pose changes so the right art is tried first.
  useEffect(() => {
    setUseFallback(false);
  }, [pose]);

  const currentSrc = useFallback ? FALLBACK_SRC : srcByPose[pose];

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
      {/* Speech Bubble */}
      {text && bubbleOpen && (
        <div
          className={`absolute z-30 max-w-[200px] sm:max-w-[240px] w-56 rounded-2xl bg-stone-100 p-3 sm:p-4 text-xs sm:text-sm font-bold text-stone-800 shadow-xl border border-stone-200/65 select-none animate-fade-in ${bubbleClasses[bubblePosition]}`}
        >
          {/* Bubble Arrow */}
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

      {/* Mascot Render â€” one consistent drawing, gently animated */}
      <motion.div
        animate={pose}
        variants={variants}
        className="relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none"
      >
        <img
          src={currentSrc}
          alt={`Gretel - ${pose}`}
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => setUseFallback(true)}
        />
      </motion.div>
    </div>
  );
}

export default GretelMascot;

// ──── MERGED FROM THEIRS ────

import { motion, type Variants } from "framer-motion";
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

/**
 * Flip-book animation frames. These .webp files live in:
 *   public/cartilla/images/gretel/poses/
 * and are served at /cartilla/images/gretel/poses/.
 * The component cycles through each pose's frames to make Gretel move.
 * If a frame is missing, it gracefully falls back to a still image so
 * nothing ever breaks.
 */
const POSE_DIR = "/cartilla/images/gretel/poses";

const framesByPose: Record<GretelPose, string[]> = {
  welcome: [
    `${POSE_DIR}/pose7-wave-0.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
    `${POSE_DIR}/pose7-wave-2.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
  ],
  wave: [
    `${POSE_DIR}/pose7-wave-0.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
    `${POSE_DIR}/pose7-wave-2.webp`,
    `${POSE_DIR}/pose7-wave-1.webp`,
  ],
  point: [
    `${POSE_DIR}/pose7-talk-0.webp`,
    `${POSE_DIR}/pose7-talk-1.webp`,
    `${POSE_DIR}/pose7-talk-2.webp`,
    `${POSE_DIR}/pose7-talk-1.webp`,
  ],
  read: [`${POSE_DIR}/pose7-talk-0.webp`, `${POSE_DIR}/pose7-blink.webp`],
  celebrate: [`${POSE_DIR}/pose7-cheer-0.webp`, `${POSE_DIR}/pose7-cheer-1.webp`],
  think: [`${POSE_DIR}/pose7-talk-0.webp`, `${POSE_DIR}/pose7-blink.webp`],
};

// How fast each pose flips its frames (milliseconds per frame).
const frameIntervalByPose: Record<GretelPose, number> = {
  welcome: 220,
  wave: 170,
  point: 240,
  read: 1600,
  celebrate: 200,
  think: 1400,
};

// Safe fallbacks: existing still art already in public/cartilla/images/gretel/.
const fallbackByPose: Record<GretelPose, string> = {
  welcome: "/cartilla/images/gretel/happy.webp",
  point: "/cartilla/images/gretel/encouraging.webp",
  read: "/cartilla/images/gretel/idle-1.webp",
  celebrate: "/cartilla/images/gretel/cheer.webp",
  think: "/cartilla/images/gretel/thinking.webp",
  wave: "/cartilla/images/gretel/happy.webp",
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
  pose = "welcome",
  text,
  className = "",
  bubblePosition = "left",
  showCloseButton = false,
}: GretelMascotProps) {
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  const frames = framesByPose[pose];
  const interval = frameIntervalByPose[pose];

  // Cycle through this pose's frames to animate Gretel.
  useEffect(() => {
    setFrameIndex(0);
    setUseFallback(false);
    if (frames.length <= 1) return;
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, interval);
    return () => clearInterval(id);
  }, [frames, interval]);

  const currentSrc = useFallback ? fallbackByPose[pose] : frames[frameIndex];

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
      {/* Speech Bubble */}
      {text && bubbleOpen && (
        <div
          className={`absolute z-30 max-w-[200px] sm:max-w-[240px] w-56 rounded-2xl bg-stone-100 p-3 sm:p-4 text-xs sm:text-sm font-bold text-stone-800 shadow-xl border border-stone-200/65 select-none animate-fade-in ${bubbleClasses[bubblePosition]}`}
        >
          {/* Bubble Arrow */}
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

      {/* Mascot Render */}
      <motion.div
        animate={pose}
        variants={variants}
        className="relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none"
      >
        <img
          src={currentSrc}
          alt={`Gretel - Pose: ${pose}`}
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => setUseFallback(true)}
        />
      </motion.div>
    </div>
  );
}

export default GretelMascot;
