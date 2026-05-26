import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BarChart3, Expand, Home, MonitorPlay, Shrink } from "lucide-react";
import { getCartillaCrmCssVars } from "@/lib/cartilla-crm-theme";
import "@/styles/kiosko.css";

type TeacherPresentationShellProps = {
  lessonNumber?: number;
  title: string;
  subtitle?: string;
  pages?: string;
  children: ReactNode;
};

export function TeacherPresentationShell({
  lessonNumber = 1,
  title,
  subtitle,
  pages,
  children,
}: TeacherPresentationShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <section
      className="teacher-presentation-shell cartilla-presentation-frame cartilla-theme-transition min-h-screen text-white"
      style={getCartillaCrmCssVars(lessonNumber)}
    >
      <div className="teacher-presentation-layout">
        <header className="teacher-presentation-header">
          <div className="teacher-presentation-meta">
            <span>
              <MonitorPlay className="h-5 w-5" aria-hidden />
              Vista docente
            </span>
            {pages ? <span>Paginas {pages}</span> : null}
            {lessonNumber ? <span>Leccion {lessonNumber}</span> : null}
          </div>
          <div className="teacher-presentation-heading">
            <div>
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            <nav className="teacher-presentation-actions" aria-label="Acciones docentes">
              <a
                href="/cartilla/teacher"
                className="teacher-presentation-fullscreen"
                aria-label="Volver al CRM docente"
                title="Volver al CRM docente"
              >
                <Home aria-hidden />
              </a>
              <a
                href="/cartilla/teacher/reportes"
                className="teacher-presentation-fullscreen"
                aria-label="Abrir reportes docentes"
                title="Abrir reportes docentes"
              >
                <BarChart3 aria-hidden />
              </a>
              <button
                type="button"
                className="teacher-presentation-fullscreen"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Shrink aria-hidden /> : <Expand aria-hidden />}
              </button>
            </nav>
          </div>
        </header>
        <div className="teacher-presentation-content">{children}</div>
      </div>
    </section>
  );
}
