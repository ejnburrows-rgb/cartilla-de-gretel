import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Lock, CircleHelp } from "lucide-react";
import { getStudentSession } from "@/lib/student-session";
import { GRETEL_HERO } from "@/components/gretel/gretelPoses";
import "@/styles/interactive-exercises.css";
import "@/styles/gretel.css";

export const Route = createFileRoute("/cartilla/")({
  beforeLoad: () => {
    // If the student is already logged in, skip the splash screen and go straight to their lessons.
    const session = getStudentSession();
    if (session) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
  component: CartillaSplash,
  head: () => ({
    meta: [
      { title: "Entrar — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "La Cartilla de Gretel — cuaderno de lectura en español para K-3. Entra con el código de clase.",
      },
    ],
  }),
});

function CartillaSplash() {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)" }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-float, .splash-letter-bounce, .splash-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* Decorative garden background (non-interactive) */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="splash-pulse absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse" />
        <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-400 rounded-full" />
        <div className="splash-float absolute top-20 left-10 w-48 h-16 bg-white/80 rounded-full blur-md animate-[float_10s_ease-in-out_infinite]" />
        <div className="splash-float absolute top-40 right-1/4 w-32 h-12 bg-white/70 rounded-full blur-md animate-[float_14s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-emerald-400 [clip-path:ellipse(120%_100%_at_50%_100%)] shadow-inner" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[30vh] bg-green-500 [clip-path:ellipse(100%_100%_at_20%_100%)] opacity-80" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[25vh] bg-emerald-600 [clip-path:ellipse(100%_100%_at_80%_100%)] opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 md:space-y-8 mt-8 px-4">
        <h1 className="sr-only">La Cartilla de Gretel</h1>
        <div className="flex space-x-1 md:space-x-2" aria-hidden="true">
          {"GRETEL".split("").map((letter, i) => (
            <span
              key={i}
              className="splash-letter-bounce font-fredoka text-5xl md:text-8xl font-black text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                WebkitTextStroke: "3px hsl(var(--primary))",
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        <p className="font-fredoka text-xl md:text-3xl font-bold text-white drop-shadow-md text-center max-w-md">
          ¡Bienvenidos al mundo mágico de las letras!
        </p>

        {/* Premium hero — real Gretel artwork (not a broken path) */}
        <div className="splash-float relative w-56 h-72 md:w-72 md:h-96 animate-[float_6s_ease-in-out_infinite]">
          <img
            src={GRETEL_HERO.src}
            srcSet={`${GRETEL_HERO.src} 1x, ${GRETEL_HERO.src2x} 2x`}
            alt={GRETEL_HERO.altEs}
            width={640}
            height={853}
            className="w-full h-full object-contain drop-shadow-2xl"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <Link
          to="/cartilla/unirse"
          className="group relative inline-flex items-center justify-center min-h-14 min-w-[12rem] px-12 py-5 font-fredoka font-black text-2xl md:text-3xl text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:translate-y-0"
        >
          <span className="relative">¡ENTRAR!</span>
        </Link>
      </div>

      {/* Help + teacher access — 44px+ targets, labeled */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-between px-6">
        <Link
          to="/cartilla/ayuda"
          className="min-h-12 min-w-12 px-4 py-3 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full text-white font-bold transition shadow-sm inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"
          aria-label="Ayuda para estudiantes, familias y docentes"
        >
          <CircleHelp className="w-5 h-5 shrink-0" aria-hidden="true" />
          Ayuda
        </Link>
        <Link
          to="/cartilla/teacher"
          className="min-h-12 min-w-12 p-3 bg-white/25 hover:bg-white/45 backdrop-blur-sm rounded-full text-white transition shadow-sm inline-flex items-center justify-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"
          aria-label="Acceso para profesores"
          title="Acceso para profesores"
        >
          <Lock className="w-5 h-5" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
