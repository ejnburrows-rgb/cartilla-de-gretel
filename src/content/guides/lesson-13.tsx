import React from "react";

export function Lesson13Guide() {
  return (
    <div className="space-y-12">

      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        ⚠️ La página 44 de esta lección (Resumen y Motivación, antes de la sección de Lectura) no aparece en la transcripción disponible de la Guía del profesor — pendiente de recuperar.
      </div>

      {/* OBJETIVOS */}
      <section id="objetivos" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-orange-500">1.</span> Objetivos de Aprendizaje
        </h2>
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Describe ilustraciones usando vocabulario apropiado para su nivel y reconoce sonidos onomatopéyicos. Pregunta y responde para demostrar comprensión de materiales de lectura presentados oralmente.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Encuentra patrones de rima en los poemas, asocia los sonidos iniciales con los símbolos escritos, y reconoce y nombra las letras mayúsculas y minúsculas.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Identifica y decodifica palabras con el patrón silábico "cv" (na, ne, ni, no, nu) a través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando combinaciones silábicas (na, ne, ni, no, nu); escribe oraciones sencillas usando mayúsculas y punto final correctamente.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Utiliza vocabulario simple y frases cortas en español.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* PROCEDIMIENTO */}
      <section id="procedimiento" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-emerald-500">2.</span> Procedimiento Sugerido
        </h2>
        <div className="space-y-6 text-stone-700 leading-relaxed font-medium">
          <p>
            Lectura (Flip Chart página 26, Libro de actividades página 45): combinaciones na, ne, ni, no, nu.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>Palabras de uso frecuente: "esa, a". Preguntas de comprensión: ¿Quién da la tina? ¿De quién es la tina? ¿Quiénes aman a Nani? ¿Quién le pone la tina a Nani? ¿Dónde pone Tono la tina?</li>
              <li>Rima "¡Nada Nino!" (Flip Chart página 27): preguntas sobre la niña, la tina y el pato de la ilustración.</li>
              <li>Refuerzo: Blackline Masters páginas 8, 15.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <div>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-wide text-stone-400 mb-2">Palabras de uso frecuente</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">esa</span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">a</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic">"¡Nada Nino!"</p>
            <p className="text-stone-500 text-sm mt-2 not-italic">
              Título documentado en la Guía del profesor. El texto completo de la rima no aparece en la transcripción disponible — se agregará cuando se transcriba.
            </p>
          </div>
        </div>
      </section>

      {/* EVALUACION */}
      <section id="evaluacion" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-purple-500">4.</span> Evaluación
        </h2>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
          <p className="text-purple-900 font-medium">
            <strong>Evaluación, página 13.</strong> Los estudiantes seguirán las instrucciones del maestro para completar la evaluación.
          </p>
        </div>
      </section>

    </div>
  );
}
