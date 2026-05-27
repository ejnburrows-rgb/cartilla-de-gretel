import { motion, Variants } from "framer-motion";

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

export function GretelMascot({ state = "idle", className = "" }: GretelMascotProps) {
  return (
    <div className={`pointer-events-none z-50 ${className}`}>
      <motion.div
        animate={state}
        variants={variants}
        className="relative w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl origin-bottom"
      >
        <img
          src="/cartilla/art/gretel-hd.png"
          alt="Gretel"
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%236366f1' opacity='0.2'/%3E%3Ctext x='50' y='55' font-size='12' text-anchor='middle' fill='%234f46e5' font-family='sans-serif'%3EGretel%3C/text%3E%3C/svg%3E";
          }}
        />
      </motion.div>
    </div>
  );
}
