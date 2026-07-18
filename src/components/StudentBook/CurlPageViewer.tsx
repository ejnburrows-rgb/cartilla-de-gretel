import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { gretelEvent } from "@/lib/gretel-bus";
import { STUDENT_PAGE_TURN_MS, prefersReducedMotion } from "@/lib/living-motion";
import type { SimplePageViewerProps, WorkbookPageEntry } from "./SimplePageViewer";

const FlipBook = HTMLFlipBook as any;

const Page = forwardRef<HTMLDivElement, { entry?: WorkbookPageEntry }>(({ entry }, ref) => {
  return (
    <div
      ref={ref}
      data-density={entry?.cover ? "hard" : "soft"}
      className="relative flex h-full w-full flex-col overflow-hidden bg-surface"
    >
      <div className="flex-1 w-full h-full p-0">{entry?.content}</div>
    </div>
  );
});
Page.displayName = "CurlPage";

/**
 * Real paper-curl student page viewer — same props contract as
 * SimplePageViewer (drop-in replacement), built on react-pageflip
 * (StPageFlip), which renders live HTML/DOM per page rather than a flat
 * canvas image, so the tap-to-grade exercises inside FaithfulPageRenderer
 * stay fully interactive during and after the curl.
 *
 * Sizing stays aspect-ratio-driven at the wrapper level (CLAUDE.md hard
 * rule — never a fixed-height wrapper here, it produces a stray native
 * scrollbar): a ResizeObserver reads the wrapper's own computed pixel box
 * (itself sized purely by CSS aspect-ratio) and feeds those exact pixels to
 * StPageFlip, which needs concrete width/height, not a CSS ratio.
 *
 * Flip is driven only by the Anterior/Siguiente buttons (useMouseEvents
 * false) — matching the existing button-only UX with zero risk of a drag
 * gesture swallowing a tap meant for an exercise inside the page.
 */
export function CurlPageViewer({
  pages,
  initialPage = 0,
  singleAspectRatio,
  onPageChange,
}: SimplePageViewerProps) {
  useEffect(() => {
    gretelEvent("mount");
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialPage));

  useEffect(() => {
    setMounted(true);
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getApi = useCallback((): any | null => {
    try {
      return bookRef.current?.pageFlip?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  const handlePrev = useCallback(() => {
    getApi()?.flipPrev?.();
  }, [getApi]);

  const handleNext = useCallback(() => {
    getApi()?.flipNext?.();
  }, [getApi]);

  const onFlip = useCallback(
    (e: any) => {
      const idx = typeof e?.data === "number" ? e.data : null;
      if (idx === null) return;
      setCurrentIndex(idx);
      onPageChange?.(idx);
      gretelEvent("page-flip");
    },
    [onPageChange],
  );

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
      <div
        ref={wrapRef}
        className="workbook-container"
        style={{ aspectRatio: singleAspectRatio ?? "3 / 4" }}
      >
        {mounted && size ? (
          <FlipBook
            key={pages.map((p) => p.id).join("|")}
            ref={bookRef}
            width={size.w}
            height={size.h}
            size="fixed"
            minWidth={size.w}
            maxWidth={size.w}
            minHeight={size.h}
            maxHeight={size.h}
            startPage={Math.min(Math.max(0, initialPage), Math.max(0, pages.length - 1))}
            showCover={false}
            usePortrait={true}
            drawShadow={true}
            maxShadowOpacity={0.4}
            // The underlying page-flip library throws "Invalid flipping
            // time" if this is <= 0 — 1ms is imperceptible (matches
            // prefers-reduced-motion intent) without crashing the book.
            flippingTime={reducedMotion ? 1 : STUDENT_PAGE_TURN_MS}
            useMouseEvents={false}
            clickEventForward={true}
            disableFlipByClick={false}
            mobileScrollSupport={true}
            className="w-full h-full rounded-b-xl overflow-hidden"
            style={{}}
            onFlip={onFlip}
          >
            {pages.map((entry) => (
              <Page key={entry.id} entry={entry} />
            ))}
          </FlipBook>
        ) : (
          <div className="w-full h-full bg-surface rounded-b-xl" />
        )}
      </div>

      <div className="mt-8 flex w-full items-center justify-center gap-2 sm:gap-6 z-20 no-print">
        <button
          type="button"
          onClick={() => hasPrev && handlePrev()}
          disabled={!hasPrev}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold transition-all border shrink-0 ${
            hasPrev
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />{" "}
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <div className="text-xs sm:text-sm font-bold text-stone-700 bg-white px-3 py-2 sm:px-4 rounded-full border border-stone-200 shadow-sm shrink-0 whitespace-nowrap">
          Página {currentIndex + 1} de {pages.length}
        </div>
        <button
          type="button"
          onClick={() => hasNext && handleNext()}
          disabled={!hasNext}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold transition-all border shrink-0 ${
            hasNext
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          <span className="hidden sm:inline">Siguiente</span>{" "}
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </div>
  );
}

export type { WorkbookPageEntry, SimplePageViewerProps } from "./SimplePageViewer";
