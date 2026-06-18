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

function Landing() {
  useEffect(() => {
    gretelEvent("lesson:start");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] overflow-hidden">
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl w-full">
        
        {/* Authentic Artwork Framed (No stretching!) */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <img 
            src="/art/hd/gretel-authentic.jpg" 
            alt="La Cartilla de Gretel Original"
            className="relative rounded-3xl shadow-2xl border-[8px] border-white/10 w-auto max-h-[60vh] object-contain transform transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>

        {/* UI Panel */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 sm:p-14 shadow-2xl border border-white/20 max-w-xl w-full text-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-black text-white drop-shadow-md" style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}>
              La Cartilla de Gretel
            </h1>
            <p className="text-2xl text-white/90 font-medium">
              Selecciona cómo deseas entrar:
            </p>
          </div>

          <div className="flex flex-col gap-5 w-full max-w-sm mx-auto">
            <Link
              to="/cartilla/student-login"
              className="flex items-center justify-center px-8 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-2xl rounded-2xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-amber-500/30"
              style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
            >
              Estudiante
            </Link>
            
            <Link
              to="/login"
              className="flex items-center justify-center px-8 py-5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-2xl rounded-2xl shadow-lg transition-all border border-white/20 hover:-translate-y-1"
              style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
            >
              Maestro / Padre
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
