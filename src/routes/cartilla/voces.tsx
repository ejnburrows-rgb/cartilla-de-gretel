import { createFileRoute } from "@tanstack/react-router";
import { AUDIO_POLICY } from "@/content/audio-manifest";

export const Route = createFileRoute("/cartilla/voces")({
  component: VoiceAudition,
  head: () => ({ meta: [{ title: "Voz de Gretel — La Cartilla de Gretel" }] }),
});

function VoiceAudition() {
  const play = () => {
    if (!AUDIO_POLICY.allowTts) return;
    // Playback remains unavailable until an authentic recording is verified.
  };

  return (
    <main className="min-h-screen w-full bg-stone-100 px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-black text-stone-800">Voz de Gretel</h1>
        <p className="font-medium text-stone-600">
          Solo se permite la grabación original de Gretel, con una transcripción
          verificada que coincida con las palabras de cada actividad.
        </p>
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="mb-2 font-bold">Audio verificado no disponible en esta página.</p>
          <p>La página permanece en silencio. No se utilizan voces sintéticas.</p>
        </div>
        <button
          type="button"
          disabled
          onClick={play}
          className="rounded-2xl border border-stone-300 bg-stone-200 px-6 py-4 font-bold text-stone-500 disabled:cursor-not-allowed"
        >
          Escuchar grabación original — no disponible
        </button>
        <details className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
          <summary className="cursor-pointer font-bold">Referencia de la grabación</summary>
          <p className="mt-3 break-words">Gretel_558674_Original.m4a</p>
          <p className="mt-2 break-all">SHA256: 239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d</p>
          <p className="mt-2 break-words">Guiones: docs/audio/CURRICULUM_NARRATION_SCRIPTS.md</p>
        </details>
      </div>
    </main>
  );
}
