/**
 * imprimir.$n.tsx  — Lane A  (NEW)
 *
 * Print-only route: PDF page + printable worksheet of the three exercises.
 * CSS @page + @media print hide all chrome on print.
 * Route: /cartilla/imprimir/:n
 */
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import interactionsData from "@/data/workbook-interactions.json";
import "@/styles/cartilla-student.css";

export const Route = createFileRoute("/cartilla/imprimir/$n")({
  component: ImprimirPage,
  head: ({ params }) => ({
    meta: [{ title: `Imprimir Lección ${params.n} — La Cartilla de Gretel` }],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function ImprimirPage() {
  const { n: nParam } = Route.useParams();
  const n = Number(nParam);
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);

  if (!entry) return null;

  const firstPage = parseInt(entry.pages.split("-")[0] ?? "1", 10) || 1;

  const syllables: string[] =
    entry.kind === "consonant"
      ? entry.data.syllables
      : entry.kind === "vowel"
        ? [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)]
        : ["a", "e", "i", "o", "u"];

  const words: string[] =
    entry.kind === "consonant"
      ? Object.values(entry.data.examples).flat().slice(0, 6)
      : entry.kind === "vowel"
        ? entry.lesson.vocab.slice(0, 6).map((v) => v.word)
        : ["ala", "oso", "uva", "isla", "era"];

  const dragWord: string =
    entry.kind === "consonant"
      ? Object.values(entry.data.examples).flat()[0] ?? "sol"
      : entry.kind === "vowel"
        ? entry.lesson.vocab[0]?.word ?? "ola"
        : "ala";

  const isPendingLesson = entry.kind === "consonant" && 
    (entry.data.syllables.length === 0 || Object.values(entry.data.examples).every(arr => arr.length === 0 || arr[0].includes("PENDIENTE")));

  const isScaffold = isPendingLesson || (interactionsData.interactions as any[]).some(
    (i) => (i.lessonNumber === n || i.lessonId === String(n)) && i.sourceStatus === "scaffold"
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Screen chrome — hidden on print ── */}
      <div className="no-print px-4 py-4 max-w-3xl mx-auto flex items-center justify-between">
        <Link
          to="/cartilla/student/leccion/$n"
          params={{ n: String(n) }}
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          aria-label={`Volver a la lección ${n}`}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Lección {n}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm"
          style={{ backgroundColor: entry.color }}
          aria-label={`Imprimir hoja de trabajo de la lección ${n}`}
        >
          <Printer className="w-4 h-4" aria-hidden /> Imprimir
        </button>
      </div>

      {/* ── Printable content ── */}
      <main className="px-4 pb-12 max-w-3xl mx-auto space-y-6">
        {/* Title header */}
        <header
          className="print-only"
          style={{ borderBottom: `3px solid ${entry.color}`, paddingBottom: "0.5rem" }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: entry.color, textTransform: "uppercase" }}>
            La Cartilla de Gretel · Lección {n} · Páginas {entry.pages}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: entry.color, margin: 0 }}>
            {entry.title}
          </h1>
          <p style={{ fontSize: "0.85rem", margin: 0, color: "#555" }}>{entry.subtitle}</p>
        </header>

        {/* Screen title */}
        <div className="no-print">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            Lección {n} · páginas {entry.pages}
          </div>
          <h1 className="text-3xl font-bold mt-1" style={{ color: entry.color }}>
            {entry.title}
          </h1>
        </div>

        {/* PDF page */}
        <PdfPage pageNumber={firstPage} />

        {/* ── Worksheet ── */}
        <section
          className={`border-2 rounded-2xl p-6 ${isScaffold ? "flex items-center justify-center min-h-[200px] border-dashed bg-slate-50" : "space-y-8"}`}
          style={isScaffold ? { borderColor: "#cbd5e1" } : { borderColor: `${entry.color}40` }}
          aria-label="Hoja de trabajo para imprimir"
        >
          {isScaffold ? (
            <div className="font-bold text-slate-500 text-center text-lg">
              [ Ejercicio pendiente de verificación — Lección {n} ]
            </div>
          ) : (
            <>
          {/* 1 — Ejercicio A: rodea la sílaba */}
          <div>
            <h2 className="font-bold text-lg mb-3" style={{ color: entry.color }}>
              A. Rodea la sílaba que escuches
            </h2>
            <p className="text-sm text-foreground/60 mb-3 no-print">
              (Usa este ejercicio en clase: el maestro dice una sílaba, el alumno la rodea.)
            </p>
            <div className="flex flex-wrap gap-3">
              {syllables.map((s) => (
                <div
                  key={s}
                  className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold"
                  style={{ borderColor: `${entry.color}60`, color: entry.color }}
                  aria-label={`Sílaba ${s}`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* 2 — Ejercicio B: une la palabra */}
          <div>
            <h2 className="font-bold text-lg mb-3" style={{ color: entry.color }}>
              B. Une la palabra con su sílaba inicial
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {words.slice(0, 4).map((w) => (
                <div
                  key={w}
                  className="flex items-center gap-3"
                  aria-label={`Palabra: ${w}`}
                >
                  <span className="font-bold text-lg flex-1">{w}</span>
                  <div
                    className="h-px border-t-2 border-dashed flex-1"
                    style={{ borderColor: `${entry.color}50` }}
                    aria-hidden
                  />
                  <div
                    className="w-12 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold"
                    style={{ borderColor: `${entry.color}60`, color: entry.color }}
                    aria-label="Espacio para respuesta"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-foreground/50 no-print">
              Sílabas para unir: {syllables.join(", ")}
            </div>
          </div>

          {/* 3 — Ejercicio C: arma la palabra */}
          <div>
            <h2 className="font-bold text-lg mb-3" style={{ color: entry.color }}>
              C. Ordena las letras y forma la palabra
            </h2>
            <div className="flex flex-col gap-6">
              {[dragWord, ...(words[1] ? [words[1]] : [])].map((targetWord) => {
                const shuffled = [...targetWord.split("")].sort(() => Math.random() - 0.5);
                return (
                  <div key={targetWord}>
                    <div className="flex gap-2 mb-3">
                      {shuffled.map((letter, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold"
                          style={{ borderColor: entry.color, color: entry.color, backgroundColor: `${entry.color}12` }}
                          aria-label={`Letra desordenada: ${letter}`}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {targetWord.split("").map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-xl border-2 border-dashed"
                          style={{ borderColor: `${entry.color}50` }}
                          aria-label={`Casilla ${i + 1} para escribir`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer
          className="text-center text-xs text-foreground/40 pt-2"
          aria-label="Pie de página"
        >
          La Cartilla de Gretel · Leonor Lopetegui · LANY BOOKS LLC · ISBN 0-971-8696-8-5
        </footer>
      </main>
    </div>
  );
}
