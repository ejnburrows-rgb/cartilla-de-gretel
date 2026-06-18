import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";
import { useSwipe } from "@/hooks/useSwipe";
import { preloadSpread } from "@/utils/preloadSpread";

interface BookPageFlipProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Page = React.forwardRef<HTMLDivElement, { pageNum: number; className?: string }>(
  ({ pageNum, className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={`page bg-surface relative overflow-hidden h-full w-full ${className || ""}`}
        ref={ref}
      >
        <BookPage pageNumber={pageNum} active={true} />
      </div>
    );
  }
);
Page.displayName = "Page";

export function BookPageFlip({ currentPage, totalPages, onPageChange }: BookPageFlipProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Synchronize internal animation state with the controlled `currentPage` prop.
  // We represent internal current index as 0-based.
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, currentPage - 1));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipTransform, setFlipTransform] = useState('rotateY(0deg)');

  useEffect(() => {
    if (!mounted || isFlipping) return;
    const targetIdx = currentPage - 1;
    // On desktop, index should be even to show spreads properly (0,1), (2,3)
    const normalizedTarget = (!isMobile && targetIdx % 2 !== 0) ? targetIdx - 1 : targetIdx;
    
    if (Math.abs(normalizedTarget - currentIndex) > 1) {
      setCurrentIndex(normalizedTarget);
    }
  }, [currentPage, isMobile, mounted, isFlipping, currentIndex]);

  const step = isMobile ? 1 : 2;
  const hasPrev = currentIndex - step >= 0;
  const hasNext = currentIndex + step < pagesArray.length;

  const handlePrev = () => {
    if (!hasPrev || isFlipping) return;
    setFlipDirection('prev');
    setIsFlipping(true);
    setFlipTransform('rotateY(-180deg)'); 
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(0deg)');
      });
    });

    setTimeout(() => {
      const nextIndex = currentIndex - step;
      setCurrentIndex(nextIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange(nextIndex + 1);
      // Preload the next spread
      const upcoming = [nextIndex + step + 1, nextIndex + step + 2].filter(n => n <= totalPages);
      if (upcoming.length) preloadSpread(upcoming);
    }, 600);
  };

  const handleNext = () => {
    if (!hasNext || isFlipping) return;
    setFlipDirection('next');
    setIsFlipping(true);
    setFlipTransform('rotateY(0deg)'); 
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform('rotateY(-180deg)');
      });
    });

    setTimeout(() => {
      const nextIndex = currentIndex + step;
      setCurrentIndex(nextIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange(nextIndex + 1);
      // Preload the next spread
      const upcoming = [nextIndex + step + 1, nextIndex + step + 2].filter(n => n <= totalPages);
      if (upcoming.length) preloadSpread(upcoming);
    }, 600);
  };

  // Add touch swipe support (swipe left = next, swipe right = previous)
  const swipeHandlers = useSwipe({
    onSwipe: (data) => {
      if (data.direction === "left") {
        handleNext();
      } else if (data.direction === "right") {
        handlePrev();
      }
    },
    minDistance: 40,
  });

  const renderMobile = () => {
    const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 1 : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
    const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
    const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex) : -1;

    return (
      <div 
        className="book-container book-single-page w-full shadow-2xl rounded-lg bg-surface border border-border aspect-[3/4]"
        {...swipeHandlers}
      >
        <div className="w-full h-full relative overflow-hidden">
          {pagesArray[staticIndex] !== undefined ? <Page pageNum={pagesArray[staticIndex]} /> : <div className="w-full h-full bg-surface" />}
        </div>

        {isFlipping && (
          <div className={`page-flip ${flipDirection === 'next' ? 'flipping-right-to-left' : ''}`}
               style={{ transform: flipTransform }}>
             <div className="page-front overflow-hidden">
                {pagesArray[flipFrontIndex] !== undefined ? <Page pageNum={pagesArray[flipFrontIndex]} /> : <div className="w-full h-full bg-surface" />}
             </div>
             <div className="page-back overflow-hidden">
                {pagesArray[flipBackIndex] !== undefined ? <Page pageNum={pagesArray[flipBackIndex]} /> : <div className="w-full h-full bg-surface" />}
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderDesktop = () => {
    const leftIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 2 : currentIndex;
    const rightIndex = isFlipping && flipDirection === 'next' ? currentIndex + 3 : currentIndex + 1;

    const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex - 1) : -1;
    const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 2 : currentIndex) : -1;

    return (
      <div 
        className="book-container flex w-full shadow-2xl rounded-lg bg-surface border border-border aspect-[2/1.33] relative"
        {...swipeHandlers}
      >
        {/* Left page */}
        <div className="w-1/2 h-full border-r border-stone-200/50 relative overflow-hidden">
          {pagesArray[leftIndex] !== undefined ? <Page pageNum={pagesArray[leftIndex]} /> : <div className="w-full h-full bg-surface" />}
          {/* Subtle page edge overlay shadow on the right side of the left page */}
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10" />
        </div>

        {/* Right page */}
        <div className="w-1/2 h-full relative overflow-hidden">
          {pagesArray[rightIndex] !== undefined ? <Page pageNum={pagesArray[rightIndex]} /> : <div className="w-full h-full bg-surface" />}
          {/* Subtle page edge overlay shadow on the left side of the right page */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10" />
        </div>

        {/* Moving leaf during flip */}
        {isFlipping && (
          <div className={`page-flip ${flipDirection === 'next' ? 'flipping-right-to-left' : ''}`} style={{ transform: flipTransform }}>
            <div className="page-front border-l border-stone-200/30 overflow-hidden">
              {pagesArray[flipFrontIndex] !== undefined ? <Page pageNum={pagesArray[flipFrontIndex]} /> : <div className="w-full h-full bg-surface" />}
            </div>
            <div className="page-back border-r border-stone-200/30 overflow-hidden">
              {pagesArray[flipBackIndex] !== undefined ? <Page pageNum={pagesArray[flipBackIndex]} /> : <div className="w-full h-full bg-surface" />}
            </div>
          </div>
        )}

        {/* Central Book spine shadow */}
        <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 pointer-events-none z-30">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/3 to-transparent w-1/2" />
          <div className="absolute inset-0 left-1/2 bg-gradient-to-l from-black/10 via-black/3 to-transparent w-1/2" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full flex items-center justify-center select-none py-6 md:py-10 px-4 sm:px-8 max-w-4xl mx-auto book-desk-wrapper">
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 h-8 w-3/4 rounded-[50%] bg-black/10 blur-2xl z-0" />

      <div className="relative z-10 w-full drop-shadow-2xl mx-auto">
        {isMobile ? renderMobile() : renderDesktop()}
      </div>

      <div className="absolute top-1/2 -left-2 -right-2 md:-left-8 md:-right-8 transform -translate-y-1/2 flex justify-between pointer-events-none z-20 no-print">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto bg-primary text-white hover:bg-primary-hover shadow-lg disabled:opacity-50 disabled:bg-surface-2 disabled:text-text-muted"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto bg-primary text-white hover:bg-primary-hover shadow-lg disabled:opacity-50 disabled:bg-surface-2 disabled:text-text-muted"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
