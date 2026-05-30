import React, { useRef, useEffect, useState } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";

const FlipBook = HTMLFlipBook as any;

// Defined as a named object (single-brace literal) and passed via style={flipBookStyle}
// to avoid an inline double-brace style prop. Matches StudentWorkbookFlip.
const flipBookStyle: React.CSSProperties = { background: "transparent" };

interface BookPageFlipProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  pageNum: number;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(({ pageNum, ...props }, ref) => {
  return (
    <div
      {...props}
      className={`page bg-white shadow-md relative overflow-hidden ${props.className || ""}`}
      ref={ref}
    >
      <BookPage pageNumber={pageNum} active={true} />

      {/* Paper-depth overlay: soft gutter shadows on both inner edges, curled
          bottom-corner shadows, and a faint top sheen. pointer-events-none so it
          never blocks taps, and it flips together with the page so the leaf
          reads like real curling paper during a turn. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/15 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/15 to-transparent" />
        <div className="absolute bottom-0 right-0 h-16 w-16 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 h-16 w-16 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.18),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
});
Page.displayName = "Page";

export function BookPageFlip({ currentPage, totalPages, onPageChange }: BookPageFlipProps) {
  const [mounted, setMounted] = useState(false);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely access the react-pageflip API. The instance attaches only after the
  // inner DOM measures itself, so it can be undefined; every call is guarded.
  const getApi = (): any | null => {
    try {
      const api = bookRef.current?.pageFlip?.();
      return api ?? null;
    } catch {
      return null;
    }
  };

  // Sync internal state with external currentPage
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
      /* flipbook not ready yet â€” ignore */
    }
  }, [currentPage, mounted]);

  if (!mounted) {
    return (
      <div className="relative w-full flex items-center justify-center select-none py-6 md:py-10 px-4 sm:px-8 max-w-4xl mx-auto book-desk-wrapper">
        <div className="relative z-10 drop-shadow-2xl mx-auto w-full">
          <div className="w-full max-w-[900px] aspect-[3/2] min-h-[420px] max-h-[750px] bg-stone-100 rounded-lg flex flex-col items-center justify-center border-2 border-stone-200/50 shadow-md mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
              <span className="text-stone-500 font-medium">Cargando libroâ€¦</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onFlip = (e: any) => {
    if (!e || typeof e.data !== "number") return;
    onPageChange(e.data + 1);
  };

  const handlePrev = () => {
    const api = getApi();
    try {
      api?.flipPrev?.();
    } catch {
      /* ignore */
    }
  };

  const handleNext = () => {
    const api = getApi();
    try {
      api?.flipNext?.();
    } catch {
      /* ignore */
    }
  };

  const safeTotal = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return (
    <div className="relative w-full flex items-center justify-center select-none py-6 md:py-10 px-4 sm:px-8 max-w-4xl mx-auto book-desk-wrapper">
      {/* Grounding desk shadow beneath the book block â€” sits behind the book
          (z-0) so the spread reads as a real object resting on a surface. */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 h-8 w-3/4 rounded-[50%] bg-black/25 blur-2xl z-0" />

      <div className="relative z-10 drop-shadow-2xl mx-auto w-full">
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
          className="book-flip"
          style={flipBookStyle}
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

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -left-2 -right-2 md:-left-8 md:-right-8 transform -translate-y-1/2 flex justify-between pointer-events-none z-20 no-print">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto book-control-btn shadow-lg"
          aria-label="PÃ¡gina anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto book-control-btn shadow-lg"
          aria-label="PÃ¡gina siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// ---- MERGED FROM THEIRS ----

import React, { useRef, useEffect, useState } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPage } from "./BookPage";

const FlipBook = HTMLFlipBook as any;

interface BookPageFlipProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  pageNum: number;
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(({ pageNum, ...props }, ref) => {
  return (
    <div
      {...props}
      className={`page bg-white shadow-md relative overflow-hidden ${props.className || ""}`}
      ref={ref}
    >
      <BookPage pageNumber={pageNum} active={true} />
    </div>
  );
});
Page.displayName = "Page";

export function BookPageFlip({ currentPage, totalPages, onPageChange }: BookPageFlipProps) {
  const [mounted, setMounted] = useState(false);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely access the react-pageflip API. The instance attaches only after the
  // inner DOM measures itself, so it can be undefined; every call is guarded.
  const getApi = (): any | null => {
    try {
      const api = bookRef.current?.pageFlip?.();
      return api ?? null;
    } catch {
      return null;
    }
  };

  // Sync internal state with external currentPage
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
      /* flipbook not ready yet â€” ignore */
    }
  }, [currentPage, mounted]);

  if (!mounted) {
    return (
      <div className="relative w-full flex items-center justify-center select-none py-6 md:py-10 px-4 sm:px-8 max-w-4xl mx-auto book-desk-wrapper">
        <div className="relative z-10 drop-shadow-2xl mx-auto w-full">
          <div className="w-full max-w-[900px] aspect-[3/2] min-h-[420px] max-h-[750px] bg-stone-100 rounded-lg flex flex-col items-center justify-center border-2 border-stone-200/50 shadow-md mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
              <span className="text-stone-500 font-medium">Cargando libroâ€¦</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onFlip = (e: any) => {
    if (!e || typeof e.data !== "number") return;
    onPageChange(e.data + 1);
  };

  const handlePrev = () => {
    const api = getApi();
    try {
      api?.flipPrev?.();
    } catch {
      /* ignore */
    }
  };

  const handleNext = () => {
    const api = getApi();
    try {
      api?.flipNext?.();
    } catch {
      /* ignore */
    }
  };

  const safeTotal = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);

  return (
    <div className="relative w-full flex items-center justify-center select-none py-6 md:py-10 px-4 sm:px-8 max-w-4xl mx-auto book-desk-wrapper">
      <div className="relative z-10 drop-shadow-2xl mx-auto w-full">
        <FlipBook
          width={450}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={550}
          minHeight={420}
          maxHeight={750}
          maxShadowOpacity={0.4}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={onFlip}
          ref={bookRef}
          className="book-flip"
          style= background: "transparent" 
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

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -left-2 -right-2 md:-left-8 md:-right-8 transform -translate-y-1/2 flex justify-between pointer-events-none z-20 no-print">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto book-control-btn shadow-lg"
          aria-label="PÃ¡gina anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto book-control-btn shadow-lg"
          aria-label="PÃ¡gina siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
