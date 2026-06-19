import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preloadSpread } from "@/utils/preloadSpread";
import { gretelEvent } from "@/components/gretel/gretelEvents";

export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  content: React.ReactNode;
}

export interface StudentWorkbookFlipProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
  /** CSS aspect-ratio value for the two-page spread, e.g. "1.414" */
  spreadAspectRatio?: string;
  /** CSS aspect-ratio value for a single page (mobile), e.g. "0.707" */
  singleAspectRatio?: string;
  /** Callback fired after every page turn with the new currentIndex */
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
  useEffect(() => {
    gretelEvent("mount");
  }, []);

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialPage));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipTransform, setFlipTransform] = useState('rotateY(0deg)');
  const [hintVisible, setHintVisible] = useState(true);

  const step = 1;
  const hasPrev = currentIndex - step >= 0;
  const hasNext = currentIndex + step < pages.length;

  // Preload the next spread whenever currentIndex changes
  useEffect(() => {
    const nextPages: number[] = [];
    for (let i = 1; i <= 2; i++) {
      const n = currentIndex + step + i;
      if (n <= pages.length) nextPages.push(n);
    }
    if (nextPages.length > 0) preloadSpread(nextPages);
  }, [currentIndex, step, pages.length]);

  const afterFlip = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange?.(newIndex);
      
      // Emit page-flip event when page changes
      gretelEvent("page-flip");
    },
    [onPageChange],
  );

  const handlePrev = () => {
    if (!hasPrev || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('prev');
    setIsFlipping(true);
    setFlipTransform('rotateY(-180deg)');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(0deg)');
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex - step);
    }, 600);
  };

  const handleNext = () => {
    if (!hasNext || isFlipping) return;
    setHintVisible(false);
    setFlipDirection('next');
    setIsFlipping(true);
    setFlipTransform('rotateY(0deg)');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(-180deg)');
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex + step);
    }, 600);
  };

  const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 1 : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
  const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
  const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex) : -1;

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
      {/* Vertical Spiral Workbook Container */}
      <div 
        className="workbook-container"
        style={{ aspectRatio: singleAspectRatio ?? "3 / 4" }}
      >
        <div className="spiral-binding">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="spiral-ring" />
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
          Desliza o presiona ↑
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
