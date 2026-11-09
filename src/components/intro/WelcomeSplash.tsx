import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GretelSceneMedia } from "@/components/gretel/GretelSceneMedia";
import { getCinematicById } from "@/content/gretel-cinematics";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { audioEngine } from "@/lib/audio-engine";
import { LivingBookCover } from "./LivingBookCover";
import "@/styles/welcome-splash.css";

export function WelcomeSplash() {
  const welcomeCinematic = getCinematicById("master-welcome");
  const [coverFailed, setCoverFailed] = useState(false);
  const showFallback = useCallback(() => setCoverFailed(true), []);
  const handleOpenBook = () => {
    audioEngine.playPageTurn(true);
  };

  return (
    <main
      className="lc-welcome"
      data-testid="welcome-splash"
      data-cover-failed={coverFailed || undefined}
    >
      <h1 className="lc-welcome__accessible-title">La Cartilla de Gretel</h1>
      <Link to="/cartilla/teacher/crm" className="lc-welcome__teacher-pill">
        Soy maestro
      </Link>
      <div className="lc-welcome__book-canvas">
        {/* Existing approved media remains a real fallback if the cover cannot load. */}
        <div className="lc-welcome__fallback" aria-hidden={!coverFailed}>
          <GretelSceneMedia
            video={welcomeCinematic?.video}
            fallback={GRETEL_APPROVED_MASTER_SRC}
            durationSeconds={6}
            loop
          />
        </div>
        {!coverFailed && (
          <>
            <LivingBookCover onError={showFallback} />
            <div className="lc-welcome__halo" aria-hidden="true" />
            <div className="lc-welcome__eyelids" aria-hidden="true">
              <svg viewBox="0 0 1086 1448" className="lc-welcome__eyelids-svg">
                <defs>
                  <linearGradient id="gretel-lid-left" x2="0" y2="1">
                    <stop stopColor="#f4d297" />
                    <stop offset="1" stopColor="#ffe9b5" />
                  </linearGradient>
                  <linearGradient id="gretel-lid-right" x2="0" y2="1">
                    <stop stopColor="#f6d69f" />
                    <stop offset="1" stopColor="#ffedc3" />
                  </linearGradient>
                </defs>
                <g className="lc-welcome__eyelid lc-welcome__eyelid--left">
                  <path
                    d="M465 861 Q482 851 504 871 Q485 882 468 872Z"
                    fill="url(#gretel-lid-left)"
                  />
                  <path
                    d="M468 869 Q486 878 502 870"
                    fill="none"
                    stroke="#65452b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
                <g className="lc-welcome__eyelid lc-welcome__eyelid--right">
                  <path
                    d="M529 872 Q546 858 564 871 Q550 885 531 879Z"
                    fill="url(#gretel-lid-right)"
                  />
                  <path
                    d="M531 875 Q548 883 563 872"
                    fill="none"
                    stroke="#65452b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
          </>
        )}
        <Link
          to="/cartilla/lecciones"
          className="lc-welcome__cover-link"
          onClick={handleOpenBook}
          aria-label="Abrir libro La Cartilla de Gretel"
        />
      </div>
      <nav className="lc-welcome__invitation" aria-label="Entrar">
        <p>¡Hola! Soy Gretel. Vamos a aprender a leer juntos.</p>
        <Link
          to="/cartilla/lecciones"
          data-testid="wc-entrar"
          className="lc-welcome__ribbon-btn"
          onClick={handleOpenBook}
        >
          Comenzar
        </Link>
      </nav>
    </main>
  );
}
