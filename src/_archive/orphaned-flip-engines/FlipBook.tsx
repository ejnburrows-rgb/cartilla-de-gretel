import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import "@/styles/flipbook-3d.css";

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
      className={`page bg-surface relative overflow-hidden h-full w-full ${props.className || ""}`}
      ref={ref}
    >
      <PdfPage pageNumber={pageNum} className="w-full h-full object-contain" />
    </div>
  );
});
Page.displayName = "Page";

export function FlipBook({ entry, initialPageNumber }: FlipBookProps) {
  const parts = useMemo(() => (entry.pages || "").split("-").map(Number), [entry]);
  const from = parts[0] && !isNaN(parts[0]) ? parts[0] : 1;
  const to = parts[1] && !isNaN(parts[1]) ? parts[1] : from;

  const pagesCount = to - from + 1;
  const pagesArray = Array.from({ length: pagesCount }, (_, i) => from + i);

  // Find the array index for initialPageNumber
  const initialIndex = pagesArray.indexOf(initialPageNumber);
  const startIdx = initialIndex >= 0 ? initialIndex : 0;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ensure index is even on desktop so we show left/right pairs correctly (0,1), (2,3)
  const normalizedStartIdx = !isMobile && startIdx % 2 !== 0 ? startIdx - 1 : startIdx;

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, normalizedStartIdx));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  // Use state for the animated transform
  const [flipTransform, setFlipTransform] = useState("rotateY(0deg)");

  const step = isMobile ? 1 : 2;
  const hasPrev = currentIndex - step >= 0;
  const hasNext = currentIndex + step < pagesArray.length;

  const handlePrev = () => {
    if (!hasPrev || isFlipping) return;
    setFlipDirection("prev");
    setIsFlipping(true);
    setFlipTransform("rotateY(-180deg)"); // Start flipped

    // Animate to 0deg
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform("rotateY(0deg)");
      });
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev - step);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  const handleNext = () => {
    if (!hasNext || isFlipping) return;
    setFlipDirection("next");
    setIsFlipping(true);
    setFlipTransform("rotateY(0deg)"); // Start flat

    // Animate to -180deg
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipTransform("rotateY(-180deg)");
      });
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev + step);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  // Single page mode (e.g. L01)
  if (pagesCount === 1) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center py-6">
        <div className="relative z-10 w-full max-w-[450px] aspect-[3/4] mx-auto drop-shadow-2xl rounded-lg overflow-hidden border border-border">
          <Page pageNum={from} className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Determine what to render based on flip state
  const renderDesktop = () => {
    const leftIndex = isFlipping && flipDirection === "prev" ? currentIndex - 2 : currentIndex;
    const rightIndex = isFlipping && flipDirection === "next" ? currentIndex + 3 : currentIndex + 1;

    const leftPageNum = pagesArray[leftIndex];
    const rightPageNum = pagesArray[rightIndex];

    // The flipping page content
    const flipFrontIndex = isFlipping
      ? flipDirection === "next"
        ? currentIndex + 1
        : currentIndex - 1
      : -1;
    const flipBackIndex = isFlipping
      ? flipDirection === "next"
        ? currentIndex + 2
        : currentIndex
      : -1;

    return (
      <div className="book-container flex w-full max-w-4xl mx-auto aspect-[2/1.3] shadow-2xl rounded-lg bg-surface border border-border">
        {/* Left Static Page */}
        <div className="w-1/2 h-full border-r border-border relative overflow-hidden">
          {leftPageNum !== undefined ? (
            <Page pageNum={leftPageNum} />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        {/* Right Static Page */}
        <div className="w-1/2 h-full relative overflow-hidden">
          {rightPageNum !== undefined ? (
            <Page pageNum={rightPageNum} />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        {/* Flipping Page */}
        {isFlipping && (
          <div
            className={`page-flip ${flipDirection === "next" ? "flipping-right-to-left" : ""}`}
            style={{ transform: flipTransform }}
          >
            <div className="page-front border-l border-border overflow-hidden">
              {pagesArray[flipFrontIndex] !== undefined ? (
                <Page pageNum={pagesArray[flipFrontIndex]} />
              ) : (
                <div className="w-full h-full bg-surface" />
              )}
            </div>
            <div className="page-back border-r border-border overflow-hidden">
              {pagesArray[flipBackIndex] !== undefined ? (
                <Page pageNum={pagesArray[flipBackIndex]} />
              ) : (
                <div className="w-full h-full bg-surface" />
              )}
            </div>
          </div>
        )}

        {/* Center Binding */}
        <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-30 pointer-events-none" />
      </div>
    );
  };

  const renderMobile = () => {
    const staticIndex =
      isFlipping && flipDirection === "prev"
        ? currentIndex - 1
        : isFlipping && flipDirection === "next"
          ? currentIndex + 1
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

    return (
      <div className="book-container book-single-page w-full max-w-[450px] mx-auto aspect-[3/4] shadow-2xl rounded-lg bg-surface border border-border">
        <div className="w-full h-full relative overflow-hidden">
          {pagesArray[staticIndex] !== undefined ? (
            <Page pageNum={pagesArray[staticIndex]} />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
        </div>

        {isFlipping && (
          <div
            className={`page-flip ${flipDirection === "next" ? "flipping-right-to-left" : ""}`}
            style={{ transform: flipTransform }}
          >
            <div className="page-front overflow-hidden">
              {pagesArray[flipFrontIndex] !== undefined ? (
                <Page pageNum={pagesArray[flipFrontIndex]} />
              ) : (
                <div className="w-full h-full bg-surface" />
              )}
            </div>
            <div className="page-back overflow-hidden">
              {pagesArray[flipBackIndex] !== undefined ? (
                <Page pageNum={pagesArray[flipBackIndex]} />
              ) : (
                <div className="w-full h-full bg-surface" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-6">
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 h-8 w-[85%] rounded-[50%] bg-black/10 blur-2xl z-0" />

      <div className="relative z-10 w-full px-4">{isMobile ? renderMobile() : renderDesktop()}</div>

      <div className="mt-8 flex items-center justify-center gap-6 z-20">
        <button
          onClick={handlePrev}
          disabled={!hasPrev || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold transition-all ${
            hasPrev
              ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
              : "bg-surface-2 text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          <ChevronLeft className="w-5 h-5" /> Anterior
        </button>
        <span className="font-display font-bold text-text bg-surface-2 px-4 py-2 rounded-md border border-border shadow-sm">
          Pág. {pagesArray[currentIndex]}{" "}
          {!isMobile && pagesArray[currentIndex + 1] ? `- ${pagesArray[currentIndex + 1]}` : ""} de{" "}
          {to}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasNext || isFlipping}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md font-bold transition-all ${
            hasNext
              ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
              : "bg-surface-2 text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          Siguiente <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
