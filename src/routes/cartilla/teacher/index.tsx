/**
 * Teacher home — the first thing a teacher sees after signing in. Two
 * layers: a row of primary task entry points (every core teacher task
 * reachable in one click from here), then the 5 guide folders, each
 * deep-linking into the real, working /cartilla/teacher/guia hub. The
 * folders used to link to /cartilla/teacher/recursos/$recursoId, a dead end
 * that asked the operator to upload PDFs that were never coming — replaced
 * with real, already-built content (rhymes, evaluation page references,
 * syllable tables) sourced from the same guia data everywhere else uses.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  BookOpen,
  MonitorPlay,
  FileSpreadsheet,
  HelpCircle,
  Rows3,
  Home,
  ClipboardCheck,
  Music,
} from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/")({
  component: TeacherHub,
  head: () => ({ meta: [{ title: "Panel del Docente — La Cartilla de Gretel" }] }),
});

interface EntryPoint {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  accent: string;
}

const ENTRY_POINTS: EntryPoint[] = [
  {
    title: "Clase",
    description: "Crea o abre una clase, agrega alumnos, asigna lecciones.",
    to: "/cartilla/teacher/crm",
    icon: <GraduationCap className="w-6 h-6" />,
    accent: "#0f766e",
  },
  {
    title: "Guía",
    description: "Guía del profesor, tablas, tareas, evaluaciones y poemas — lección por lección.",
    to: "/cartilla/teacher/guia",
    icon: <BookOpen className="w-6 h-6" />,
    accent: "#4f46e5",
  },
  {
    title: "Presentar",
    description: "Abre el flipchart para proyectar la lección frente a la clase.",
    to: "/cartilla/teacher/flipchart",
    icon: <MonitorPlay className="w-6 h-6" />,
    accent: "#d97706",
  },
  {
    title: "Reportes",
    description: "Progreso por alumno y por lección, reporte imprimible y exportación CSV.",
    to: "/cartilla/teacher/reportes",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    accent: "#9333ea",
  },
  {
    title: "Ayuda",
    description: "Cómo usar la app: clase, asignar, presentar, guía y progreso, paso a paso.",
    to: "/cartilla/teacher/ayuda",
    icon: <HelpCircle className="w-6 h-6" />,
    accent: "#dc2626",
  },
];

interface DriveFolder {
  title: string;
  color: string;
  iconColor: string;
  icon: React.ReactNode;
  folderKey: "guia" | "tablas" | "tareas" | "evaluaciones" | "poemas";
}

const FOLDERS: DriveFolder[] = [
  {
    title: "Guía del Profesor",
    color: "bg-[#16a34a]",
    iconColor: "text-green-200",
    icon: <BookOpen className="w-10 h-10" />,
    folderKey: "guia",
  },
  {
    title: "Tablas Silábicas y de Vocales",
    color: "bg-[#059669]",
    iconColor: "text-emerald-200",
    icon: <Rows3 className="w-10 h-10" />,
    folderKey: "tablas",
  },
  {
    title: "Tareas para el Hogar",
    color: "bg-[#d97706]",
    iconColor: "text-amber-100",
    icon: <Home className="w-10 h-10" />,
    folderKey: "tareas",
  },
  {
    title: "Evaluaciones",
    color: "bg-[#9333ea]",
    iconColor: "text-purple-200",
    icon: <ClipboardCheck className="w-10 h-10" />,
    folderKey: "evaluaciones",
  },
  {
    title: "Poemas y Audio",
    color: "bg-[#e11d48]",
    iconColor: "text-rose-200",
    icon: <Music className="w-10 h-10" />,
    folderKey: "poemas",
  },
];

function TeacherHub() {
  return (
    <div className="w-full space-y-10 pb-16">
      <header>
        <h1 className="teacher-chrome__title text-3xl sm:text-4xl font-black">Panel del Docente</h1>
        <p className="text-[var(--tc-ink-soft)] font-bold mt-1">
          Todo lo que necesitas para dar clase con La Cartilla de Gretel, en un solo lugar.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ENTRY_POINTS.map((entry) => (
          <Link
            key={entry.title}
            to={entry.to as never}
            className="teacher-chrome__card rounded-3xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md"
              style={{ background: entry.accent }}
            >
              {entry.icon}
            </div>
            <h2 className="font-black text-lg text-[var(--tc-ink)]">{entry.title}</h2>
            <p className="text-xs font-medium text-[var(--tc-ink-soft)] mt-1 leading-snug">
              {entry.description}
            </p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="teacher-chrome__title text-xl font-black mb-1">Materiales de la Guía</h2>
        <p className="text-sm font-bold text-[var(--tc-ink-soft)] mb-6">
          Toca una carpeta para ver las 24 lecciones dentro de esa categoría.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {FOLDERS.map((folder) => (
            <Link
              key={folder.title}
              to="/cartilla/teacher/guia"
              search={{ folder: folder.folderKey }}
              className="group relative flex flex-col w-full pt-6 cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03]"
            >
              <div
                className={`relative z-10 w-full min-h-[160px] ${folder.color} rounded-3xl shadow-md flex flex-col items-center justify-center p-5 gap-3 border-b-4 border-black/20`}
              >
                <div className={folder.iconColor}>{folder.icon}</div>
                <h3 className="text-sm sm:text-base font-black leading-tight uppercase text-white text-center">
                  {folder.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
