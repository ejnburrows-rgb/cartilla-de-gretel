import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, FileText } from "lucide-react";
import { OfficialWorkbookPage } from "@/components/cartilla/OfficialWorkbookPage";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";

type OfficialWorkbookLessonViewProps = {
  lessonNumber: number;
  pages: string;
  title: string;
  accent?: string;
};

export function OfficialWorkbookLessonView({
  lessonNumber,
  pages,
  title,
  accent,
}: OfficialWorkbookLessonViewProps) {
  const lessonSource = useMemo(
    () => getWorkbookPageSourcesForLesson(lessonNumber, pages),
    [lessonNumber, pages],
  );
  const [selectedPage, setSelectedPage] = useState(
    lessonSource.pages[0]?.pageNumber ?? lessonNumber,
  );
  const [runtimePdfAvailable, setRuntimePdfAvailable] = useState(false);

  useEffect(() => {
    setSelectedPage(lessonSource.pages[0]?.pageNumber ?? lessonNumber);
  }, [lessonNumber, lessonSource.pages]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(lessonSource.pdfStatus.pdfPath, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        const contentType = response.headers.get("content-type") ?? "";
        if (!cancelled) setRuntimePdfAvailable(response.ok && contentType.includes("pdf"));
      })
      .catch(() => {
        if (!cancelled) setRuntimePdfAvailable(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [lessonSource.pdfStatus.pdfPath]);

  const selectedSource =
    lessonSource.pages.find((source) => source.pageNumber === selectedPage) ?? lessonSource.pages[0];
  const connectedCount =
    lessonSource.connectedSourceCount || (runtimePdfAvailable ? lessonSource.pages.length : 0);
  const sourceStatus =
    connectedCount > 0
      ? "Pagina oficial conectada"
      : "Paginas pendientes de conexion al cuaderno oficial";

  if (!selectedSource) return null;

  return (
    <section className="mt-5 space-y-4" aria-label="Cuaderno oficial de la leccion">
      <div className="rounded-[1.75rem] border-2 border-[var(--cartilla-accent)]/20 bg-white/75 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--cartilla-accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <BookOpenCheck className="h-3.5 w-3.5" /> Cuaderno oficial
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-[var(--cartilla-title-ink)]">
              {title}
            </h2>
            <p className="mt-1 text-sm font-semibold text-foreground/62">
              Primero revisa la pagina del cuaderno; despues practica con las actividades.
            </p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-white px-3 py-2 text-xs font-bold text-foreground/65">
            <div className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {sourceStatus}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Paginas de esta leccion">
          {lessonSource.pages.map((source) => {
            const active = source.pageNumber === selectedPage;
            return (
              <button
                key={source.pageNumber}
                type="button"
                onClick={() => setSelectedPage(source.pageNumber)}
                className={
                  active
                    ? "min-h-11 min-w-11 rounded-xl bg-[var(--cartilla-accent)] px-3 py-2 text-sm font-bold text-white shadow-sm"
                    : "min-h-11 min-w-11 rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm font-bold text-[var(--cartilla-title-ink)] hover:bg-foreground/5"
                }
                style={active && accent ? { backgroundColor: accent } : undefined}
                aria-pressed={active}
              >
                {source.pageNumber}
              </button>
            );
          })}
        </div>
      </div>

      <OfficialWorkbookPage source={selectedSource} runtimePdfAvailable={runtimePdfAvailable} />
    </section>
  );
}
