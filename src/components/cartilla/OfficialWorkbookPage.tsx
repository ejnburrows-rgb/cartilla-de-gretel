import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { AlertCircle, FileText } from "lucide-react";
import type { WorkbookPageSource } from "@/lib/workbook-source";

try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
} catch (error) {
  console.error("Worker registration error", error);
}

type OfficialWorkbookPageProps = {
  source: WorkbookPageSource;
  runtimePdfAvailable?: boolean;
};

export function OfficialWorkbookPage({
  source,
  runtimePdfAvailable = false,
}: OfficialWorkbookPageProps) {
  const hasConnectedPdf = runtimePdfAvailable || source.status === "pdf-available";
  const [activeImage, setActiveImage] = useState(source.imageRef ?? source.originalImageRef ?? "");
  const [width, setWidth] = useState<number>(980);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImage(source.imageRef ?? source.originalImageRef ?? "");
  }, [source.imageRef, source.originalImageRef]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const resize = () => setWidth(Math.max(320, Math.min(node.clientWidth, 1120)));
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const hasImage = Boolean(source.hasVerifiedImage && activeImage);

  return (
    <article className="official-workbook-page-shell">
      <div ref={containerRef} className="official-workbook-page-stage">
        {hasImage ? (
          <div className="official-workbook-page-imageWrap">
            <img
              src={activeImage}
              alt={`Página ${source.pageNumber} del cuaderno oficial`}
              className="official-workbook-page-image"
              decoding="async"
              loading="eager"
              fetchPriority="high"
              onError={() => {
                if (source.originalImageRef && activeImage !== source.originalImageRef) {
                  setActiveImage(source.originalImageRef);
                }
              }}
            />
          </div>
        ) : hasConnectedPdf && !loadError ? (
          <div className="official-workbook-page-pdfWrap">
            <Document
              file={source.pdfPath}
              loading={
                <div className="official-workbook-page-loading">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--cartilla-accent)]/30 border-t-[var(--cartilla-accent)]" />
                  <span>Abriendo cuaderno oficial…</span>
                </div>
              }
              error={
                <div className="official-workbook-page-error">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <span>No se pudo cargar la página oficial.</span>
                  <button onClick={() => setLoadError(null)}>Reintentar</button>
                </div>
              }
              onLoadError={(err) => setLoadError(err.message)}
              onLoadSuccess={() => setLoadError(null)}
            >
              <Page
                pageNumber={source.pageNumber}
                width={width}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="official-workbook-page-pdf"
              />
            </Document>
          </div>
        ) : hasConnectedPdf && loadError ? (
          <div className="official-workbook-page-error">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <span>No se pudo cargar la página oficial.</span>
            <button onClick={() => setLoadError(null)}>Reintentar</button>
          </div>
        ) : (
          <div className="official-workbook-page-missing">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-stone-200/40 bg-white shadow-md">
              <FileText className="h-8 w-8 text-[var(--cartilla-accent)]" />
            </div>
            <h4>Página pendiente de conexión</h4>
            <p>Esta área está reservada para la página oficial del cuaderno.</p>
          </div>
        )}
      </div>
    </article>
  );
}
