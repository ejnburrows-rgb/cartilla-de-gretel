import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type BookPageFlipProps = {
  pageKey: string | number;
  direction: 1 | -1;
  children: ReactNode;
};

const stageStyle: CSSProperties = {
  perspective: "2400px",
  transformStyle: "preserve-3d",
};

const pageStyle: CSSProperties = {
  transformOrigin: "left center",
  transformStyle: "preserve-3d",
  backfaceVisibility: "hidden",
  willChange: "transform, opacity",
};

const springTransition = {
  type: "spring" as const,
  stiffness: 180,
  damping: 28,
  mass: 0.9,
};

const pageVariants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? -88 : 0,
    opacity: dir > 0 ? 0 : 1,
    x: dir > 0 ? -32 : 0,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? 0 : -88,
    opacity: dir > 0 ? 1 : 0,
    x: dir > 0 ? 0 : -32,
  }),
};

const RING_COUNT = 14;

function SpiralBinding() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-3 left-1 z-20 flex w-7 flex-col items-center justify-around"
    >
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <span
          key={i}
          className="relative block h-5 w-5 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1.5px_2px_rgba(0,0,0,0.4),0_1.5px_3px_rgba(0,0,0,0.28)]"
        >
          <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/65 blur-[1px]" />
          <span className="absolute inset-x-1 bottom-0.5 h-px rounded-full bg-black/35" />
        </span>
      ))}
    </div>
  );
}

export function BookPageFlip({ pageKey, direction, children }: BookPageFlipProps) {
  return (
    <div className="relative overflow-visible rounded-[1.6rem]" style={stageStyle}>
      <div className="pointer-events-none absolute -inset-x-6 bottom-0 z-0 h-16 rounded-[50%] bg-[#2c1e16]/24 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-8 bottom-1 z-0 h-8 rounded-[50%] bg-[#2c1e16]/16 blur-xl" />
      <div className="pointer-events-none absolute inset-x-5 bottom-0 z-0 h-full rounded-[1.4rem] border border-amber-950/10 bg-[#fff8e8] translate-y-2 shadow-sm" />
      <div className="pointer-events-none absolute inset-x-9 bottom-0 z-0 h-full rounded-[1.4rem] border border-amber-950/10 bg-[#f6edd8] translate-y-4 shadow-sm" />

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="relative z-10 w-full"
          style={pageStyle}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 rounded-l-[1.45rem] bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
          <SpiralBinding />
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.45rem] bg-[linear-gradient(115deg,transparent,rgba(255,255,245,0.30),transparent)] mix-blend-screen"
            initial= opacity: 0.55, x: direction > 0 ? -90 : 90 
            animate= opacity: 0, x: direction > 0 ? 90 : -90 
            transition= duration: 0.5, ease: "easeOut" 
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
