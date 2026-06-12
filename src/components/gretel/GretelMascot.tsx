import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useGretelAnimation } from "./useGretelAnimation";

export type GretelPose = "welcome" | "point" | "read" | "celebrate" | "think" | "wave";

interface GretelMascotProps {
  pose?: GretelPose;
  text?: string;
  className?: string;
  bubblePosition?: "left" | "right" | "top";
  showCloseButton?: boolean;
}

// Smooth, gentle motion that makes a single still feel alive — no sketch swapping.
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
  const { currentPose, send } = useGretelAnimation();

  useEffect(() => {
    // Reset bubble open state when pose or text changes
    setBubbleOpen(true);
  }, [pose, text]);

  useEffect(() => {
    // Map props to FSM triggers
    switch (pose) {
      case "welcome":
      case "wave":
        send({ type: "WAVE" });
        break;
      case "point":
        send({ type: "POINT" });
        break;
      case "celebrate":
        send({ type: "CHEER" });
        break;
      case "read":
      case "think":
      default:
        send({ type: "IDLE" });
        break;
    }
  }, [pose, send]);

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

      {/* Mascot Render — one consistent drawing, gently animated */}
      <motion.div
        animate={pose}
        variants={variants}
        className="relative h-24 w-24 sm:h-36 sm:w-36 origin-bottom drop-shadow-xl select-none"
      >
        <img
          src={currentPose}
          alt={`Gretel - ${pose}`}
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => send({ type: "ASSET_ERROR" })}
        />
      </motion.div>
    </div>
  );
}

export default GretelMascot;
