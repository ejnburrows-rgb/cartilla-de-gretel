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
  stiffness: 190,
  damping: 24,
  mass: 0.8,
};

const overlayTransition = {
  duration: 0.28,
  ease: "easeOut" as const,
};

const pageVariants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? 74 : -74,
    opacity: 0,
    scale: 0.985,
    x: dir > 0 ? 22 : -22,
    filter: "drop-shadow(0 32px 48px rgba(44,30,22,0.32))",
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    x: 0,
    filter: "drop-shadow(0 24px 36px rgba(44,30,22,0.22))",
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? -74 : 74,
    opacity: 0,
    scale: 0.985,
    x: dir > 0 ? -22 : 22,
    filter: "drop-shadow(0 32px 48px rgba(44,30,22,0.32))",
  }),
};

const shadeInitial = { opacity: 0.46 };
const shadeCenter = { opacity: 0.12 };
const shadeExit = { opacity: 0.38 };

function glareInitial(direction: 1 | -1) {
  return { opacity: 0.58, x: direction > 0 ? -80 : 80 };
}

function glareExit(direction: 1 | -1) {
  return { opacity: 0.46, x: direction > 0 ? 80 : -80 };
}

const glareCenter = { opacity: 0.18, x: 0 };

export function BookPageFlip({ pageKey, direction, children }: BookPageFlipProps) {
  return (
    <div
      className="relative overflow-visible rounded-[2rem] p-1 [perspective:1900px]"
      style={stageStyle}
    >
      <div className="pointer-events-none absolute -inset-x-6 bottom-1 z-0 h-16 rounded-[50%] bg-[#2c1e16]/25 blur-2xl" />
      <div className="pointer-events-none absolute inset-y-6 left-1/2 z-20 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3a281e]/15 via-[#3a281e]/5 to-transparent blur-[10px]" />
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="relative w-full origin-left will-change-transform"
          style={pageStyle}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.75rem] bg-gradient-to-r from-[#4a3424]/20 via-transparent to-[#fffdf5]/30 mix-blend-multiply"
            initial={shadeInitial}
            animate={shadeCenter}
            exit={shadeExit}
            transition={overlayTransition}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.75rem] bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,245,0.65),transparent_34%),linear-gradient(115deg,transparent,rgba(255,255,245,0.25),transparent)]"
            initial={glareInitial(direction)}
            animate={glareCenter}
            exit={glareExit(direction)}
            transition={overlayTransition}
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
