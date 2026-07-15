import type { CatalogEntry } from "@/lib/lesson-catalog";
import { Key } from "lucide-react";
import interactionsData from "@/data/workbook-interactions.json";

// Hoisted Styles for double-brace JSX styling ban compliance
const blockStyle: React.CSSProperties = {
  padding: "0.85rem",
  border: "2px solid #b7e4c7",
  borderRadius: "1rem",
  backgroundColor: "#f4fbf7",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  boxSizing: "border-box",
  height: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: "bold",
  color: "#1b4332",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  borderBottom: "1px dashed #b7e4c7",
  paddingBottom: "0.35rem",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "#2d6a4f",
  lineHeight: "1.4",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};

const boldLabelStyle: React.CSSProperties = {
  fontWeight: "bold",
  color: "#1b4332",
};

const bulletListStyle: React.CSSProperties = {
  margin: "0.2rem 0 0 1rem",
  padding: 0,
  listStyleType: "disc",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

export function getExerciseKindForPage(
  entry: CatalogEntry,
  pageNumber: number,
): "intro" | "syllable_tap" | "word_match" | "reading" {
  const parts = entry.pages.split("-").map(Number);
  const from = parts[0] || 1;
  const offset = Math.max(0, pageNumber - from);

  if (entry.kind === "intro") {
    if (offset === 0) return "intro";
    return "reading";
  }

  if (entry.kind === "vowel") {
    if (offset === 0) return "intro";
    if (offset === 1) return "word_match";
    return "reading";
  }

  // Consonant
  if (offset === 0) return "intro";
  if (offset === 1) return "syllable_tap";
  if (offset === 2) return "word_match";
  return "reading";
}

interface AnswerKeyBlockProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function AnswerKeyBlock({ entry, pageNumber }: AnswerKeyBlockProps) {
  const kind = getExerciseKindForPage(entry, pageNumber);

  // Extract syllables, words, and sentences
  const syllables: string[] =
    entry.kind === "consonant"
      ? entry.data?.syllables || []
      : entry.kind === "vowel"
        ? [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)]
        : ["a", "e", "i", "o", "u"];

  const words: string[] =
    entry.kind === "consonant"
      ? entry.data?.examples
        ? Object.values(entry.data.examples).flat().slice(0, 6)
        : []
      : entry.kind === "vowel"
        ? (entry.lesson?.vocab || []).slice(0, 6).map((v) => v.word)
        : ["ala", "oso", "uva", "isla", "era"];

  const sentences: string[] =
    entry.kind === "consonant"
      ? entry.data?.sentences || []
      : entry.kind === "vowel"
        ? [`${entry.lesson?.characterName || ""}. ${entry.lesson?.characterDesc || ""}`]
        : ["Las cinco vocales son a, e, i, o, u. Repite conmigo: a, e, i, o, u."];

  const isScaffold = (
    Array.isArray(interactionsData.interactions) ? (interactionsData.interactions as any[]) : []
  ).some(
    (i) =>
      i &&
      (i.lessonNumber === entry.n || i.lessonId === String(entry.n)) &&
      i.sourceStatus === "scaffold",
  );

  return (
    <div style={blockStyle}>
      <h4 style={titleStyle}>
        <Key className="w-3.5 h-3.5 text-emerald-600" />
        Guía y Solucionario Docente
      </h4>

      <div style={contentStyle}>
        {isScaffold ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #b7e4c7",
              borderRadius: "0.5rem",
              backgroundColor: "#f4fbf7",
              padding: "1rem",
              textAlign: "center",
              color: "#2d6a4f",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            [ Ejercicio pendiente de verificación — Lección {entry.n} ]
          </div>
        ) : (
          <>
            {kind === "intro" && (
              <>
                <div>
                  <span style={boldLabelStyle}>Actividad: </span> Presentación de la lección e
                  historia del personaje.
                </div>
                <div>
                  <span style={boldLabelStyle}>Instrucciones de Escritura: </span> El alumno debe
                  trazar la letra o vocal en la cuadrícula punteada siguiendo el orden correcto de
                  trazo del maestro.
                </div>
                <div>
                  <span style={boldLabelStyle}>Foco fonético: </span> Reconocimiento sonoro inicial
                  de las grafías principales:{" "}
                  <span className="font-mono font-bold">{syllables.join(", ")}</span>.
                </div>
              </>
            )}

            {kind === "syllable_tap" && (
              <>
                <div>
                  <span style={boldLabelStyle}>Actividad: </span> Identificación auditiva y lectura
                  de sílabas.
                </div>
                <div>
                  <span style={boldLabelStyle}>Respuestas de Escritura: </span> Se espera que el
                  estudiante rellene las sílabas correspondientes:
                </div>
                <ul style={bulletListStyle}>
                  {syllables.map((s) => (
                    <li key={s}>
                      Letra / Sonido <span className="font-bold">{s}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {kind === "word_match" && (
              <>
                <div>
                  <span style={boldLabelStyle}>Actividad: </span> Asociación de vocabulario visual
                  con la sílaba inicial.
                </div>
                <div>
                  <span style={boldLabelStyle}>Respuestas correctas de unión (Líneas): </span>
                </div>
                <ul style={bulletListStyle}>
                  {words.slice(0, 4).map((w) => {
                    // Find matching starting syllable
                    const match =
                      syllables.find((s) => w.toLowerCase().startsWith(s.toLowerCase())) ||
                      syllables[0];
                    return (
                      <li key={w}>
                        <span className="font-bold capitalize">{w}</span> une con la sílaba{" "}
                        <span className="font-mono font-bold text-emerald-800">[{match}]</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {kind === "reading" && (
              <>
                <div>
                  <span style={boldLabelStyle}>Actividad: </span> Lectura guiada grupal y
                  caligrafía.
                </div>
                <div>
                  <span style={boldLabelStyle}>Texto de lectura / dictado de oraciones: </span>
                </div>
                <ul style={bulletListStyle}>
                  {sentences.map((sentence, idx) => (
                    <li key={idx} className="italic text-emerald-950">
                      &ldquo;{sentence}&rdquo;
                    </li>
                  ))}
                </ul>
                <div className="mt-1">
                  <span style={boldLabelStyle}>Caligrafía: </span> Copia manuscrita del estudiante
                  en las guías pautadas.
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
