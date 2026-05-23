import { FileText, Image, ShieldCheck } from "lucide-react";
import type { WorkbookPageContent } from "@/lib/book-faithful";

type VerifiedWorkbookPagesProps = {
  pages: WorkbookPageContent[];
};

function statusLabel(status: WorkbookPageContent["transcriptionStatus"]) {
  if (status === "verified") return "Transcripción verificada";
  if (status === "partial") return "Parcial";
  return "Pendiente";
}

export function VerifiedWorkbookPages({ pages }: VerifiedWorkbookPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className="mt-6 space-y-3" aria-label="Contenido verificado por página">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold text-[var(--cartilla-title-ink)]">
          <ShieldCheck className="h-5 w-5 text-[var(--cartilla-accent)]" />
          Contenido fuente por página
        </h2>
        <span className="rounded-full bg-foreground/8 px-3 py-1 text-xs font-bold text-foreground/60">
          Solo texto verificado
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <article
            key={page.pageNumber}
            className="rounded-2xl border-2 border-[var(--cartilla-accent)]/20 bg-white/72 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-foreground/55">
                  Página {page.pageNumber}
                </div>
                <div className="text-sm font-bold text-[var(--cartilla-title-ink)]">
                  {statusLabel(page.transcriptionStatus)}
                </div>
              </div>
              <span className="rounded-full border border-foreground/10 bg-white/80 px-3 py-1 text-xs font-bold text-foreground/65">
                {page.pageRole}
              </span>
            </div>

            {page.verifiedTextBlocks.length > 0 ? (
              <div className="mt-3 space-y-2">
                {page.verifiedTextBlocks.map((block, index) => (
                  <p key={`${page.pageNumber}-${index}`} className="text-base leading-relaxed">
                    {block}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-foreground/18 bg-foreground/[0.03] p-3 text-sm font-semibold text-foreground/58">
                Contenido pendiente de transcripción verificada.
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
          </article>
        ))}
      </div>
    </section>
  );
}
