import type { ReactNode } from "react";
import "@/styles/faithful-page.css";

interface PageFrameProps {
  pageNumber?: number;
  lessonNumber?: number;
  children: ReactNode;
  className?: string;
}

function WavySidebar() {
  const d =
    "M0,0 L70,0 " +
    "C40,40 100,80 70,120 C40,160 100,200 70,240 " +
    "C40,280 100,320 70,360 C40,400 100,440 70,480 " +
    "C40,520 100,560 70,600 C40,640 100,680 70,720 " +
    "C40,760,100,800,70,840 C40,880,100,920,70,960 " +
    "C40,1000,100,1040,70,1080 L0,1080 Z";
  return (
    <svg viewBox="0 0 100 1080" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** Neutral page trim. Source artwork and source-color crops are never altered here. */
export function PageFrame({ pageNumber, lessonNumber, children, className }: PageFrameProps) {
  const classes = ["faithful-page", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <div className="faithful-page__sidebar"><WavySidebar /></div>
      <div className="faithful-page__body">{children}</div>
      {typeof pageNumber === "number" && <div className="faithful-page__pagenum" aria-label={`Página ${pageNumber}`}><span>{pageNumber}</span></div>}
      {typeof lessonNumber === "number" && <div className="faithful-page__lesson">Lección {lessonNumber}</div>}
    </div>
  );
}
