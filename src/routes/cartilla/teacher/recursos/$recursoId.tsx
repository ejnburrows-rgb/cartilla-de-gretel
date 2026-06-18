import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Folder, ArrowLeft, FileText, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/cartilla/teacher/recursos/$recursoId")({
  component: RecursoViewer,
});

const RECURSOS_META: Record<string, { title: string; color: string; iconColor: string }> = {
  rimas: {
    title: "Rimas Reproducible Enriquecimiento",
    color: "bg-[#1e40af]",
    iconColor: "text-blue-200",
  },
  respuestas: {
    title: "Respuestas de las Evaluaciones",
    color: "bg-[#eab308]",
    iconColor: "text-yellow-100",
  },
  evaluaciones: {
    title: "Evaluaciones Reproducibles",
    color: "bg-[#dc2626]",
    iconColor: "text-red-200",
  },
  blacklines: {
    title: "Blackline Masters tablas silábicas",
    color: "bg-[#9333ea]",
    iconColor: "text-purple-200",
  },
};

function RecursoViewer() {
  const { recursoId } = Route.useParams();
  const meta = RECURSOS_META[recursoId];

  if (!meta) {
    return <div>Recurso no encontrado.</div>;
  }

  return (
    <div className="w-full flex flex-col items-start py-8">
      
      {/* Header */}
      <div className="mb-8 w-full border-b border-stone-200 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/cartilla/teacher" className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className={`p-3 rounded-xl ${meta.color}`}>
            <Folder className={`w-8 h-8 ${meta.iconColor} fill-current`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{meta.title}</h1>
            <p className="text-stone-500 text-sm font-medium">Mi Unidad / {meta.title}</p>
          </div>
        </div>
      </div>

      {/* PDF Placeholder */}
      <div className="w-full h-[600px] bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-12 text-center">
        <UploadCloud className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-2xl font-bold text-stone-700 mb-2">Esperando el PDF</h2>
        <p className="text-stone-500 max-w-lg mb-8">
          Aún no has subido el PDF para <b>"{meta.title}"</b> al repositorio. 
          Por favor, sube el archivo a la carpeta <code>public/teacher/{recursoId}.pdf</code> o compártelo en el chat para que la IA lo enlace.
        </p>
      </div>

    </div>
  );
}
