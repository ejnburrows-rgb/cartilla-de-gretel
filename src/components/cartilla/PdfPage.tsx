import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDF_FILE = "/book/book.pdf";

interface PdfPageProps {
  pageNumber: number;
  /** Optional fixed width in CSS pixels. If omitted, fills the container width responsively. */
  width?: number;
  className?: string;
  /** If true, hides the page number badge in the corner (used inside spreads). */
  hideBadge?: boolean;
}

/**
 * Renders a single page from the canonical workbook PDF
 * (public/book/book.pdf, fetched from Notion at build time by
 * scripts/prebuild-fetch-pdfs.mjs).
 *
 * When `width` is not provided, the component measures its container with a
 * ResizeObserver and renders the PDF page at that width, so the same
 * component scales correctly inside both single-page and side-by-side spreads.
 *
 * If the PDF fails to load (e.g. build-time fetch failed), an actionable
 * fallback is rendered with a retry button and a link to the build diagnostic.
 */
export function PdfPage({ pageNumber, width, className, hideBadge }: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(width);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (typeof width === "number") {
      setMeasuredWidth(width);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setMeasuredWidth(Math.floor(w));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    setNumPages(null);
    setReloadKey((k) => k + 1);
  }, []);

  const safePage = numPages
    ? Math.min(Math.max(1, pageNumber), numPages)
    : Math.max(1, pageNumber);

  return (
    <div
      ref={containerRef}
      className={className}
      style= width: "100%", position: "relative" 
    >
      {loadError ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 py-16 px-6 text-center"
        >
          <p className="text-base font-semibold text-red-800">
            No se pudo cargar el libro.
          </p>
          <p className="text-sm text-red-700/80 max-w-md">
            El archivo PDF no está disponible en este momento. Esto suele
            resolverse al reintentar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
            >
              Reintentar
            </button>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-700/70 underline underline-offset-2"
            >
              Ver diagnóstico
            </a>
          </div>
        </div>
      ) : (
        <Document
          key={reloadKey}
          file={PDF_FILE}
          onLoadSuccess={(doc) => setNumPages(doc.numPages)}
          onLoadError={(err) => setLoadError(err?.message ?? "unknown")}
          onSourceError={(err) => setLoadError(err?.message ?? "source")}
          loading={
            <div
              className="py-24 text-center text-sm font-semibold opacity-60"
              aria-live="polite"
            >
              Cargando libro…
            </div>
          }
          error={
            <div
              role="alert"
              className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            >
              <p className="text-sm font-semibold text-red-800">
                No se pudo cargar el libro.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-full bg-red-700 px-4 py-1.5 text-xs font-semibold text-white"
              >
                Reintentar
              </button>
            </div>
          }
        >
          {measuredWidth ? (
            <Page
              pageNumber={safePage}
              width={measuredWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div
                  className="py-24 text-center text-sm font-semibold opacity-60"
                  aria-live="polite"
                >
                  Cargando página…
                </div>
              }
            />
          ) : null}
        </Document>
      )}
      {!hideBadge && numPages && !loadError && measuredWidth ? (
        <div
          className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white"
          aria-hidden="true"
        >
          p. {safePage} / {numPages}
        </div>
      ) : null}
    </div>
  );
}
