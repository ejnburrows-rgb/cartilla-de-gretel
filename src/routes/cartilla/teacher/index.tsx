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
        minHeight: "calc(100vh - 64px)", // account for header
      }}
    >
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3" style={{ color: "#3b2a12" }}>
          Recursos del Maestro
        </h1>
        <p className="text-lg md:text-xl font-bold" style={{ color: "#7a6040" }}>
          Selecciona una carpeta para abrir los materiales
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-10 pb-20">
        {FOLDERS.map((folder) => (
          <Link
            key={folder.title}
            to={folder.to as any}
            className="group relative flex flex-col w-full pt-8 cursor-pointer transition-transform duration-300 hover:-translate-y-4 hover:scale-[1.05]"
          >
            {/* Folder Tab (Back flap) */}
            <div 
              className={`absolute top-0 left-4 w-2/5 h-12 ${folder.color} rounded-t-2xl z-0 shadow-inner`} 
              style={{ filter: "brightness(0.9)" }} // Make tab slightly darker to look like it's behind
            />
            
            {/* Folder Front/Body */}
            <div 
              className={`relative z-10 w-full aspect-square ${folder.color} rounded-3xl rounded-tl-sm shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3),inset_0_4px_12px_rgba(255,255,255,0.3)] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden`}
            >
              {/* Folder Crease/Shadow line to make it look physical */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-black/10 mix-blend-overlay pointer-events-none" />
              
              {/* Inner Label (Sticker on the physical folder) */}
              <div className="bg-white/95 rounded-2xl shadow-md w-full h-3/5 flex flex-col items-center justify-center p-3 text-center border-2 border-stone-100 z-20">
                <h2 
                  className="text-lg md:text-xl font-black leading-snug uppercase tracking-wide"
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
