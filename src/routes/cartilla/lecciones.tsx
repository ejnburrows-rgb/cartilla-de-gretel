import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { readLearnerResume } from "@/lib/learner-resume";
import { playUiTick } from "@/lib/piano-audio";
import { requestLessonFullscreen } from "@/lib/lesson-fullscreen";
import { audioEngine } from "@/lib/audio-engine";

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
  if (entry.kind === "consonant") {
    return (
      entry.data.vocab.find((v) => v.illustrationSrc && !v.illustrationSrc.endsWith(".svg"))?.illustrationSrc ??
      entry.data.vocab.find((v) => v.illustrationSrc)?.illustrationSrc
    );
  }
  if (entry.kind === "vowel") {
    return (
      entry.lesson.vocab.find((v) => v.illustrationSrc && !v.illustrationSrc.endsWith(".svg"))?.illustrationSrc ??
      entry.lesson.vocab.find((v) => v.illustrationSrc)?.illustrationSrc
    );
  }
  return "/cartilla/images/cover.png";
}

type LessonFilter = "all" | "vowels" | "consonants";

function Lecciones() {
  const { isCompleted, completed } = useLessonProgress();
  const [filter, setFilter] = useState<LessonFilter>("all");
  const resume = readLearnerResume();
  const doneCount = [...completed].filter((n) => n >= 1 && n <= TOTAL_LESSONS).length;
  const currentLesson = CATALOG.find((entry) => !isCompleted(entry.n))?.n ?? TOTAL_LESSONS;
  const progressPercent = Math.round((doneCount / TOTAL_LESSONS) * 100);

  const handleTileClick = () => {
    playUiTick();
    audioEngine.playPageTurn(true);
    requestLessonFullscreen();
  };

  const filteredCatalog = CATALOG.filter((entry) => {
    if (filter === "vowels") return entry.kind === "intro" || entry.kind === "vowel";
    if (filter === "consonants") return entry.kind === "consonant";
    return true;
  });

  return (
    <main className="lc-lessons">
      <header className="lc-lessons__header">
        <Link to="/cartilla" className="lc-lessons__back">
          <ArrowLeft size={20} /> Cartilla
        </Link>
        <section className="lc-lessons__companion-card" aria-label="Progreso y lecciones">
          <div className="lc-lessons__companion-content">
            <div className="lc-lessons__bubble">
              <span className="lc-lessons__bubble-tag">Gretel dice:</span>
              <p className="lc-lessons__bubble-text">
                ¡Hola! Elige cualquier lección para abrir tu cuaderno de trabajo.
              </p>
            </div>
            <h1 className="lc-lessons__title">Mis lecciones</h1>
            <div className="lc-lessons__progress-row">
              <div className="lc-lessons__progress-bar-wrap" aria-hidden="true">
                <div
                  className="lc-lessons__progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="lc-progress-pill">
                Llevas {doneCount} de {TOTAL_LESSONS}
              </span>
            </div>
            {resume && (
              <Link
                to="/cartilla/leccion/$n"
                params={{ n: String(resume.lesson) }}
                onClick={handleTileClick}
                className="lc-lessons__continue-btn"
              >
                <Play size={18} fill="currentColor" /> Continuar lección {resume.lesson}
              </Link>
            )}
          </div>
          <div className="lc-lessons__companion-figure">
            <div className="lc-lessons__gretel-grounded">
              <img
                src={GRETEL_APPROVED_MASTER_SRC}
                alt="Gretel"
                draggable={false}
                className="lc-lessons__gretel-img"
              />
              <div className="lc-lessons__gretel-shadow" />
            </div>
          </div>
        </section>
      </header>

      <div className="mx-auto mb-5 flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
        <p className="lc-lessons__persistence-note m-0">
          Tu escritura y tus dibujos se conservan en este navegador. Todas las 24 lecciones están abiertas.
        </p>
        <div className="inline-flex rounded-xl border border-stone-300 bg-white p-1 shadow-2xs" role="group" aria-label="Filtrar lecciones">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              filter === "all" ? "bg-amber-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Todas (1–24)
          </button>
          <button
            type="button"
            onClick={() => setFilter("vowels")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              filter === "vowels" ? "bg-amber-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Vocales (1–6)
          </button>
          <button
            type="button"
            onClick={() => setFilter("consonants")}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              filter === "consonants" ? "bg-amber-900 text-white" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            Consonantes (7–24)
          </button>
        </div>
      </div>

      <section className="lc-lesson-grid" aria-label="24 lecciones">
        {filteredCatalog.map((entry) => {
          const done = isCompleted(entry.n);
          const current = !done && entry.n === currentLesson;
          const picture = lessonPicture(entry);
          return (
            <Link
              key={entry.n}
              to="/cartilla/leccion/$n"
              params={{ n: String(entry.n) }}
              onClick={handleTileClick}
              className={`lc-lesson-tile${current ? " is-current" : ""}${done ? " is-done" : ""}`}
              style={{ "--lesson-color": entry.color } as CSSProperties}
              aria-label={`Lección ${entry.n}: ${entry.title}`}
            >
              <span className="lc-lesson-tile__number">{entry.n}</span>
              {picture ? (
                <img
                  src={picture}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="lc-lesson-tile__art"
                />
              ) : null}
              <strong className="lc-lesson-tile__letter">{lessonLetter(entry)}</strong>
              <span className="lc-lesson-tile__syllables">{lessonSyllables(entry)}</span>
              {done ? (
                <span className="lc-lesson-tile__done" aria-label="Completada">
                  <Check size={20} />
                </span>
              ) : null}
            </Link>
          );
        })}
      </section>
    </main>
  );
}
