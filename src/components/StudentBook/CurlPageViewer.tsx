import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { gretelEvent } from "@/lib/gretel-bus";
import type {
  FlipBookComponent,
  FlipBookHandle,
  FlipEvent,
  PageFlipApi,
} from "@/lib/pageflip-types";
import { STUDENT_PAGE_TURN_MS, prefersReducedMotion } from "@/lib/living-motion";
import { KidButton } from "@/components/ui/KidButton";
import type { SimplePageViewerProps, WorkbookPageEntry } from "./SimplePageViewer";

interface CurlPageViewerProps extends SimplePageViewerProps {
  /** Lesson's own accent color for the Anterior/Siguiente pills. Defaults to book-teal. */
  accent?: string;
}

const FlipBook = HTMLFlipBook as unknown as FlipBookComponent;

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
  accent = "var(--book-teal)",
}: CurlPageViewerProps) {
  useEffect(() => {
    gretelEvent("mount");
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle | null>(null);
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

  const getApi = useCallback((): PageFlipApi | null => {
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
    (e: FlipEvent) => {
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
        <KidButton
          variant="outline"
          accent={accent}
          sound={false}
          onClick={() => hasPrev && handlePrev()}
          disabled={!hasPrev}
          className="!px-3 sm:!px-5 !py-2 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />{" "}
          <span className="hidden sm:inline">Anterior</span>
        </KidButton>
        <div
          className="text-xs sm:text-sm font-bold px-3 py-2 sm:px-4 rounded-full border shrink-0 whitespace-nowrap"
          style={{
            color: "var(--book-ink, #2b2a22)",
            background: "var(--book-paper, #fbf3e0)",
            borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
          }}
        >
          Página {currentIndex + 1} de {pages.length}
        </div>
        <KidButton
          variant="outline"
          accent={accent}
          sound={false}
          onClick={() => hasNext && handleNext()}
          disabled={!hasNext}
          className="!px-3 sm:!px-5 !py-2 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0"
        >
          <span className="hidden sm:inline">Siguiente</span>{" "}
          <ChevronRight className="w-4 h-4 shrink-0" />
        </KidButton>
      </div>
    </div>
  );
}

export type { WorkbookPageEntry, SimplePageViewerProps } from "./SimplePageViewer";
