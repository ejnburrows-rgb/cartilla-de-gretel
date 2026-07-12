/**
 * PdfPage — renders a single workbook page as the original scanned image.
 *
 * Pages 1-92: 2550×3301 color scans from /cartilla/art/color/workbook/
 *
 * The scanned art is the source of truth. WorkbookPageRenderer is not used.
 */
import { useEffect, useState } from "react";
import { getBookPageImage, getWorkbookPageFallbackChain } from "@/lib/bookImages";

export function prefetchPage(pageNumber: number) {
  const src = getBookPageImage(pageNumber);
  if (src) {
    const img = new Image();
    img.src = src;
  }
}

interface PdfPageProps {
  pageNumber: number;
  className?: string;
}

export function PdfPage({ pageNumber, className = "" }: PdfPageProps) {
  const safe = Math.max(1, Math.min(pageNumber, 95));
  const chain = getWorkbookPageFallbackChain(safe);

  const [src, setSrc] = useState<string | null>(chain[0] ?? null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextChain = getWorkbookPageFallbackChain(Math.max(1, Math.min(pageNumber, 95)));
    setSrc(nextChain[0] ?? null);
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
      {src ? (
        <img
          src={src}
          alt={`Página ${safe} del libro`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          draggable={false}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            const currentIdx = chain.indexOf(src);
            if (currentIdx >= 0 && currentIdx + 1 < chain.length) {
              setSrc(chain[currentIdx + 1]!);
            } else {
              setSrc(null);
              setLoaded(false);
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400 p-8 text-center bg-stone-50 border border-stone-200">
          <span className="font-medium">Página no disponible</span>
        </div>
      )}
    </div>
  );
}
