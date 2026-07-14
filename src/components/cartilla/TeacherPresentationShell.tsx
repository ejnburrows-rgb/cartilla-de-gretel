/**
 * TeacherPresentationShell — full-viewport CRM-grade classroom presenter.
 * Warm book palette (not dark navy SaaS). Stage is the hero; chrome is
 * light and finger-friendly. Used by /cartilla/presentar/$n only.
 */
import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Maximize2, Minimize2, MousePointerClick, X, Focus } from "lucide-react";
import "@/styles/flipchart-presenter.css";

interface TeacherPresentationShellProps {
  children: ReactNode;
  accentColor?: string;
  onExit?: () => void;
  /** Lesson title, e.g. "Vocal O o" */
  title?: string;
  /** Secondary line, e.g. "Flipchart del maestro · Lección 2" */
  subtitle?: string;
  /** Short eyebrow, e.g. "Lección 2" */
  eyebrow?: string;
}

export function TeacherPresentationShell({
  children,
  accentColor = "#c98c4f",
  onExit,
  title = "Presentación del flipchart",
  subtitle = "Proyector del maestro",
  eyebrow = "Panel del docente",
}: TeacherPresentationShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserPointer, setLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [focusMode, setFocusMode] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // In focus mode, hide header after idle so the chart dominates
    idleTimerRef.current = setTimeout(() => {
      if (focusMode) setIsIdle(true);
    }, 2800);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserPointer) setLaserPos({ x: e.clientX, y: e.clientY });
  };

  const shellStyle = {
    ["--fc-accent-live" as string]: accentColor,
  } as CSSProperties;

  const laserStyle: CSSProperties = {
    left: laserPos.x,
    top: laserPos.y,
    backgroundColor: accentColor,
    boxShadow: `0 0 18px 4px ${accentColor}`,
  };

  const focusClass = focusMode || isIdle ? " is-focus" : "";

  return (
    <div
      className={`fc-presenter${focusClass}`}
      style={shellStyle}
      data-accent=""
      data-testid="teacher-presenter-shell"
      onMouseMove={handleMouseMove}
    >
      {laserPointer && <div className="fc-presenter__laser" style={laserStyle} aria-hidden />}

      <header className="fc-presenter__header" data-testid="teacher-presenter-header">
        <div className="fc-presenter__brand">
          <button
            type="button"
            onClick={onExit}
            className="fc-presenter__exit"
            aria-label="Volver al panel del docente"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
          <div className="fc-presenter__titles">
            <span className="fc-presenter__eyebrow">{eyebrow}</span>
            <h1 className="fc-presenter__title">{title}</h1>
            {subtitle ? <p className="fc-presenter__subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <div className="fc-presenter__actions">
          <button
            type="button"
            onClick={() => setLaserPointer((v) => !v)}
            className={`fc-presenter__btn${laserPointer ? " is-active" : ""}`}
            aria-pressed={laserPointer}
            aria-label="Alternar puntero láser"
          >
            <MousePointerClick className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Puntero</span>
          </button>
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            className={`fc-presenter__btn${focusMode ? " is-active" : ""}`}
            aria-pressed={focusMode}
            aria-label="Modo proyección sin cromo"
          >
            <Focus className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Enfoque</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="fc-presenter__btn"
            aria-label="Alternar pantalla completa"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" aria-hidden />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden />
            )}
            <span className="hidden sm:inline">Pantalla completa</span>
          </button>
        </div>
      </header>

      {/* Full-width stage — no max-w postage stamp */}
      <main className="fc-presenter__main" data-testid="teacher-presenter-stage">
        <div className="fc-presenter__stage">{children}</div>
      </main>
    </div>
  );
}
