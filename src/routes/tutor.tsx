/**
 * /tutor — the tutor's home (spec §2, §9): lesson picker for Lecciones 1–3
 * plus the teacher-side offline pack control ("Preparar sin internet").
 *
 * This is also the layout route for /tutor/$n: while a session screen is
 * active only the child session renders; visiting /tutor directly shows the
 * picker. Gretel appears ONLY on tutor routes — nothing here is reachable
 * from the Workbook or Flip Chart.
 */
import { useState } from "react";
import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { TutorOfflinePack } from "@/components/tutor/TutorOfflinePack";
import { clearAllTutorMemory } from "@/lib/tutor-memory";
import { clearTutorProgress } from "@/lib/tutor-progress";
import { CATALOG } from "@/lib/lesson-catalog";
import { TUTOR_LESSONS } from "@/lib/tutor-content";

export const Route = createFileRoute("/tutor")({
  component: TutorLayout,
  head: () => ({
    meta: [
      { title: "Tutor de Gretel — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Tutor de voz de Gretel para las Lecciones 1–3 de La Cartilla de Gretel.",
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
  const [classCode, setClassCode] = useState("clase");
  const [slot, setSlot] = useState(1);
  const [memoryCleared, setMemoryCleared] = useState(false);

  const lessonEntries = TUTOR_LESSONS.map((n) => ({
    n,
    entry: CATALOG.find((candidate) => candidate.n === n),
  }));

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" /> Inicio
        </Link>

        <header className="mt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-4xl font-black">Tutor de Gretel</h1>
          <p className="mt-2 text-foreground/70">
            Lecciones 1–3 · la voz de Gretel, en este aparato
          </p>
        </header>

        <p
          className="mt-6 rounded-xl border border-amber-700/20 bg-amber-50 p-4 text-sm text-stone-800"
          role="note"
        >
          Vista previa: las grabaciones de algunas instrucciones y reacciones siguen pendientes de
          verificación. La práctica de voz usa reconocimiento local; no ofrece una puntuación de
          pronunciación.
        </p>

        {/* Class code + seat slot — anonymous progress ids (spec §10).
            No names, no storage: they travel in the link to the session. */}
        <section className="kid-card mt-8 p-6" aria-label="Identificación de la sesión">
          <h2 className="text-lg font-black">Sesión</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Código de la clase y puesto. No se guardan nombres.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-foreground/80">
              Código de la clase
              <input
                type="text"
                value={classCode}
                onChange={(event) => setClassCode(event.target.value.trim() || "clase")}
                className="mt-1 w-full rounded-xl border-2 border-foreground/15 bg-white px-4 py-3 text-base font-bold text-foreground"
                maxLength={40}
              />
            </label>
            <label className="block text-sm font-bold text-foreground/80">
              Puesto
              <select
                value={slot}
                onChange={(event) => setSlot(Number(event.target.value))}
                className="mt-1 w-full rounded-xl border-2 border-foreground/15 bg-white px-4 py-3 text-base font-bold text-foreground"
              >
                {Array.from({ length: 40 }, (_, index) => index + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section aria-label="Lecciones del tutor" className="mt-8 grid gap-4 sm:grid-cols-3">
          {lessonEntries.map(({ n, entry }) => (
            <Link
              key={n}
              to="/tutor/$n"
              params={{ n: String(n) }}
              search={{ code: classCode, slot }}
              className="kid-card group flex flex-col gap-2 p-6 text-center transition-transform hover:-translate-y-1"
            >
              <span className="text-3xl font-black text-foreground/40">Lección {n}</span>
              <strong className="text-xl font-black text-foreground">{entry?.title}</strong>
              <span className="text-sm font-medium text-foreground/60">
                {entry?.subtitle ?? " "}
              </span>
            </Link>
          ))}
        </section>

        <div className="mt-8">
          <TutorOfflinePack />
        </div>

        <section className="mt-8 text-center text-sm">
          <p>
            El progreso se guarda únicamente en este navegador, mientras se conserven sus datos.
          </p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl border px-4 font-bold"
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
          </button>
          <p role="status">
            {memoryCleared ? "Memoria borrada. El material sin internet se conserva." : ""}
          </p>
        </section>
        <footer className="mt-8 pb-8 text-center">
          <Link
            to="/privacy/tutor"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Privacidad del tutor
          </Link>
        </footer>
      </div>
    </main>
  );
}
