import type { ReactNode } from "react";
import "@/styles/faithful-page.css";

/**
 * The book's signature page "trim" — a white page with a wavy teal left
 * sidebar, a teal diamond page number, and a "Lección N" footer. Wrapping
 * every faithful page in this guarantees the student CRM view, the student
 * workbook, and the teacher flipbook all look like the same printed book.
 */
interface PageFrameProps {
  pageNumber?: number;
  lessonNumber?: number;
  children: ReactNode;
  /** Extra class on the root (e.g. "faithful-page--pending"). */
  className?: string;
}

/** Wavy right-edge teal band, stretched to the page height. */
function WavySidebar() {
  // A vertical sine-like right edge; preserveAspectRatio="none" lets it stretch.
  const d =
    "M0,0 L70,0 " +
    "C40,40 100,80 70,120 " +
    "C40,160 100,200 70,240 " +
    "C40,280 100,320 70,360 " +
    "C40,400 100,440 70,480 " +
    "C40,520 100,560 70,600 " +
    "C40,640 100,680 70,720 " +
    "C40,760 100,800 70,840 " +
    "C40,880 100,920 70,960 " +
    "C40,1000 100,1040 70,1080 " +
    "L0,1080 Z";
  return (
    <svg viewBox="0 0 100 1080" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function PageFrame({ pageNumber, lessonNumber, children, className }: PageFrameProps) {
  const rootClass = className ? `faithful-page ${className}` : "faithful-page";
  return (
    <div className={rootClass}>
      <div className="faithful-page__sidebar">
        <WavySidebar />
      </div>

      <div className="faithful-page__body">{children}</div>

      {typeof pageNumber === "number" && (
        <div className="faithful-page__pagenum" aria-label={`Página ${pageNumber}`}>
          <span>{pageNumber}</span>
        </div>
      )}
      {typeof lessonNumber === "number" && (
        <div className="faithful-page__lesson">Lección {lessonNumber}</div>
      )}
    </div>
  );
}
