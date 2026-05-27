import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/binder/$lesson")({
  component: BinderLessonStub,
});

function BinderLessonStub() {
  const { lesson } = Route.useParams();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center font-sans text-stone-800 bg-amber-50">
      <h1 className="text-3xl font-extrabold mb-4 text-stone-900">Lección {lesson}</h1>
      <p className="text-stone-600 mb-6 max-w-md leading-relaxed">
        La hoja de impresión para esta lección estará lista en unos minutos.
      </p>
      <a href="/" className="text-sky-700 underline hover:text-sky-900">← Volver al inicio</a>
    </div>
  );
}
