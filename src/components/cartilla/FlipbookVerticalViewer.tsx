import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipbookVerticalViewerProps {
  pageNumber: number;
  className?: string;
  /** Overrides the resolved workbook scan with an explicit image (e.g. a Teacher Flip Chart master). */
  srcOverride?: string;
  /** Overrides the default "Página N del libro" alt/aria-label text when srcOverride is set. */
  altOverride?: string;
}

import { getBookPageImage } from "@/lib/bookImages";

export function FlipbookVerticalViewer({
  pageNumber,
  className = "",
  srcOverride,
  altOverride,
}: FlipbookVerticalViewerProps) {
  const safePageNumber = Math.max(1, pageNumber);
  const src = srcOverride ?? getBookPageImage(safePageNumber);
  const label = altOverride ?? `Página ${safePageNumber} del libro`;

  // Track previous page to determine direction
  const [prevPage, setPrevPage] = useState(pageNumber);
  const direction = pageNumber > prevPage ? 1 : -1;

  useEffect(() => {
    setPrevPage(pageNumber);
  }, [pageNumber]);

  // Framer Motion variants for a vertical (spiral-bound) flip
  const variants = {
    enter: (direction: number) => {
      // If going forward, the new page comes from underneath (static).
      // If going backward, the new page folds DOWN from the top.
      return {
        rotateX: direction > 0 ? 0 : 90,
        opacity: direction > 0 ? 0.5 : 0, // Slight fade to hide behind the exiting page
        zIndex: direction > 0 ? 0 : 10,
      };
    },
    center: {
      rotateX: 0,
      opacity: 1,
      zIndex: 5,
    },
    exit: (direction: number) => {
      // If going forward, the old page folds UP to the top.
      // If going backward, the old page stays static underneath.
      return {
        rotateX: direction > 0 ? 90 : 0,
        opacity: direction > 0 ? 0 : 0.5,
        zIndex: direction > 0 ? 10 : 0,
      };
    },
  };

  return (
    <div className={`relative perspective-[1500px] flex items-center justify-center ${className}`}>
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <motion.div
          key={pageNumber}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 0.8,
          }}
          style={{
            transformOrigin: "top center",
            backfaceVisibility: "hidden",
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label={label}
        >
          <img
            src={src}
            alt={label}
            className="w-full h-full object-contain drop-shadow-xl"
            loading="lazy"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
