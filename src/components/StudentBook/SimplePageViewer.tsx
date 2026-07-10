import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gretelEvent } from "@/components/gretel/gretelEvents";

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

const FLIP_MS = 1500; // must match .workbook-flip-wrapper's CSS transition duration

/**
 * Student workbook page viewer — real horizontal (left-to-right) 3-D page
 * turn, like a physical book. Same real page content (FaithfulPageRenderer
 * via buildPageArray), same aspect-ratio sizing as before. Reuses the
 * .workbook-* CSS classes in styles.css (rotateY on the flip wrapper,
 * transform-origin: left center).
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

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  const afterFlip = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      setIsFlipping(false);
      setFlipDirection(null);
      onPageChange?.(newIndex);
      gretelEvent("page-flip");
    },
    [onPageChange],
  );

  const goTo = (index: number, direction: "next" | "prev") => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);
    setFlipTransform(direction === "next" ? "rotateY(0deg)" : "rotateY(-180deg)");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform(direction === "next" ? "rotateY(-180deg)" : "rotateY(0deg)");
      });
    });

    setTimeout(() => afterFlip(index), FLIP_MS);
  };

  const staticIndex = isFlipping
    ? flipDirection === "prev"
      ? currentIndex - 1
      : currentIndex + 1
    : currentIndex;
  const flipFrontIndex = isFlipping ? (flipDirection === "next" ? currentIndex : currentIndex - 1) : -1;
  const flipBackIndex = isFlipping ? (flipDirection === "next" ? currentIndex + 1 : currentIndex) : -1;

  const current = pages[currentIndex];

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center">
      <div
        className="workbook-container"
        style={{ aspectRatio: singleAspectRatio ?? "3 / 4" }}
      >
        {/* Static base page */}
        <div className="w-full h-full relative overflow-hidden rounded-b-xl">
          {pages[staticIndex] ? (
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

        {/* Flipping leaf — horizontal (rotateY), hinged on the left edge */}
        {isFlipping && (
          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1500px" }}
          >
            <div className="workbook-flip-wrapper" style={{ transform: flipTransform }}>
              <div className="workbook-page-front">
                {pages[flipFrontIndex] ? (
                  <PageContent cover={pages[flipFrontIndex]!.cover}>{pages[flipFrontIndex]!.content}</PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                <div className="workbook-shadow-overlay" style={{ opacity: flipDirection === "next" ? 1 : 0 }} />
              </div>
              <div className="workbook-page-back">
                {pages[flipBackIndex] ? (
                  <PageContent cover={pages[flipBackIndex]!.cover}>{pages[flipBackIndex]!.content}</PageContent>
                ) : (
                  <div className="w-full h-full bg-surface" />
                )}
                <div className="workbook-shadow-overlay" style={{ opacity: flipDirection === "prev" ? 1 : 0 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 z-20 no-print">
        <button
          onClick={() => hasPrev && goTo(currentIndex - 1, "prev")}
          disabled={!hasPrev || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasPrev
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <div className="text-sm font-bold text-stone-700 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
          Página {currentIndex + 1} de {pages.length}
        </div>
        <button
          onClick={() => hasNext && goTo(currentIndex + 1, "next")}
          disabled={!hasNext || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
            hasNext
              ? "bg-white text-stone-700 hover:bg-stone-50 border-stone-300 shadow-sm"
              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
          }`}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
