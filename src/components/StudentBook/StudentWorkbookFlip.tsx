import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";
import { preloadSpread } from "@/utils/preloadSpread";

export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  content: React.ReactNode;
}

export interface StudentWorkbookFlipProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
  spreadAspectRatio?: string;
  singleAspectRatio?: string;
  onPageChange?: (index: number) => void;
}

const PageContent = React.forwardRef<HTMLDivElement, { children?: React.ReactNode; cover?: boolean }>(
  function PageContent({ children, cover }, ref) {
    return (
      <div
        ref={ref}
        data-density={cover ? "hard" : "soft"}
        className="relative flex h-full w-full flex-col overflow-hidden bg-surface"
      >
        <div className="flex-1 w-full h-full p-0">{children}</div>
      </div>
    );
  }
);

export function StudentWorkbookFlip({
  pages,
  initialPage = 0,
  spreadAspectRatio,
  singleAspectRatio,
  onPageChange,
}: StudentWorkbookFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPage);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipTransform, setFlipTransform] = useState('rotateX(0deg)');
  const [hintVisible, setHintVisible] = useState(true);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  // Preload the next page whenever currentIndex changes
  useEffect(() => {
    if (currentIndex + 1 < pages.length) {
      preloadSpread([currentIndex + 1]);
    }
  }, [currentIndex, pages.length]);

  const afterFlip = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange?.(newIndex);
    },
    [onPageChange],
  );

  const handlePrev = () => {
    if (!hasPrev || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('prev');
    setIsFlipping(true);
    setFlipTransform('rotateX(-180deg)'); // Start curled up

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateX(0deg)'); // Restores down
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex - 1);
    }, 600);
  };

  const handleNext = () => {
    if (!hasNext || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('next');
    setIsFlipping(true);
    setFlipTransform('rotateX(0deg)'); // Start flat

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateX(-180deg)'); // Flips up and back
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex + 1);
    }, 600);
  };

  // Setup swipe handlers (swipe up = next, swipe down = prev)
  const swipeHandlers = useSwipe({
    onSwipe: (data) => {
      if (data.direction === "up") {
        handleNext();
      } else if (data.direction === "down") {
        handlePrev();
      }
    },
    minDistance: 40,
  });

  const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 1 : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
  const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
  const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex) : -1;

  // Number of rings in spiral binding
  const rings = Array.from({ length: 12 }).map((_, i) => i);

  return (
    <div 
      className="relative mx-auto flex w-full max-w-xl flex-col items-center select-none"
      {...swipeHandlers}
    >
      {/* Workbook outer container */}
      <div 
        className="workbook-container w-full"
        style={{ aspectRatio: singleAspectRatio ?? "0.75" }}
      >
        {/* Spiral Rings */}
        <div className="spiral-binding">
          {rings.map((r) => (
            <div key={r} className="spiral-ring" />
          ))}
        </div>

        {/* Static Base Page */}
        <div className="w-full h-full relative overflow-hidden rounded-b-xl">
          {pages[staticIndex] ? (
            <PageContent cover={pages[staticIndex].cover}>{pages[staticIndex].content}</PageContent>
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        {/* Flipping Leaf */}
        {isFlipping && (
          <div 
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ 
              transformStyle: "preserve-3d", 
              perspective: "1500px" 
            }}
          >
            <div
              className="workbook-flip-wrapper"
              style={{ transform: flipTransform }}
            >
              {/* Front of flipping leaf */}
              <div className="workbook-page-front">
                {pages[flipFrontIndex] ? (
                  <PageContent cover={pages[flipFrontIndex].cover}>{pages[flipFrontIndex].content}</PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                {/* Shadow overlay */}
                <div 
                  className="workbook-shadow-overlay"
                  style={{ opacity: flipDirection === 'next' ? 1 : 0 }}
                />
              </div>

              {/* Back of flipping leaf */}
              <div className="workbook-page-back">
                {pages[flipBackIndex] ? (
                  <PageContent cover={pages[flipBackIndex].cover}>{pages[flipBackIndex].content}</PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                {/* Shadow overlay */}
                <div 
                  className="workbook-shadow-overlay"
                  style={{ opacity: flipDirection === 'prev' ? 1 : 0 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {hintVisible && currentIndex === 0 && (
        <div className="pointer-events-none absolute bottom-24 right-6 z-10 animate-pulse rounded-full bg-primary px-4 py-2 text-xs font-black text-white shadow-lg border border-amber-300">
          Desliza hacia arriba ↑
        </div>
      )}

      {/* Navigation Controls */}
      <div className="mt-8 flex items-center justify-center gap-6 z-20 no-print">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasPrev
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <div className="text-sm font-bold text-stone-700 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
          Página {currentIndex + 1} de {pages.length}
        </div>
        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasNext
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
