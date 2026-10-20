import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cartilla/voces")({
  component: VoiceRecordings,
  head: () => ({ meta: [{ title: "Grabaciones — La Cartilla de Gretel" }] }),
});

function VoiceRecordings() {
  return (
    <main className="min-h-screen w-full bg-stone-100 px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-black text-stone-800">Grabaciones de Gretel</h1>
        <p className="text-stone-700">
          La voz se reproduce únicamente desde archivos de audio. Si falta una grabación,
          la app permanece en silencio.
        </p>
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 font-bold text-stone-800">Audio de las lecciones</h2>
          <p className="text-stone-700">Cada botón utiliza su archivo de grabación correspondiente.</p>
          <p className="mt-4 text-sm text-stone-600" role="status">Sin archivo, la grabación queda pendiente.</p>
        </section>
        <p className="text-sm text-stone-600">
          No se utilizan voces del navegador ni servicios de voz sintetizada.
        </p>
      </div>
    </main>
  );
}
