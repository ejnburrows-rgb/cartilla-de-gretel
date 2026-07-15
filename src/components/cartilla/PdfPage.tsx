/**
 * PdfPage — renders a single workbook page image via the art fallback chain:
 *   1. HD colorized art
 *   2. Clean transparent lineart
 *   3. Raw source scan
 *
 * Never invents content — if every candidate 404s, shows an honest pending state.
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
  const safe = Math.max(1, Math.min(pageNumber, 95));
  const chain = useMemo(() => getWorkbookPageFallbackChain(safe), [safe]);

  const [chainIndex, setChainIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setChainIndex(0);
    setLoaded(false);
  }, [safe]);

  const src = chainIndex < chain.length ? (chain[chainIndex] ?? null) : null;

  return (
    <div
      className={`pdf-page-wrapper relative flex items-center justify-center overflow-hidden bg-white select-none ${className}`}
      aria-label={`Página ${safe} del libro`}
    >
      {!loaded && src && <div className="absolute inset-0 bg-stone-100 animate-pulse" />}
      {src ? (
        <img
          key={src}
          src={src}
          alt={`Página ${safe} del libro`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          draggable={false}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setChainIndex((i) => i + 1);
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
