import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Play, BookOpen, Presentation } from "lucide-react";
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

type VowelDetail = {
  n: number;
  sheetNum: string;
  step: string;
  singleGlyph: string;
  glyph: string;
  auraClass: string;
  poemBoxClass: string;
  poemTitleClass: string;
  poemTitle: string;
  poemVerse: string;
  words: { lead: string; rest: string }[];
};

const VOWEL_DETAILS: VowelDetail[] = [
  {
    n: 2,
    sheetNum: "Lección 2 · Lámina 4",
    step: "1.ª Vocal",
    singleGlyph: "o",
    glyph: "O o",
    auraClass: "fc-aura-o",
    poemBoxClass: "fc-poem-box-o",
    poemTitleClass: "fc-title-o",
    poemTitle: "Arre caballito",
    poemVerse: "“yo soy redondita\ny puedo rodar”",
    words: [
      { lead: "o", rest: "lla" },
      { lead: "O", rest: "to" },
      { lead: "o", rest: "veja" },
      { lead: "o", rest: "so" },
      { lead: "o", rest: "reja" },
      { lead: "o", rest: "cho" },
    ],
  },
  {
    n: 3,
    sheetNum: "Lección 3 · Lámina 5",
    step: "2.ª Vocal",
    singleGlyph: "a",
    glyph: "A a",
    auraClass: "fc-aura-a",
    poemBoxClass: "fc-poem-box-a",
    poemTitleClass: "fc-title-a",
    poemTitle: "La niña enfermita",
    poemVerse: "“abre bien la boca\nsi tienes dolor: ¡a!”",
    words: [
      { lead: "a", rest: "banico" },
      { lead: "a", rest: "nillo" },
      { lead: "a", rest: "raña" },
      { lead: "a", rest: "la" },
      { lead: "a", rest: "ro" },
      { lead: "A", rest: "na" },
    ],
  },
  {
    n: 4,
    sheetNum: "Lección 4 · Lámina 6",
    step: "3.ª Vocal",
    singleGlyph: "e",
    glyph: "E e",
    auraClass: "fc-aura-e",
    poemBoxClass: "fc-poem-box-e",
    poemTitleClass: "fc-title-e",
    poemTitle: "La niña sordita",
    poemVerse: "“Ee, Ee te he llamado\nentiende al revés: ¡e!”",
    words: [
      { lead: "e", rest: "lefante" },
      { lead: "e", rest: "spejo" },
      { lead: "E", rest: "ma" },
      { lead: "e", rest: "strella" },
      { lead: "e", rest: "rizo" },
      { lead: "e", rest: "scalera" },
    ],
  },
  {
    n: 5,
    sheetNum: "Lección 5 · Lámina 7",
    step: "4.ª Vocal",
    singleGlyph: "i",
    glyph: "I i",
    auraClass: "fc-aura-i",
    poemBoxClass: "fc-poem-box-i",
    poemTitleClass: "fc-title-i",
    poemTitle: "La niña llorona",
    poemVerse: "“flaquita y llorona\n¡iii no llores más!”",
    words: [
      { lead: "i", rest: "mán" },
      { lead: "i", rest: "glú" },
      { lead: "i", rest: "ndio" },
      { lead: "i", rest: "nsecto" },
      { lead: "i", rest: "sla" },
      { lead: "I", rest: "rma" },
    ],
  },
  {
    n: 6,
    sheetNum: "Lección 6 · Lámina 8",
    step: "5.ª Vocal",
    singleGlyph: "u",
    glyph: "U u",
    auraClass: "fc-aura-u",
    poemBoxClass: "fc-poem-box-u",
    poemTitleClass: "fc-title-u",
    poemTitle: "La brujita",
    poemVerse: "“vuela en su escobita\nasustando: ¡u, u, u!”",
    words: [
      { lead: "u", rest: "no" },
      { lead: "u", rest: "va" },
      { lead: "u", rest: "rraca" },
      { lead: "u", rest: "nicornio" },
      { lead: "u", rest: "niforme" },
      { lead: "U", rest: "lises" },
    ],
  },
];

function consonantSyllables(entry: CatalogEntry): string {
  if (entry.kind === "consonant") return entry.data.syllables.join(" · ");
  return "";
}

type LessonFilter = "vowels" | "all" | "consonants";

function Lecciones() {
  const { isCompleted, completed } = useLessonProgress();
  const [filter, setFilter] = useState<LessonFilter>("vowels");
  const resume = readLearnerResume();
  const doneCount = [...completed].filter((n) => n >= 1 && n <= TOTAL_LESSONS).length;
  const currentLesson = CATALOG.find((entry) => !isCompleted(entry.n))?.n ?? TOTAL_LESSONS;

  const handleTileClick = () => {
    playUiTick();
    audioEngine.playPageTurn(true);
    requestLessonFullscreen();
  };

  const showVowels = filter === "vowels" || filter === "all";
  const showConsonants = filter === "consonants" || filter === "all";
  const consonantsCatalog = CATALOG.filter((entry) => entry.kind === "consonant");

  return (
    <main className="lc-lessons-editorial">
      <header className="lc-editorial-header">
        <div className="lc-editorial-topbar">
          <Link to="/cartilla" className="lc-editorial-back">
            <ArrowLeft size={18} /> Portada de la Cartilla
          </Link>
          <div className="lc-filter-group" role="group" aria-label="Filtrar lecciones">
            <button
              type="button"
              onClick={() => setFilter("vowels")}
              className={`lc-filter-btn ${filter === "vowels" ? "active" : ""}`}
            >
              Vocales (1–6)
            </button>
            <button
              type="button"
              onClick={() => setFilter("consonants")}
              className={`lc-filter-btn ${filter === "consonants" ? "active" : ""}`}
            >
              Consonantes (7–24)
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`lc-filter-btn ${filter === "all" ? "active" : ""}`}
            >
              Todas (1–24)
            </button>
          </div>
        </div>

        {resume && (
          <div className="lc-resume-wrap" style={{ marginBottom: 20 }}>
            <Link
              to="/cartilla/leccion/$n"
              params={{ n: String(resume.lesson) }}
              onClick={handleTileClick}
              className="lc-editorial-continue-btn"
            >
              <Play size={16} fill="currentColor" /> Continuar lección {resume.lesson}
            </Link>
            <span className="lc-editorial-done-counter">
              {doneCount} de {TOTAL_LESSONS} lecciones completadas
            </span>
          </div>
        )}
      </header>

      {/* STAGE 1: VOWELS — AUTHENTIC FLIP BOOK REPLICA (NO PICTURES, PURE FLIP BOOK AESTHETIC) */}
      {showVowels && (
        <section className="lc-flipchart-sheet-hero" aria-label="Introducción a las Hermanitas Vocales">
          {/* Flip chart spiral binding rings along the top */}
          <div className="flipchart-spiral-header" aria-hidden="true" />

          {/* Sheet 3 Header: Pastel Sky Blue card with Red Italic Title */}
          <div className="fc-verse-card-hero">
            <h1 className="fc-verse-title-red">Las hermanitas vocales</h1>
            <p className="fc-verse-lines">
              Cinco hermanitas todas aplicadas,<br />
              las cinco bonitas nunca están calladas.
            </p>
          </div>

          {/* 5 Vowels Row with authentic Flip Book Glowing Halos & Red Letters */}
          <div className="fc-vowels-aura-row" aria-label="Las cinco vocales en orden pedagógico">
            {VOWEL_DETAILS.map((v) => (
              <Link
                key={v.n}
                to="/cartilla/leccion/$n"
                params={{ n: String(v.n) }}
                onClick={handleTileClick}
                className="fc-vowel-aura-badge"
                title={`${v.step}: Vocal ${v.singleGlyph}`}
              >
                <div className={`fc-aura-circle ${v.auraClass}`}>
                  <span className="fc-vowel-red-glyph">{v.singleGlyph}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Action buttons: Student workbook vs Teacher projector */}
          <div className="fc-hermanitas-action-row">
            <Link
              to="/cartilla/leccion/$n"
              params={{ n: "1" }}
              onClick={handleTileClick}
              className="fc-action-btn-primary"
            >
              <BookOpen size={18} /> Abrir Cuaderno · Lección 1
            </Link>
            <Link
              to="/cartilla/presentar/$n"
              params={{ n: "1" }}
              onClick={handleTileClick}
              className="fc-action-btn-secondary"
            >
              <Presentation size={18} /> Proyectar Rotafolio · Lámina 3
            </Link>
          </div>

          {/* 5 Individual Vowel Lessons in Authentic Flip Book Style & Colors (O, A, E, I, U) */}
          <div className="fc-vowels-5-grid" aria-label="Cinco lecciones de vocales individuales">
            {VOWEL_DETAILS.map((v) => {
              const done = isCompleted(v.n);
              const current = !done && v.n === currentLesson;
              return (
                <Link
                  key={v.n}
                  to="/cartilla/leccion/$n"
                  params={{ n: String(v.n) }}
                  onClick={handleTileClick}
                  className={`fc-vowel-card ${current ? "is-current" : ""}`}
                  aria-label={`${v.sheetNum}: ${v.poemTitle}`}
                >
                  <span className="fc-sheet-num-pill">{v.sheetNum}</span>
                  <div className={`fc-card-poem-box ${v.poemBoxClass}`}>
                    <div className={`fc-card-poem-title ${v.poemTitleClass}`}>{v.poemTitle}</div>
                    <p className="fc-card-poem-verse">
                      {v.poemVerse.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i === 0 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className={`fc-card-big-aura ${v.auraClass}`}>
                    <span className="v-glyph">{v.glyph}</span>
                  </div>
                  <div className="fc-words-list">
                    {v.words.slice(0, 3).map((w, idx) => (
                      <span key={idx}>
                        <strong>{w.lead}</strong>
                        {w.rest}
                        {idx < 2 ? " · " : ""}
                      </span>
                    ))}
                    <br />
                    {v.words.slice(3).map((w, idx) => (
                      <span key={idx}>
                        <strong>{w.lead}</strong>
                        {w.rest}
                        {idx < 2 ? " · " : ""}
                      </span>
                    ))}
                  </div>
                  {done && (
                    <span className="fc-card-done" aria-label="Completada">
                      <Check size={18} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* STAGE 2: CONSONANTS (LECCIONES 7–24) */}
      {showConsonants && (
        <section className="lc-consonants-stage" aria-label="Etapa de Consonantes y Sílabas">
          <div className="lc-stage-divider">
            <span className="lc-eyebrow">Etapa 2 · Sílabas y Lectura Inicial</span>
            <h2 className="lc-stage-title">Consonantes (Lecciones 7 a 24)</h2>
          </div>

          <div className="lc-consonants-grid">
            {consonantsCatalog.map((entry) => {
              const done = isCompleted(entry.n);
              const current = !done && entry.n === currentLesson;
              const syllables = consonantSyllables(entry);
              const letter = entry.kind === "consonant" ? entry.letter.toUpperCase() : "";

              return (
                <Link
                  key={entry.n}
                  to="/cartilla/leccion/$n"
                  params={{ n: String(entry.n) }}
                  onClick={handleTileClick}
                  className={`lc-consonant-card ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}
                  style={{ "--lesson-color": entry.color } as CSSProperties}
                  aria-label={`Lección ${entry.n}: ${entry.title}`}
                >
                  <span className="lc-consonant-num">{entry.n}</span>
                  <div className="lc-consonant-emblem">
                    <span className="consonant-glyph">{letter}</span>
                  </div>
                  <div className="lc-consonant-title">{entry.title}</div>
                  <div className="lc-consonant-syllables">{syllables}</div>
                  {done && (
                    <span className="lc-consonant-done" aria-label="Completada">
                      <Check size={16} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default Lecciones;
