import React from "react";

export function Lesson7Guide() {
  return (
    <div className="space-y-12">

      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        ⚠️ Las páginas 20–21 del desarrollo de esta lección (la parte de motivación/lectura, entre la introducción de M-m y el Reforzamiento de la página 22) no aparecen en la transcripción disponible de la Guía del profesor — pendiente de recuperar.
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
                Identifica y decodifica palabras con el patrón silábico "cv" (ma, me, mi, mo, mu) a través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando sílabas simples (me, mi) o combinaciones silábicas (mamá, Memo); escribe oraciones sencillas usando mayúsculas y punto final correctamente.
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
            El maestro invitará a los estudiantes a observar la ilustración de las páginas 7–9 del flip chart y asociará el sonido de la letra <strong>M-m</strong> con las sílabas ma, me, mi, mo, mu.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>El maestro pedirá a los estudiantes que formen palabras usando las sílabas de la tabla silábica (página 9), las copien en la parte superior de la página 8, y escriban oraciones sencillas usando esas palabras en la parte inferior.</li>
              <li>El maestro reforzará el uso de la letra mayúscula al principio de la oración y en los nombres propios, y el uso del punto final.</li>
              <li>Completan los ejercicios de escritura y lenguaje en las páginas 19–22 del libro de actividades.</li>
              <li>Refuerzo: Blackline Masters páginas 8, 9.</li>
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
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic">"Mi mamá"</p>
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
            <strong>Evaluación, página 7.</strong> Los estudiantes seguirán las instrucciones del maestro para completar la evaluación.
          </p>
        </div>
      </section>

    </div>
  );
}
