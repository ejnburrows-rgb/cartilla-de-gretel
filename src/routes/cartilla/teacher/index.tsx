/**
 * Teacher Resource Hub — "Google Workspace" Drive view
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, MoreVertical, LayoutGrid, List } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/")({
  component: TeacherHub,
  head: () => ({
    meta: [{ title: "Recursos del Maestro — La Cartilla de Gretel" }],
  }),
});

interface DriveFolder {
  title: string;
  color: string;
  bgColor: string;
  to: string;
  date: string;
}

const FOLDERS: DriveFolder[] = [
  {
    title: "Rimas Reproducible Enriquecimiento",
    color: "text-[#1a73e8]", // Google Blue
    bgColor: "bg-[#e8f0fe]",
    to: "/cartilla/teacher/recursos/rimas",
    date: "Modificado 15 de oct.",
  },
  {
    title: "Carpeta Pendiente (Placeholder)",
    color: "text-gray-400", // Placeholder Gray
    bgColor: "bg-gray-100",
    to: "/cartilla/teacher/recursos/placeholder",
    date: "--",
  },
  {
    title: "Evaluaciones Reproducibles",
    color: "text-[#d93025]", // Google Red
    bgColor: "bg-[#fce8e6]",
    to: "/cartilla/teacher/recursos/evaluaciones",
    date: "Modificado 12 de oct.",
  },
  {
    title: "Blackline masters, tablas silábicas",
    color: "text-[#9334e6]", // Google Purple
    bgColor: "bg-[#f3e8fd]",
    to: "/cartilla/teacher/recursos/blacklines",
    date: "Modificado 10 de oct.",
  }
];

function TeacherHub() {
  return (
    <div className="w-full flex flex-col pt-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-normal text-gray-800">Mi unidad</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <List className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-gray-100">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-[14px] font-medium text-gray-600 mb-4">Carpetas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FOLDERS.map((folder) => (
            <Link
              key={folder.title}
              to={folder.to as any}
              className="flex items-center gap-4 p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors group cursor-pointer bg-white"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${folder.bgColor}`}>
                <Folder className={`w-5 h-5 ${folder.color} fill-current`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-medium text-gray-800 truncate">
                  {folder.title}
                </h3>
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-full transition-all text-gray-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-[14px] font-medium text-gray-600 mb-4">Archivos recientes</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600">Nombre</th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 hidden sm:table-cell">Propietario</th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 hidden md:table-cell">Última modificación</th>
                <th className="py-3 px-4 text-[13px] font-medium text-gray-600 hidden lg:table-cell">Tamaño del archivo</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy recent files to complete the illusion */}
              <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded text-blue-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] text-gray-800 font-medium">Evaluación Lección 12.pdf</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden sm:table-cell">Yo</td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden md:table-cell">Hoy</td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden lg:table-cell">1.2 MB</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded text-green-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] text-gray-800 font-medium">Guía de Rimas - Lección 4.pdf</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden sm:table-cell">Yo</td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden md:table-cell">Ayer</td>
                <td className="py-3 px-4 text-[13px] text-gray-600 hidden lg:table-cell">840 KB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
