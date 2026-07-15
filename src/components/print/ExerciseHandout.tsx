import React from "react";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { getExerciseKindForPage } from "../cartilla/AnswerKeyBlock";
import interactionsData from "@/data/workbook-interactions.json";

// Hoisted Styles for double-brace JSX styling ban compliance
const containerStyle: React.CSSProperties = {
  boxSizing: "border-box",
  border: "2px dashed #475569",
  borderRadius: "0.75rem",
  padding: "0.5rem 0.85rem",
  backgroundColor: "#ffffff",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "#1e293b",
  borderBottom: "1.5px dashed #94a3b8",
  paddingBottom: "0.25rem",
  margin: 0,
  letterSpacing: "0.05em",
};

const instructionStyle: React.CSSProperties = {
  fontSize: "0.62rem",
  fontWeight: "bold",
  color: "#334155",
  margin: 0,
  lineHeight: "1.3",
};

const nameLineStyle: React.CSSProperties = {
  fontSize: "0.6rem",
  fontWeight: "bold",
  color: "#475569",
  borderBottom: "1px solid #cbd5e1",
  paddingBottom: "0.15rem",
  marginBottom: "0.2rem",
};

const traceBoxStyle: React.CSSProperties = {
  border: "1.5px dashed #94a3b8",
  borderRadius: "0.5rem",
  padding: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.8rem",
  fontFamily: "Courier, monospace",
  color: "#cbd5e1",
  letterSpacing: "0.4rem",
  height: "2.8rem",
  textDecoration: "underline",
  textDecorationStyle: "dotted",
};

const linedBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.1rem",
  marginTop: "0.25rem",
};

const lineRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #cbd5e1",
  height: "1.25rem",
  width: "100%",
};

const connectRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "1.35rem",
  fontSize: "0.7rem",
  fontWeight: "bold",
};

const dotConnectorStyle = (color: string): React.CSSProperties => ({
  width: "7px",
  height: "7px",
  borderRadius: "9999px",
  backgroundColor: color,
  border: "1px solid #475569",
});

const formulaBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: "#334155",
};

const fillSquareStyle: React.CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
  border: "1.5px solid #94a3b8",
  borderRadius: "0.25rem",
  backgroundColor: "#ffffff",
};

interface ExerciseHandoutProps {
  entry: CatalogEntry;
  pageNumber: number;
}

export function ExerciseHandout({ entry, pageNumber }: ExerciseHandoutProps) {
  const kind = getExerciseKindForPage(entry, pageNumber);
  const color = entry.color || "#8B5A2B";

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

  const shuffledSyllables = [...syllables].sort((a, b) => b.localeCompare(a));

  const targetChar =
    entry.kind === "consonant"
      ? entry.letter || ""
      : entry.kind === "vowel"
        ? entry.vowel || ""
        : "V";

  const isScaffold = (
    Array.isArray(interactionsData.interactions) ? (interactionsData.interactions as any[]) : []
  ).some(
    (i) =>
      i &&
      (i.lessonNumber === entry.n || i.lessonId === String(entry.n)) &&
      i.sourceStatus === "scaffold",
  );

  return (
    <div style={containerStyle} className="exercise-handout-box">
      <div style={nameLineStyle}>Alumno: ________________________</div>

      <h4 style={titleStyle}>Ficha de Trabajo del Estudiante</h4>

      {isScaffold ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #cbd5e1",
            borderRadius: "0.5rem",
            backgroundColor: "#f8fafc",
            padding: "1rem",
            textAlign: "center",
            color: "#64748b",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          [ Ejercicio pendiente de verificación — Lección {entry.n} ]
        </div>
      ) : (
        <>
          {/* ── KIND 1: INTRO (Letter Tracing) ── */}
          {kind === "intro" && (
            <div className="flex-1 flex flex-col justify-between gap-1.5">
              <p style={instructionStyle}>
                Instrucción: Repasa con lápiz la letra punteada siguiendo las flechas guía de
                caligrafía y luego practica tú solo en el renglón.
              </p>
              <div style={traceBoxStyle}>
                {targetChar.toUpperCase()} {targetChar} {targetChar.toUpperCase()} {targetChar}
              </div>
              <div style={linedBoxStyle}>
                <div style={lineRowStyle} />
                <div style={lineRowStyle} />
              </div>
            </div>
          )}

          {/* ── KIND 2: SYLLABLE TAP (Syllable synthesis) ── */}
          {kind === "syllable_tap" && (
            <div className="flex-1 flex flex-col justify-between gap-1.5">
              <p style={instructionStyle}>
                Instrucción: Escribe en cada cuadro la sílaba resultante al unir la consonante con
                la vocal correspondiente.
              </p>
              <div className="flex flex-col gap-1.5">
                {syllables.slice(0, 5).map((s) => {
                  const letterPart = entry.kind === "consonant" ? entry.letter : "";
                  const vowelPart = s.replace(letterPart, "");
                  return (
                    <div key={s} style={formulaBoxStyle}>
                      <span className="font-mono text-xs capitalize">{letterPart || "V"}</span>
                      <span>+</span>
                      <span className="font-mono text-xs">{vowelPart || s}</span>
                      <span>=</span>
                      <div style={fillSquareStyle} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KIND 3: WORD MATCH (Draw match lines) ── */}
          {kind === "word_match" && (
            <div className="flex-1 flex flex-col justify-between gap-1">
              <p style={instructionStyle}>
                Instrucción: Une la palabra con su sílaba inicial trazando una línea de un punto a
                otro.
              </p>
              <div className="flex-1 flex flex-col justify-around gap-1 mt-1">
                {words.slice(0, 4).map((w, idx) => {
                  const rightSyl = shuffledSyllables[idx] || syllables[0];
                  const leftDot = dotConnectorStyle(color);
                  const rightDot = dotConnectorStyle(color);

                  return (
                    <div key={w} style={connectRowStyle}>
                      <div className="flex items-center gap-1.5 w-1/2">
                        <div style={leftDot} />
                        <span className="capitalize truncate">{w}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end w-1/2">
                        <span className="font-mono">{rightSyl}</span>
                        <div style={rightDot} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── KIND 4: READING (Calligraphy Copywriting) ── */}
          {kind === "reading" && (
            <div className="flex-1 flex flex-col justify-between gap-1.5">
              <p style={instructionStyle}>
                Instrucción: Dictado de oraciones. Copia en los renglones pautados las oraciones que
                el docente dicte durante la sesión.
              </p>
              <div style={linedBoxStyle} className="mt-1">
                <div style={lineRowStyle} />
                <div style={lineRowStyle} />
                <div style={lineRowStyle} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
