import React from "react";

export function Lesson21Guide() {
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
                Evaluar el progreso en fluidez y comprensión lectora.
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

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4 text-stone-700 leading-relaxed font-medium">
              <li>Administrar la evaluación a los estudiantes. Registrar los resultados.</li>
            </ol>
          </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
<p className="text-amber-600 italic">AWAITING-SOURCE-SCAN — Guía del profesor páginas 75–78 (Lección 21) aún no transcritas; el escaneo físico no está disponible todavía.</p>
      </section>

      {/* EVALUACION */}
      <section id="evaluacion" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-purple-500">4.</span> Evaluación
        </h2>
<p className="text-amber-600 italic">AWAITING-SOURCE-SCAN — Guía del profesor páginas 75–78 (Lección 21) aún no transcritas; el escaneo físico no está disponible todavía.</p>
      </section>

    </div>
  );
}
