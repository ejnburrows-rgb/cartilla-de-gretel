import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { getStudentSession } from "@/lib/student-session";
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
    ],
  }),
});

function CartillaSplash() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center" style={{ background: "radial-gradient(circle, #e5c531 0%, #0d6b38 100%)" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      {/* 3D CSS Garden Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Sun */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse" />
        <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-400 rounded-full" />
        
        {/* Clouds */}
        <div className="absolute top-20 left-10 w-48 h-16 bg-white/80 rounded-full blur-md animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-1/4 w-32 h-12 bg-white/70 rounded-full blur-md animate-[float_14s_ease-in-out_infinite_reverse]" />
        
        {/* Rolling Hills (CSS curves) */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-emerald-400 [clip-path:ellipse(120%_100%_at_50%_100%)] shadow-inner" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[30vh] bg-green-500 [clip-path:ellipse(100%_100%_at_20%_100%)] opacity-80" />
        <div className="absolute bottom-0 left-[-20%] right-[-20%] h-[25vh] bg-emerald-600 [clip-path:ellipse(100%_100%_at_80%_100%)] opacity-60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 mt-10">
        
        {/* Bouncing Welcome Text */}
        <div className="flex space-x-2">
          {"GRETEL".split("").map((letter, i) => (
            <span
              key={i}
              className="font-fredoka text-6xl md:text-8xl font-black text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                WebkitTextStroke: "3px hsl(var(--primary))"
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        <h2 className="font-fredoka text-2xl md:text-3xl font-bold text-white drop-shadow-md text-center max-w-md px-4">
          ¡Bienvenidos al mundo mágico de las letras!
        </h2>

        {/* Gretel Mascot Image */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 animate-[float_6s_ease-in-out_infinite]">
          <img 
            src="/cartilla/art/faithful/gretel-poses/gretel-book-right.png" 
            alt="Gretel saludando"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Big Student "Entrar" Button */}
        <Link
          to="/cartilla/unirse"
          className="group relative inline-flex items-center justify-center px-12 py-6 font-fredoka font-black text-3xl text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:translate-y-0"
        >
          <span className="relative">¡ENTRAR!</span>
          <div className="absolute inset-0 h-full w-full rounded-full border-4 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
        </Link>
      </div>

      {/* Hidden/Subtle Teacher Padlock */}
      <div className="absolute bottom-6 right-6 z-20">
        <Link
          to="/cartilla/teacher"
          className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition shadow-sm inline-flex"
          aria-label="Acceso Profesores"
          title="Acceso Profesores"
        >
          <Lock className="w-5 h-5" />
        </Link>
      </div>
    </main>
  );
}
