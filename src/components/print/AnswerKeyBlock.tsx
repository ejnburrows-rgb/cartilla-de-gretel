import React from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { getExerciseKindForPage } from "../cartilla/AnswerKeyBlock";

// Hoisted Styles for double-brace JSX styling ban compliance
const keyContainerStyle: React.CSSProperties = {
  boxSizing: "border-box",
  border: "3px double #059669", // Double border green/emerald
  backgroundColor: "#ecfdf5",
  padding: "0.5rem 0.85rem",
  borderRadius: "0.75rem",
  color: "#064e3b",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const keyHeaderStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "#047857",
  borderBottom: "1.5px dashed #a7f3d0",
  paddingBottom: "0.25rem",
  margin: 0,
  letterSpacing: "0.05em",
};

const textContentStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  lineHeight: "1.35",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const boldLabelStyle: React.CSSProperties = {
  fontWeight: "bold",
  color: "#064e3b",
};

const itemListsStyle: React.CSSProperties = {
  margin: "0.15rem 0 0 0.85rem",
  padding: 0,
  listStyleType: "disc",
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
};

interface AnswerKeyBlockProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function AnswerKeyBlock({ entry, pageNumber }: AnswerKeyBlockProps) {
  const kind = getExerciseKindForPage(entry, pageNumber);

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

  const sentences: string[] =
    entry.kind === "consonant"
      ? entry.data.sentences
      : entry.kind === "vowel"
        ? [`${entry.lesson.characterName}. ${entry.lesson.characterDesc}`]
        : ["Las cinco vocales son a, e, i, o, u. Repite conmigo: a, e, i, o, u."];

  return (
    <div style={keyContainerStyle} className="answer-key-box">
      <h4 style={keyHeaderStyle}>Solucionario de la Cartilla</h4>

      <div style={textContentStyle}>
        {kind === "intro" && (
          <>
            <div>
              <span style={boldLabelStyle}>Actividad: </span> Caligrafía y trazo inicial de letras principales:{" "}
              <span className="font-mono font-bold text-emerald-800">{syllables.join(", ")}</span>.
            </div>
            <div>
              <span style={boldLabelStyle}>Criterio de Evaluación: </span> Comprobar que el alumno conecte las líneas guía punteadas respetando los puntos de inicio y finalización del trazo.
            </div>
          </>
        )}

        {kind === "syllable_tap" && (
          <>
            <div>
              <span style={boldLabelStyle}>Respuestas de Sílabas: </span> Escribir las combinaciones silábicas correspondientes:
            </div>
            <ul style={itemListsStyle}>
              {syllables.slice(0, 5).map((s) => (
                <li key={s}>
                  Combinación silábica: <span className="font-bold text-emerald-800">{s}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {kind === "word_match" && (
          <>
            <div>
              <span style={boldLabelStyle}>Respuestas de Asociación Inicial: </span>
            </div>
            <ul style={itemListsStyle}>
              {words.slice(0, 4).map((w) => {
                const match = syllables.find((s) => w.toLowerCase().startsWith(s.toLowerCase())) || syllables[0];
                return (
                  <li key={w}>
                    Asociación correcta: <span className="capitalize font-bold">{w}</span> ➔{" "}
                    <span className="font-mono font-bold">[{match}]</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {kind === "reading" && (
          <>
            <div>
              <span style={boldLabelStyle}>Oraciones de Dictado / Lectura: </span>
            </div>
            <ul style={itemListsStyle}>
              {sentences.map((s, idx) => (
                <li key={idx} className="italic font-bold">
                  &ldquo;{s}&rdquo;
                </li>
              ))}
            </ul>
            <div className="mt-1">
              <span style={boldLabelStyle}>Copia de Dictado: </span> Evaluar caligrafía en la pauta de triple línea.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
