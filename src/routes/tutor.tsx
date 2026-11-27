/**
 * /tutor — the tutor's home (spec §2, §9, Milestone 6): lesson picker for
 * all 24 curriculum lessons (Lecciones 1–24) plus the teacher-side offline
 * pack control ("Preparar sin internet").
 *
 * This is also the layout route for /tutor/$n: while a session screen is
 * active only the child session renders; visiting /tutor directly shows the
 * picker. Gretel appears ONLY on tutor routes — nothing here is reachable
 * from the Workbook or Flip Chart.
 */
import { useState } from "react";
import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { TutorOfflinePack } from "@/components/tutor/TutorOfflinePack";
import { clearAllTutorMemory } from "@/lib/tutor-memory";
import { clearTutorProgress } from "@/lib/tutor-progress";
import { CATALOG } from "@/lib/lesson-catalog";
import { ALL_CURRICULUM_LESSONS, lessonGraphFor } from "@/lib/tutor-content";

export const Route = createFileRoute("/tutor")({
  validateSearch: (search: Record<string, unknown>): { demo?: boolean } => ({
    demo: import.meta.env.VITE_CRM_REVIEW === "true" && search.demo === true ? true : undefined,
  }),
  component: TutorLayout,
  head: () => ({
    meta: [
      { title: "Tutor de Gretel — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Tutor interactivo de Gretel para las Lecciones 1–24 de La Cartilla de Gretel.",
      },
    ],
  }),
});

/** Session route id inside this layout (routeTree.gen). */
const SESSION_ROUTE_ID = "/tutor/$n";

function TutorLayout() {
  const matches = useMatches();
  const inSession = matches.some((match) => match.routeId === SESSION_ROUTE_ID);

  if (inSession) {
    // A session screen is active: it owns the whole screen.
    return <Outlet />;
  }
  return <TutorPicker />;
}

function TutorPicker() {
  const { demo } = Route.useSearch();
  const [classCode, setClassCode] = useState("clase");
  const [slot, setSlot] = useState(1);
  const [memoryCleared, setMemoryCleared] = useState(false);

  const lessonEntries = ALL_CURRICULUM_LESSONS.map((n) => ({
    n,
    entry: CATALOG.find((candidate) => candidate.n === n),
    graph: lessonGraphFor(n),
  }));

  const vowelLessons = lessonEntries.filter((item) => item.n <= 6);
  const consonantLessons = lessonEntries.filter((item) => item.n >= 7);

  const renderLessonCard = ({
    n,
    entry,
    graph,
  }: (typeof lessonEntries)[number]) => {
    const approvedCount = graph?.summary.itemsWithApprovedAudio ?? 0;
    const totalCount = graph?.summary.totalItems ?? 0;
    const hasAudio = approvedCount > 0;

    return (
      <Link
        key={n}
        to="/tutor/$n"
        params={{ n: String(n) }}
        search={{ code: classCode, slot, demo }}
        data-tutor-lesson-card={n}
        className="group flex flex-col justify-between gap-2 rounded-2xl border border-[#5c3d28]/15 bg-[#fffaf0] p-5 text-left shadow-[0_2px_8px_rgba(42,33,27,0.06)] transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[#1e4b82]/40 hover:shadow-[0_8px_20px_rgba(42,33,27,0.1)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#1e4b82]"
      >
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#635145]">
            Lección {n}
          </span>
          <strong className="mt-1 block text-lg font-black text-[#2a211b]">
            {entry?.title ?? graph?.title ?? `Lección ${n}`}
          </strong>
          <span className="mt-0.5 block text-sm text-[#635145]">
            {entry?.subtitle ?? graph?.focus ?? ""}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#5c3d28]/10 pt-2 text-xs font-bold">
          <span className={hasAudio ? "inline-flex items-center gap-1 text-[#0f766e]" : "inline-flex items-center gap-1 text-[#635145]"}>
            {hasAudio ? (
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {hasAudio ? `${approvedCount}/${totalCount} con audio` : "Audio pendiente"}
          </span>
          {graph?.flipchartPages.length ? (
            <span className="text-[#1e4b82]">
              {graph.flipchartPages.length} láminas
            </span>
          ) : null}
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6efe2] px-4 py-8 text-[#2a211b]">
      <div className="mx-auto max-w-5xl">
        <Link
          to={demo ? "/cartilla/lecciones" : "/"}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#635145] hover:bg-[#efe5d3] hover:text-[#2a211b]"
          aria-label={demo ? "Volver al modo demo" : "Volver al inicio"}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {demo ? "Modo Demo" : "Inicio"}
        </Link>

        <header className="mt-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e4b82] text-[#fffaf0] shadow-[0_6px_16px_rgba(30,75,130,0.22)]">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#2a211b]">
            Tutor de Gretel
          </h1>
          <p className="mt-2 text-base text-[#635145]">
            Lecciones 1–24 · videollamada educativa, rotafolio y práctica guiada en este dispositivo
          </p>
        </header>

        <p
          className="mt-6 rounded-2xl border border-[#b88228]/25 bg-[#fffaf0] p-4 text-sm text-[#2a211b]"
          role="note"
        >
          Vista previa: las grabaciones aprobadas de voz se reproducen directamente en el
          dispositivo; las líneas sin grabación aprobada se muestran con texto visible sin voz
          sintética. La práctica de voz usa reconocimiento local y no emite calificaciones de
          pronunciación.
        </p>

        {/* Class code + seat slot — anonymous progress ids (spec §10).
            No names, no storage: they travel in the link to the session. */}
        {!demo && <section
          className="mt-6 rounded-2xl border border-[#5c3d28]/15 bg-[#fffaf0] p-6 shadow-[0_2px_10px_rgba(42,33,27,0.06)]"
          aria-label="Identificación de la sesión"
        >
          <h2 className="text-lg font-black text-[#2a211b]">Sesión</h2>
          <p className="mt-1 text-sm text-[#635145]">
            Código de la clase y puesto. No se guardan nombres.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#2a211b]">
              Código de la clase
              <input
                type="text"
                value={classCode}
                onChange={(event) => setClassCode(event.target.value.trim() || "clase")}
                className="mt-1 w-full rounded-xl border border-[#5c3d28]/25 bg-white px-4 py-3 text-base font-bold text-[#2a211b]"
                maxLength={40}
              />
            </label>
            <label className="block text-sm font-bold text-[#2a211b]">
              Puesto
              <select
                value={slot}
                onChange={(event) => setSlot(Number(event.target.value))}
                className="mt-1 w-full rounded-xl border border-[#5c3d28]/25 bg-white px-4 py-3 text-base font-bold text-[#2a211b]"
              >
                {Array.from({ length: 40 }, (_, index) => index + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>}

        <section aria-label="Lecciones del tutor" className="mt-8 space-y-8">
          <div>
            <h2 className="mb-3 text-lg font-black text-[#2a211b]">
              Introducción y vocales (Lecciones 1–6)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vowelLessons.map(renderLessonCard)}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-black text-[#2a211b]">
              Consonantes (Lecciones 7–24)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {consonantLessons.map(renderLessonCard)}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <TutorOfflinePack />
        </div>

        <section className="mt-8 text-center text-sm text-[#635145]">
          <p>
            El progreso se guarda únicamente en este navegador, mientras se conserven sus datos.
          </p>
          {!demo && <button
            type="button"
            className="mt-3 min-h-11 rounded-xl border border-[#5c3d28]/25 bg-[#fffaf0] px-4 font-bold text-[#2a211b] hover:bg-[#efe5d3]"
            onClick={() => {
              if (
                !window.confirm(
                  "¿Borrar el progreso y la memoria del tutor de este navegador? El material sin internet se conserva.",
                )
              )
                return;
              try {
                clearAllTutorMemory();
                clearTutorProgress();
                setMemoryCleared(true);
              } catch {
                setMemoryCleared(false);
              }
            }}
          >
            Borrar progreso y memoria
          </button>}
          <p role="status" className="mt-2 font-bold text-[#0f766e]">
            {memoryCleared ? "Memoria borrada. El material sin internet se conserva." : ""}
          </p>
        </section>

        <footer className="mt-8 pb-8 text-center">
          <Link
            to="/privacy/tutor"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#635145] hover:bg-[#efe5d3] hover:text-[#2a211b]"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Privacidad del tutor
          </Link>
        </footer>
      </div>
    </main>
  );
}
