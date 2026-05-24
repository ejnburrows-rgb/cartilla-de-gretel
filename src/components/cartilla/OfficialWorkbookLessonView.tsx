import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { OfficialWorkbookPage } from "@/components/cartilla/OfficialWorkbookPage";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";

type OfficialWorkbookLessonViewProps = {
  lessonNumber: number;
  pages: string;
  title: string;
  accent?: string;
  /** Called whenever the selected page chip changes. */
  onPageChange?: (pageNumber: number) => void;
  /** Optional content rendered after the official page viewer. */
  belowPage?: (pageNumber: number) => React.ReactNode;
};

export function OfficialWorkbookLessonView({
  lessonNumber,
  pages,
  title,
  accent,
  onPageChange,
  belowPage,
}: OfficialWorkbookLessonViewProps) {
  const lessonSource = useMemo(
    () => getWorkbookPageSourcesForLesson(lessonNumber, pages),
    [lessonNumber, pages],
  );

  const [selectedPage, setSelectedPage] = useState(
    lessonSource.pages[0]?.pageNumber ?? lessonNumber,
  );
  const [runtimePdfAvailable, setRuntimePdfAvailable] = useState(false);

  // Track direction for slide animation: 1 = forward (next page), -1 = backward (prev page)
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    const firstPage = lessonSource.pages[0]?.pageNumber ?? lessonNumber;
    setSelectedPage(firstPage);
    onPageChange?.(firstPage);
  }, [lessonNumber, lessonSource.pages, onPageChange]);

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

  const currentIndex = lessonSource.pages.findIndex((s) => s.pageNumber === selectedPage);
  const totalPages = lessonSource.pages.length;

  const selectedSource =
    lessonSource.pages[currentIndex] ?? lessonSource.pages[0];

  const connectedCount =
    lessonSource.connectedSourceCount || (runtimePdfAvailable ? lessonSource.pages.length : 0);
  const sourceStatus =
    connectedCount > 0
      ? "Página oficial conectada"
      : "Páginas pendientes de conexión";

  const handleSelectPage = (pageNumber: number) => {
    const newIndex = lessonSource.pages.findIndex((s) => s.pageNumber === pageNumber);
    directionRef.current = newIndex > currentIndex ? 1 : -1;
    setSelectedPage(pageNumber);
    onPageChange?.(pageNumber);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    handleSelectPage(lessonSource.pages[currentIndex - 1].pageNumber);
  };

  const handleNext = () => {
    if (currentIndex >= totalPages - 1) return;
    handleSelectPage(lessonSource.pages[currentIndex + 1].pageNumber);
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalPages - 1;

  if (!selectedSource) return null;

  // Page-turn animation variants using framer-motion
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "60%" : "-60%",
      opacity: 0,
      rotateY: dir > 0 ? 8 : -8,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-40%" : "40%",
      opacity: 0,
      rotateY: dir > 0 ? -6 : 6,
    }),
  };

  return (
    <section className="mt-5 space-y-4" aria-label="Cuaderno oficial de la lección">
      {/* ── Header card ───────────────────────────────────────────── */}
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
              Revisa la página del cuaderno y practica con las actividades.
            </p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-white px-3 py-2 text-xs font-bold text-foreground/65">
            <div className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {sourceStatus}
            </div>
          </div>
        </div>

        {/* ── Page chips ─────────────────────────────────────────── */}
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Páginas de esta lección"
        >
          {lessonSource.pages.map((source, idx) => {
            const active = source.pageNumber === selectedPage;
            return (
              <button
                key={source.pageNumber}
                type="button"
                id={`page-chip-${source.pageNumber}`}
                onClick={() => handleSelectPage(source.pageNumber)}
                className={
                  active
                    ? "min-h-11 min-w-11 rounded-xl bg-[var(--cartilla-accent)] px-3 py-2 text-sm font-bold text-white shadow-sm transition-all"
                    : "min-h-11 min-w-11 rounded-xl border border-foreground/12 bg-white px-3 py-2 text-sm font-bold text-[var(--cartilla-title-ink)] transition-all hover:bg-foreground/5"
                }
                style={active && accent ? { backgroundColor: accent } : undefined}
                aria-pressed={active}
                aria-label={`Página ${source.pageNumber}${active ? ", activa" : ""}${idx === 0 ? ", primera página" : ""}${idx === totalPages - 1 ? ", última página" : ""}`}
              >
                {source.pageNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Page viewer with turn animation ────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ perspective: "1200px" }}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Página ${selectedPage} de ${totalPages > 0 ? lessonSource.pages[totalPages - 1].pageNumber : selectedPage}`}
      >
        <AnimatePresence
          mode="wait"
          custom={directionRef.current}
          initial={false}
        >
          <motion.div
            key={selectedPage}
            custom={directionRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.32,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ transformOrigin: directionRef.current > 0 ? "left center" : "right center" }}
          >
            <OfficialWorkbookPage source={selectedSource} runtimePdfAvailable={runtimePdfAvailable} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Page-turn controls ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 px-1"
        role="navigation"
        aria-label="Controles de página"
      >
        <button
          type="button"
          id="workbook-prev-page"
          onClick={handlePrev}
          disabled={!hasPrev}
          aria-label="Página anterior"
          className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-sm font-bold text-foreground/70 shadow-sm transition-all hover:bg-foreground/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div
          className="flex flex-col items-center gap-0.5"
          aria-label={`Página ${currentIndex + 1} de ${totalPages}`}
        >
          <span className="text-xs font-bold text-foreground/50 tabular-nums">
            Página {selectedPage}
          </span>
          <span className="text-[10px] font-semibold text-foreground/35 tabular-nums">
            {currentIndex + 1} de {totalPages}
          </span>
        </div>

        <button
          type="button"
          id="workbook-next-page"
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="Página siguiente"
          className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-sm font-bold text-foreground/70 shadow-sm transition-all hover:bg-foreground/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Interactive layer slot ─────────────────────────────── */}
      {belowPage?.(selectedPage)}
    </section>
  );
}
