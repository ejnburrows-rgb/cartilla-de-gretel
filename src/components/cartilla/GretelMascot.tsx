import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

export type GretelState = "idle" | "pointing" | "cheering";

interface GretelMascotProps {
  state?: GretelState;
  className?: string;
}

const variants: Variants = {
  idle: {
    y: [0, -6, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pointing: {
    y: [0, -3, 0],
    scale: 1.05,
    rotate: [0, -5, 0],
    transition: {
      duration: 0.5,
    },
  },
  cheering: {
    y: [0, -20, 0, -10, 0],
    scale: [1, 1.1, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 1.2,
      repeat: 3,
    },
  },
};

// Single still per state — always present, used as the guaranteed fallback.
const stillByState: Record<GretelState, string> = {
  idle: "/gretel/idle-1.webp",
  pointing: "/gretel/encouraging.webp",
  cheering: "/gretel/cheer.webp",
};

// Optional multi-frame sequences exported by the art pipeline into
// public/gretel/frames/<state>-<n>.webp. When present they are cycled to
// produce real frame-by-frame motion (talking mouth, waving, cheering, blink).
// When absent (404), the component silently falls back to the single still,
// so it behaves exactly as before until frames land.
const MAX_FRAMES_PER_STATE = 6;
const FRAME_INTERVAL_MS = 180;

function frameCandidates(state: GretelState): string[] {
  const list: string[] = [];
  for (let i = 0; i < MAX_FRAMES_PER_STATE; i++) {
    list.push(`/gretel/frames/${state}-${i}.webp`);
  }
  return list;
}

export function GretelMascot({ state = "idle", className = "" }: GretelMascotProps) {
  const still = stillByState[state];
  const [loadedFrames, setLoadedFrames] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);

  // Preload frame candidates for the active state (client-only).
  useEffect(() => {
    setLoadedFrames([]);
    setFrameIndex(0);
    if (typeof window === "undefined") return;

    let cancelled = false;
    const candidates = frameCandidates(state);
    const found: string[] = [];
    let pending = candidates.length;

    const settle = () => {
      pending -= 1;
      if (!cancelled && pending === 0) {
        setLoadedFrames(found.filter(Boolean));
      }
    };

    candidates.forEach((src, idx) => {
      const img = new Image();
      img.onload = () => {
        found[idx] = src;
        settle();
      };
      img.onerror = settle;
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [state]);

  // Cycle the frames that actually loaded.
  useEffect(() => {
    if (loadedFrames.length < 2) return;
    const id = window.setInterval(() => {
      setFrameIndex((i) => (i + 1) % loadedFrames.length);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [loadedFrames]);

  const src =
    loadedFrames.length > 0
      ? loadedFrames[Math.min(frameIndex, loadedFrames.length - 1)]
      : still;

  return (
    <div className={`pointer-events-none z-50 ${className}`}>
      <motion.div
        animate={state}
        variants={variants}
        className="relative h-32 w-32 origin-bottom drop-shadow-2xl md:h-48 md:w-48"
      >
        <img
          src={src}
          alt="Gretel"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
