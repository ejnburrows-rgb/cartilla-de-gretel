/**
 * Teacher Resource Hub — four color-coded entry points.
 * CRM (groups/students/progress) lives behind "Mis Alumnos" → /cartilla/teacher/crm
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { MonitorPlay, Users, BookOpenCheck, Printer } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/")({
  component: TeacherHub,
  head: () => ({
    meta: [{ title: "Recursos del Maestro — La Cartilla de Gretel" }],
  }),
});

interface HubBox {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  textColor: string;
  to: string;
}

const BOXES: HubBox[] = [
  {
    icon: <MonitorPlay className="w-12 h-12" />,
    title: "Presentar",
    subtitle: "Rotafolio HD para proyectar en el aula",
    color: "#d99c30",
    textColor: "#5c3d07",
    to: "/cartilla/teacher/flipchart",
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Mis Alumnos",
    subtitle: "Grupos, progreso y registro de clase",
    color: "#406c72",
    textColor: "#1a2e31",
    to: "/cartilla/teacher/crm",
  },
  {
    icon: <BookOpenCheck className="w-12 h-12" />,
    title: "Guía del Maestro",
    subtitle: "Planes de clase y notas pedagógicas",
    color: "#6a7a60",
    textColor: "#28301e",
    to: "/cartilla/teacher/guide",
  },
  {
    icon: <Printer className="w-12 h-12" />,
    title: "Imprimir",
    subtitle: "Fichas de trabajo y materiales imprimibles",
    color: "#b8311a",
    textColor: "#4a1009",
    to: "/cartilla/teacher/print",
  },
];

function TeacherHub() {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-start py-16 px-6"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, #fdf3e0 0%, #f5e8c8 60%, #ecdaaa 100%)",
      }}
    >
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 shadow-md"
          style={{ backgroundColor: "#d99c3020", border: "3px solid #d99c30" }}
        >
          <span className="text-4xl font-black" style={{ color: "#d99c30" }}>G</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3" style={{ color: "#3b2a12" }}>
          Centro de Recursos
        </h1>
        <p className="text-xl font-semibold" style={{ color: "#7a6040" }}>
          La Cartilla de Gretel · Maestro
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {BOXES.map((box) => (
          <HubCard key={box.title} box={box} />
        ))}
      </div>
    </div>
  );
}

function HubCard({ box }: { box: HubBox }) {
  return (
    <Link
      to={box.to as "/cartilla/teacher/flipchart" | "/cartilla/teacher/crm" | "/cartilla/teacher/guide" | "/cartilla/teacher/print"}
      className="group relative flex flex-col items-start p-8 rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
      style={{
        backgroundColor: box.color,
        boxShadow: `0 8px 32px ${box.color}55, 0 2px 8px rgba(0,0,0,0.12)`,
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: box.textColor }}
      />

      <div className="relative z-10" style={{ color: box.textColor, opacity: 0.85 }}>
        {box.icon}
      </div>

      <h2
        className="relative z-10 text-3xl font-black mt-5 mb-2 tracking-tight"
        style={{ color: "#fff", textShadow: `0 1px 4px ${box.textColor}55` }}
      >
        {box.title}
      </h2>
      <p className="relative z-10 text-base font-semibold leading-snug" style={{ color: "#ffffffcc" }}>
        {box.subtitle}
      </p>

      <div
        className="relative z-10 mt-6 self-end text-3xl font-black opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
        style={{ color: "#fff" }}
      >
        →
      </div>
    </Link>
  );
}
