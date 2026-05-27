import { createFileRoute, Link, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/binder/$lesson")({
  component: BinderLessonStub,
});

function BinderLessonStub() {
  const { lesson } = useParams({ from: "/cartilla/binder/$lesson" });
  return (
    <div
      style=
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1c1917",
        textAlign: "center",
        gap: "1rem",
      
    >
      <h1 style= fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#78350f" >
        Lección {lesson}
      </h1>
      <p style= color: "#57534e", margin: 0, maxWidth: "36rem", lineHeight: 1.5 >
        La hoja de impresión para esta lección estará lista en unos minutos.
      </p>
      <Link
        to="/"
        style=
          marginTop: "1rem",
          color: "#0369a1",
          textDecoration: "underline",
          fontWeight: 600,
        
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
