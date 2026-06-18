import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/print")({
  component: TeacherPrint,
  head: () => ({
    meta: [{ title: "Imprimir — La Cartilla de Gretel" }],
  }),
});

function TeacherPrint() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-center">
      <Link
        to="/cartilla/teacher"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 text-[#b8311a] hover:text-[#7a1a08] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "#b8311a20", border: "3px solid #b8311a" }}
      >
        <Printer className="w-10 h-10" style={{ color: "#b8311a" }} />
      </div>
      <h1 className="text-4xl font-black mb-4" style={{ color: "#4a1009" }}>Imprimir</h1>
      <p className="text-lg font-semibold" style={{ color: "#b8311a" }}>
        PLACEHOLDER_CONTENT — Las fichas de trabajo imprimibles estarán disponibles próximamente.
      </p>
    </div>
  );
}
