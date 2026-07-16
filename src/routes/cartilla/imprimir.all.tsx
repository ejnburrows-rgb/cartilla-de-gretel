import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { supabase } from "@/integrations/supabase/client";
import { hasTeacherOrAdminRole } from "@/lib/auth-role";
import { isSeedSessionActive } from "@/lib/seed-data";
import "@/styles/student-print.css";

export const Route = createFileRoute("/cartilla/imprimir/all")({
  component: ImprimirAllPage,
  head: () => ({
    meta: [{ title: "Cuaderno Completo Para Imprimir (24 Lecciones) — La Cartilla de Gretel" }],
  }),
  beforeLoad: async () => {
    // Teacher-only: Imprimir/PDF is a teacher tool, same gate as /cartilla/presentar/$n.
    if (isSeedSessionActive()) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const hasRole = await hasTeacherOrAdminRole(data.session.user.id);
    if (!hasRole) {
      throw redirect({ to: "/login" });
    }
  },
});

function ImprimirAllPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Screen action bar */}
      <div className="no-print px-4 py-4 max-w-3xl mx-auto flex items-center justify-between border-b border-stone-255 mb-6">
        <Link
          to="/cartilla/lecciones"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          aria-label="Volver al índice de lecciones"
        >
          <ArrowLeft className="w-4 h-4" /> Índice
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-850 text-white font-bold text-sm rounded-xl shadow transition"
          aria-label="Imprimir cuaderno completo"
        >
          <Printer className="w-4 h-4" /> Imprimir 24 Lecciones
        </button>
      </div>

      <main className="max-w-3xl mx-auto space-y-12">
        {CATALOG.map((entry) => (
          <LessonWorksheet key={entry.n} entry={entry} />
        ))}
      </main>
    </div>
  );
}

function LessonWorksheet({ entry }: { entry: CatalogEntry }) {
  const n = entry.n;
  const firstPage = parseInt(entry.pages.split("-")[0] ?? "1", 10) || 1;

  const syllables: string[] = useMemo(() => {
    return entry.kind === "consonant"
      ? entry.data.syllables
      : entry.kind === "vowel"
        ? [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)]
        : ["a", "e", "i", "o", "u"];
  }, [entry]);

  const words: string[] = useMemo(() => {
    return entry.kind === "consonant"
      ? Object.values(entry.data.examples).flat().slice(0, 6)
      : entry.kind === "vowel"
        ? entry.lesson.vocab.slice(0, 6).map((v) => v.word)
        : ["ala", "oso", "uva", "isla", "era"];
  }, [entry]);

  const dragWord: string = useMemo(() => {
    return entry.kind === "consonant"
      ? (Object.values(entry.data.examples).flat()[0] ?? "sol")
      : entry.kind === "vowel"
        ? (entry.lesson.vocab[0]?.word ?? "ola")
        : "ala";
  }, [entry]);

  const borderStyle = { borderColor: `${entry.color}40` };
  const titleStyle = { color: entry.color };
  const badgeStyle = { borderColor: `${entry.color}60`, color: entry.color };
  const dashedStyle = { borderColor: `${entry.color}50` };
  const shuffledStyle = {
    borderColor: entry.color,
    color: entry.color,
    backgroundColor: `${entry.color}12`,
  };

  return (
    <div className="worksheet-page border-b-2 border-dashed border-stone-200 pb-12 print:border-none print:pb-0">
      {/* Title Header */}
      <header className="pb-3 border-b-2 mb-6" style={{ borderColor: entry.color }}>
        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
          La Cartilla de Gretel · Lección {n} · Páginas {entry.pages}
        </div>
        <h2 className="text-2xl font-black" style={titleStyle}>
          {entry.title}
        </h2>
        <p className="text-xs text-stone-600 font-bold">{entry.subtitle}</p>
      </header>

      {/* PDF original page copy */}
      <div className="mb-6 flex justify-center">
        <PdfPage pageNumber={firstPage} className="w-full max-w-[500px]" />
      </div>

      {/* Worksheets */}
      <div className="border-2 rounded-3xl p-6 space-y-6" style={borderStyle}>
        {/* A. Rodea la sílaba */}
        <div>
          <h3 className="font-bold text-base mb-2" style={titleStyle}>
            A. Rodea la sílaba que escuches
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {syllables.map((s) => (
              <div
                key={s}
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold"
                style={badgeStyle}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* B. Une la palabra */}
        <div>
          <h3 className="font-bold text-base mb-2" style={titleStyle}>
            B. Une la palabra con su sílaba inicial
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {words.slice(0, 4).map((w) => (
              <div key={w} className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-700">{w}</span>
                <div className="h-px border-t-2 border-dashed flex-1" style={dashedStyle} />
                <div className="w-10 h-8 rounded-lg border-2" style={badgeStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* C. Arma la palabra */}
        <div>
          <h3 className="font-bold text-base mb-2" style={titleStyle}>
            C. Ordena las letras y forma la palabra
          </h3>
          <div className="flex flex-col gap-4">
            {[dragWord, ...(words[1] ? [words[1]] : [])].map((targetWord, idx) => {
              // Deterministic shuffle for printing consistency
              const shuffled = [...targetWord.split("")].sort(
                (a, b) => a.charCodeAt(0) - b.charCodeAt(0),
              );
              return (
                <div
                  key={`${targetWord}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex gap-1.5">
                    {shuffled.map((letter, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold"
                        style={shuffledStyle}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block text-stone-400 font-bold">→</div>
                  <div className="flex gap-1.5">
                    {targetWord.split("").map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-dashed"
                        style={dashedStyle}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sheet Footer */}
      <footer className="text-center text-[10px] text-stone-400 font-bold pt-4">
        La Cartilla de Gretel · Leonor Lopetegui
      </footer>
    </div>
  );
}
