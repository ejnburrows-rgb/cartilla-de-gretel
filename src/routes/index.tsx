import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { GretelGuide } from "@/components/gretel/GretelGuide";
import { GretelStage } from "@/components/gretel/GretelStage";
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
    <main className="desk-scene min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-4xl w-full text-center">
        {/* Gretel */}
        <div className="relative">
          <GretelStage size="lg" warmth={true}>
            <GretelGuide bubblePosition="top" />
          </GretelStage>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(197,41%,22%)]" style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}>
            La Cartilla de Gretel
          </h1>
          <p className="text-xl text-[hsl(197,41%,22%)]/80 font-bold">
            Selecciona cómo deseas entrar:
          </p>
        </div>

        {/* Login Split Options */}
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          <Link
            to="/cartilla/student-login"
            className="flex items-center justify-center px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl w-64"
            style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
          >
            Estudiante
          </Link>
          
          <Link
            to="/login"
            className="flex items-center justify-center px-8 py-4 bg-[hsl(197,41%,22%)] hover:bg-[hsl(197,41%,15%)] text-white font-bold text-xl rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl w-64"
            style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
          >
            Maestro / Padre
          </Link>
        </div>
      </div>
    </main>
  );
}
