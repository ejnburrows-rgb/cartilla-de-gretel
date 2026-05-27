import type { CatalogEntry } from "@/lib/lesson-catalog";
import { PenTool } from "lucide-react";
import { getExerciseKindForPage } from "./AnswerKeyBlock";

// Hoisted Styles for double-brace JSX styling ban compliance
const containerStyle: React.CSSProperties = {
  padding: "0.85rem",
  border: "2px dashed #cbd5e1",
  borderRadius: "1rem",
  backgroundColor: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  boxSizing: "border-box",
  height: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: "bold",
  color: "#334155",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  borderBottom: "1px dashed #cbd5e1",
  paddingBottom: "0.35rem",
  margin: 0,
};

const studentNameArea: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: "#64748b",
  borderBottom: "1px solid #cbd5e1",
  paddingBottom: "0.2rem",
  marginBottom: "0.25rem",
};

const traceBoxStyle: React.CSSProperties = {
  border: "2px dashed #94a3b8",
  borderRadius: "0.75rem",
  padding: "0.75rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2.2rem",
  fontFamily: "Courier, monospace",
  color: "#cbd5e1",
  letterSpacing: "0.5rem",
  height: "3.5rem",
  textDecoration: "underline",
  textDecorationStyle: "dotted",
};

const lineRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e2e8f0",
  height: "1.5rem",
  width: "100%",
};

const linedBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.1rem",
  marginTop: "0.2rem",
};

const connectRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "1.75rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
};

const dotConnectorStyle = (color: string): React.CSSProperties => ({
  width: "8px",
  height: "8px",
  borderRadius: "9999px",
  backgroundColor: color,
  border: "1.5px solid #64748b",
});

const formulaBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: "#475569",
};

const fillSquareStyle: React.CSSProperties = {
  width: "1.75rem",
  height: "1.75rem",
  border: "1.5px solid #cbd5e1",
  borderRadius: "0.35rem",
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

  // Shuffle syllables for the connection column
  const shuffledSyllables = [...syllables].sort((a, b) => b.localeCompare(a));

  const targetChar =
    entry.kind === "consonant"
      ? entry.letter
      : entry.kind === "vowel"
        ? entry.vowel
        : "V";

  return (
    <div style={containerStyle}>
      <div style={studentNameArea}>Nombre: ____________________________</div>

      <h4 style={titleStyle}>
        <PenTool className="w-3.5 h-3.5 text-slate-500" />
        Hoja de Trabajo del Alumno
      </h4>

      {/* ── KIND 1: INTRO (Tracing practice) ── */}
      {kind === "intro" && (
        <div className="flex-1 flex flex-col justify-between gap-2">
          <div className="text-[10px] text-slate-500 font-bold">
            1. Repasa la letra por la línea punteada:
          </div>
          <div style={traceBoxStyle}>
            {targetChar.toUpperCase()} {targetChar} {targetChar.toUpperCase()} {targetChar}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            2. Intenta escribirla tú solo:
          </div>
          <div style={linedBoxStyle}>
            <div style={lineRowStyle} />
            <div style={lineRowStyle} />
          </div>
        </div>
      )}

      {/* ── KIND 2: SYLLABLE TAP (Fill missing syllables) ── */}
      {kind === "syllable_tap" && (
        <div className="flex-1 flex flex-col justify-between gap-1.5">
          <div className="text-[10px] text-slate-500 font-bold">
            Escribe la sílaba correspondiente en el recuadro:
          </div>
          <div className="flex flex-col gap-1.5">
            {syllables.slice(0, 5).map((s) => {
              const letterPart = entry.kind === "consonant" ? entry.letter : "";
              const vowelPart = s.replace(letterPart, "");
              return (
                <div key={s} style={formulaBoxStyle}>
                  <span className="font-mono text-xs">{letterPart || "V"}</span>
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

      {/* ── KIND 3: WORD MATCH (Draw connections) ── */}
      {kind === "word_match" && (
        <div className="flex-1 flex flex-col justify-between gap-1">
          <div className="text-[10px] text-slate-500 font-bold">
            Une con una línea cada palabra con su sílaba inicial:
          </div>
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

      {/* ── KIND 4: READING (Lined copy writing) ── */}
      {kind === "reading" && (
        <div className="flex-1 flex flex-col justify-between gap-2">
          <div className="text-[10px] text-slate-500 font-bold">
            Copia la oración dictada por tu profesor:
          </div>
          <div style={linedBoxStyle} className="mt-1">
            <div style={lineRowStyle} />
            <div style={lineRowStyle} />
            <div style={lineRowStyle} />
            <div style={lineRowStyle} />
          </div>
        </div>
      )}
    </div>
  );
}
