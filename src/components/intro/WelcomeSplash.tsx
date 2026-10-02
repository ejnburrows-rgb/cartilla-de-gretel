import { Link } from "@tanstack/react-router";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import "@/styles/welcome-splash.css";

export function WelcomeSplash() {
  return (
    <main className="lc-welcome" data-testid="welcome-splash">
      <div className="lc-welcome__wave" aria-hidden />
      <div className="lc-welcome__inner">
        <div className="lc-welcome__gretel">
          <img src={GRETEL_APPROVED_MASTER_SRC} alt="Gretel" draggable={false} />
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
