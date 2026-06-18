/**
 * Teacher Resource Hub — "Google Workspace" Drive view
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, FolderOpen, FileText } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/")({
  component: TeacherHub,
  head: () => ({
    meta: [{ title: "Recursos del Maestro — La Cartilla de Gretel" }],
  }),
});

interface DriveFolder {
  title: string;
  color: string;
  iconColor: string;
  to: string;
}

const FOLDERS: DriveFolder[] = [
  {
    title: "Rimas Reproducible Enriquecimiento",
    color: "bg-[#1e40af]", // Solid Blue
    iconColor: "text-blue-200",
    to: "/cartilla/teacher/recursos/rimas",
  },
  {
    title: "Respuestas de las Evaluaciones",
    color: "bg-[#eab308]", // Solid Yellow
    iconColor: "text-yellow-100",
    to: "/cartilla/teacher/recursos/respuestas",
  },
  {
    title: "Evaluaciones Reproducibles",
    color: "bg-[#dc2626]", // Solid Red
    iconColor: "text-red-200",
    to: "/cartilla/teacher/recursos/evaluaciones",
  },
  {
    title: "Blackline Masters tablas silábicas",
    color: "bg-[#9333ea]", // Solid Purple
    iconColor: "text-purple-200",
    to: "/cartilla/teacher/recursos/blacklines",
  },
  {
    title: "Guía del Profesor",
    color: "bg-[#16a34a]", // Solid Green for the newly provided text
    iconColor: "text-green-200",
    to: "/cartilla/teacher/recursos/guia",
  }
];

function TeacherHub() {
  return (
    <div className="w-full flex flex-col items-start py-8">
      
      {/* Header */}
      <div className="mb-10 w-full border-b border-stone-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-stone-400" />
            Mi Unidad (Recursos)
          </h1>
          <p className="text-stone-500 mt-1 font-medium">Materiales y documentos para el aula</p>
        </div>
      </div>

      {/* Grid of Folders */}
      <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">Carpetas (5)</h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FOLDERS.map((folder) => (
          <Link
            key={folder.title}
            to={folder.to as any}
            className={`group relative flex flex-col items-start p-6 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border border-black/10 ${folder.color}`}
          >
            {/* Folder Icon Background Glow */}
            <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity ${folder.iconColor}`}>
              <Folder className="w-40 h-40" />
            </div>

            <div className="relative z-10 flex items-center gap-4 w-full">
              <Folder className={`w-10 h-10 ${folder.iconColor} fill-current`} />
              <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm pr-4">
                {folder.title}
              </h2>
            </div>

          </Link>
        ))}
      </div>

      {/* Placeholder for Recent Files */}
      <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mt-16 mb-6">Archivos Recientes</h2>
      <div className="w-full bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 border-dashed">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">No hay archivos recientes. Abre una de las carpetas arriba para ver los documentos.</p>
      </div>

    </div>
  );
}
