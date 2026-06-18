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
    <div 
      className="w-full min-h-screen flex flex-col items-center justify-start py-16 px-4 sm:px-8 -mx-6 -my-6"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% -10%, #fdf3e0 0%, #f5e8c8 60%, #ecdaaa 100%)",
        minHeight: "calc(100vh - 64px)", 
      }}
    >
      <div className="text-center mb-16 relative z-10 drop-shadow-sm">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ color: "#3b2a12" }}>
          Recursos del Maestro
        </h1>
        <p className="text-xl md:text-2xl font-bold" style={{ color: "#7a6040" }}>
          ¡Selecciona una carpeta para abrir los materiales!
        </p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-12 pb-20">
        {FOLDERS.map((folder) => (
          <Link
            key={folder.title}
            to={folder.to as any}
            className="group relative flex flex-col w-full pt-10 cursor-pointer transition-transform duration-300 hover:-translate-y-4 hover:scale-[1.05] hover:rotate-1"
          >
            {/* Playful Folder Tab */}
            <div 
              className={`absolute top-0 left-6 w-1/2 h-14 ${folder.color} rounded-t-3xl z-0 shadow-inner`} 
              style={{ filter: "brightness(0.85)" }} 
            />
            
            {/* Folder Front/Body */}
            <div 
              className={`relative z-10 w-full min-h-[220px] ${folder.color} rounded-3xl rounded-tl-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4),inset_0_6px_20px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center p-5 overflow-visible border-b-4 border-black/20`}
            >
              {/* Fun shadow and light glare */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none rounded-3xl" />
              
              {/* White Sticker Label (expands naturally) */}
              <div className="bg-white/95 rounded-2xl shadow-lg w-full flex flex-col items-center justify-center p-4 text-center border-4 border-stone-100 z-20 group-hover:bg-white transition-colors rotate-[-2deg] group-hover:rotate-0 duration-300">
                <h2 
                  className="text-xl sm:text-2xl font-black leading-tight uppercase"
                  style={{ color: "#3b2a12" }}
                >
                  {folder.title}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
