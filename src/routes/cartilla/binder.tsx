import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/binder")({
  component: BinderStub,
});

function BinderStub() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center font-sans text-stone-800 bg-amber-50">
      <h1 className="text-3xl font-extrabold mb-4 text-stone-900">Carpeta del Maestro</h1>
      <p className="text-stone-600 mb-6 max-w-md leading-relaxed">
        Estamos terminando los últimos detalles de la carpeta para imprimir. Estará disponible en unos minutos.
      </p>
      <a href="/" className="text-sky-700 underline hover:text-sky-900">← Volver al inicio</a>
    </div>
  );
}
