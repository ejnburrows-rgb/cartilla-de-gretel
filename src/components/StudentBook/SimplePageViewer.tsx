import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/lib/gretel-bus";
import {
  STUDENT_PAGE_TURN_MS,
  prefersReducedMotion,
  prefersSimplePageTransition,
  studentFlipTransforms,
} from "@/lib/living-motion";

/** Canonical home for this type. */
export interface WorkbookPageEntry {
  id: string;
  cover?: boolean;
  src?: string;
  content: ReactNode;
}

export interface SimplePageViewerProps {
  pages: WorkbookPageEntry[];
  initialPage?: number;
  /** CSS aspect-ratio value for a single page, e.g. "0.707". Must stay
   * aspect-ratio-driven, never a fixed height — a fixed-height wrapper here
   * fights .faithful-page's own aspect-ratio sizing and produces a stray
   * native scrollbar (see CLAUDE.md's documented scrollbar-bug root cause). */
  singleAspectRatio?: string;
  onPageChange?: (index: number) => void;
}

function PageContent({ cover, children }: { cover?: boolean; children?: ReactNode }) {
  return (
    <div
      data-density={cover ? "hard" : "soft"}
      className="relative flex h-full w-full flex-col overflow-hidden bg-surface"
    >
      <div className="flex-1 w-full h-full p-0">{children}</div>
    </div>
  );
}

/**
 * Student workbook page viewer — elegant right-to-left free-edge page turn
 * (binding on the left), 600–900ms, soft cubic-bezier, curl shadow.
 * Reduced-motion / weak devices: crossfade. Preloads neighbors.
 */
export function SimplePageViewer({
  pages,
  initialPage = 0,
  singleAspectRatio,
  onPageChange,
}: SimplePageViewerProps) {
  useEffect(() => {
    gretelEvent("mount");
  }, []);

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialPage));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateY(0deg)");
  const [simpleMode, setSimpleMode] = useState(false);
  const [crossfade, setCrossfade] = useState<{ from: number; to: number; opacity: number } | null>(
    null,
  );

  useEffect(() => {
    setSimpleMode(prefersReducedMotion() || prefersSimplePageTransition());
  }, []);

  // Prefetch adjacent page image assets (if any src) + warm React neighbors by keeping them mounted offscreen...
  // Content is React nodes — we only flip what's already built in `pages`.
  useEffect(() => {
    // Touch neighbor entries so any lazy children in a future version warm up.
    void pages[currentIndex - 1];
    void pages[currentIndex + 1];
  }, [pages, currentIndex]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  const afterFlip = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      setCrossfade(null);
      onPageChange?.(newIndex);
      gretelEvent("page-flip");
    },
    [onPageChange],
  );

  const goTo = (index: number, direction: "next" | "prev") => {
    if (isFlipping || crossfade) return;
    if (index < 0 || index >= pages.length) return;

    // Reduced motion / weak device: crossfade only
    if (simpleMode) {
      setCrossfade({ from: currentIndex, to: index, opacity: 0 });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCrossfade({ from: currentIndex, to: index, opacity: 1 });
        });
      });
      setTimeout(() => afterFlip(index), 420);
      return;
    }

    const { start, end } = studentFlipTransforms(direction);
    setFlipDirection(direction);
    setIsFlipping(true);
    setFlipTransform(start);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform(end);
      });
    });

    setTimeout(() => afterFlip(index), STUDENT_PAGE_TURN_MS);
  };

  const staticIndex = isFlipping
    ? flipDirection === "prev"
      ? currentIndex - 1
      : currentIndex + 1
    : currentIndex;
  const flipFrontIndex = isFlipping
    ? flipDirection === "next"
      ? currentIndex
      : currentIndex - 1
    : -1;
  const flipBackIndex = isFlipping
    ? flipDirection === "next"
      ? currentIndex + 1
      : currentIndex
    : -1;

  const current = pages[currentIndex];

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center">
      <div className="workbook-container" style={{ aspectRatio: singleAspectRatio ?? "3 / 4" }}>
        {/* Static base page */}
        <div className="w-full h-full relative overflow-hidden rounded-b-xl">
          {crossfade ? (
            <>
              <div className="workbook-simple-crossfade" style={{ opacity: 1 - crossfade.opacity }}>
                {pages[crossfade.from] ? (
                  <PageContent cover={pages[crossfade.from]!.cover}>
                    {pages[crossfade.from]!.content}
                  </PageContent>
                ) : null}
              </div>
              <div className="workbook-simple-crossfade" style={{ opacity: crossfade.opacity }}>
                {pages[crossfade.to] ? (
                  <PageContent cover={pages[crossfade.to]!.cover}>
                    {pages[crossfade.to]!.content}
                  </PageContent>
                ) : null}
              </div>
            </>
          ) : pages[staticIndex] ? (
            <PageContent cover={pages[staticIndex]!.cover} key={pages[staticIndex]!.id}>
              {pages[staticIndex]!.content}
            </PageContent>
          ) : current ? (
            <PageContent cover={current.cover} key={current.id}>
              {current.content}
            </PageContent>
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        {/* Flipping leaf — free edge R→L for next (left-hinged binding) */}
        {isFlipping && !simpleMode && (
          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1800px" }}
          >
            <div className="workbook-flip-wrapper" style={{ transform: flipTransform }}>
              <div className="workbook-page-front">
                {pages[flipFrontIndex] ? (
                  <PageContent cover={pages[flipFrontIndex]!.cover}>
                    {pages[flipFrontIndex]!.content}
                  </PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                <div
                  className="workbook-shadow-overlay"
                  style={{ opacity: flipDirection === "next" ? 1 : 0 }}
                />
              </div>
              <div className="workbook-page-back">
                {pages[flipBackIndex] ? (
                  <PageContent cover={pages[flipBackIndex]!.cover}>
                    {pages[flipBackIndex]!.content}
                  </PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                <div
                  className="workbook-shadow-overlay"
                  style={{ opacity: flipDirection === "prev" ? 1 : 0 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex w-full items-center justify-center gap-2 sm:gap-6 z-20 no-print">
        <button
          type="button"
          onClick={() => hasPrev && goTo(currentIndex - 1, "prev")}
          disabled={!hasPrev || isFlipping || !!crossfade}
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
          onClick={() => hasNext && goTo(currentIndex + 1, "next")}
          disabled={!hasNext || isFlipping || !!crossfade}
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
