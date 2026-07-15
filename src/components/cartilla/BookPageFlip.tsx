import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";
import { getBookPageImage } from "@/lib/bookImages";
import { preloadSpread } from "@/utils/preloadSpread";
import { gretelEvent } from "@/components/gretel/gretelEvents";

interface BookPageFlipProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const FLIP_DURATION = 1100;
const EASE_CUBIC = "cubic-bezier(0.4, 0.0, 0.2, 1)";

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
  const [mounted, setMounted] = useState(false);
  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, currentPage - 1));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [flipStarted, setFlipStarted] = useState(false);

  const pointerStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useRef(false);
  const flipPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    gretelEvent("mount");
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!mounted || isFlipping) return;
    const targetIdx = currentPage - 1;
    if (Math.abs(targetIdx - currentIndex) > 1) {
      setCurrentIndex(targetIdx);
    }
  }, [currentPage, mounted, isFlipping, currentIndex]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pagesArray.length - 1;

  const clearFlipTimer = useCallback(() => {
    if (flipTimerRef.current !== null) {
      clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
  }, []);

  const completeFlip = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setIsFlipping(false);
    setFlipDirection(null);
    setFlipStarted(false);
    onPageChange(nextIndex + 1);
    gretelEvent("page-flip");
    const upcoming = [nextIndex + 2, nextIndex + 3].filter(n => n <= totalPages);
    if (upcoming.length) {
      const srcs = upcoming.map(n => getBookPageImage(n)).filter(Boolean) as string[];
      preloadSpread(srcs);
    }
  }, [onPageChange, totalPages]);

  const handleTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "transform") {
      clearFlipTimer();
      if (flipDirection === 'next') {
        completeFlip(currentIndex + 1);
      } else if (flipDirection === 'prev') {
        completeFlip(currentIndex - 1);
      }
    }
  }, [flipDirection, currentIndex, completeFlip, clearFlipTimer]);

  const triggerFlip = useCallback((dir: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDirection(dir);
    setIsFlipping(true);
    setFlipStarted(false);

    if (reducedMotion.current) {
      const nextIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1;
      completeFlip(nextIndex);
      return;
    }

    flipTimerRef.current = setTimeout(() => {
      clearFlipTimer();
      if (dir === 'next') {
        completeFlip(currentIndex + 1);
      } else {
        completeFlip(currentIndex - 1);
      }
    }, FLIP_DURATION + 100);
  }, [isFlipping, currentIndex, completeFlip, clearFlipTimer]);

  useEffect(() => {
    if (isFlipping && !flipStarted && flipPageRef.current) {
      const raf = requestAnimationFrame(() => {
        setFlipStarted(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isFlipping, flipStarted]);

  const handlePrev = useCallback(() => {
    if (!hasPrev || isFlipping) return;
    triggerFlip('prev');
  }, [hasPrev, isFlipping, triggerFlip]);

  const handleNext = useCallback(() => {
    if (!hasNext || isFlipping) return;
    triggerFlip('next');
  }, [hasNext, isFlipping, triggerFlip]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (delta < -SWIPE_THRESHOLD) handleNext();
    else if (delta > SWIPE_THRESHOLD) handlePrev();
  };

  useEffect(() => {
    return () => {
      clearFlipTimer();
    };
  }, [clearFlipTimer]);

  if (!mounted) {
    return (
      <div className="book-scene w-full flex items-center justify-center h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
      </div>
    );
  }

  const staticIndex = isFlipping && flipDirection === 'prev'
    ? currentIndex - 1
    : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
  const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
  const flipBackIndex  = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex)  : -1;

  const flipTransform = flipStarted
    ? (flipDirection === 'next'
      ? `rotateY(-180deg)`
      : flipDirection === 'prev'
        ? `rotateY(180deg)`
        : `rotateY(0deg)`)
    : `rotateY(0deg)`;

  const curlMaskStyle: React.CSSProperties = isFlipping ? {
    maskImage: flipDirection === 'next'
      ? 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)'
      : 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
    WebkitMaskImage: flipDirection === 'next'
      ? 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)'
      : 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
  } : {};

  return (
    <div
      className="book-scene relative w-full select-none py-10 px-4 flex flex-col items-center"
      style={{ background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)" }}
    >
      {/* Hill silhouette */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{ top: "28%", height: "30%" }}
      >
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden>
          <ellipse cx="250" cy="200" rx="380" ry="160" fill="#7aaa5e" opacity="0.7" />
          <ellipse cx="780" cy="200" rx="500" ry="140" fill="#6a9a52" opacity="0.6" />
          <ellipse cx="1050" cy="200" rx="300" ry="120" fill="#8dba70" opacity="0.5" />
        </svg>
      </div>

      {/* Desk surface under book */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(180deg, #b8895a 0%, #9a6e42 100%)" }}
      />
      {/* Desk grain lines */}
      <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none overflow-hidden opacity-20">
        {[4, 10, 16, 22].map(t => (
          <div key={t} className="absolute inset-x-0 h-px bg-black" style={{ bottom: `${t}%` }} />
        ))}
      </div>

      {/* Book shadow */}
      <div className="pointer-events-none absolute h-6 w-[70%] max-w-xs rounded-[50%] bg-black/25 blur-xl z-0"
           style={{ bottom: "calc(6rem + 0px)", left: "50%", transform: "translateX(-50%)" }} />

      {/* Book container */}
      <div
        className="relative z-10 w-full max-w-sm mx-auto"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ cursor: "grab", touchAction: "pan-y" }}
      >
        <div
          className="book-container book-single-page w-full aspect-[3/4] shadow-2xl rounded-lg bg-surface border border-border overflow-hidden"
          style={{ perspective: "1200px" }}
        >
          {/* Static backing page */}
          <div className="absolute inset-0 overflow-hidden">
            {pagesArray[staticIndex] !== undefined
              ? <Page pageNum={pagesArray[staticIndex]} />
              : <div className="w-full h-full bg-surface" />}
          </div>

          {/* Flipping page */}
          {isFlipping && (
            <div
              ref={flipPageRef}
              className={`page-flip absolute inset-0 ${flipDirection === 'next' ? 'flipping-right-to-left' : ''}`}
              style={{
                transform: flipTransform,
                transition: `transform ${FLIP_DURATION}ms ${EASE_CUBIC}`,
                transformStyle: "preserve-3d",
                transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              <div className="page-front absolute inset-0 overflow-hidden" style={curlMaskStyle}>
                {pagesArray[flipFrontIndex] !== undefined
                  ? <Page pageNum={pagesArray[flipFrontIndex]} />
                  : <div className="w-full h-full bg-surface" />}
              </div>
              <div className="page-back absolute inset-0 overflow-hidden" style={{ transform: "rotateY(180deg)" }}>
                {pagesArray[flipBackIndex] !== undefined
                  ? <Page pageNum={pagesArray[flipBackIndex]} />
                  : <div className="w-full h-full bg-surface" />}
              </div>
            </div>
          )}

          {/* Page curl shadow overlay */}
          {isFlipping && (
            <div
              className="absolute inset-y-0 w-20 pointer-events-none z-20"
              style={{
                right: flipDirection === 'next' ? 0 : 'auto',
                left: flipDirection === 'prev' ? 0 : 'auto',
                background: flipDirection === 'next'
                  ? "linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)"
                  : "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)",
              }}
            />
          )}
        </div>

        {/* Page number badge */}
        <div className="mt-3 text-center text-xs font-black text-white/90 drop-shadow">
          Pág. {pagesArray[currentIndex] ?? "—"} de {totalPages}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="absolute top-1/2 inset-x-2 md:inset-x-4 flex justify-between -translate-y-1/2 pointer-events-none z-20">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg transition
            bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg transition
            bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Reduced motion: crossfade fallback */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .page-flip {
            transition: opacity 300ms ease !important;
            transform: none !important;
          }
          .page-front, .page-back {
            backface-visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
