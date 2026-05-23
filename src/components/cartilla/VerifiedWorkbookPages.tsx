import { FileText, Image, ShieldCheck } from "lucide-react";
import type { WorkbookPageContent } from "@/lib/book-faithful";

type VerifiedWorkbookPagesProps = {
  pages: WorkbookPageContent[];
};

function statusLabel(status: WorkbookPageContent["transcriptionStatus"]) {
  if (status === "verified") return "Texto verificado";
  if (status === "partial") return "Parcial";
  return "Pendiente";
}

export function VerifiedWorkbookPages({ pages }: VerifiedWorkbookPagesProps) {
  if (pages.length === 0) return null;

  const verifiedCount = pages.filter((page) => page.transcriptionStatus === "verified").length;
  const imageCount = pages.filter((page) => Boolean(page.imageScanReference)).length;

  return (
    <section
      className="mt-5 rounded-2xl border border-[var(--cartilla-accent)]/18 bg-white/58 p-3"
      aria-label="Estado de contenido verificado por pagina"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cartilla-title-ink)]">
          <ShieldCheck className="h-5 w-5 text-[var(--cartilla-accent)]" />
          Estado del cuaderno
        </h2>
        <div className="flex flex-wrap gap-1.5 text-xs font-bold text-foreground/62">
          <span className="rounded-full bg-foreground/7 px-2.5 py-1">
            Texto {verifiedCount}/{pages.length}
          </span>
          <span className="rounded-full bg-foreground/7 px-2.5 py-1">
            Imagen {imageCount}/{pages.length}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {pages.map((page) => (
          <details
            key={page.pageNumber}
            className="group rounded-xl border border-foreground/10 bg-white/72 px-3 py-2 text-sm"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 font-bold text-[var(--cartilla-title-ink)]">
              <span>Pagina {page.pageNumber}</span>
              <span className="rounded-full bg-foreground/7 px-2 py-0.5 text-xs text-foreground/62">
                {statusLabel(page.transcriptionStatus)}
              </span>
            </summary>

            {page.verifiedTextBlocks.length > 0 ? (
              <div className="mt-3 space-y-2">
                {page.verifiedTextBlocks.map((block, index) => (
                  <p key={`${page.pageNumber}-${index}`} className="text-base leading-relaxed">
                    {block}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-foreground/16 bg-foreground/[0.03] p-3 text-sm font-semibold text-foreground/58">
                Contenido pendiente de transcripcion verificada.
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground/55">
              {page.sourceRawLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/6 px-2.5 py-1">
                  <FileText className="h-3.5 w-3.5" />
                  {page.sourceRawLabel}
                </span>
              )}
              {page.imageScanReference && (
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/6 px-2.5 py-1">
                  <Image className="h-3.5 w-3.5" />
                  Referencia visual disponible
                </span>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
