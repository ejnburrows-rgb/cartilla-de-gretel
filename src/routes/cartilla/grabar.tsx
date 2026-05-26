import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { RecordLine } from "@/components/recording/RecordLine";
import { CloneJobList } from "@/components/recording/CloneJobList";
import { normalizeLineId } from "@/lib/audio-clone-jobs";

export const Route = createFileRoute("/cartilla/grabar")({
  component: GrabarVoz,
  head: () => ({ meta: [{ title: "Grabar voz - La Cartilla de Gretel" }] }),
});

type RecordingLine = {
  lessonId: string;
  lineId: string;
  text: string;
};

function linesForLesson(entry: (typeof CATALOG)[number]): RecordingLine[] {
  const lessonId = String(entry.n);
  if (entry.kind === "intro") {
    return ["a", "e", "i", "o", "u"].map((text) => ({ lessonId, lineId: `${lessonId}-${normalizeLineId(text)}`, text }));
  }
  if (entry.kind === "vowel") {
    return entry.lesson.vocab.map((item) => ({ lessonId, lineId: `${lessonId}-${normalizeLineId(item.word)}`, text: item.word }));
  }
  const syllables = entry.data.syllables.map((text) => ({ lessonId, lineId: `${lessonId}-${normalizeLineId(text)}`, text }));
  const examples = Object.values(entry.data.examples)
    .flat()
    .filter(Boolean)
    .slice(0, 12)
    .map((text) => ({ lessonId, lineId: `${lessonId}-${normalizeLineId(text)}`, text }));
  const sentences = entry.data.sentences.slice(0, 6).map((text) => ({ lessonId, lineId: `${lessonId}-${normalizeLineId(text)}`, text }));
  return [...syllables, ...examples, ...sentences];
}

function GrabarVoz() {
  const lines = CATALOG.flatMap(linesForLesson);

  return (
    <main className="min-h-screen bg-[#fff8de] px-4 py-6 text-[#3A281E]">
      <div className="mx-auto max-w-5xl pb-16">
        <Link to="/cartilla/lecciones" className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-black shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Lecciones
        </Link>
        <header className="mt-6 rounded-3xl border border-amber-900/15 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-amber-800">Grabar voz</p>
          <h1 className="mt-1 text-3xl font-black">Voz de lector para la cartilla</h1>
          <p className="mt-2 text-sm font-bold text-[#3A281E]/65">Las grabaciones se guardan localmente y entran en una cola local. No hay backend de clonacion conectado todavia.</p>
        </header>

        <section className="mt-6 grid gap-4">
          {lines.map((line) => (
            <RecordLine key={line.lineId} lessonId={line.lessonId} lineId={line.lineId} text={line.text} />
          ))}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xl font-black">Trabajos de clonacion</h2>
          <CloneJobList />
        </section>
      </div>
    </main>
  );
}
