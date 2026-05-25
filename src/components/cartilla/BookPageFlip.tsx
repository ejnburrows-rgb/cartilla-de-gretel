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
    rotateY: dir > 0 ? 82 : -82,
    rotateX: 2,
    opacity: 0,
    scale: 0.976,
    x: dir > 0 ? 34 : -34,
    filter: "drop-shadow(0 40px 58px rgba(44,30,22,0.36))",
  }),
  center: {
    rotateY: 0,
    rotateX: 0,
    opacity: 1,
    scale: 1,
    x: 0,
    filter: "drop-shadow(0 26px 42px rgba(44,30,22,0.24))",
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? -82 : 82,
    rotateX: -1.5,
    opacity: 0,
    scale: 0.976,
    x: dir > 0 ? -34 : 34,
    filter: "drop-shadow(0 40px 58px rgba(44,30,22,0.36))",
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
  const originClass = direction > 0 ? "origin-left" : "origin-right";

  return (
    <div
      className="relative overflow-visible rounded-[2rem] p-1 [perspective:2100px]"
      style={stageStyle}
    >
      <div className="pointer-events-none absolute -inset-x-8 bottom-0 z-0 h-20 rounded-[50%] bg-[#2c1e16]/30 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-4 bottom-3 z-0 h-8 rounded-[50%] bg-[#2c1e16]/18 blur-xl" />
      <div className="pointer-events-none absolute inset-y-6 left-1/2 z-20 w-14 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3a281e]/20 via-[#3a281e]/7 to-transparent blur-[12px]" />
      <div className="pointer-events-none absolute inset-x-5 bottom-0 z-0 h-full rounded-[1.8rem] border border-amber-950/10 bg-[#fff8e8] translate-y-2 shadow-sm" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 z-0 h-full rounded-[1.8rem] border border-amber-950/10 bg-[#f6edd8] translate-y-4 shadow-sm" />
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className={`relative w-full ${originClass} will-change-transform`}
          style={pageStyle}
        >
          <motion.div
            className="pointer-events-none absolute inset-y-4 z-40 w-9 rounded-full bg-gradient-to-r from-[#fffaf0]/85 via-[#fffaf0]/30 to-transparent blur-[2px]"
            style={direction > 0 ? { right: -8 } : { left: -8, transform: "rotate(180deg)" }}
            initial={{ opacity: 0.9, scaleX: 1.3 }}
            animate={{ opacity: 0.28, scaleX: 1 }}
            exit={{ opacity: 0.82, scaleX: 1.25 }}
            transition={overlayTransition}
          />
          <div className="pointer-events-none absolute inset-y-3 right-[-5px] z-20 w-3 rounded-r-[1.6rem] bg-gradient-to-r from-[#d8c49f]/55 to-[#8a6a3d]/25 shadow-[3px_0_8px_rgba(66,43,22,0.16)]" />
          <div className="pointer-events-none absolute inset-y-3 left-[-3px] z-20 w-2 rounded-l-[1.4rem] bg-[#fff7e8]/70" />
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
