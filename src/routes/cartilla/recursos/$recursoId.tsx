import { createFileRoute, Link } from "@tanstack/react-router";
import { Folder, ArrowLeft, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/cartilla/recursos/$recursoId")({
  component: RecursoViewer,
});

const RECURSOS_META: Record<string, { title: string; color: string; iconColor: string; pdfPath: string }> = {
  rimas: {
    title: "Rimas Reproducible Enriquecimiento",
    color: "bg-[#1e40af]",
    iconColor: "text-blue-200",
    pdfPath: "/recursos/rimas.pdf"
  },
  respuestas: {
    title: "Respuestas de las Evaluaciones",
    color: "bg-[#eab308]",
    iconColor: "text-yellow-100",
    pdfPath: "/recursos/respuestas.pdf"
  },
  evaluaciones: {
    title: "Evaluaciones Reproducibles",
    color: "bg-[#dc2626]",
    iconColor: "text-red-200",
    pdfPath: "/recursos/evaluaciones.pdf"
  },
  blacklines: {
    title: "Blackline Masters tablas silábicas",
    color: "bg-[#9333ea]",
    iconColor: "text-purple-200",
    pdfPath: "/recursos/blacklines.pdf"
  },
  guia: {
    title: "Guía del Profesor",
    color: "bg-[#16a34a]",
    iconColor: "text-green-200",
    pdfPath: "/recursos/guia-del-profesor.pdf"
  }
};

function RecursoViewer() {
  const { recursoId } = Route.useParams();
  const meta = RECURSOS_META[recursoId];

  const [pdfExists, setPdfExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (meta) {
      fetch(meta.pdfPath, { method: 'HEAD' })
        .then(res => {
          setPdfExists(res.ok);
        })
        .catch(() => setPdfExists(false));
    }
  }, [meta]);

  if (!meta) {
    return <div>Recurso no encontrado.</div>;
  }

  return (
    <div className="w-full flex flex-col items-start py-8 h-screen max-h-screen">

      {/* Header */}
      <div className="mb-6 w-full border-b border-stone-200 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/cartilla/recursos" className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors">
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

      {/* PDF Viewer */}
      <div className="w-full flex-1 bg-stone-100 rounded-3xl border-2 border-stone-300 flex flex-col items-center justify-center text-center overflow-hidden">
        {pdfExists === null ? (
          <div className="animate-pulse">Cargando documento...</div>
        ) : pdfExists ? (
          <iframe
            src={meta.pdfPath}
            className="w-full h-full rounded-2xl"
            title={meta.title}
          />
        ) : (
          <div className="p-12">
            <UploadCloud className="w-16 h-16 text-stone-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-stone-700 mb-2">Esperando el PDF</h2>
            <p className="text-stone-500 max-w-lg mb-8">
              Aún no has subido el PDF para <b>"{meta.title}"</b> al repositorio.
              Por favor, sube el archivo a la carpeta <code>public{meta.pdfPath}</code> o compártelo en el chat para que la IA lo enlace.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
