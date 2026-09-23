import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { gretelEvent } from "@/lib/gretel-bus";
import type {
  FlipBookComponent,
  FlipBookHandle,
  FlipEvent,
  PageFlipApi,
} from "@/lib/pageflip-types";
import {
  STUDENT_PAGE_TURN_MS,
  prefersReducedMotion,
} from "@/lib/living-motion";
import { KidButton } from "@/components/ui/KidButton";
import type {
  SimplePageViewerProps,
  WorkbookPageEntry,
} from "./SimplePageViewer";
import "@/styles/physical-book.css";

interface CurlPageViewerProps extends SimplePageViewerProps {
  accent?: string;
  /** Small living-book guide anchored to the paper edge, outside printable content. */
  bookCompanion?: ReactNode;
}

const FlipBook = HTMLFlipBook as unknown as FlipBookComponent;

export const PRINTED_PAGE_WIDTH = 612;
export const PRINTED_PAGE_HEIGHT = 792;
export const SPREAD_BREAKPOINT_PX = 760;
export const SINGLE_PAGE_ASPECT_RATIO = `${PRINTED_PAGE_WIDTH} / ${PRINTED_PAGE_HEIGHT}`;
export const SPREAD_ASPECT_RATIO = `${PRINTED_PAGE_WIDTH * 2} / ${PRINTED_PAGE_HEIGHT}`;

export function clampPageIndex(index: number, pageCount: number): number {
  return Math.min(Math.max(0, index), Math.max(0, pageCount - 1));
}

export function visiblePageLabel(
  currentIndex: number,
  pageCount: number,
  spread: boolean,
): string {
  if (!spread) return `Página ${currentIndex + 1} de ${pageCount}`;
  const first = currentIndex + 1;
  const last = Math.min(currentIndex + 2, pageCount);
  return first === last
    ? `Página ${first} de ${pageCount}`
    : `Páginas ${first}–${last} de ${pageCount}`;
}

const Page = forwardRef<
  HTMLDivElement,
  { entry?: WorkbookPageEntry; index: number }
>(({ entry, index }, ref) => (
  <div
    ref={ref}
    data-density={entry?.cover ? "hard" : "soft"}
    data-page-index={index}
    data-leaf-side={index % 2 === 0 ? "left" : "right"}
    className="premium-book-page book-paper-surface relative flex h-full w-full flex-col overflow-hidden"
  >
    <div className="h-full w-full flex-1 p-0">{entry?.content}</div>
  </div>
));
Page.displayName = "CurlPage";

function EdgeStack({
  side,
  count,
}: {
  side: "left" | "right";
  count: number;
}) {
  const n = Math.max(0, Math.min(6, count));
  return (
    <div
      className={`book-edge-stack book-edge-stack--${side}`}
      aria-hidden="true"
    >
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="book-edge-sliver"
          style={
            {
              [side]: `${i * 1.7}px`,
              top: `${i * 0.6}px`,
              bottom: `${i * 0.6}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

type BookSize = { pageW: number; pageH: number; spread: boolean };

/**
 * Physical workbook reader. Desktop/tablet shows a true two-page spread;
 * narrow screens retain a single portrait page. The authored page content
 * remains live DOM so every exercise stays tappable through the paper curl.
 * Page turning can be triggered by the controls or by deliberately dragging
 * the outer paper edge; ordinary taps on lesson activities never turn a page.
 */
export function CurlPageViewer({
  pages,
  initialPage = 0,
  singleAspectRatio,
  onPageChange,
  accent = "var(--book-teal)",
  bookCompanion,
}: CurlPageViewerProps) {
  useEffect(() => gretelEvent("mount"), []);

  const safeInitialPage = clampPageIndex(initialPage, pages.length);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [size, setSize] = useState<BookSize | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(safeInitialPage);
  const [turning, setTurning] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialRevealDoneRef = useRef(false);
  const pendingRevealIndexRef = useRef(safeInitialPage);

  useEffect(() => {
    setMounted(true);
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const spread = rect.width >= SPREAD_BREAKPOINT_PX;
      setSize({
        pageW: Math.round(spread ? rect.width / 2 : rect.width),
        pageH: Math.round(rect.height),
        spread,
      });
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

  const spread = size?.spread ?? false;
  const hasPrev = currentIndex > 0;
  const hasNext = spread
    ? currentIndex + 2 < pages.length
    : currentIndex < pages.length - 1;

  const startTurn = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setTurning(true);
    gretelEvent("page-turn:start");
  }, []);

  const scheduleReveal = useCallback((delayMs?: number, revealIndex?: number) => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    const delay = delayMs ?? (reducedMotion ? 0 : 140);
    const pageIndex = revealIndex ?? currentIndex;
    revealTimerRef.current = setTimeout(() => {
      initialRevealDoneRef.current = true;
      setTurning(false);
      const page = pages[pageIndex];
      const companionLines = [
        page?.gretelLine,
        spread ? pages[pageIndex + 1]?.gretelLine : undefined,
      ].filter((line, index, all): line is string =>
        Boolean(line?.trim()) && all.findIndex((candidate) => candidate === line) === index,
      );
      gretelEvent("page:revealed", {
        text: companionLines.join(" ").trim() || undefined,
        pageNumber: page?.pageNumber,
      });
    }, delay);
  }, [currentIndex, pages, reducedMotion, spread]);

  const handlePrev = useCallback(() => {
    startTurn();
    getApi()?.flipPrev?.();
  }, [getApi, startTurn]);

  const handleNext = useCallback(() => {
    startTurn();
    getApi()?.flipNext?.();
  }, [getApi, startTurn]);
  const onFlip = useCallback(
    (e: FlipEvent) => {
      const idx =
        typeof e?.data === "number"
          ? clampPageIndex(e.data, pages.length)
          : null;
      if (idx === null) return;
      pendingRevealIndexRef.current = idx;
      setCurrentIndex(idx);
      onPageChange?.(idx);
      gretelEvent("page-flip");
      // react-pageflip does not reliably emit a final "read" state in every
      // browser/input path. onFlip is the authoritative completed-page signal,
      // so always schedule the companion reveal from here as a fallback.
      scheduleReveal(reducedMotion ? 0 : 140, idx);
    },
    [onPageChange, pages.length, reducedMotion, scheduleReveal],
  );

  const onChangeState = useCallback((e: FlipEvent) => {
    const state = typeof e?.data === "string" ? e.data : "";
    if (state === "flipping" || state === "user_fold") {
      if (!turning) startTurn();
      return;
    }
    if (state === "read") scheduleReveal(undefined, pendingRevealIndexRef.current);
  }, [scheduleReveal, startTurn, turning]);

  useEffect(() => {
    if (!mounted || !size || initialRevealDoneRef.current) return;
    scheduleReveal(reducedMotion ? 0 : 260, currentIndex);
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [currentIndex, mounted, reducedMotion, scheduleReveal, size]);

  useEffect(() => () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
  }, []);

  const shellStyle = {
    ["--book-turn-ms" as string]: `${STUDENT_PAGE_TURN_MS}ms`,
  } as CSSProperties;

  return (
    <div
      className="physical-book-reader relative mx-auto flex w-full max-w-6xl flex-col items-center"
      data-testid="physical-book-reader"
      data-page-turn-axis="horizontal"
      data-page-turn-ms={STUDENT_PAGE_TURN_MS}
      data-page-turn-gesture="edge-drag"
      data-book-companion={bookCompanion ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-label="Libro interactivo de La Cartilla de Gretel"
    >
      <div
        className="book-shell premium-book-shell"
        data-spread={spread ? "true" : "false"}
        style={shellStyle}
      >
        {(() => {
          const frac =
            pages.length > 1 ? currentIndex / (pages.length - 1) : 0;
          const left = Math.round(frac * 6);
          return (
            <>
              <EdgeStack side="left" count={left} />
              <EdgeStack side="right" count={6 - left} />
            </>
          );
        })()}
        <div className="premium-book-spine" aria-hidden="true" />
        <div
          ref={wrapRef}
          className="premium-book-stage workbook-container relative z-[1]"
          data-testid="physical-book-stage"
          style={{
            aspectRatio: spread
              ? SPREAD_ASPECT_RATIO
              : (singleAspectRatio ?? SINGLE_PAGE_ASPECT_RATIO),
            perspective: spread ? "2600px" : "2100px",
            background: "#fffaf0",
          }}
        >
          {mounted && size ? (
            <FlipBook
              key={`${pages.map((p) => p.id).join("|")}-${size.spread ? "spread" : "single"}`}
              ref={bookRef}
              width={size.pageW}
              height={size.pageH}
              size="fixed"
              minWidth={size.pageW}
              maxWidth={size.pageW}
              minHeight={size.pageH}
              maxHeight={size.pageH}
              startPage={clampPageIndex(currentIndex, pages.length)}
              showCover={false}
              usePortrait={!size.spread}
              drawShadow={true}
              maxShadowOpacity={0.46}
              flippingTime={reducedMotion ? 1 : STUDENT_PAGE_TURN_MS}
              useMouseEvents={true}
              clickEventForward={true}
              disableFlipByClick={true}
              showPageCorners={true}
              swipeDistance={48}
              mobileScrollSupport={true}
              className="premium-pageflip h-full w-full overflow-hidden rounded-b-xl"
              style={{}}
              onFlip={onFlip}
              onChangeState={onChangeState}
            >
              {pages.map((entry, index) => (
                <Page key={entry.id} entry={entry} index={index} />
              ))}
            </FlipBook>
          ) : (
            <div className="h-full w-full rounded-b-xl bg-[#fffaf0]" />
          )}
        </div>
        {bookCompanion && (
          <div
            className={`book-companion-anchor ${turning ? "book-companion-anchor--turning" : ""}`}
            data-testid="book-companion-anchor"
            aria-hidden={turning}
          >
            {bookCompanion}
          </div>
        )}
      </div>

      <div className="book-reader-controls no-print z-20 mt-8 flex w-full items-center justify-center gap-2 sm:gap-6">
        <KidButton
          variant="outline"
          accent={accent}
          sound={false}
          onClick={() => hasPrev && handlePrev()}
          disabled={!hasPrev}
          className="!px-3 !py-2 sm:!px-5 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Anterior</span>
        </KidButton>
        <div
          className="shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm"
          data-testid="physical-book-counter"
          style={{
            color: "var(--book-ink, #2b2a22)",
            background: "#fffaf0",
            borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
          }}
        >
          {visiblePageLabel(currentIndex, pages.length, spread)}
        </div>
        <KidButton
          variant="outline"
          accent={accent}
          sound={false}
          onClick={() => hasNext && handleNext()}
          disabled={!hasNext}
          className="!px-3 !py-2 sm:!px-5 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </KidButton>
      </div>
    </div>
  );
}

export type {
  WorkbookPageEntry,
  SimplePageViewerProps,
} from "./SimplePageViewer";
