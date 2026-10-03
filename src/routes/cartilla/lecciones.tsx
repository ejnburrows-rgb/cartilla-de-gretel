import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import type { CSSProperties } from "react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { readLearnerResume } from "@/lib/learner-resume";
import { playUiTick } from "@/lib/piano-audio";

export const Route = createFileRoute("/cartilla/lecciones")({
  component: Lecciones,
  head: () => ({ meta: [{ title: "Mis lecciones — La Cartilla de Gretel" }] }),
});

function lessonLetter(entry: CatalogEntry): string {
  if (entry.kind === "consonant") return entry.letter.toUpperCase();
  if (entry.kind === "vowel") return entry.vowel.toUpperCase();
  return "AEIOU";
}

function lessonSyllables(entry: CatalogEntry): string {
  if (entry.kind === "consonant") return entry.data.syllables.join(" · ");
  if (entry.kind === "vowel") return `${entry.vowel.toUpperCase()} ${entry.vowel}`;
  return "a · e · i · o · u";
}

function lessonPicture(entry: CatalogEntry): string | undefined {
  if (entry.kind === "consonant") return entry.data.vocab.find((v) => v.illustrationSrc)?.illustrationSrc;
  if (entry.kind === "vowel") return entry.lesson.vocab.find((v) => v.illustrationSrc)?.illustrationSrc;
  return "/cartilla/images/cover.png";
}

function Lecciones() {
  const { isCompleted, completed } = useLessonProgress();
  const resume = readLearnerResume();
  const doneCount = [...completed].filter((n) => n >= 1 && n <= TOTAL_LESSONS).length;
  const currentLesson = CATALOG.find((entry) => !isCompleted(entry.n))?.n ?? TOTAL_LESSONS;

  return (
    <main className="lc-lessons">
      <header className="lc-lessons__header">
        <Link to="/cartilla" className="lc-lessons__back"><ArrowLeft size={20} /> Cartilla</Link>
        <div className="lc-lessons__identity">
          <img src={GRETEL_APPROVED_MASTER_SRC} alt="Gretel" draggable={false} />
          <div>
            <h1>Mis lecciones</h1>
            <p className="lc-progress-pill">Llevas {doneCount} de {TOTAL_LESSONS}</p>
          </div>
        </div>
      </header>

      {resume && <Link to="/cartilla/leccion/$n" params={{ n: String(resume.lesson) }} className="inline-flex items-center rounded-xl bg-white px-5 py-3 mb-5 font-bold border border-stone-200">Continuar lección {resume.lesson}</Link>}
      <p className="mb-4 text-sm text-stone-600">Tu escritura y tus dibujos se conservan en este navegador. Vuelve desde el mismo dispositivo y navegador.</p>
      <section className="lc-lesson-grid" aria-label="24 lecciones">
        {CATALOG.map((entry) => {
          const done = isCompleted(entry.n);
          const current = !done && entry.n === currentLesson;
          const picture = lessonPicture(entry);
          return (
            <Link
              key={entry.n}
              to="/cartilla/leccion/$n"
              params={{ n: String(entry.n) }}
              onClick={() => playUiTick()}
              className={`lc-lesson-tile${current ? " is-current" : ""}${done ? " is-done" : ""}`}
              style={{ "--lesson-color": entry.color } as CSSProperties}
              aria-label={`Lección ${entry.n}: ${entry.title}`}
            >
              <span className="lc-lesson-tile__number">{entry.n}</span>
              {picture ? <img src={picture} alt="" aria-hidden draggable={false} /> : null}
              <strong className="lc-lesson-tile__letter">{lessonLetter(entry)}</strong>
              <span className="lc-lesson-tile__syllables">{lessonSyllables(entry)}</span>
              {done ? <span className="lc-lesson-tile__done" aria-label="Completada"><Check size={20} /></span> : null}
            </Link>
          );
        })}
      </section>
    </main>
  );
}
