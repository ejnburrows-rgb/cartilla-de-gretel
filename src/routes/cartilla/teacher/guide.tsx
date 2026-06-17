import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  ChevronLeft,
  Users2,
  ClipboardList,
  BarChart3,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/guide")({
  component: TeacherGuide,
  head: () => ({
    meta: [{ title: "Guía del Maestro — La Cartilla de Gretel" }],
  }),
});

interface GuideSquare {
  icon: React.ReactNode;
  title: string;
  color: string;
  textColor: string;
  steps: string[];
  fyi: string;
}

const SQUARES: GuideSquare[] = [
  {
    icon: <Users2 className="w-9 h-9" />,
    title: "Primeros pasos",
    color: "#406c72",
    textColor: "#1a2e31",
    steps: [
      "Crea una clase desde \"Mis Alumnos\" → Mis clases.",
      "Copia el código de unión de la clase.",
      "Comparte el código con tus alumnos: lo introducen junto con su código personal para entrar.",
    ],
    fyi: "Cada alumno también recibe un código personal — úsalo si olvida el suyo (búscalo por nombre en \"Mis Alumnos\").",
  },
  {
    icon: <ClipboardList className="w-9 h-9" />,
    title: "Asignar lecciones y tareas",
    color: "#d99c30",
    textColor: "#5c3d07",
    steps: [
      "En \"Mis Alumnos\", asigna una lección específica con fecha de entrega y, si quieres, un tiempo límite.",
      "Tus alumnos la verán automáticamente al abrir esa lección en su cartilla.",
      "Para grupos pequeños o tarea adicional, asígnala manualmente por nombre.",
    ],
    fyi: "Las páginas 91-92 (sílabas y trabajo extra de la Lección 24) no aparecen en la cartilla del alumno — son material complementario que tú asignas a mano, como tarea o en grupos pequeños.",
  },
  {
    icon: <BarChart3 className="w-9 h-9" />,
    title: "Seguir el progreso",
    color: "#b8311a",
    textColor: "#4a1009",
    steps: [
      "El panel de progreso muestra qué alumnos completaron cada lección y el % de aciertos de la clase.",
      "Cada alumno tiene su propio detalle: ejercicios, tiempo total, insignias y nivel adaptativo actual.",
      "Exporta a CSV cuando necesites compartir el avance con la escuela o la familia.",
    ],
    fyi: "El progreso se guarda en la nube en cuanto el alumno termina una lección — no depende de que use el mismo dispositivo.",
  },
  {
    icon: <Layers className="w-9 h-9" />,
    title: "Material para el aula",
    color: "#6a7a60",
    textColor: "#28301e",
    steps: [
      "\"Presentar\" abre el rotafolio en alta definición para proyectar en clase, página por página.",
      "\"Imprimir\" genera fichas de trabajo y materiales listos para imprimir.",
      "Usa el rotafolio para introducir una lección en grupo antes de que los alumnos la trabajen solos.",
    ],
    fyi: "El rotafolio y la cartilla del alumno muestran siempre el mismo contenido — son dos formas de ver las mismas 92 páginas.",
  },
];

function TeacherGuide() {
  return (
    <div
      className="w-full min-h-screen py-16 px-6"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, #fdf3e0 0%, #f5e8c8 60%, #ecdaaa 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <Link
          to="/cartilla/teacher"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-10 text-[#6a7a60] hover:text-[#3a4a30] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="text-center mb-14">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 shadow-md"
            style={{ backgroundColor: "#6a7a6020", border: "3px solid #6a7a60" }}
          >
            <BookOpenCheck className="w-10 h-10" style={{ color: "#6a7a60" }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ color: "#3b2a12" }}>
            Guía del Maestro
          </h1>
          <p className="text-lg font-semibold" style={{ color: "#7a6040" }}>
            Cómo usar La Cartilla de Gretel con tu clase
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SQUARES.map((square) => (
            <GuideCard key={square.title} square={square} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GuideCard({ square }: { square: GuideSquare }) {
  return (
    <div
      className="relative flex flex-col p-7 rounded-3xl overflow-hidden"
      style={{
        backgroundColor: "#fffdf7",
        border: `3px solid ${square.color}`,
        boxShadow: `0 8px 24px ${square.color}33`,
      }}
    >
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ backgroundColor: `${square.color}22`, color: square.textColor }}
      >
        {square.icon}
      </div>

      <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ color: square.textColor }}>
        {square.title}
      </h2>

      <ol className="space-y-2 mb-5 list-decimal list-inside">
        {square.steps.map((step) => (
          <li key={step} className="text-sm font-semibold leading-snug" style={{ color: "#3b3b30" }}>
            {step}
          </li>
        ))}
      </ol>

      <div
        className="mt-auto pt-4 text-xs font-bold leading-snug rounded-xl px-4 py-3"
        style={{ backgroundColor: `${square.color}14`, color: square.textColor }}
      >
        FYI: {square.fyi}
      </div>
    </div>
  );
}
