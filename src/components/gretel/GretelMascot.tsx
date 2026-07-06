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

/**
 * SUPPRESSED visual speech bubble per owner directive (CLAUDE.md
 * "Characters must be ALIVE"): Gretel speaks via TTS audio. The visible text
 * bubble that overlaid and blocked page content is removed. If `text` is
 * passed, it renders as a screen-reader-only live region for a11y.
 *
 * The bubble CSS classes and arrow code below are preserved but unused so
 * the diff is minimal and easy to review. If the owner ever approves visible
 * captions, re-add the `{text && bubbleOpen && (...)}` block.
 */
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
    setBubbleOpen(true);
  }, [pose, text]);

  useEffect(() => {
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

  // Kept for future re-enablement; currently unused since bubble is suppressed.
  void bubblePosition;
  void showCloseButton;
  void bubbleOpen;
  void setBubbleOpen;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Speech bubble SUPPRESSED — Gretel speaks via TTS audio only */}
      {text && (
        <span className="sr-only" role="status" aria-live="polite">
          {text}
        </span>
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
