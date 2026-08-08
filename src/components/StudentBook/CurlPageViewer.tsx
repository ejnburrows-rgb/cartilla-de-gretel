import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { gretelEvent } from "@/lib/gretel-bus";
import type { FlipBookComponent, FlipBookHandle, FlipEvent, PageFlipApi } from "@/lib/pageflip-types";
import { prefersReducedMotion } from "@/lib/living-motion";
import { KidButton } from "@/components/ui/KidButton";
import { SimplePageViewer, type SimplePageViewerProps, type WorkbookPageEntry } from "./SimplePageViewer";

interface CurlPageViewerProps extends SimplePageViewerProps {
  accent?: string;
}

const FlipBook = HTMLFlipBook as unknown as FlipBookComponent;

export const PRINTED_PAGE_WIDTH = 612;
export const PRINTED_PAGE_HEIGHT = 792;
export const SPREAD_BREAKPOINT_PX = 760;
export const SINGLE_PAGE_ASPECT_RATIO = `${PRINTED_PAGE_WIDTH} / ${PRINTED_PAGE_HEIGHT}`;
export const SPREAD_ASPECT_RATIO = `${PRINTED_PAGE_WIDTH * 2} / ${PRINTED_PAGE_HEIGHT}`;
const DESKTOP_PAGE_TURN_MS = 420;

export function clampPageIndex(index: number, pageCount: number): number {
  return Math.min(Math.max(0, index), Math.max(0, pageCount - 1));
}

export function visiblePageLabel(currentIndex: number, pageCount: number, spread: boolean): string {
  if (!spread) return `Página ${currentIndex + 1} de ${pageCount}`;
  const first = currentIndex + 1;
  const last = Math.min(currentIndex + 2, pageCount);
  return first === last ? `Página ${first} de ${pageCount}` : `Páginas ${first}–${last} de ${pageCount}`;
}

const Page = forwardRef<HTMLDivElement, { entry?: WorkbookPageEntry }>(({ entry }, ref) => (
  <div
    ref={ref}
    data-density={entry?.cover ? "hard" : "soft"}
    className="book-paper-surface relative flex h-full w-full flex-col overflow-hidden"
  >
    <div className="h-full w-full flex-1 p-0">{entry?.content}</div>
  </div>
));
Page.displayName = "CurlPage";

function EdgeStack({ side, count }: { side: "left" | "right"; count: number }) {
  const n = Math.max(0, Math.min(6, count));
  return (
    <div className={`book-edge-stack book-edge-stack--${side}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="book-edge-sliver"
          style={{ [side]: `${i * 1.7}px`, top: `${i * 0.6}px`, bottom: `${i * 0.6}px` } as CSSProperties}
        />
      ))}
    </div>
  );
}

type BookSize = { pageW: number; pageH: number; spread: boolean };

/**
 * Physical workbook reader. Desktop/tablet shows a true two-page spread;
 * narrow screens retain a single portrait page. The page content remains live
 * DOM so every exercise stays tappable through the curl.
 */
export function CurlPageViewer({
  pages,
  initialPage = 0,
  singleAspectRatio,
  onPageChange,
  accent = "var(--book-teal)",
}: CurlPageViewerProps) {
  useEffect(() => gretelEvent("mount"), []);

  const safeInitialPage = clampPageIndex(initialPage, pages.length);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [size, setSize] = useState<BookSize | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(safeInitialPage);
  const [isTurning, setIsTurning] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const spread = rect.width >= SPREAD_BREAKPOINT_PX;
      const trimRatio = PRINTED_PAGE_HEIGHT / PRINTED_PAGE_WIDTH;
      // A fixed bottom navigation bar used to sit on top of a width-first book.
      // Size the live page from the usable viewport height first so a settled
      // spread is fully visible instead of appearing cut off below the fold.
      const navigationAllowance = 104;
      const availablePageHeight = Math.max(320, window.innerHeight - rect.top - navigationAllowance);
      const widthLimit = spread ? rect.width / 2 : rect.width;
      const pageW = Math.floor(Math.min(widthLimit, availablePageHeight / trimRatio));
      const pageH = Math.round(pageW * trimRatio);
      setSize((previous) =>
        previous &&
        previous.pageW === pageW &&
        previous.pageH === pageH &&
        previous.spread === spread
          ? previous
          : { pageW, pageH, spread },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const getApi = useCallback((): PageFlipApi | null => {
    try {
      return bookRef.current?.pageFlip?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const spread = size?.spread ?? false;
  const simpleMode = reducedMotion || !spread;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex + 2 < pages.length;

  const reportPageChange = useCallback(
    (index: number) => {
      const next = clampPageIndex(index, pages.length);
      setCurrentIndex(next);
      onPageChange?.(next);
      gretelEvent("page-flip");
    },
    [onPageChange, pages.length],
  );

  const startTurn = useCallback(
    (direction: "next" | "prev") => {
      if (isTurning || simpleMode) return;
      const api = getApi();
      if (!api) return;
      setIsTurning(true);
      if (direction === "next") api.flipNext?.();
      else api.flipPrev?.();
      // A defensive release avoids trapping navigation if a third-party flip
      // event is interrupted by a resize. Normal turns release in onFlip.
      window.setTimeout(() => setIsTurning(false), DESKTOP_PAGE_TURN_MS + 180);
    },
    [getApi, isTurning, simpleMode],
  );

  const handlePrev = useCallback(() => {
    if (hasPrev) startTurn("prev");
  }, [hasPrev, startTurn]);
  const handleNext = useCallback(() => {
    if (hasNext) startTurn("next");
  }, [hasNext, startTurn]);
  const onFlip = useCallback(
    (e: FlipEvent) => {
      const idx = typeof e?.data === "number" ? clampPageIndex(e.data, pages.length) : null;
      if (idx === null) return;
      setIsTurning(false);
      reportPageChange(idx);
    },
    [pages.length, reportPageChange],
  );

  if (simpleMode) {
    return (
      <div ref={wrapRef} className="storybook-simple-reader">
        <SimplePageViewer
          key={`simple-${pages.map((page) => page.id).join("|")}`}
          pages={pages}
          initialPage={currentIndex}
          singleAspectRatio={singleAspectRatio ?? SINGLE_PAGE_ASPECT_RATIO}
          onPageChange={reportPageChange}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
      <div className="book-shell">
        {(() => {
          const frac = pages.length > 1 ? currentIndex / (pages.length - 1) : 0;
          const left = Math.round(frac * 6);
          return <><EdgeStack side="left" count={left} /><EdgeStack side="right" count={6 - left} /></>;
        })()}
        <div
          ref={wrapRef}
          className="workbook-container relative z-[1]"
          style={{
            width: size ? `${size.spread ? size.pageW * 2 : size.pageW}px` : "100%",
            maxWidth: "100%",
            aspectRatio: spread ? SPREAD_ASPECT_RATIO : (singleAspectRatio ?? SINGLE_PAGE_ASPECT_RATIO),
            perspective: spread ? "2200px" : "1600px",
            background: "#fffaf0",
          }}
        >
          {mounted && size ? (
            <FlipBook
              key={`${pages.map((p) => p.id).join("|")}-${size.pageW}x${size.pageH}-spread`}
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
              maxShadowOpacity={0.58}
              flippingTime={DESKTOP_PAGE_TURN_MS}
              useMouseEvents={false}
              clickEventForward={true}
              disableFlipByClick={true}
              mobileScrollSupport={true}
              className="h-full w-full overflow-hidden rounded-b-xl"
              style={{}}
              onFlip={onFlip}
            >
              {pages.map((entry) => <Page key={entry.id} entry={entry} />)}
            </FlipBook>
          ) : <div className="h-full w-full rounded-b-xl bg-[#fffaf0]" />}
        </div>
      </div>

      <div className="no-print z-20 mt-8 flex w-full items-center justify-center gap-2 sm:gap-6">
        <KidButton variant="outline" accent={accent} sound={false} onClick={handlePrev} disabled={!hasPrev || isTurning} className="!px-3 !py-2 sm:!px-5 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0">
          <ChevronLeft className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Anterior</span>
        </KidButton>
        <div className="shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm" style={{ color: "var(--book-ink, #2b2a22)", background: "#fffaf0", borderColor: `color-mix(in srgb, ${accent} 35%, transparent)` }}>
          {visiblePageLabel(currentIndex, pages.length, spread)}
        </div>
        <KidButton variant="outline" accent={accent} sound={false} onClick={handleNext} disabled={!hasNext || isTurning} className="!px-3 !py-2 sm:!px-5 sm:!py-2.5 gap-1.5 sm:gap-2 shrink-0">
          <span className="hidden sm:inline">Siguiente</span> <ChevronRight className="h-4 w-4 shrink-0" />
        </KidButton>
      </div>
    </div>
  );
}

export type { WorkbookPageEntry, SimplePageViewerProps } from "./SimplePageViewer";
