/**
 * PdfPage — renders a single workbook page as the original scanned image.
 *
 * Pages 1-92: 2550×3301 color scans from /cartilla/art/color/workbook/
 * Pages 93-95: hd placeholder scans from /art/hd/
 *
 * The scanned art is the source of truth. WorkbookPageRenderer is not used.
 */
import { useEffect, useState } from "react";
import { getBookPageImage } from "@/lib/bookImages";

export function prefetchPage(pageNumber: number) {
  const img = new Image();
  img.src = getBookPageImage(pageNumber);
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safe = Math.max(1, Math.min(pageNumber, 95));
  const primary = getBookPageImage(safe);
  const fallback = `/art/hd/page-${safe}.png`;

  const [src, setSrc] = useState(primary);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(getBookPageImage(Math.max(1, Math.min(pageNumber, 95))));
    setLoaded(false);
  }, [pageNumber]);

  return (
    <div
      className={`pdf-page-wrapper relative flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
      aria-label={`Página ${safe} del libro`}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={`Página ${safe} del libro`}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        draggable={false}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== fallback) {
            setSrc(fallback);
            setLoaded(false);
          }
        }}
      />
    </div>
  );
}
