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
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-6xl w-full">
        {/* Book Cover */}
        <div className="relative order-2 lg:order-1">
          <img
            src="/art/hd/page-1.png"
            alt="La Cartilla de Gretel - Portada"
            className="w-64 sm:w-80 lg:w-96 h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
            style={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)",
              transform: "rotate(-2deg)",
            }}
          />
        </div>

        {/* Gretel Waving */}
        <div className="relative order-1 lg:order-2">
          <GretelStage size="lg" warmth={true}>
            <GretelGuide bubblePosition="left" />
          </GretelStage>
        </div>

        {/* CTA Button */}
        <div className="order-3 lg:order-3 mt-8 lg:mt-0">
          <Link
            to="/cartilla/student-login"
            className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ fontFamily: "'Fredoka', ui-rounded, system-ui, sans-serif" }}
          >
            ¡Comencemos!
          </Link>
        </div>
      </div>
    </main>
  );
}
