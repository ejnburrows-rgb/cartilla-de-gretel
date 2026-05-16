import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { storage } from "@/lib/storage";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const KEY = "reader.position.pdf";

export function PdfViewer({
  url,
  onUnitChange,
  onProgress,
  advanceSignal = 0,
}: {
  url: string;
  onUnitChange?: (label: string) => void;
  onProgress?: (current: number, total: number) => void;
  advanceSignal?: number;
}) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState<number>(storage.get(KEY, 1));
  const [width, setWidth] = useState<number>(800);
  const [loadError, setLoadError] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = shellRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const resize = () => setWidth(Math.max(280, Math.min(node.clientWidth - 24, 920)));
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    storage.set(KEY, page);
  }, [page]);
  useEffect(() => {
    if (numPages > 0) {
      const safePage = Math.min(Math.max(1, page), numPages);
      if (safePage !== page) setPage(safePage);
      onProgress?.(safePage, numPages);
      onUnitChange?.(`Página ${safePage}`);
    }
  }, [page, numPages, onProgress, onUnitChange]);

  useEffect(() => {
    if (advanceSignal > 0) setPage((p) => (numPages ? Math.min(numPages, p + 1) : p));
  }, [advanceSignal, numPages]);

  const goTo = (next: number) => setPage(() => Math.min(Math.max(1, next), Math.max(numPages, 1)));

  return (
    <div ref={shellRef} className="flex min-h-full flex-col items-center gap-4 p-4 sm:p-6">
      <div className="w-full max-w-6xl rounded-[2rem] border border-primary/10 bg-card/80 p-3 shadow-2xl shadow-primary/10 backdrop-blur">
        {loadError ? (
          <div className="rounded-3xl border-2 border-destructive/20 bg-destructive/5 p-6 text-center">
            <h2 className="font-bold text-destructive">No se pudo abrir el PDF</h2>
            <p className="mt-1 text-sm text-foreground/70">{loadError}</p>
          </div>
        ) : (
          <Document
            file={url}
            loading={
              <div className="p-10 text-center text-sm font-bold text-foreground/50">
                Cargando libro…
              </div>
            }
            error={
              <div className="p-10 text-center text-sm font-bold text-destructive">
                Error cargando el PDF.
              </div>
            }
            onLoadError={(err) => setLoadError(err.message)}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setLoadError(null);
            }}
          >
            <div className="overflow-hidden rounded-[1.5rem] bg-background shadow-inner">
              <Page pageNumber={page} width={width} renderAnnotationLayer renderTextLayer />
            </div>
          </Document>
        )}
      </div>

      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/90 px-3 py-2 shadow-xl shadow-primary/10 backdrop-blur">
        <button
          onClick={() => goTo(page - 1)}
          className="rounded-xl border border-border px-3 py-2 font-bold transition hover:bg-secondary disabled:opacity-40"
          disabled={page <= 1}
        >
          ←
        </button>
        <span className="min-w-24 text-center text-sm font-bold tabular-nums text-foreground/75">
          {page} / {numPages || "—"}
        </span>
        <button
          onClick={() => goTo(page + 1)}
          className="rounded-xl border border-border px-3 py-2 font-bold transition hover:bg-secondary disabled:opacity-40"
          disabled={numPages > 0 && page >= numPages}
        >
          →
        </button>
      </div>
    </div>
  );
}
