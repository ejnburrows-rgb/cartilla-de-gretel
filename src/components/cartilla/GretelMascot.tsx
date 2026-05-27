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

const imageByState: Record<GretelState, string> = {
  idle: "/gretel/idle-1.webp",
  pointing: "/gretel/encouraging.webp",
  cheering: "/gretel/cheer.webp",
};

export function GretelMascot({ state = "idle", className = "" }: GretelMascotProps) {
  return (
    <div className={`pointer-events-none z-50 ${className}`}>
      <motion.div
        animate={state}
        variants={variants}
        className="relative h-32 w-32 origin-bottom drop-shadow-2xl md:h-48 md:w-48"
      >
        <img
          src={imageByState[state]}
          alt="Gretel"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
