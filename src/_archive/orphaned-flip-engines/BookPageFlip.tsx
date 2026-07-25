import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";
import { getBookPageImage } from "@/lib/bookImages";
import type {
  FlipBookComponent,
  FlipBookHandle,
  FlipEvent,
  PageFlipApi,
} from "@/lib/pageflip-types";
import { preloadSpread } from "@/utils/preloadSpread";
import { gretelEvent } from "@/components/gretel/gretelEvents";
import HTMLFlipBook from "react-pageflip";

const FlipBook = HTMLFlipBook as unknown as FlipBookComponent;
const flipBookStyle: React.CSSProperties = { background: "transparent" };

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
        {/* Paper-depth overlay for curling effect */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/15 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/15 to-transparent" />
          <div className="absolute bottom-0 right-0 h-16 w-16 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 h-16 w-16 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.18),transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    );
  },
);
Page.displayName = "Page";

export function BookPageFlip({ currentPage, totalPages, onPageChange }: BookPageFlipProps) {
  const [mounted, setMounted] = useState(false);
  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  const bookRef = useRef<FlipBookHandle | null>(null);
  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setMounted(true);
    gretelEvent("mount");
  }, []);

  const getApi = (): PageFlipApi | null => {
    try {
      const api = bookRef.current?.pageFlip?.();
      return api ?? null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!mounted) return;
    const api = getApi();
    if (!api) return;
    try {
      const flipPage = (api.getCurrentPageIndex?.() ?? 0) + 1;
      if (Math.abs(flipPage - currentPage) > 1) {
        api.turnToPage?.(currentPage - 1);
      }
    } catch {
      /* flipbook not ready yet — ignore */
    }
  }, [currentPage, mounted]);

  const onFlip = useCallback(
    (e: FlipEvent) => {
      if (!e || typeof e.data !== "number") return;
      const nextIndex = e.data;
      onPageChange(nextIndex + 1);
      gretelEvent("page-flip");
      const upcoming = [nextIndex + 2, nextIndex + 3].filter((n) => n <= totalPages);
      if (upcoming.length) {
        const srcs = upcoming.map((n) => getBookPageImage(n)).filter(Boolean) as string[];
        preloadSpread(srcs);
      }
    },
    [onPageChange, totalPages],
  );

  const handlePrev = useCallback(() => {
    const api = getApi();
    try {
      api?.flipPrev?.();
    } catch {
      /* ignore */
    }
  }, []);

  const handleNext = useCallback(() => {
    const api = getApi();
    try {
      api?.flipNext?.();
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted) {
    return (
      <div className="book-scene w-full flex items-center justify-center h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
      </div>
    );
  }

  const safeTotal = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return (
    <div
      className="book-scene relative w-full select-none py-10 px-4 flex flex-col items-center"
      style={{ background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)" }}
    >
      {/* Hill silhouette */}
      <div className="absolute inset-x-0 pointer-events-none" style={{ top: "28%", height: "30%" }}>
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="w-full h-full"
          aria-hidden
        >
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
        {[4, 10, 16, 22].map((t) => (
          <div key={t} className="absolute inset-x-0 h-px bg-black" style={{ bottom: `${t}%` }} />
        ))}
      </div>

      {/* Book shadow */}
      <div
        className="pointer-events-none absolute h-6 w-[70%] max-w-xs rounded-[50%] bg-black/25 blur-xl z-0"
        style={{ bottom: "calc(6rem + 0px)", left: "50%", transform: "translateX(-50%)" }}
      />

      <div className="relative z-10 w-full drop-shadow-2xl mx-auto">
        <FlipBook
          width={450}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={550}
          minHeight={420}
          maxHeight={750}
          maxShadowOpacity={0.55}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={onFlip}
          ref={bookRef}
          className="book-flip mx-auto"
          style={flipBookStyle}
          flippingTime={reducedMotion.current ? 0 : 1100}
        >
          {pages.map((pageNum) => (
            <Page key={pageNum} pageNum={pageNum} />
          ))}
        </FlipBook>

        {/* Spiral Binding Overlay - only visible on md+ (2-page spread) */}
        <div className="pointer-events-none absolute inset-y-4 left-1/2 -ml-[14px] z-50 hidden md:flex w-7 flex-col items-center justify-around drop-shadow-md">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="relative block h-5 w-5 rounded-full bg-[conic-gradient(from_220deg,#d4d4d8,#71717a,#d4d4d8,#a1a1aa)] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1.5px_2px_rgba(0,0,0,0.4),0_1.5px_3px_rgba(0,0,0,0.28)]"
            >
              <span className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/65 blur-[1px]" />
              <span className="absolute inset-x-1 bottom-0.5 h-px rounded-full bg-black/35" />
            </span>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="absolute top-1/2 inset-x-2 md:inset-x-4 flex justify-between -translate-y-1/2 pointer-events-none z-20">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg transition bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto shadow-lg transition bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Reduced motion: instant page swap handled by HTMLFlipBook config internally if needed, but we can't easily inject it into the canvas. */}
    </div>
  );
}
