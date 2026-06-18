import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { gretelEvent } from "@/lib/gretel-bus";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel" },
      {
        name: "description",
        content: "Libro de lectura para estudiantes de K-2 en Miami-Dade.",
      },
    ],
  }),
});

// A simple reusable video component for the living collage
function LivingVideo({ src, className }: { src: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-xl group cursor-pointer ${className || ''}`}>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
      />
    </div>
  );
}

function Landing() {
  useEffect(() => {
    gretelEvent("lesson:start");
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 lg:p-12 overflow-hidden">
      
      {/* Blurred Garden Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/cartilla/images/family-garden-bg.jpeg')",
          filter: "blur(12px) brightness(0.7)"
        }}
      />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-[1400px] w-full">
        
        {/* LEFT: Premium CRM Login Panel */}
        <div className="flex-1 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-16 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 text-center space-y-12">
            
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center shadow-inner mb-8">
                <span className="text-4xl">📖</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight drop-shadow-lg" style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}>
                La Cartilla de Gretel
              </h1>
              <p className="text-2xl text-white/90 font-medium tracking-wide">
                Bienvenido a la familia.
              </p>
            </div>

            <div className="flex flex-col gap-5 w-full mx-auto">
              <Link
                to="/cartilla/student-login"
                className="flex items-center justify-center px-8 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-2xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.6)] border border-amber-400/30"
                style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
              >
                Entrar como Estudiante
              </Link>
              
              <Link
                to="/login"
                className="flex items-center justify-center px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xl rounded-2xl shadow-lg transition-all border border-white/20 hover:-translate-y-1"
                style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
              >
                Portal para Maestros
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Big Family Composition Area */}
        <div className="flex-1 w-full max-w-3xl hidden lg:flex items-center justify-center relative">
          {/* This is where the transparent PNG characters will go */}
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Esperando recortes transparentes...</h3>
            <p className="text-white/80">
              Para que los animales y Gretel se mezclen perfectamente como "una gran familia" sobre el jardín borroso, 
              necesito que subas las imágenes de los personajes en formato <b>PNG transparente</b>.
            </p>
          </div>
        </div>
        
      </div>
    </main>
  );
}
