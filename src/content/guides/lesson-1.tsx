import React from "react";

export function Lesson1Guide() {
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
                Escucha un cuento simple basado en representaciones pictóricas.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Sigue instrucciones verbales y pantomima acciones físicas según la historia.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Produce palabras con los mismos sonidos iniciales y asocia sonidos iniciales con los símbolos de las vocales "a", "e", "i", "o", "u".
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Reconoce e identifica por su nombre las vocales "a", "e", "i", "o", "u".
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
            El maestro invitará a los estudiantes a observar la ilustración inicial de <strong>"Las hermanitas vocales"</strong>.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>Participarán en actividades orales introductorias.</li>
              <li>Identificarán los sonidos de cada una de las vocales a través de la lectura visual.</li>
              <li>Leerán el vocabulario asociado a las ilustraciones de la lección.</li>
              <li>Completarán los ejercicios de escritura y lenguaje en su libro de actividades impreso.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <p className="text-stone-500 italic mb-4">
          Esta lección es introductoria y se enfoca en los sonidos globales de las vocales.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <p className="text-blue-900 font-bold italic">
            A, E, I, O, U <br />
            las hermanitas vocales eres tú.
          </p>
        </div>
      </section>

      {/* EVALUACION */}
      <section id="evaluacion" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-purple-500">4.</span> Evaluación
        </h2>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
          <p className="text-purple-900 font-medium">
            Verifique la correcta identificación auditiva y visual de las 5 vocales antes de proceder a la Lección 2.
          </p>
        </div>
      </section>

    </div>
  );
}
