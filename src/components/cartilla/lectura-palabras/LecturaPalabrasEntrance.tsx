// LecturaPalabrasEntrance.tsx — the "Lectura de palabras" entrance screen.
//
// The child picks a letter before the activity starts. Mm is the first letter
// with teacher source material; every other letter of the Cartilla's own
// teaching order (src/data/lessons.json) is shown but disabled and labeled
// "Pendiente" until its source file exists. Nothing beyond Mm is invented.
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import { LECTURA_LETTERS } from "@/content/lectura-palabras/lectura-letras";

export function LecturaPalabrasEntrance() {
  return (
    <main className="min-h-screen px-4 py-6 sm:py-10 relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div className="flex justify-start">
          <Link
            to="/cartilla/practica"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
            aria-label="Volver a práctica"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Práctica
          </Link>
        </div>
        <div className="flex justify-center">
          <GretelMascot
            pose="welcome"
            text="¡Elige una letra para leer palabras!"
            bubblePosition="top"
          />
        </div>

        <section className="kid-card p-5 sm:p-7 space-y-5" aria-label="Elige una letra">
          <h1 className="text-center text-2xl font-black text-stone-800 sm:text-3xl">
            Lectura de palabras
          </h1>
          <p className="text-center text-sm font-bold text-stone-600 sm:text-base">
            Toca tu letra para empezar.
          </p>

          <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {LECTURA_LETTERS.map(({ letter, available }) =>
              available ? (
                <li key={letter}>
                  <Link
                    to="/cartilla/lectura-de-palabras/$letra"
                    params={{ letra: letter[0].toLowerCase() }}
                    className="flex aspect-square min-h-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-2xl font-black text-primary transition-colors hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label={`Leer palabras con la letra ${letter}`}
                  >
                    {letter}
                  </Link>
                </li>
              ) : (
                <li key={letter}>
                  <button
                    type="button"
                    disabled
                    aria-label={`Letra ${letter} pendiente`}
                    className="flex aspect-square min-h-16 w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-2xl font-black text-stone-300"
                  >
                    {letter}
                    <span className="text-[10px] font-bold uppercase tracking-wide">Pendiente</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
