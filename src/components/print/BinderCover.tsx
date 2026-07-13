import React from "react";

// Hoisted Styles for double-brace JSX styling ban compliance
const coverContainerStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  minHeight: "10in",
  padding: "2in 1in",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  textAlign: "center",
  border: "10px double #78350f",
  borderRadius: "1.5rem",
  backgroundColor: "#fdfcfa",
};

const topBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  marginTop: "1in",
};

const mainTitleStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  fontWeight: "800",
  color: "#78350f",
  margin: 0,
  lineHeight: "1.2",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#a16207",
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const metaBlockStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#44403c",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginBottom: "1.5in",
  borderTop: "2px solid #ecdac3",
  paddingTop: "1.5rem",
  width: "70%",
};

const footerLabelStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  color: "#78716c",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

export function BinderCover() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="binder-sheet-page" style={coverContainerStyle}>
      <div style={topBlockStyle}>
        <h1 style={mainTitleStyle}>La Cartilla de Gretel</h1>
        <h2 style={subtitleStyle}>Cuaderno del Maestro</h2>
        <div className="w-20 h-1 bg-amber-700 my-4 rounded" />
      </div>

      <div style={metaBlockStyle}>
        <div>
          <strong>Docente: </strong>
          <span className="border-b border-stone-400 px-4 py-0.5">Prof. Leonor Lopetegui</span>
        </div>
        <div>
          <strong>Clase / Aula: </strong>
          <span className="border-b border-stone-400 px-4 py-0.5">Primer Grado - Sección A</span>
        </div>
        <div>
          <strong>Fecha de Emisión: </strong>
          <span className="border-b border-stone-400 px-4 py-0.5">{currentDate}</span>
        </div>
      </div>

      <div style={footerLabelStyle}>
        Edición de Soporte Impreso · ISBN 0-971-8696-8-5
      </div>
    </section>
  );
}
