import { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2, MousePointerClick, X } from "lucide-react";

interface TeacherPresentationShellProps {
  children: React.ReactNode;
  accentColor?: string;
  onExit?: () => void;
  title?: string;
  subtitle?: string;
}

const shellClass = "fixed inset-0 w-screen h-screen overflow-hidden bg-stone-950 text-white flex flex-col z-50 select-none font-sans";
const headerClass = "no-print absolute top-6 inset-x-6 max-w-5xl mx-auto bg-stone-900/80 border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-500 z-50";
const actionBtnClass = "px-4 py-2.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/15 hover:border-white/10 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer";
const laserActiveBtnClass = "px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg";

export function TeacherPresentationShell({ children, accentColor, onExit }: TeacherPresentationShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserPointer, setLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Sync fullscreen state if changed externally
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // 2. Idle control bar hiding
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 3000);
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
  }, []);

  // 3. Laser Pointer position tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserPointer) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Strict double-brace JSX styling ban compliance
  const activeLaserStyle = {
    borderColor: accentColor,
    backgroundColor: `${accentColor}20`,
    color: accentColor,
  };

  const laserPointerDotStyle = {
    left: `${laserPos.x}px`,
    top: `${laserPos.y}px`,
    boxShadow: `0 0 20px 4px ${accentColor}`,
    backgroundColor: accentColor,
  };

  const headerOpacityClass = isIdle ? "opacity-0 pointer-events-none" : "opacity-100";

  return (
    <div className={shellClass} onMouseMove={handleMouseMove}>
      {/* Laser Pointer overlay */}
      {laserPointer && (
        <div 
          className="fixed pointer-events-none w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-75"
          style={laserPointerDotStyle}
        />
      )}

      {/* Slide Navigation Header */}
      <header className={`${headerClass} ${headerOpacityClass}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-3 rounded-2xl border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white/80 transition-all cursor-pointer"
            aria-label="Salir de la presentación"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
              Pantalla del Maestro
            </span>
            <span className="text-xs font-bold text-white">Presentación en Pizarra Digital</span>
          </div>
        </div>

        {/* Display actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLaserPointer(!laserPointer)}
            className={laserPointer ? laserActiveBtnClass : actionBtnClass}
            style={laserPointer ? activeLaserStyle : undefined}
            aria-label="Alternar puntero láser interactivo"
          >
            <MousePointerClick className="w-4 h-4" />
            Puntero Láser
          </button>

          <button
            onClick={toggleFullscreen}
            className={actionBtnClass}
            aria-label="Alternar pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            Pantalla Completa
          </button>
        </div>
      </header>

      {/* Main Slide canvas */}
      <main className="flex-1 w-full h-full flex items-center justify-center p-6 mt-16 select-none relative">
        <div className="w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] bg-stone-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative">
          {children}
        </div>
      </main>
    </div>
  );
}
