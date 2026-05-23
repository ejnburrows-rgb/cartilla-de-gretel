import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FileText, Image, Link as LinkIcon, AlertCircle } from "lucide-react";
import type { WorkbookPageSource, WorkbookSourceStatus } from "@/lib/workbook-source";

// Ensure the worker is registered properly
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
} catch (e) {
  console.error("Worker registration error", e);
}

type OfficialWorkbookPageProps = {
  source: WorkbookPageSource;
  runtimePdfAvailable?: boolean;
};

function statusCopy(status: WorkbookSourceStatus, runtimePdfAvailable?: boolean) {
  if (status === "image-available") return "Pagina oficial conectada";
  if (status === "pdf-available" || runtimePdfAvailable) return "Pagina oficial conectada";
  if (status === "pending-transcription") return "Fuente conectada; texto pendiente";
  return "Pagina pendiente de conexion al cuaderno oficial";
}

export function OfficialWorkbookPage({
  source,
  runtimePdfAvailable = false,
}: OfficialWorkbookPageProps) {
  const hasConnectedPdf = runtimePdfAvailable || source.status === "pdf-available";
  const hasImage = source.hasVerifiedImage && source.imageRef;

  const [width, setWidth] = useState<number>(600);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const resize = () => {
      // Scale page to fit container width beautifully
      setWidth(Math.max(280, Math.min(node.clientWidth - 16, 760)));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <article className="overflow-hidden rounded-[1.75rem] border-2 border-[var(--cartilla-accent)]/25 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 bg-[var(--cartilla-accent-soft)]/35 px-4 py-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/55">
            Pagina oficial
          </div>
          <h3 className="text-xl font-bold text-[var(--cartilla-title-ink)]">
            Pagina {source.pageNumber}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-[var(--cartilla-title-ink)]">
          <LinkIcon className="h-3.5 w-3.5 text-[var(--cartilla-accent)]" />
          {statusCopy(source.status, runtimePdfAvailable)}
        </span>
      </div>

      {/* Body */}
      <div ref={containerRef} className="w-full">
        {hasImage ? (
          <div className="bg-stone-100 p-3 flex justify-center">
            <img
              src={hasImage}
              alt={`Pagina ${source.pageNumber} del cuaderno oficial`}
              className="mx-auto rounded-xl object-contain shadow-md"
              style={{ width }}
              loading="lazy"
            />
          </div>
        ) : hasConnectedPdf && !loadError ? (
          <div className="bg-stone-100 p-3 sm:p-5 flex justify-center shadow-inner">
            <Document
              file={source.pdfPath}
              loading={
                <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-[var(--cartilla-accent)]/30 border-t-[var(--cartilla-accent)] animate-spin" />
                  <span className="text-sm font-bold text-foreground/50">
                    Abriendo cuaderno oficial…
                  </span>
                </div>
              }
              error={
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                  <span className="text-sm font-bold text-destructive">
                    No se pudo cargar la página oficial.
                  </span>
                  <button
                    onClick={() => setLoadError(null)}
                    className="mt-2 text-xs font-bold text-[var(--cartilla-accent)] underline hover:opacity-80"
                  >
                    Reintentar
                  </button>
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
                className="mx-auto select-none rounded-xl overflow-hidden shadow-lg border border-foreground/5"
              />
            </Document>
          </div>
        ) : hasConnectedPdf && loadError ? (
          <div className="p-10 text-center flex flex-col items-center gap-2 bg-stone-100 shadow-inner">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <span className="text-sm font-bold text-destructive">
              No se pudo cargar la página oficial.
            </span>
            <button
              onClick={() => setLoadError(null)}
              className="mt-2 text-xs font-bold text-[var(--cartilla-accent)] underline hover:opacity-80"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid min-h-[360px] place-items-center bg-[linear-gradient(135deg,#fffaf0,#f5ead0)] px-5 py-10 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm">
                <FileText className="h-8 w-8 text-[var(--cartilla-accent)]" />
              </div>
              <h4 className="mt-4 text-2xl font-bold text-[var(--cartilla-title-ink)]">
                Pagina pendiente de conexion
              </h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/62">
                Esta area esta reservada para la pagina oficial del cuaderno. No se muestra texto ni
                arte hasta que la fuente verificada este conectada.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 px-4 py-3 text-xs font-bold text-foreground/60">
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/6 px-2.5 py-1">
          <FileText className="h-3.5 w-3.5" />
          PDF {hasConnectedPdf ? "disponible" : "pendiente"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-foreground/6 px-2.5 py-1">
          <Image className="h-3.5 w-3.5" />
          Imagen {source.hasVerifiedImage ? "disponible" : "pendiente"}
        </span>
      </div>
    </article>
  );
}
