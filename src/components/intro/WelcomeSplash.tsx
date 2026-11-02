import { Link } from "@tanstack/react-router";
import { GretelSceneMedia } from "@/components/gretel/GretelSceneMedia";
import { getCinematicById } from "@/content/gretel-cinematics";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { audioEngine } from "@/lib/audio-engine";
import "@/styles/welcome-splash.css";

export function WelcomeSplash() {
  const welcomeCinematic = getCinematicById("master-welcome");

  const handleOpenBook = () => {
    audioEngine.playPageTurn(true);
  };

  return (
    <main className="lc-welcome" data-testid="welcome-splash">
      <div className="lc-welcome__wave" aria-hidden />
      <div className="lc-welcome__inner">
        <div className="lc-welcome__stage">
          <div className="lc-welcome__book-wrapper" aria-hidden="true" onClick={handleOpenBook}>
            <div className="lc-welcome__book-spine" />
            <div className="lc-welcome__book-cover" />
            <div className="lc-welcome__book-shadow" />
          </div>
          <div className="lc-welcome__gretel">
            <GretelSceneMedia
              video={welcomeCinematic?.video}
              fallback={GRETEL_APPROVED_MASTER_SRC}
              durationSeconds={6}
              loop
            />
          </div>
        </div>
        <section className="lc-welcome__copy" aria-labelledby="lc-welcome-title">
          <h1 id="lc-welcome-title">La Cartilla de <span>Gretel</span></h1>
          <p>¡Hola! Soy Gretel. Vamos a aprender a leer juntos.</p>
          <nav className="lc-welcome__actions" aria-label="Entrar">
            <Link
              to="/cartilla/lecciones"
              className="lc-button lc-button--primary"
              data-testid="wc-entrar"
              onClick={handleOpenBook}
            >
              Comenzar
            </Link>
            <Link to="/cartilla/teacher/crm" className="lc-button lc-button--teacher">
              Soy maestro
            </Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
