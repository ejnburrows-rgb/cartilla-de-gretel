import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/binder")({
  component: BinderStub,
});

function BinderStub() {
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
      <h1 style= fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "#78350f" >
        Carpeta del Maestro
      </h1>
      <p style= color: "#57534e", margin: 0, maxWidth: "36rem", lineHeight: 1.5 >
        Estamos terminando los últimos detalles de la carpeta para imprimir. Estará disponible en unos minutos.
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
