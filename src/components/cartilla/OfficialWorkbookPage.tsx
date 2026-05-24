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
    <article className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-[#fdfbf7] shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.05)]">
      {/* Notebook Spine Bind effect on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/14 via-black/3 to-transparent pointer-events-none z-20" />
      {/* Subtle page curl highlight on right page edge */}
      <div className="absolute right-0 bottom-0 w-12 h-12 bg-gradient-to-br from-transparent to-black/5 pointer-events-none z-20 rounded-br-[1.75rem]" />
      
      {/* Header */}
      <div className="relative pl-8 pr-4 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 bg-[#FAF7F0] z-10">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500/80">
            Cuaderno del estudiante
          </div>
          <h3 className="text-xl font-black text-[var(--cartilla-title-ink)]">
            Página {source.pageNumber}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[var(--cartilla-title-ink)] shadow-sm">
          <LinkIcon className="h-3.5 w-3.5 text-[var(--cartilla-accent)]" />
          {statusCopy(source.status, runtimePdfAvailable)}
        </span>
      </div>

      {/* Body */}
      <div ref={containerRef} className="w-full relative">
        {hasImage ? (
          <div className="bg-[#f5ebd5]/40 p-4 sm:p-6 flex justify-center shadow-inner">
            <img
              src={hasImage}
              alt={`Página ${source.pageNumber} del cuaderno oficial`}
              className="mx-auto rounded-xl object-contain shadow-[0_8px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.04)] border border-stone-200/60 bg-white"
              style={{ width }}
              loading="lazy"
            />
          </div>
        ) : hasConnectedPdf && !loadError ? (
          <div className="bg-[#f5ebd5]/40 p-4 sm:p-6 flex justify-center shadow-inner">
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
                className="mx-auto select-none rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-stone-200/60 bg-white"
              />
            </Document>
          </div>
        ) : hasConnectedPdf && loadError ? (
          <div className="p-10 text-center flex flex-col items-center gap-2 bg-[#f5ebd5]/40 shadow-inner">
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
          <div className="grid min-h-[360px] place-items-center bg-[linear-gradient(135deg,#fffaf0,#f5ead0)] px-5 py-10 text-center pl-8">
            <div className="max-w-md">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-md border border-stone-200/40">
                <FileText className="h-8 w-8 text-[var(--cartilla-accent)]" />
              </div>
              <h4 className="mt-4 text-2xl font-bold text-[var(--cartilla-title-ink)]">
                Página pendiente de conexión
              </h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/62">
                Esta área está reservada para la página oficial del cuaderno. No se muestra texto ni
                arte hasta que la fuente verificada esté conectada.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative pl-8 pr-4 py-3 flex flex-wrap items-center gap-2 border-t border-stone-200/60 bg-[#FAF7F0] text-xs font-bold text-foreground/60 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-stone-200/50 px-2.5 py-1 shadow-sm">
          <FileText className="h-3.5 w-3.5 text-stone-500" />
          PDF {hasConnectedPdf ? "disponible" : "pendiente"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-stone-200/50 px-2.5 py-1 shadow-sm">
          <Image className="h-3.5 w-3.5 text-stone-500" />
          Imagen {source.hasVerifiedImage ? "disponible" : "pendiente"}
        </span>
      </div>
    </article>
  );
}
