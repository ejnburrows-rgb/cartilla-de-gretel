import React from "react";

export function Lesson10Guide() {
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
                Describe ilustraciones usando vocabulario apropiado para su nivel y reconoce sonidos
                onomatopéyicos. Pregunta y responde para demostrar comprensión de materiales de
                lectura presentados oralmente.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Encuentra patrones de rima en los poemas, asocia los sonidos iniciales con los
                símbolos escritos, y reconoce y nombra las letras mayúsculas y minúsculas.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Identifica y decodifica palabras con el patrón silábico "cv" (ta, te, ti, to, tu) a
                través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando combinaciones silábicas (ta, te, ti, to, tu); escribe
                oraciones sencillas usando mayúsculas y punto final correctamente.
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
            El maestro asociará "Tan tan tararán…" con el sonido del niño tocando el tambor (Flip
            Chart página 16).
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas: ¿Qué ves en la ilustración? ¿Dónde está el niño? ¿Qué toca? ¿Cómo suena
                el tambor? ¿Cuántos tomates hay?
              </li>
              <li>
                Nota cultural: el tomate es una fruta y también un vegetal; se usa en ensaladas y
                para cocinar.
              </li>
              <li>
                Lectura (Flip Chart página 17, Libro de actividades página 33): combinaciones ta,
                te, ti, to, tu. Palabras de uso frecuente: "tiene, patio, no". Preguntas de
                comprensión sobre Tito, Tata y el topo.
              </li>
              <li>
                Rima "La sopa de pato" (Flip Chart página 18): preguntas sobre los niños, la olla,
                los tomates y el pato de la ilustración.
              </li>
              <li>Refuerzo: Blackline Masters páginas 8, 12.</li>
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
            <p className="text-xs font-black uppercase tracking-wide text-stone-400 mb-2">
              Palabras de uso frecuente
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                tiene
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                patio
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                no
              </span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic">"La sopa de pato"</p>
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
            <strong>Evaluación, página 10.</strong> Los estudiantes seguirán las instrucciones del
            maestro para completar la evaluación.
          </p>
        </div>
      </section>
    </div>
  );
}
