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
    <main className="min-h-screen flex items-center justify-center p-4 lg:p-12 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] overflow-hidden">
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-[1400px] w-full">
        
        {/* LEFT: Premium CRM Login Panel */}
        <div className="flex-1 w-full max-w-xl">
          <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-16 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 text-center space-y-12">
            
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center shadow-inner mb-8">
                <img src="/art/hd/page-1.png" alt="Icon" className="w-16 h-16 object-contain drop-shadow-lg" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
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

        {/* RIGHT: Big Family "Living Collage" */}
        <div className="flex-1 w-full max-w-3xl hidden lg:block perspective-1000">
          <div className="grid grid-cols-2 gap-6 p-6 transform rotate-y-[-10deg] rotate-x-[5deg] scale-105 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-1000 ease-out">
            
            <div className="flex flex-col gap-6 pt-12">
              <LivingVideo src="/art/animated/page-202606180716.mp4" className="aspect-[4/5] shadow-2xl" />
              <LivingVideo src="/art/animated/page-14.mp4" className="aspect-square shadow-2xl" />
            </div>

            <div className="flex flex-col gap-6">
              <LivingVideo src="/art/animated/page-33.mp4" className="aspect-square shadow-2xl" />
              <LivingVideo src="/art/animated/page-21.mp4" className="aspect-[4/5] shadow-2xl" />
            </div>

          </div>
        </div>
        
      </div>
    </main>
  );
}
