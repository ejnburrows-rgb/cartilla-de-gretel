import React, { useState, useEffect, useRef, useMemo } from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { usePageFlip } from "@/hooks/usePageFlip";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Hoisted Styles for double-brace JSX styling ban compliance
const flipBookContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxHeight: "65vh",
  aspectRatio: "4/3",
  borderRadius: "1rem",
  overflow: "hidden",
  userSelect: "none",
  touchAction: "pan-y",
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
  const [peekPage, setPeekPage] = useState(initialPageNumber);

  const { flip, isFlipping, direction, handleTransitionEnd } = usePageFlip(520);

  // Sync with initial page changes
  useEffect(() => {
    setActivePage(initialPageNumber);
  }, [initialPageNumber]);

  const triggerNext = () => {
    if (isFlipping || activePage >= to) return;
    const nextPage = activePage + 1;
    setPeekPage(nextPage);
    flip("next", () => {
      setActivePage(nextPage);
    });
  };

  const triggerPrev = () => {
    if (isFlipping || activePage <= from) return;
    const prevPage = activePage - 1;
    setPeekPage(prevPage);
    flip("prev", () => {
      setActivePage(prevPage);
    });
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

    // Horizontal swipe threshold: 80px
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
      className="select-none relative bg-stone-100"
    >
      <div className="cartilla-flip-book w-full h-full relative">
        {/* 1. Underlying Peek Page */}
        {isFlipping && (
          <div className="cartilla-flip-underlay absolute inset-0">
            <PdfPage
              pageNumber={peekPage}
              className="rounded-xl overflow-hidden object-contain max-h-[60vh] shadow-sm"
            />
          </div>
        )}

        {/* 2. Top Active Page that rotates */}
        <div
          className={`cartilla-flip-book-page absolute inset-0 ${isFlipping ? "flipped" : ""}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <PdfPage
            pageNumber={isFlipping ? activePage : activePage}
            className="rounded-xl overflow-hidden object-contain max-h-[60vh]"
          />
        </div>
      </div>

      {/* 3. Screen overlays for book navigation */}
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
