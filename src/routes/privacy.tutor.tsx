import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

// NOTE (milestone 6): routeTree.gen.ts is owned by the screens lane and is
// regenerated at integration; a typecheck flag on this file's route
// registration is expected until then.
export const Route = createFileRoute("/privacy/tutor")({
  component: TutorPrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacidad — Tutor de Gretel — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Qué datos recoge el Tutor de La Cartilla de Gretel: solo eventos de progreso, sin audio ni nombres.",
      },
    ],
  }),
});

function TutorPrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" /> Inicio
        </Link>

        <header className="mt-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-4xl font-black">Privacidad del Tutor — La Cartilla de Gretel</h1>
        </header>

        {/* Español */}
        <section className="kid-card mt-10 space-y-6 p-8">
          <div>
            <h2 className="text-xl font-black">Qué se recoge</h2>
            <p className="mt-2 text-foreground/80">
              El Tutor solo registra eventos de progreso de cada ítem terminado, con estos campos y
              ningún otro:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-foreground/80">
              <li>
                <b>session_id</b> — identificador anónimo de la sesión (derivado del código de la
                clase y del puesto; no es secreto: quien sepa el código de la clase puede
                calcularlo).
              </li>
              <li>
                <b>lesson_id</b> — lección (1, 2 o 3).
              </li>
              <li>
                <b>item_id</b> — ítem de la lección (por ejemplo, una palabra).
              </li>
              <li>
                <b>result</b> — resultado: correcto, correcto tras reintentar, o no logrado.
              </li>
              <li>
                <b>attempts</b> — número de intentos (1 a 3).
              </li>
              <li>
                <b>created_at</b> — fecha y hora del evento.
              </li>
            </ul>
            <p className="mt-3 text-foreground/80">
              Nunca se guardan nombres, audio ni transcripciones.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Audio</h2>
            <p className="mt-2 text-foreground/80">
              La voz del niño se procesa en el dispositivo y nunca se guarda ni se envía
              (reconocimiento local únicamente).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Dónde se guardan los datos</h2>
            <p className="mt-2 text-foreground/80">
              Los eventos de progreso se guardan solo en este dispositivo (almacenamiento local del
              navegador). No se envían a ningún servidor.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Retención</h2>
            <p className="mt-2 text-foreground/80">[OWNER TO SET]</p>
          </div>

          <div>
            <h2 className="text-xl font-black">Contacto</h2>
            <p className="mt-2 text-foreground/80">[OWNER TO SET]</p>
          </div>

          <div>
            <h2 className="text-xl font-black">Analítica y cookies</h2>
            <p className="mt-2 text-foreground/80">
              El Tutor no usa analítica ni cookies de terceros.
            </p>
          </div>
        </section>

        {/* English */}
        <section className="kid-card mt-6 space-y-6 p-8">
          <h2 className="text-xl font-black">English</h2>

          <div>
            <h3 className="text-lg font-bold">What is collected</h3>
            <p className="mt-2 text-foreground/80">
              The Tutor records progress events only, one per finished item, with these fields and
              nothing else:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-foreground/80">
              <li>
                <b>session_id</b> — anonymous session identifier (derived from the class code and
                the seat slot; it is anonymous, not secret: anyone who knows the class code can
                compute it).
              </li>
              <li>
                <b>lesson_id</b> — lesson (1, 2, or 3).
              </li>
              <li>
                <b>item_id</b> — lesson item (for example, a word).
              </li>
              <li>
                <b>result</b> — correct, correct after retry, or missed.
              </li>
              <li>
                <b>attempts</b> — number of attempts (1 to 3).
              </li>
              <li>
                <b>created_at</b> — event date and time.
              </li>
            </ul>
            <p className="mt-3 text-foreground/80">
              Names, audio, and transcripts are never stored.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Audio</h3>
            <p className="mt-2 text-foreground/80">
              The child's voice is processed on the device and is never stored or sent anywhere
              (on-device recognition only).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Where data is stored</h3>
            <p className="mt-2 text-foreground/80">
              Progress events are stored on this device only (the browser's local storage). They are
              not sent to any server.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Retention</h3>
            <p className="mt-2 text-foreground/80">[OWNER TO SET]</p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Contact</h3>
            <p className="mt-2 text-foreground/80">[OWNER TO SET]</p>
          </div>

          <div>
            <h3 className="text-lg font-bold">Analytics and cookies</h3>
            <p className="mt-2 text-foreground/80">
              The Tutor uses no analytics and no third-party cookies.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
