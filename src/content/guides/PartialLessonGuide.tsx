import React from "react";
import { getGuiaLesson, getRhymeTitle, getRhymeText } from "@/content/guia/loader";
import { VocabularyList } from "./VocabularyList";

/**
 * Shared renderer for lessons whose printed Teacher's Guide (Leonor
 * Lopetegui's book) was never scanned into this repo. Reads directly from
 * src/content/guia/lesson-N.json so it can never go stale the way the old
 * per-lesson hand-written components did — when a rhyme (or anything else)
 * gets transcribed later, this component picks it up automatically.
 *
 * Never invents objectives, motivation, script, or evaluation text for
 * these lessons — only shows the rhyme when it's real, verified content.
 */
export function PartialLessonGuide({ lessonId }: { lessonId: number }) {
  const lesson = getGuiaLesson(lessonId);
  const rhymeTitle = getRhymeTitle(lessonId);
  const rhymeText = getRhymeText(lessonId);
  const evaluationPage = lesson?.evaluationRef.page ?? null;

  return (
    <div className="space-y-12">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        ⚠️ No existe en este repositorio un escaneo de la Guía del profesor impresa para la Lección{" "}
        {lessonId}. La transcripción disponible (docs/Transcripción Integral...) termina a mitad de
        la Lección 15 y no llega hasta aquí. Lo que se muestra abajo viene únicamente de las páginas
        reales del cuaderno del estudiante ya digitalizadas.
      </div>

      <section id="objetivos" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-orange-500">1.</span> Objetivos de Aprendizaje
        </h2>
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
          <p className="text-amber-600 italic">
            SOURCE-NOT-IN-REPO — los objetivos de esta lección no están disponibles en el
            repositorio.
          </p>
        </div>
      </section>

      <section id="procedimiento" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-emerald-500">2.</span> Procedimiento Sugerido
        </h2>
        <p className="text-amber-600 italic">
          SOURCE-NOT-IN-REPO — el guion del maestro para esta lección no está disponible en el
          repositorio.
        </p>
      </section>

      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <VocabularyList lessonNumber={lessonId} />
        {rhymeTitle && rhymeText ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
            <h3 className="font-black text-lg text-stone-800 mb-3">{rhymeTitle}</h3>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed font-medium">
              {rhymeText}
            </p>
            <p className="text-xs text-stone-400 mt-4">
              Transcrito palabra por palabra de la página real del cuaderno del estudiante.
            </p>
          </div>
        ) : (
          <p className="text-amber-600 italic">
            SOURCE-NOT-IN-REPO — el poema de esta lección no está disponible en el repositorio.
          </p>
        )}
      </section>

      <section id="evaluacion" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-purple-500">4.</span> Evaluación
        </h2>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
          <p className="text-purple-900 font-medium">
            {evaluationPage
              ? `Evaluación, página ${evaluationPage} (número inferido por el patrón del libro — no verificado contra un escaneo real de esta lección).`
              : ""}
          </p>
          <p className="text-amber-600 italic mt-2">
            SOURCE-NOT-IN-REPO — el texto de instrucción de la evaluación no está disponible en el
            repositorio.
          </p>
        </div>
      </section>
    </div>
  );
}
