import { useEffect, useRef, useState } from "react";
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
}

/**
 * Renders a single page from the canonical student workbook PDF
 * (public/book/book.pdf, fetched from Notion at build time by
 * scripts/prebuild-fetch-pdfs.mjs).
 *
 * When `width` is not provided, the component measures its container with a
 * ResizeObserver and renders the PDF page at that width, so the same
 * component scales correctly inside both single-page and side-by-side spreads.
 */
export function PdfPage({ pageNumber, width, className }: PdfPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(width);

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

  const safePage = numPages
    ? Math.min(Math.max(1, pageNumber), numPages)
    : Math.max(1, pageNumber);

  return (
    <div ref={containerRef} className={className} style= width: "100%" >
      <Document
        file={PDF_FILE}
        onLoadSuccess={(doc) => setNumPages(doc.numPages)}
        loading={
          <div className="py-24 text-center font-bold opacity-50">
            Cargando libro…
          </div>
        }
        error={
          <div className="py-16 text-center font-bold text-red-700/80">
            No se pudo cargar el libro. Vuelve a intentarlo.
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
              <div className="py-24 text-center font-bold opacity-50">
                Cargando página…
              </div>
            }
          />
        ) : null}
      </Document>
    </div>
  );
}
