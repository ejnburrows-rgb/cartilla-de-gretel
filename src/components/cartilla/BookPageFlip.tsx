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
      rotateY: dir > 0 ? 165 : -165,
      opacity: 0,
      z: -30,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      z: 0,
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -165 : 165,
      opacity: 0,
      z: -30,
    }),
  };

  return (
    <div
      className="relative overflow-visible rounded-2xl p-0.5"
      style={{ perspective: "1800px", transformStyle: "preserve-3d" }}
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={pageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative w-full"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Subtle paper shadow overlay that darkens as page curls */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-black/8 pointer-events-none z-10 rounded-2xl"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0.4 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Highlight glare overlay to simulate physical light reflection */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/12 via-white/5 to-transparent pointer-events-none z-10 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
