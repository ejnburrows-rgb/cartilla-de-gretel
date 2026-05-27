import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { CATALOG, type CatalogEntry } from "@/lib/lesson-catalog";
import { PdfPage } from "@/components/cartilla/PdfPage";
import { KioskoShell } from "@/components/kiosko/KioskoShell";
import { KioskoControls } from "@/components/kiosko/KioskoControls";
import { AmbientToggle } from "@/components/audio/AmbientToggle";
import { ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import "@/styles/kiosko.css";

export const Route = createFileRoute("/cartilla/kiosko/$n")({
  component: KioskoPresenter,
  head: ({ params }) => ({
    meta: [
      { title: `Presentando Lección ${params.n} — La Cartilla de Gretel` },
      { name: "description", content: "Presentador a pantalla completa de la lección para pizarras interactivas." },
    ],
  }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/kiosko" });
    }
  },
});

// Hoisted Styles for double-brace JSX styling ban compliance
const presenterWrapperStyle = (color: string): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  position: "relative",
  background: `radial-gradient(circle at center, ${color}30 0%, #0c0a08 100%)`,
});

const topHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 1.5rem",
  borderBottom: "1.5px solid rgba(255, 248, 222, 0.08)",
  backgroundColor: "rgba(12, 10, 8, 0.7)",
  backdropFilter: "blur(6px)",
  zIndex: 10,
  flexShrink: 0,
};

const topTitleBlockStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: "900",
  color: "#ffc078",
  margin: 0,
};

const headerSubtitleStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "rgba(255, 248, 222, 0.6)",
  margin: 0,
};

const rightHeaderBlockStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const mainContentWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  padding: "1.5rem 4rem",
  boxSizing: "border-box",
};

const pageContainerShadowStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  maxWidth: "75vh", // Retain proportional size in landscape
  maxHeight: "80vh",
  backgroundColor: "#ffffff",
  borderRadius: "1.5rem",
  boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 255, 255, 0.05)",
  border: "4px solid rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  padding: "0.5rem",
};

const pageCounterBadgeStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "1rem",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#ffd43b",
  padding: "0.35rem 0.85rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  fontFamily: "monospace",
  zIndex: 10,
};

const navOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "1.5rem",
  right: "1.5rem",
  transform: "translateY(-50%)",
  display: "flex",
  justifyContent: "space-between",
  pointerEvents: "none",
  width: "calc(100% - 3rem)",
  zIndex: 20,
};

const arrowBtnStyle: React.CSSProperties = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  border: "2.5px solid rgba(255, 255, 255, 0.25)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  pointerEvents: "auto",
  transition: "all 0.15s ease",
  backdropFilter: "blur(6px)",
  boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
};

function getPagesArray(pagesStr: string): number[] {
  const parts = pagesStr.split("-").map(Number);
  const from = parts[0] || 1;
  const to = parts[1] || from;
  const pages: number[] = [];
  for (let i = from; i <= to; i++) {
    pages.push(i);
  }
  return pages;
}

export function KioskoPresenter() {
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);

  const entry = useMemo<CatalogEntry | undefined>(
    () => CATALOG.find((e) => e.n === n),
    [n]
  );

  const pages = useMemo<number[]>(() => {
    if (!entry) return [1];
    return getPagesArray(entry.pages);
  }, [entry]);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePageNum = pages[activePageIndex] || pages[0];

  // Dispatch page flip event to trigger page turn audio play cleanly
  const triggerPageFlipSound = (isSoft = false) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("cartilla:page-flip", {
        detail: { soft: isSoft },
      });
      window.dispatchEvent(event);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
      triggerPageFlipSound(true);
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < pages.length - 1) {
      setActivePageIndex(activePageIndex + 1);
      triggerPageFlipSound(false);
    }
  };

  const handleExitPresenter = () => {
    navigate({ to: "/cartilla/kiosko" });
  };

  if (!entry) return null;

  const accentColor = entry.color || "#ff922b";
  const dynamicWrapperStyle = presenterWrapperStyle(accentColor);

  return (
    <KioskoShell onExit={handleExitPresenter}>
      <div style={dynamicWrapperStyle}>
        {/* Header toolbar */}
        <header style={topHeaderStyle}>
          <div style={topTitleBlockStyle}>
            <Presentation className="w-5 h-5 text-amber-400" />
            <div>
              <h2 style={headerTitleStyle}>{entry.title}</h2>
              <p style={headerSubtitleStyle}>Presentación Interactiva Kiosko</p>
            </div>
          </div>

          <div style={rightHeaderBlockStyle}>
            {/* Ambient Sound Toggle */}
            <AmbientToggle color={accentColor} />

            {/* General CRM Controls */}
            <KioskoControls accentColor={accentColor} onExit={handleExitPresenter} />
          </div>
        </header>

        {/* Content canvas */}
        <main style={mainContentWrapperStyle}>
          <div style={pageContainerShadowStyle}>
            <PdfPage
              pageNumber={activePageNum}
              className="rounded-lg max-h-[72vh] object-contain flex items-center justify-center"
            />
          </div>

          {/* Page index indicator bubble */}
          <div style={pageCounterBadgeStyle}>
            Página {activePageNum} ({activePageIndex + 1} de {pages.length})
          </div>

          {/* Huge Touch Navigation Arrow Overlays */}
          <div style={navOverlayStyle}>
            {/* Prev arrow */}
            {activePageIndex > 0 ? (
              <button
                onClick={handlePrevPage}
                style={arrowBtnStyle}
                className="kiosko-huge-arrow hover:scale-105 active:scale-95"
                title="Página Anterior"
                aria-label="Página Anterior"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            ) : (
              <div className="w-[70px]" />
            )}

            {/* Next arrow */}
            {activePageIndex < pages.length - 1 ? (
              <button
                onClick={handleNextPage}
                style={arrowBtnStyle}
                className="kiosko-huge-arrow hover:scale-105 active:scale-95"
                title="Página Siguiente"
                aria-label="Página Siguiente"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            ) : (
              <div className="w-[70px]" />
            )}
          </div>
        </main>
      </div>
    </KioskoShell>
  );
}
