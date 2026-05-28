import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ClassroomPageEntry {
  id: string;
  content: ReactNode;
}

export interface ClassroomBookFlipProps {
  pages: ClassroomPageEntry[];
  initialIndex?: number;
}

const stageStyle = { perspective: 1800 } as const;
const pageStyle = {
  transformOrigin: "top center",
  transformStyle: "preserve-3d" as const,
  backfaceVisibility: "hidden" as const,
};
const pageTransition = { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] as const };

const pageVariants = {
  enter: (dir: number) => ({
    rotateX: dir === 1 ? -92 : 92,
    opacity: 0,
  }),
  center: { rotateX: 0, opacity: 1 },
  exit: (dir: number) => ({
    rotateX: dir === 1 ? 92 : -92,
    opacity: 0,
  }),
};

/**
 * Vertical 3D flip chart for the teacher's classroom book.
 * Pages rotate around their top edge — like a spiral-bound desk easel.
 *
 * Built on framer-motion only (react-pageflip is horizontal-only).
 * Lane-lock note: this component does NOT modify Reader.tsx or anything
 * under src/routes/_authenticated/**.
 */
export function ClassroomBookFlip({
  pages,
  initialIndex = 0,
}: ClassroomBookFlipProps) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<1 | -1>(1);

  const goNext = () => {
    if (index < pages.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    }
  };
  const goPrev = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex((i) => i - 1);
    }
  };

  const current = pages[index];

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Spiral binding at the top */}
      <div
        aria-hidden
        className="mx-auto mb-2 flex h-6 w-3/5 items-center justify-around rounded-full"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="block h-6 w-1.5 rounded-full bg-[hsl(31,56%,48%)]/55 shadow-inner"
          />
        ))}
      </div>

      <div className="relative" style={stageStyle}>
        <div className="relative aspect-[4/3] w-full">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current.id}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              style={pageStyle}
              className="absolute inset-0 rounded-2xl border-2 border-[hsl(28,30%,18%)]/10 bg-[hsl(48_100%_97%)] p-10 shadow-[0_24px_60px_hsl(28_30%_18%/0.18)]"
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom edge shadow to suggest depth */}
        <div
          aria-hidden
          className="mx-auto mt-1 h-3 w-[95%] rounded-b-2xl bg-gradient-to-b from-[hsl(28,30%,18%)]/15 to-transparent"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="min-h-12 rounded-full bg-white px-5 py-2 text-sm font-black text-[hsl(28,30%,18%)] shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Lámina anterior"
        >
          ↑ Anterior
        </button>
        <p className="text-sm font-bold text-[hsl(28,30%,18%)]/60">
          Lámina {index + 1} de {pages.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={index === pages.length - 1}
          className="min-h-12 rounded-full bg-[hsl(197,41%,22%)] px-5 py-2 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Siguiente lámina"
        >
          Siguiente ↓
        </button>
      </div>
    </div>
  );
}
