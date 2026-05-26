import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  Home,
  MonitorPlay,
  Shrink,
} from "lucide-react";
import { getCartillaCrmCssVars } from "@/lib/cartilla-crm-theme";
import { cn } from "@/lib/utils";
import "@/styles/kiosko.css";

type KioskoShellProps = {
  lessonNumber?: number;
  title: string;
  subtitle?: string;
  pages?: string;
  progressLabel?: string;
  progressValue?: number;
  backTo?: string;
  backLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  children: ReactNode;
};

const NEXT_KEYS = new Set([
  "ArrowRight",
  "ArrowDown",
  "PageDown",
  " ",
  "Enter",
  "MediaTrackNext",
]);

const PREVIOUS_KEYS = new Set([
  "ArrowLeft",
  "ArrowUp",
  "PageUp",
  "Backspace",
  "MediaTrackPrevious",
]);

function clampProgress(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.min(100, Math.max(0, value));
}

function isControlTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "button,a,input,select,textarea,[role='button'],[data-kiosko-control='true']",
    ),
  );
}

export function KioskoShell({
  lessonNumber = 1,
  title,
  subtitle,
  pages,
  progressLabel,
  progressValue,
  backTo = "/cartilla/lecciones",
  backLabel = "Indice",
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
  onPrevious,
  onNext,
  children,
}: KioskoShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const progress = clampProgress(progressValue);

  const style = useMemo<CSSProperties>(
    () => getCartillaCrmCssVars(lessonNumber),
    [lessonNumber],
  );

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const resetIdle = () => {
      setControlsHidden(false);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setControlsHidden(true), 3200);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }
      if (NEXT_KEYS.has(event.key) && onNext) {
        event.preventDefault();
        onNext();
        return;
      }
      if (PREVIOUS_KEYS.has(event.key) && onPrevious) {
        event.preventDefault();
        onPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("pointerdown", resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("pointerdown", resetIdle);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [onNext, onPrevious]);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }

  const handleStageClick = (event: PointerEvent<HTMLElement>) => {
    if (!onNext || isControlTarget(event.target)) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    onNext();
  };

  return (
    <section className="kiosko-shell cartilla-theme-transition" style={style}>
      <header
        className={cn("kiosko-topbar", controlsHidden && "kiosko-topbar--idle")}
        data-kiosko-control="true"
      >
        <a href={backTo} className="kiosko-home-link" aria-label={backLabel}>
          <Home aria-hidden className="kiosko-icon" />
          <span>{backLabel}</span>
        </a>

        <div className="kiosko-title-block">
          <div className="kiosko-eyebrow">
            <MonitorPlay aria-hidden className="kiosko-icon" />
            <span>Modo salon</span>
            {pages ? <span>Paginas {pages}</span> : null}
            {progressLabel ? <span>{progressLabel}</span> : null}
          </div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <button
          type="button"
          className="kiosko-icon-button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Shrink aria-hidden /> : <Expand aria-hidden />}
        </button>
      </header>

      {typeof progress === "number" ? (
        <div className="kiosko-progress" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <main className="kiosko-stage" onPointerUp={handleStageClick}>
        {children}
      </main>

      <nav
        className={cn("kiosko-controls", controlsHidden && "kiosko-controls--idle")}
        data-kiosko-control="true"
        aria-label="Controles de presentacion"
      >
        <button
          type="button"
          className="kiosko-nav-button kiosko-nav-button--secondary"
          onClick={onPrevious}
          disabled={!onPrevious}
        >
          <ArrowLeft aria-hidden />
          <span>{previousLabel}</span>
        </button>
        <button type="button" className="kiosko-nav-button" onClick={onNext} disabled={!onNext}>
          <span>{nextLabel}</span>
          <ArrowRight aria-hidden />
        </button>
      </nav>
    </section>
  );
}
