import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type BookPageFlipProps = {
  pageKey: string | number;
  direction: 1 | -1;
  children: ReactNode;
};

const stageStyle: CSSProperties = {
  transformStyle: "preserve-3d",
};

const pageStyle: CSSProperties = {
  transformStyle: "preserve-3d",
  backfaceVisibility: "hidden",
};

const springTransition = {
  type: "spring" as const,
  stiffness: 210,
  damping: 26,
  mass: 0.78,
};

const overlayTransition = {
  duration: 0.24,
  ease: "easeOut" as const,
};

const pageVariants = {
  enter: (dir: number) => ({
    rotateX: dir > 0 ? 8 : -8,
    opacity: 0,
    scale: 0.982,
    y: dir > 0 ? 46 : -46,
    filter: "drop-shadow(0 34px 48px rgba(44,30,22,0.30))",
  }),
  center: {
    rotateX: 0,
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "drop-shadow(0 24px 38px rgba(44,30,22,0.20))",
  },
  exit: (dir: number) => ({
    rotateX: dir > 0 ? -8 : 8,
    opacity: 0,
    scale: 0.982,
    y: dir > 0 ? -46 : 46,
    filter: "drop-shadow(0 34px 48px rgba(44,30,22,0.30))",
  }),
};

function glareInitial(direction: 1 | -1) {
  return { opacity: 0.5, y: direction > 0 ? -70 : 70 };
}

function glareExit(direction: 1 | -1) {
  return { opacity: 0.38, y: direction > 0 ? 70 : -70 };
}

export function BookPageFlip({ pageKey, direction, children }: BookPageFlipProps) {
  return (
    <div className="relative overflow-visible rounded-[1.6rem] [perspective:1800px]" style={stageStyle}>
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
          className="relative z-10 w-full origin-center will-change-transform"
          style={pageStyle}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.45rem] bg-gradient-to-b from-[#fffdf5]/44 via-transparent to-[#4a3424]/12 mix-blend-multiply"
            initial={{ opacity: 0.42 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0.36 }}
            transition={overlayTransition}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.45rem] bg-[linear-gradient(115deg,transparent,rgba(255,255,245,0.28),transparent)]"
            initial={glareInitial(direction)}
            animate={{ opacity: 0.12, y: 0 }}
            exit={glareExit(direction)}
            transition={overlayTransition}
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
