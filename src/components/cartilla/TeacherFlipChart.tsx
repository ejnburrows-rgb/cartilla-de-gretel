import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaithfulPageRenderer } from "./FaithfulPageRenderer";

export interface TeacherFlipChartProps {
  pages: number[];
  lessonNumber: number;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  accentColor?: string;
}

export function TeacherFlipChart({
  pages,
  lessonNumber,
  initialPage = 0,
  onPageChange,
  accentColor = "#c98c4f",
}: TeacherFlipChartProps) {
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialPage));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipTransform, setFlipTransform] = useState('rotateX(0deg)');

  const step = 1;
  const hasPrev = currentIndex - step >= 0;
  const hasNext = currentIndex + step < pages.length;

  const afterFlip = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange?.(newIndex);
    },
    [onPageChange]
  );

  const handlePrev = useCallback(() => {
    if (!hasPrev || isFlipping) return;
    setFlipDirection('prev');
    setIsFlipping(true);
    // When going previous, the page flips down from the top.
    setFlipTransform('rotateX(180deg)');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateX(0deg)');
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex - step);
    }, 800); // 800ms elegant transition
  }, [hasPrev, isFlipping, currentIndex, step, afterFlip]);

  const handleNext = useCallback(() => {
    if (!hasNext || isFlipping) return;
    setFlipDirection('next');
    setIsFlipping(true);
    setFlipTransform('rotateX(0deg)');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Flipping up (lifting from bottom, bringing forward and over the top)
        setFlipTransform('rotateX(180deg)');
      });
    });

    setTimeout(() => {
      afterFlip(currentIndex + step);
    }, 800);
  }, [hasNext, isFlipping, currentIndex, step, afterFlip]);

  // Keyboard navigation & remote-clicker mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Remote clickers emulate page up/down, space, enter, or arrows
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Determine what is currently visible during the animation
  const staticIndex = isFlipping && flipDirection === 'prev' 
    ? currentIndex - 1 
    : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
    
  const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
      {/* 3D Container for Flip Chart */}
      <div 
        className="relative w-full max-w-[500px] h-full flip-chart-container shadow-2xl rounded-2xl bg-white flex items-center justify-center border-4"
        style={{ borderColor: `${accentColor}30`, aspectRatio: "3/4" }}
      >
        {/* Top spiral binding rings */}
        <div className="absolute -top-4 left-0 right-0 h-8 z-40 flex justify-evenly px-8 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-4 h-10 rounded-full border-2 border-stone-400 bg-stone-300 shadow-md" style={{ 
              background: 'linear-gradient(to right, #d6d3d1, #f5f5f4, #d6d3d1)' 
            }} />
          ))}
        </div>

        {/* Static Base Page */}
        <div className="w-full h-full relative overflow-hidden rounded-2xl bg-white">
          {pages[staticIndex] !== undefined ? (
            <FaithfulPageRenderer pageNumber={pages[staticIndex]} lessonNumber={lessonNumber} interactive={false} />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center text-stone-300">Página no disponible</div>
          )}
        </div>

        {/* Flipping Page */}
        {isFlipping && (
          <div 
            className="absolute inset-0 z-30 pointer-events-none flip-chart-page-flip"
            style={{ transform: flipTransform }}
          >
            {/* Front side of the flipping leaf */}
            <div className="flip-chart-page-front rounded-2xl overflow-hidden border-4 border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.2)] bg-white">
              {pages[flipFrontIndex] !== undefined ? (
                <FaithfulPageRenderer pageNumber={pages[flipFrontIndex]} lessonNumber={lessonNumber} interactive={false} />
              ) : (
                <div className="w-full h-full bg-white" />
              )}
              {/* Shadow gradient as page lifts */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none transition-opacity duration-[800ms]" 
                style={{ opacity: flipDirection === 'next' ? 1 : 0 }} 
              />
            </div>

            {/* Back side of the flipping leaf (upside down naturally) */}
            <div className="flip-chart-page-back rounded-2xl overflow-hidden bg-stone-50 border border-stone-200">
              <div className="w-full h-full flex items-center justify-center text-stone-200 opacity-50 bg-stone-100">
                <div className="rotate-180">Parte trasera</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls Overlay */}
      <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex justify-between items-center px-4 md:px-12 z-50">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className="p-4 rounded-full bg-stone-900/80 border border-white/20 text-white hover:bg-stone-800 hover:scale-105 active:scale-95 disabled:opacity-30 pointer-events-auto transition-all"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className="p-4 rounded-full bg-stone-900/80 border border-white/20 text-white hover:bg-stone-800 hover:scale-105 active:scale-95 disabled:opacity-30 pointer-events-auto transition-all"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
