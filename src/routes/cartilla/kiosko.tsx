import { createFileRoute, useNavigate, Link, useLocation, Outlet } from "@tanstack/react-router";
import { CATALOG } from "@/lib/lesson-catalog";
import { KioskoShell } from "@/components/cartilla/KioskoShell";
import { KioskoBigButton } from "@/components/kiosko/KioskoBigButton";
import { ArrowLeft, BookOpen, Presentation } from "lucide-react";
import "@/styles/kiosko.css";

export const Route = createFileRoute("/cartilla/kiosko")({
  component: KioskoLayout,
  head: () => ({
    meta: [
      { title: "Terminal Kiosko Smartboard — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Presentador táctil interactivo en pantalla completa para pizarras digitales.",
      },
    ],
  }),
});

export function KioskoLayout() {
  const location = useLocation();
  const isIndex =
    location.pathname === "/cartilla/kiosko" || location.pathname === "/cartilla/kiosko/";

  if (!isIndex) {
    return <Outlet />;
  }

  return <KioskoLanding />;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const dashboardWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  padding: "1.5rem",
  boxSizing: "border-box",
  overflow: "hidden",
};

const headerBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "2px solid rgba(236, 218, 195, 0.12)",
  paddingBottom: "1rem",
  marginBottom: "1rem",
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "900",
  color: "#ffc078",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "rgba(255, 248, 222, 0.6)",
  margin: 0,
  marginTop: "0.15rem",
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: "#fca5a5",
  backgroundColor: "rgba(239, 68, 68, 0.15)",
  border: "1.5px solid rgba(239, 68, 68, 0.4)",
  padding: "0.4rem 0.85rem",
  borderRadius: "0.85rem",
  cursor: "pointer",
  textDecoration: "none",
  transition: "all 0.15s ease",
};

const gridContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "1rem",
  paddingRight: "0.5rem",
  overflowY: "auto",
  flex: 1,
};

const lessonIconStyle = (color: string): React.CSSProperties => ({
  color,
});

export function KioskoLanding() {
  const navigate = useNavigate();

  const handlePickLesson = (n: number) => {
    navigate({ to: `/cartilla/kiosko/${n}` });
  };

  return (
    <KioskoShell>
      <div style={dashboardWrapperStyle}>
        {/* Header bar */}
        <header style={headerBoxStyle}>
          <div>
            <h1 style={titleStyle}>
              <Presentation className="w-6 h-6 text-amber-400" />
              Terminal Kiosko Smartboard
            </h1>
            <p style={subtitleStyle}>
              Presentador interactivo táctil. Selecciona una lección para proyectar.
            </p>
          </div>

          <Link
            to="/cartilla/student/lecciones"
            style={backLinkStyle}
            className="hover:bg-red-500/25"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salir de Kiosko</span>
          </Link>
        </header>

        {/* Picker grid */}
        <main style={gridContainerStyle} className="kiosko-picker-grid">
          {CATALOG.map((entry) => {
            const subtitleText =
              entry.kind === "consonant"
                ? `Letra ${entry.letter}`
                : entry.kind === "vowel"
                  ? `Vocal ${entry.vowel}`
                  : "Vocales";
            const iconStyle = lessonIconStyle(entry.color);

            return (
              <KioskoBigButton
                key={entry.n}
                label={`Lección ${entry.n}`}
                sublabel={`${subtitleText}`}
                color={entry.color}
                icon={<BookOpen className="w-5 h-5" style={iconStyle} />}
                onClick={() => handlePickLesson(entry.n)}
              />
            );
          })}
        </main>
      </div>
    </KioskoShell>
  );
}
