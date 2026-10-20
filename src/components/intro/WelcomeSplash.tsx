import { Link } from "@tanstack/react-router";
import { GretelSceneMedia } from "@/components/gretel/GretelSceneMedia";
import { getCinematicById } from "@/content/gretel-cinematics";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import "@/styles/welcome-splash.css";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipForward } from "lucide-react";

export function WelcomeSplash() {
  const welcomeCinematic = getCinematicById("master-welcome");

  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check reduced motion
    let mediaQuery: MediaQueryList | null = null;
    let handler: ((e: MediaQueryListEvent) => void) | null = null;

    if (typeof window !== "undefined" && window.matchMedia) {
      mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
    }

    // Check if video exists
    // Since this is Vite, a missing file in public/ will return index.html (200 OK) with Content-Type text/html.
    // We can check the Content-Type to see if it's actually a video.
    fetch("/video/welcome.mp4", { method: "HEAD" })
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("video")) {
          setHasVideo(true);
        } else {
          setHasVideo(false);
        }
      })
      .catch(() => setHasVideo(false));

    return () => {
      if (mediaQuery && handler) {
        mediaQuery.removeEventListener("change", handler);
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsSkipped(true);
  };

  const renderMedia = () => {
    // Behavior:
    // 1. File exists, reduced motion -> Poster only
    // 2. File exists, motion enabled -> Player
    // 3. File doesn't exist -> Original GretelSceneMedia

    if (hasVideo === null) {
      // Loading state, just show the poster frame transparently
      return (
        <img
          src={GRETEL_APPROVED_MASTER_SRC}
          alt="Gretel"
          style={{ opacity: 0 }}
        />
      );
    }

    if (hasVideo) {
      if (prefersReducedMotion) {
        return (
          <img
            src={GRETEL_APPROVED_MASTER_SRC}
            alt="Gretel"
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center" }}
          />
        );
      }

      if (isSkipped) {
         return (
          <img
            src={GRETEL_APPROVED_MASTER_SRC}
            alt="Gretel"
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center" }}
          />
        );
      }

      return (
        <div className="relative w-full h-full flex flex-col justify-end group">
          <video
            ref={videoRef}
            src="/video/welcome.mp4"
            poster={GRETEL_APPROVED_MASTER_SRC}
            className="w-full h-full object-contain object-bottom"
            onEnded={() => setIsSkipped(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
          />
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-700"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-700"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-2" />
            <button
              onClick={skipVideo}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-700 flex items-center gap-2 font-bold text-sm"
              aria-label="Omitir"
            >
              Omitir <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <GretelSceneMedia
        video={welcomeCinematic?.video}
        fallback={GRETEL_APPROVED_MASTER_SRC}
        durationSeconds={6}
        loop
      />
    );
  };

  return (
    <main className="lc-welcome" data-testid="welcome-splash">
      <div className="lc-welcome__wave" aria-hidden />
      <div className="lc-welcome__inner">
        <div className="lc-welcome__gretel">
          {renderMedia()}
        </div>
        <section className="lc-welcome__copy" aria-labelledby="lc-welcome-title">
          <h1 id="lc-welcome-title">La Cartilla de <span>Gretel</span></h1>
          <p>¡Hola! Soy Gretel. Vamos a aprender a leer juntos.</p>
          <nav className="lc-welcome__actions" aria-label="Entrar">
            <Link to="/cartilla/lecciones" className="lc-button lc-button--primary" data-testid="wc-entrar">Comenzar</Link>
            <Link to="/cartilla/teacher/crm" className="lc-button lc-button--teacher">Soy maestro</Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
