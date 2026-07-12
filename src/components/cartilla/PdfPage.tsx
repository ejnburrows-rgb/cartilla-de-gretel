/**
 * PdfPage — renders a single workbook page via the canonical art fallback
 * chain (HD improved → lineart → source scan). Missing tiers degrade
 * gracefully; the page never crashes.
 *
 * WorkbookPageRenderer is not used on this path.
 */
import { useEffect, useMemo, useState } from "react";
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
  const safe = Math.max(1, Math.min(Math.floor(Number(pageNumber) || 1), 95));
  const chain = useMemo(() => getWorkbookPageFallbackChain(safe), [safe]);

  const [src, setSrc] = useState<string | null>(chain[0] ?? null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(chain[0] ?? null);
    setLoaded(false);
  }, [chain]);

  return (
    <div
      className={`pdf-page-wrapper relative flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
      aria-label={`Página ${safe} del libro`}
    >
      {!loaded && src && (
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
            // Re-resolve from the current chain so page changes never leave
            // a stale index. Prefer improved art → lineart → source.
            const currentIdx = chain.indexOf(src);
            if (currentIdx >= 0 && currentIdx + 1 < chain.length) {
              setLoaded(false);
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
