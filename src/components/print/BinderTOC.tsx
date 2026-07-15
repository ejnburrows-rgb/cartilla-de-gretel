import React from "react";
import { CATALOG } from "@/lib/lesson-catalog";

// Hoisted Styles for double-brace JSX styling ban compliance
const tocContainerStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  minHeight: "10in",
  padding: "0.5in 0.5in",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
};

const tocTitleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "#78350f",
  borderBottom: "3px solid #78350f",
  paddingBottom: "0.4rem",
  marginBottom: "1rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const tableHeaderStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "#78716c",
  borderBottom: "1.5px solid #ecdac3",
  paddingBottom: "0.25rem",
  marginBottom: "0.5rem",
  display: "flex",
};

const listWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  flex: 1,
};

const itemRowStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  display: "flex",
  alignItems: "center",
  borderBottom: "1px dashed #f5f5f4",
  paddingBottom: "0.15rem",
};

const lessonNumStyle: React.CSSProperties = {
  width: "4rem",
  fontWeight: "bold",
  color: "#78350f",
};

const lessonTitleStyle: React.CSSProperties = {
  flex: 1,
  fontWeight: "bold",
  color: "#1c1917",
};

const pageColStyle: React.CSSProperties = {
  width: "6rem",
  textAlign: "right",
  fontFamily: "monospace",
  fontWeight: "bold",
  color: "#78716c",
};

const checkColStyle: React.CSSProperties = {
  width: "4rem",
  textAlign: "right",
  color: "#cbd5e1",
};

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid #e7e5e4",
  paddingTop: "0.5rem",
  textAlign: "center",
  fontSize: "0.55rem",
  color: "#a8a29e",
};

export function BinderTOC() {
  return (
    <section className="binder-sheet-page" style={tocContainerStyle}>
      <div>
        <h2 style={tocTitleStyle}>Índice de Contenidos</h2>

        <div style={tableHeaderStyle}>
          <span style={{ width: "4rem" }}>Lección</span>
          <span style={{ flex: 1 }}>Descripción y Foco Silábico</span>
          <span style={{ width: "6rem", textAlign: "right" }}>Páginas</span>
          <span style={{ width: "4rem", textAlign: "right" }}>Marcado</span>
        </div>

        <div style={listWrapperStyle}>
          {CATALOG.map((entry) => (
            <div key={entry.n} style={itemRowStyle}>
              <span style={lessonNumStyle}>L{entry.n}</span>
              <span style={lessonTitleStyle}>
                {entry.title}
                <span className="text-[10px] text-stone-500 font-normal italic ml-2">
                  ({entry.kind === "consonant" ? `Letra ${entry.letter}` : entry.kind})
                </span>
              </span>
              <span style={pageColStyle}>p. {entry.pages}</span>
              <span style={checkColStyle}>[ ]</span>
            </div>
          ))}
        </div>
      </div>

      <div style={footerStyle}>
        Carpeta del Maestro · La Cartilla de Gretel · Cuaderno de Control de Aulas
      </div>
    </section>
  );
}
