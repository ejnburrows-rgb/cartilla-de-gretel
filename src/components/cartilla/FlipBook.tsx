import React, { useRef, useEffect, useState, useMemo } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";

const FlipBookLib = HTMLFlipBook as any;

interface FlipBookProps {
  entry: CatalogEntry;
  initialPageNumber: number;
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
      <PdfPage pageNumber={pageNum} className="w-full h-full object-contain" />

      {/* Paper-depth overlay: soft gutter shadows and curled corners */}
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

export function FlipBook({ entry, initialPageNumber }: FlipBookProps) {
  const parts = useMemo(() => (entry.pages || "").split("-").map(Number), [entry]);
  const from = parts[0] && !isNaN(parts[0]) ? parts[0] : 1;
  const to = parts[1] && !isNaN(parts[1]) ? parts[1] : from;

  const [mounted, setMounted] = useState(false);
  const bookRef = useRef<any>(null);
  const [activePage, setActivePage] = useState(initialPageNumber);

  useEffect(() => {
    setMounted(true);
    setActivePage(initialPageNumber);
  }, [initialPageNumber]);

  const getApi = (): any | null => {
    try {
      return bookRef.current?.pageFlip?.() ?? null;
    } catch {
      return null;
    }
  };

  const onFlip = (e: any) => {
    if (!e || typeof e.data !== "number") return;
    setActivePage(from + e.data);
  };

  const handlePrev = () => { getApi()?.flipPrev?.(); };
  const handleNext = () => { getApi()?.flipNext?.(); };

  if (!mounted) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-500" />
      </div>
    );
  }

  const pagesCount = to - from + 1;
  const pagesArray = Array.from({ length: pagesCount }, (_, i) => from + i);

  const hasPrev = activePage > from;
  const hasNext = activePage < to;

  // Single page rendering (e.g., L01)
  if (pagesCount === 1) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center py-6">
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 h-6 w-3/4 max-w-[400px] rounded-[50%] bg-black/25 blur-xl z-0" />
        <div className="relative z-10 w-full max-w-[450px] aspect-[3/4] mx-auto drop-shadow-2xl rounded-lg overflow-hidden border border-black/5">
          <Page pageNum={from} className="w-full h-full" />
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 z-20">
          <span className="font-mono text-sm font-bold text-stone-500">
            Pág. {from}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-6 max-w-4xl mx-auto">
      {/* Grounding shadow under the book */}
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 h-8 w-[85%] rounded-[50%] bg-black/25 blur-2xl z-0" />

      <div className="relative z-10 drop-shadow-2xl mx-auto w-full flex justify-center">
        <FlipBookLib
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
          style={{ background: "transparent" }}
        >
          {pagesArray.map((pageNum) => (
            <Page key={pageNum} pageNum={pageNum} />
          ))}
        </FlipBookLib>

        {/* Spiral Binding Overlay (Desktop only) */}
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

      {/* Elegant Controls below the book */}
      <div className="mt-8 flex items-center justify-center gap-6 z-20">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            hasPrev
              ? "bg-white text-stone-700 shadow-md hover:bg-stone-50 border border-stone-200"
              : "bg-stone-100 text-stone-400 cursor-not-allowed border border-transparent"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <span className="font-mono text-sm font-bold text-stone-500 bg-white/60 px-4 py-1.5 rounded-full shadow-sm">
          Pág. {activePage} de {to}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            hasNext
              ? "bg-white text-stone-700 shadow-md hover:bg-stone-50 border border-stone-200"
              : "bg-stone-100 text-stone-400 cursor-not-allowed border border-transparent"
          }`}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
