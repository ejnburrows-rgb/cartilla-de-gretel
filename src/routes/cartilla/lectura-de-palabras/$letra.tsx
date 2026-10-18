import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LecturaPalabras } from "@/components/cartilla/lectura-palabras/LecturaPalabras";
import { LECTURA_ACTIVITIES } from "@/content/lectura-palabras/lectura-letras";

export const Route = createFileRoute("/cartilla/lectura-de-palabras/$letra")({
  component: LecturaPorLetra,
  head: () => ({
    meta: [{ title: "Lectura de palabras — La Cartilla de Gretel" }],
  }),
});

function LecturaPorLetra() {
  const { letra } = Route.useParams();
  const activity = LECTURA_ACTIVITIES[letra];

  if (!activity) {
    return (
      <main className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="kid-card p-6 text-center space-y-4">
          <p className="font-black text-stone-700">
            Esta letra todavía no tiene actividad de lectura de palabras.
          </p>
          <Link
            to="/cartilla/lectura-de-palabras"
            className="inline-flex items-center gap-2 font-bold text-primary underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Elegir otra letra
          </Link>
        </div>
      </main>
    );
  }

  return <LecturaPalabras activity={activity} />;
}
