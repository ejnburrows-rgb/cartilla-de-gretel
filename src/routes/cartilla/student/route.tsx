import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import "@/styles/cartilla-student.css"; // Ensure this has our pastel CSS vars

export const Route = createFileRoute("/cartilla/student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <div className="cartilla-student-theme min-h-screen flex flex-col font-sans relative overflow-hidden bg-[var(--paper-bg, #fdfbf7)]">
      {/* Subtle paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <header className="relative z-10 bg-white/60 backdrop-blur-md border-b border-[var(--pastel-border, #ecdac3)] sticky top-0 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/cartilla" className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition">
            <ArrowLeft className="w-4 h-4" />
            Volver a Inicio
          </Link>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span className="font-black text-amber-900 tracking-tight">Mi Cuaderno Colorido</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
