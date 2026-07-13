/**
 * FlipchartHdPanel — HD-first teacher flipchart board for classroom projection.
 *
 * Assets: public/cartilla/art/hd/flipchart/page-NNN.jpg (HD colour plates).
 * Source scans are never the designed primary when HD paths exist in
 * teacher-flipchart.json (getFlipchartPageSrc).
 *
 * ORIENTATION: Source JPGs are stored pixel-upside-down; CSS rotate(180deg)
 * restores upright presentation (see flipchart-presenter.css .fc-board__face img).
 *
 * Vertical top-hinged flip timing from living-motion (unchanged curves).
 */
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getFlipchartPagesForLesson,
  getFlipchartPageSrc,
  isHdFlipchartPath,
  type FlipchartPage,
} from "@/lib/flipchart-hd";
import { FLIPCHART_FLIP_MS, flipchartFlipTransforms } from "@/lib/living-motion";
import "@/styles/flipchart-presenter.css";

interface FlipchartHdPanelProps {
  lessonNumber: number;
  /** Optional accent for nav highlight (book palette). */
  accentColor?: string;
}

function FlipchartFace({ page }: { page?: FlipchartPage }) {
  if (!page) return <div className="fc-board__face" aria-hidden />;
  const src = getFlipchartPageSrc(page);
  return (
    <div
      className="fc-board__face"
      data-hd={isHdFlipchartPath(src) ? "true" : "false"}
      data-flipchart-src={src}
    >
      <img
        src={src}
        alt={`Lámina ${page.flipchartPage} del flipchart`}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

export function FlipchartHdPanel({ lessonNumber, accentColor }: FlipchartHdPanelProps) {
  const pages: FlipchartPage[] = getFlipchartPagesForLesson(lessonNumber);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateX(0deg)");

  useEffect(() => {
    setSelectedIdx(0);
    setIsFlipping(false);
    setFlipDirection(null);
    setFlipTransform("rotateX(0deg)");
  }, [lessonNumber]);

  const afterFlip = useCallback((newIndex: number) => {
    setSelectedIdx(newIndex);
    setIsFlipping(false);
    setFlipDirection(null);
  }, []);

  const safeIdx = pages.length === 0 ? 0 : Math.min(selectedIdx, pages.length - 1);
  const currentPage = pages[safeIdx];

  const goTo = useCallback(
    (index: number, direction: "next" | "prev") => {
      if (isFlipping || pages.length === 0) return;
      if (index < 0 || index >= pages.length) return;
      // Instant jump for filmstrip far jumps (skip mid-flip when |delta| > 1)
      if (Math.abs(index - safeIdx) > 1) {
        setSelectedIdx(index);
        return;
      }
      const { start, end } = flipchartFlipTransforms(direction);
      setFlipDirection(direction);
      setIsFlipping(true);
      setFlipTransform(start);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipTransform(end);
        });
      });

      setTimeout(() => afterFlip(index), FLIPCHART_FLIP_MS);
    },
    [afterFlip, isFlipping, pages.length, safeIdx],
  );

  const handlePrev = useCallback(() => {
    if (safeIdx > 0) goTo(safeIdx - 1, "prev");
  }, [goTo, safeIdx]);

  const handleNext = useCallback(() => {
    if (safeIdx < pages.length - 1) goTo(safeIdx + 1, "next");
  }, [goTo, pages.length, safeIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  useEffect(() => {
    if (pages.length === 0) return;
    const neighbors = [pages[safeIdx - 1], pages[safeIdx + 1]].filter(Boolean) as FlipchartPage[];
    for (const p of neighbors) {
      const img = new Image();
      img.src = getFlipchartPageSrc(p);
    }
  }, [pages, safeIdx]);

  if (pages.length === 0) {
    return (
      <div className="fc-board__empty" data-testid="flipchart-empty">
        <p className="fc-board__empty-kicker">Flipchart</p>
        <p className="fc-board__empty-title">
          No hay láminas del flipchart para la lección {lessonNumber}.
        </p>
      </div>
    );
  }

  const staticIdx = isFlipping
    ? flipDirection === "prev"
      ? safeIdx - 1
      : safeIdx + 1
    : safeIdx;
  const flipFrontIdx = isFlipping ? (flipDirection === "next" ? safeIdx : safeIdx - 1) : -1;
  const flipBackIdx = isFlipping ? (flipDirection === "next" ? safeIdx + 1 : safeIdx) : -1;

  const accentStyle = accentColor
    ? ({ ["--fc-accent" as string]: accentColor } as CSSProperties)
    : undefined;

  return (
    <div
      className="fc-board"
      style={accentStyle}
      data-testid="flipchart-hd-panel"
      data-hd-primary="true"
    >
      <div className="fc-board__easel" data-testid="flipchart-stage">
        <div className="fc-board__rail" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="fc-board__rail-dot" />
          ))}
        </div>

        <div className="fc-board__page">
          <div className="fc-board__page-inner">
            <div className="w-full h-full absolute inset-0">
              <FlipchartFace page={pages[staticIdx] ?? currentPage} />
            </div>

            {isFlipping && (
              <div
                className="absolute inset-0 z-30 pointer-events-none"
                style={{ transformStyle: "preserve-3d", perspective: "1800px" }}
              >
                <div className="flipchart-flip-wrapper" style={{ transform: flipTransform }}>
                  <div className="flipchart-page-front">
                    <FlipchartFace page={pages[flipFrontIdx]} />
                    <div
                      className="flipchart-shadow-overlay"
                      style={{ opacity: flipDirection === "next" ? 1 : 0 }}
                    />
                  </div>
                  <div className="flipchart-page-back">
                    <FlipchartFace page={pages[flipBackIdx]} />
                    <div
                      className="flipchart-shadow-overlay"
                      style={{ opacity: flipDirection === "prev" ? 1 : 0 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fc-board__controls">
        <button
          type="button"
          onClick={handlePrev}
          disabled={safeIdx === 0 || isFlipping}
          className="fc-board__nav"
          aria-label="Lámina anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <div className="fc-board__counter" data-testid="flipchart-counter">
          <span>
            Hoja {safeIdx + 1} de {pages.length}
          </span>
          <span className="fc-board__counter-sub">
            Lámina {currentPage?.flipchartPage ?? "—"} · Lección {lessonNumber}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={safeIdx >= pages.length - 1 || isFlipping}
          className="fc-board__nav fc-board__nav--next"
          aria-label="Lámina siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {pages.length > 1 && (
        <div className="fc-board__strip" role="tablist" aria-label="Láminas del flipchart">
          {pages.map((p, i) => (
            <button
              key={p.flipchartPage}
              type="button"
              role="tab"
              aria-selected={i === safeIdx}
              className={`fc-board__thumb${i === safeIdx ? " is-active" : ""}`}
              onClick={() => goTo(i, i > safeIdx ? "next" : "prev")}
              aria-label={`Ir a hoja ${i + 1}`}
            >
              <img src={getFlipchartPageSrc(p)} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
