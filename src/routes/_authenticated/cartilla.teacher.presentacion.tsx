import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Eye, FileText, LibraryBig, Layers, Maximize } from "lucide-react";
import { TeacherPresentationShell } from "@/components/cartilla/TeacherPresentationShell";
import { CATALOG } from "@/lib/lesson-catalog";
import { getBookFaithfulLesson, getSightWordsForLesson, getWorkbookTranscriptionSummary, lessonHasEmptyPalabras, lessonHasMiniStory } from "@/lib/book-faithful";
import { getBookSectionForLesson, getLessonPageNumbers } from "@/lib/cartilla-crm-theme";
import { getWorkbookPageSourcesForLesson } from "@/lib/workbook-source";
import { getInteractionReadinessForLesson } from "@/lib/workbook-interactions";
import { routePath } from "@/lib/assets";
import { useState } from "react";
import { TeacherResourcePanel } from "@/components/teacher/TeacherResourcePanel";
import { Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cartilla/teacher/presentacion")({
  component: TeacherPresentation,
  head: () => ({ meta: [{ title: "Presentación docente — La Cartilla de Gretel" }] }),
});

function sectionLabel(section: string) {
  if (section === "intro") return "Introducción";
  if (section === "vowels") return "Vocales";
  return "Consonantes";
}

function lessonCardStyle(color: string) {
  return { borderTop: `6px solid ${color}` };
}

function TeacherPresentation() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  return (
    <TeacherPresentationShell title="Presentación docente" subtitle="Presentación docente basada en la estructura verificada del libro.">
      {selectedResource && (
        <TeacherResourcePanel resourceId={selectedResource} onClose={() => setSelectedResource(null)} />
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/cartilla/teacher" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-white hover:bg-white/18">
            <ArrowLeft className="h-4 w-4" /> Panel CRM
          </Link>
          <Link to="/cartilla/presentar/$n" params={{ n: "1" }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--cartilla-accent)] bg-[var(--cartilla-accent)] px-4 py-2 text-sm font-bold text-white hover:opacity-90 shadow-lg shadow-[var(--cartilla-accent)]/20">
            <Maximize className="h-4 w-4" /> Proyectar Cartilla
          </Link>
          <Link to="/cartilla/teacher/remaster-review" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-indigo-500 bg-indigo-600/30 px-4 py-2 text-sm font-bold text-indigo-200 hover:bg-indigo-600/50 transition-colors">
            <Layers className="h-4 w-4 text-indigo-400" /> Revisar Remasterizaciones
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-white/80">
          <LibraryBig className="h-4 w-4" /> 24 lecciones
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CATALOG.map((entry) => {
          const faithful = getBookFaithfulLesson(entry.n);
          const section = getBookSectionForLesson(entry.n);
          const sightWords = getSightWordsForLesson(entry.n);
          const hasMiniStory = lessonHasMiniStory(entry.n);
          const hasEmptyPalabras = lessonHasEmptyPalabras(entry.n);
          const transcription = getWorkbookTranscriptionSummary(entry.n);
          const source = getWorkbookPageSourcesForLesson(entry.n, entry.pages);
          const pageNumbers = getLessonPageNumbers(entry.pages);
          const needsSourceMapping = source.connectedSourceCount === 0;
          const interactions = getInteractionReadinessForLesson(entry.n, pageNumbers);
          const transcriptionLabel = transcription.status === "verified" ? "Transcripción verificada" : transcription.status === "partial" ? "Transcripción parcial" : "Transcripción pendiente";

          return (
            <article key={entry.n} className="rounded-2xl border border-white/16 bg-white/92 p-4 text-[var(--cartilla-title-ink)] shadow-xl" style={lessonCardStyle(entry.color)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-foreground/55">Lección {entry.n}</div>
                  <h2 className="mt-1 text-xl font-bold leading-tight">{faithful?.title ?? entry.title}</h2>
                </div>
                <span className="rounded-full bg-[var(--cartilla-accent)] px-3 py-1 text-xs font-bold text-white">{sectionLabel(section)}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground/68">{entry.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/8 px-3 py-1 text-foreground/70"><FileText className="h-3.5 w-3.5" /> Páginas {entry.pages}</span>
                {sightWords.length > 0 && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-900">Vista: {sightWords.join(", ")}</span>}
                {hasMiniStory && <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">Mini-cuento</span>}
                {hasEmptyPalabras && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Palabras pendientes</span>}
                <span className={transcription.status === "verified" ? "rounded-full bg-emerald-100 px-3 py-1 text-emerald-900" : transcription.status === "partial" ? "rounded-full bg-yellow-100 px-3 py-1 text-yellow-900" : "rounded-full bg-stone-100 px-3 py-1 text-stone-700"}>
                  {transcriptionLabel}: {transcription.verified}/{transcription.total} páginas
                </span>
                <span className={needsSourceMapping ? "rounded-full bg-rose-100 px-3 py-1 text-rose-900" : "rounded-full bg-emerald-100 px-3 py-1 text-emerald-900"}>
                  {needsSourceMapping ? "Necesita mapeo" : "Fuente conectada"}: {source.connectedSourceCount}/{source.pages.length}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">Imagen/fuente: {source.verifiedImageCount}/{source.pages.length}</span>
                {interactions.readyCount > 0 ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-900"><Layers className="h-3 w-3" /> Actividad lista ({interactions.readyCount})</span> : <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">Actividad generada/pendiente</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={routePath(`/cartilla/leccion/${entry.n}`)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--cartilla-accent)] px-3 py-2 text-sm font-bold text-white hover:opacity-90">
                  <Eye className="h-4 w-4" /> Abrir lección
                </a>
                <Link to="/cartilla/lecciones" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-foreground/12 px-3 py-2 text-sm font-bold text-foreground/70 hover:bg-foreground/5">
                  <BookOpen className="h-4 w-4" /> Índice
                </Link>
                <button 
                  onClick={() => setSelectedResource(`lesson-${entry.n}`)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-foreground/12 px-3 py-2 text-sm font-bold text-foreground/70 hover:bg-foreground/5"
                >
                  <Info className="h-4 w-4" /> Más info
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 mb-5">
        <h2 className="text-2xl font-bold text-stone-800">Juegos Interactivos</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-white/16 bg-white/92 p-4 text-[var(--cartilla-title-ink)] shadow-xl" style={lessonCardStyle("#f97316")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-foreground/55">Juego</div>
              <h2 className="mt-1 text-xl font-bold leading-tight">Payaso Chano</h2>
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground/68">Forma palabras con sílabas s, m, p</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/cartilla/juego/payaso-chano-ss" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--cartilla-accent)] px-3 py-2 text-sm font-bold text-white hover:opacity-90">
              <Eye className="h-4 w-4" /> Abrir juego
            </a>
            <button 
              onClick={() => setSelectedResource("game-payaso-chano")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-foreground/12 px-3 py-2 text-sm font-bold text-foreground/70 hover:bg-foreground/5"
            >
              <Info className="h-4 w-4" /> Más info
            </button>
          </div>
        </article>
      </div>
    </TeacherPresentationShell>
  );
}
