import React, { type ReactNode, useEffect, useRef } from "react";
import "@/styles/faithful-page.css";
import "@/styles/generated-lesson-art.css";

const GENERATED_REPLACEMENTS = new Set(["abeja", "aguja", "abrigo", "remolino", "globo", "oruga"]);

interface PageFrameProps {
  pageNumber?: number;
  lessonNumber?: number;
  children: ReactNode;
  className?: string;
  garden?: boolean;
  gardenBg?: string;
}

function WavySidebar() {
  const d =
    "M0,0 L70,0 " +
    "C40,40 100,80 70,120 C40,160 100,200 70,240 " +
    "C40,280 100,320 70,360 C40,400 100,440 70,480 " +
    "C40,520 100,560 70,600 C40,640 100,680 70,720 " +
    "C40,760 100,800 70,840 C40,880 100,920 70,960 " +
    "C40,1000 100,1040 70,1080 L0,1080 Z";
  return (
    <svg viewBox="0 0 100 1080" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function PageFrame({ pageNumber, lessonNumber, children, className, garden, gardenBg }: PageFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const classes = ["faithful-page", garden ? "faithful-page--garden" : "", className ?? ""].filter(Boolean).join(" ");
  const style = garden && gardenBg ? ({ "--garden-page-bg": `url('${gardenBg}')` } as React.CSSProperties) : undefined;

  useEffect(() => {
    const root = frameRef.current;
    if (!root) return;
    for (const marker of root.querySelectorAll<HTMLElement>(".fp-art-pending")) {
      const word = marker.querySelector<HTMLElement>(".fp-art-pending__word")?.textContent?.trim().toLowerCase();
      if (!word || !GENERATED_REPLACEMENTS.has(word)) continue;
      marker.dataset.generatedArt = word;
      marker.setAttribute("aria-label", word);
    }
  }, [pageNumber]);

  return (
    <div ref={frameRef} className={classes} style={style}>
      <div className="faithful-page__sidebar"><WavySidebar /></div>
      <div className="faithful-page__body">{children}</div>
      {typeof pageNumber === "number" && <div className="faithful-page__pagenum" aria-label={`Página ${pageNumber}`}><span>{pageNumber}</span></div>}
      {typeof lessonNumber === "number" && <div className="faithful-page__lesson">Lección {lessonNumber}</div>}
    </div>
  );
}
