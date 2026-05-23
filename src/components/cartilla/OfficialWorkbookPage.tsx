import { FileText, Image, Link as LinkIcon } from "lucide-react";
import type { WorkbookPageSource, WorkbookSourceStatus } from "@/lib/workbook-source";

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
  const pdfPageUrl = `${source.pdfPath}#page=${source.pageNumber}&view=FitH`;

  return (
    <article className="overflow-hidden rounded-[1.75rem] border-2 border-[var(--cartilla-accent)]/25 bg-white shadow-sm">
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

      {hasImage ? (
        <div className="bg-stone-100 p-3">
          <img
            src={hasImage}
            alt={`Pagina ${source.pageNumber} del cuaderno oficial`}
            className="mx-auto max-h-[68vh] w-full rounded-xl object-contain"
            loading="lazy"
          />
        </div>
      ) : hasConnectedPdf ? (
        <div className="h-[64vh] min-h-[420px] bg-stone-100">
          <iframe
            title={`Pagina ${source.pageNumber} del cuaderno oficial`}
            src={pdfPageUrl}
            className="h-full w-full border-0"
          />
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
