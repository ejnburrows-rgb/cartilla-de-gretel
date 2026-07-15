import React from "react";

export function Lesson3Guide() {
  return (
    <div className="space-y-12">
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
                Escucha rimas o poemas leídos por el maestro y responde con sonidos, palabras y
                movimientos apropiados. Sigue instrucciones verbales y describe dibujos en oraciones
                orales.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Produce palabras con los mismos sonidos iniciales, encuentra patrones de rima en los
                poemas, y asocia los sonidos iniciales con los símbolos escritos correspondientes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Reconoce y nombra las letras mayúsculas y minúsculas del abecedario; modela y traza
                líneas de arriba hacia abajo y de izquierda a derecha; forma letras y copia palabras
                sencillas.
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
            El maestro invitará a los estudiantes a observar la ilustración de la página 3 del flip
            chart y asociará el sonido <strong>Aaa…</strong> con el sonido que hace la niñita cuando
            abre la boca para que el médico le examine la garganta.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas de motivación: ¿Quiénes están en la ilustración? ¿Por qué va la niña al
                doctor? ¿Qué le dice el doctor a la niña? ¿Qué dice la niña cuando abre la boca?
                ¿Por qué el doctor usa una paletica? ¿Qué letra tiene la carterita de la niña?
              </li>
              <li>
                Preguntas de vida personal: ¿Adónde vas tú cuando estás enfermo/a? ¿Cómo se llama tu
                doctor?
              </li>
              <li>Los estudiantes leen la rima e identifican las palabras que riman.</li>
              <li>
                Completan los ejercicios de escritura y lenguaje en las páginas 7–9 del libro de
                actividades.
              </li>
              <li>Refuerzo: Blackline Masters páginas 3, 7.</li>
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
          <p className="text-stone-600 mb-4">
            <strong>Palabras que riman:</strong> doctor, dolor, amor.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic">"La niña enfermita"</p>
            <p className="text-stone-500 text-sm mt-2 not-italic">
              Título documentado en la Guía del profesor. El texto completo de la rima no aparece en
              la transcripción disponible — se agregará cuando se transcriba.
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
            <strong>Evaluación, página 3.</strong> Los estudiantes seguirán las instrucciones del
            maestro para completar la evaluación.
          </p>
        </div>
      </section>
    </div>
  );
}
