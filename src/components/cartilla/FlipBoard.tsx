import React, { useState, useEffect } from "react";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { usePageFlip } from "@/hooks/usePageFlip";
import "@/styles/cartilla-polish.css";

// Hoisted Styles for double-brace JSX styling ban compliance
const boardContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxHeight: "65vh",
  aspectRatio: "4/3",
  borderRadius: "1.5rem",
  overflow: "hidden",
  userSelect: "none",
};

interface FlipBoardProps {
  pageNumber: number;
}

export function FlipBoard({ pageNumber }: FlipBoardProps) {
  const [activePage, setActivePage] = useState(pageNumber);
  const [peekPage, setPeekPage] = useState(pageNumber);

  const { flip, isFlipping, handleTransitionEnd } = usePageFlip(600);

  // Trigger vertical down-to-up flip transition whenever pageNumber changes
  useEffect(() => {
    if (pageNumber === activePage) return;
    setPeekPage(pageNumber);
    flip("next", () => {
      setActivePage(pageNumber);
    });
  }, [pageNumber, activePage, flip]);

  return (
    <div style={boardContainerStyle} className="bg-stone-950 relative select-none">
      <div className="cartilla-flip-vertical w-full h-full relative">
        {/* 1. Underlying target page (peek page) */}
        {isFlipping && (
          <div className="cartilla-flip-underlay absolute inset-0">
            <PdfPage
              pageNumber={peekPage}
              className="rounded-2xl overflow-hidden object-contain max-h-[60vh] shadow-sm"
            />
          </div>
        )}

        {/* 2. Top page flipping up */}
        <div
          className={`cartilla-flip-vertical-page absolute inset-0 ${isFlipping ? "flipped" : ""}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <PdfPage
            pageNumber={activePage}
            className="rounded-2xl overflow-hidden object-contain max-h-[60vh]"
          />
        </div>
      </div>
    </div>
  );
}
