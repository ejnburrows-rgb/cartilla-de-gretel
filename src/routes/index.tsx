import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap, User } from "lucide-react";
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
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(180deg, #fffaf6 0%, #fbf1e6 100%)" }}
    >
      <div className="flex flex-col items-center w-full max-w-sm">
        <GretelStage size="md" warmth={true}>
          <GretelGuide bubblePosition="top" />
        </GretelStage>

        <h1
          className="mt-6 text-3xl font-black text-center"
          style={{ color: "#4a1009", fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
        >
          La Cartilla de Gretel
        </h1>
        <p className="mt-1 text-sm font-semibold text-center" style={{ color: "#9a6a55" }}>
          Lectura en español para niños de K-2
        </p>

        <div className="mt-10 w-full flex flex-col gap-3">
          <Link
            to="/login"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "#b8311a30" }}
          >
            <span
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#b8311a18", color: "#b8311a" }}
            >
              <GraduationCap className="w-6 h-6" />
            </span>
            <span className="text-left">
              <span className="block font-bold" style={{ color: "#4a1009" }}>
                Soy maestro/a
              </span>
              <span className="block text-xs font-semibold" style={{ color: "#9a6a55" }}>
                Gestiona tus clases y el progreso de tus alumnos
              </span>
            </span>
          </Link>

          <Link
            to="/cartilla/unirse"
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "#406c7230" }}
          >
            <span
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#406c7218", color: "#406c72" }}
            >
              <User className="w-6 h-6" />
            </span>
            <span className="text-left">
              <span className="block font-bold" style={{ color: "#1a2e31" }}>
                Soy estudiante
              </span>
              <span className="block text-xs font-semibold" style={{ color: "#3a5a5e" }}>
                Únete a tu clase con el código de tu maestro/a
              </span>
            </span>
          </Link>
        </div>

        <Link
          to="/cartilla"
          className="mt-8 text-xs font-bold underline"
          style={{ color: "#9a6a55" }}
        >
          Ver todo el menú
        </Link>
      </div>
    </main>
  );
}
