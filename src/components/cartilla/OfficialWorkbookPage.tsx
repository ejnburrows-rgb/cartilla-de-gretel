import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { AlertCircle, FileText, Image, Link as LinkIcon, Sparkles } from "lucide-react";
import type { WorkbookPageSource, WorkbookSourceStatus } from "@/lib/workbook-source";

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

function statusCopy(status: WorkbookSourceStatus, runtimePdfAvailable?: boolean) {
  if (status === "image-available") return "Página oficial conectada";
  if (status === "pdf-available" || runtimePdfAvailable) return "Página oficial conectada";
  if (status === "pending-transcription") return "Fuente conectada; texto pendiente";
  return "Página pendiente de conexión al cuaderno oficial";
}

export function OfficialWorkbookPage({
  source,
  runtimePdfAvailable = false,
}: OfficialWorkbookPageProps) {
  const hasConnectedPdf = runtimePdfAvailable || source.status === "pdf-available";
  const [activeImage, setActiveImage] = useState(source.imageRef ?? source.originalImageRef ?? "");
  const [width, setWidth] = useState<number>(760);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImage(source.imageRef ?? source.originalImageRef ?? "");
  }, [source.imageRef, source.originalImageRef]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const resize = () => setWidth(Math.max(320, Math.min(node.clientWidth - 24, 980)));
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const hasImage = Boolean(source.hasVerifiedImage && activeImage);
  const isEnhanced = useMemo(
    () => Boolean(activeImage && source.originalImageRef && activeImage !== source.originalImageRef),
    [activeImage, source.originalImageRef],
  );

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[#fdfbf7] shadow-[0_24px_70px_rgba(34,24,12,0.20),0_5px_18px_rgba(0,0,0,0.08)]">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-8 bg-gradient-to-r from-black/18 via-black/5 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-24 w-24 rounded-br-[2rem] bg-gradient-to-br from-transparent via-black/5 to-black/14" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.72),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.22),transparent_18%,transparent_82%,rgba(0,0,0,0.06))]" />

      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 bg-[#FAF7F0]/95 py-3.5 pl-9 pr-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500/80">
            Cuaderno del estudiante
          </div>
          <h3 className="text-xl font-black text-[var(--cartilla-title-ink)]">
            Página {source.pageNumber}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEnhanced && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> {source.qualityLabel ?? "Imagen mejorada"}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-[var(--cartilla-title-ink)] shadow-sm">
            <LinkIcon className="h-3.5 w-3.5 text-[var(--cartilla-accent)]" />
            {statusCopy(source.status, runtimePdfAvailable)}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative z-20 w-full">
        {hasImage ? (
          <div className="flex justify-center bg-[#f5ebd5]/45 p-3 shadow-inner sm:p-6">
            <img
              src={activeImage}
              alt={`Página ${source.pageNumber} del cuaderno oficial`}
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl border border-stone-200/70 bg-white object-contain shadow-[0_16px_36px_rgba(0,0,0,0.16),0_2px_7px_rgba(0,0,0,0.08)] [image-rendering:auto]"
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
          <div className="flex justify-center bg-[#f5ebd5]/45 p-4 shadow-inner sm:p-6">
            <Document
              file={source.pdfPath}
              loading={
                <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--cartilla-accent)]/30 border-t-[var(--cartilla-accent)]" />
                  <span className="text-sm font-bold text-foreground/50">
                    Abriendo cuaderno oficial…
                  </span>
                </div>
              }
              error={
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
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
                className="mx-auto select-none overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-[0_16px_36px_rgba(0,0,0,0.16)]"
              />
            </Document>
          </div>
        ) : hasConnectedPdf && loadError ? (
          <div className="flex flex-col items-center gap-2 bg-[#f5ebd5]/40 p-10 text-center shadow-inner">
            <AlertCircle className="h-10 w-10 text-destructive" />
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
          <div className="grid min-h-[360px] place-items-center bg-[linear-gradient(135deg,#fffaf0,#f5ead0)] px-5 py-10 pl-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-stone-200/40 bg-white shadow-md">
                <FileText className="h-8 w-8 text-[var(--cartilla-accent)]" />
              </div>
              <h4 className="mt-4 text-2xl font-bold text-[var(--cartilla-title-ink)]">
                Página pendiente de conexión
              </h4>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/62">
                Esta área está reservada para la página oficial del cuaderno. No se muestra texto ni arte hasta que la fuente verificada esté conectada.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-30 flex flex-wrap items-center gap-2 border-t border-stone-200/60 bg-[#FAF7F0]/95 py-3 pl-9 pr-4 text-xs font-bold text-foreground/60">
        <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/50 bg-white px-2.5 py-1 shadow-sm">
          <FileText className="h-3.5 w-3.5 text-stone-500" />
          PDF {hasConnectedPdf ? "disponible" : "pendiente"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/50 bg-white px-2.5 py-1 shadow-sm">
          <Image className="h-3.5 w-3.5 text-stone-500" />
          Imagen {source.hasVerifiedImage ? "disponible" : "pendiente"}
        </span>
      </div>
    </article>
  );
}
