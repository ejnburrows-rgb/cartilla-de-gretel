import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { ChevronLeft, ChevronRight } from "lucide-react";

const flipBookContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxHeight: "65vh",
  aspectRatio: "4/3",
  borderRadius: "1rem",
  overflow: "hidden",
  userSelect: "none",
  touchAction: "pan-y",
  backgroundColor: "#fdfbf7",
  boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
};

const navigationOverlayStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "0.85rem",
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-between",
  padding: "0 1.25rem",
  zIndex: 30,
  pointerEvents: "none",
};

const navBtnStyle = (color: string, disabled: boolean): React.CSSProperties => ({
  backgroundColor: disabled ? "#f5f5f4" : "#ffffff",
  border: `2px solid ${disabled ? "#e7e5e4" : color}`,
  color: disabled ? "#a8a29e" : color,
  padding: "0.35rem 0.85rem",
  borderRadius: "0.75rem",
  fontSize: "0.7rem",
  fontWeight: "bold",
  cursor: disabled ? "not-allowed" : "pointer",
  pointerEvents: disabled ? "none" : "auto",
  boxShadow: disabled ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  transition: "all 0.1s ease",
});

interface FlipBookProps {
  entry: CatalogEntry;
  initialPageNumber: number;
}

export function FlipBook({ entry, initialPageNumber }: FlipBookProps) {
  const parts = useMemo(() => entry.pages.split("-").map(Number), [entry]);
  const from = parts[0] || 1;
  const to = parts[1] || from;

  const [activePage, setActivePage] = useState(initialPageNumber);
  const [prevPage, setPrevPage] = useState(initialPageNumber);
  const [isFlipping, setIsFlipping] = useState(false);

  // Direction: 1 = next page (flips to left), -1 = prev page (flips from left to right)
  const direction = activePage > prevPage ? 1 : -1;

  useEffect(() => {
    setActivePage(initialPageNumber);
    setPrevPage(initialPageNumber);
  }, [initialPageNumber]);

  const triggerNext = () => {
    if (isFlipping || activePage >= to) return;
    setPrevPage(activePage);
    setActivePage((p) => p + 1);
    setIsFlipping(true);
  };

  const triggerPrev = () => {
    if (isFlipping || activePage <= from) return;
    setPrevPage(activePage);
    setActivePage((p) => p - 1);
    setIsFlipping(true);
  };

  const onAnimationComplete = () => {
    setIsFlipping(false);
  };

  // Horizontal Side-to-Side Flip Variants
  const variants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 0 : -90,
      opacity: direction > 0 ? 0.5 : 0,
      zIndex: direction > 0 ? 0 : 10,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      zIndex: 5,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 0,
      opacity: direction > 0 ? 0 : 0.5,
      zIndex: direction > 0 ? 10 : 0,
    }),
  };

  // Touch handlers for lightweight swiping gestures
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || 0;
    touchStartY.current = e.touches[0]?.clientY || 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const endY = e.changedTouches[0]?.clientY || 0;

    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 80) {
        triggerNext();
      } else if (diffX < -80) {
        triggerPrev();
      }
    }
  };

  const color = entry.color || "#8B5A2B";
  const hasPrev = activePage > from;
  const hasNext = activePage < to;

  const prevStyle = navBtnStyle(color, !hasPrev || isFlipping);
  const nextStyle = navBtnStyle(color, !hasNext || isFlipping);

  return (
    <div
      style={flipBookContainerStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="select-none perspective-[1500px]"
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <AnimatePresence custom={direction} mode="popLayout" initial={false} onExitComplete={onAnimationComplete}>
          <motion.div
            key={activePage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
            style={{
              transformOrigin: "center left",
              backfaceVisibility: "hidden",
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <PdfPage
              pageNumber={activePage}
              className="rounded-xl overflow-hidden object-contain max-h-[60vh] drop-shadow-md bg-transparent"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={navigationOverlayStyle} className="no-print">
        <button
          onClick={triggerPrev}
          style={prevStyle}
          disabled={!hasPrev || isFlipping}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Anterior
        </button>

        <span className="bg-white/80 dark:bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-stone-600 dark:text-stone-300 font-mono shadow-sm self-center pointer-events-auto">
          Pág. {activePage} de {to}
        </span>

        <button
          onClick={triggerNext}
          style={nextStyle}
          disabled={!hasNext || isFlipping}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
