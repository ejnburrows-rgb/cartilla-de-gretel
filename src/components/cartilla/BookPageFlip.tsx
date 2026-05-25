import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

type BookPageFlipProps = {
  pageKey: string | number;
  direction: 1 | -1;
  children: ReactNode;
};

export function BookPageFlip({ pageKey, direction, children }: BookPageFlipProps) {
  const variants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 74 : -74,
      opacity: 0,
      scale: 0.985,
      x: dir > 0 ? 22 : -22,
      filter: "drop-shadow(0 28px 32px rgba(0,0,0,0.24))",
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      x: 0,
      filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.16))",
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -74 : 74,
      opacity: 0,
      scale: 0.985,
      x: dir > 0 ? -22 : 22,
      filter: "drop-shadow(0 28px 32px rgba(0,0,0,0.24))",
    }),
  };

  return (
    <div
      className="relative overflow-visible rounded-[2rem] p-1 [perspective:1800px]"
      style= transformStyle: "preserve-3d" 
    >
      <div className="pointer-events-none absolute inset-y-6 left-1/2 z-20 w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-black/14 via-black/6 to-transparent blur-md" />
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition= type: "spring", stiffness: 210, damping: 26, mass: 0.82 
          className="relative w-full origin-left will-change-transform"
          style= transformStyle: "preserve-3d", backfaceVisibility: "hidden" 
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.75rem] bg-gradient-to-r from-black/18 via-transparent to-white/10 mix-blend-multiply"
            initial= opacity: 0.55 
            animate= opacity: 0.1 
            exit= opacity: 0.5 
            transition= duration: 0.22 
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 rounded-[1.75rem] bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.55),transparent_34%),linear-gradient(115deg,transparent,rgba(255,255,255,0.22),transparent)]"
            initial= opacity: 0.35 
            animate= opacity: 0.08 
            exit= opacity: 0.3 
            transition= duration: 0.22 
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
