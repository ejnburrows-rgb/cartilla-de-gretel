import React from "react";

export function Lesson7Guide() {
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
                Listens to nursery rhymes or poems read by the teacher and responds with appropriate sounds, words, and motions. Follows verbal directions. Describes illustrations using appropriate vocabulary for grade level. Recognizes onomatopoeic sounds / words. Asks and answers questions to demonstrate comprehension of reading materials that have been pre-sented orally.Rhymes word patterns in poems. Matches same initial word sounds with written word symbols. Recognizes and names upper and lower case letters of the alphabet. Identifies and decodes words with the syllable pattern “cv” ma, me, mi, mo, mu through illustrations. Asks and answers teacher-directed questions to demonstrate comprehension of literary selection.Models and forms lower and upper case letter of the alphabet. Forms new words using single syllables me, mi or syllabic combinations mamá, Memo etc. Writes simple sentences. Arranges and spaces words when forming sentences. Uses appropriate capitalization / lower case lettering conventions when writting simple sentences or proper nouns.Uses simple vocabulary and short phrases in Spanish.
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
              <li>El maestro invitará a los estudiantes a observar la ilustración y contestar: ¿Qué animal es? ¿De qué color es la vaca? Luego, participarán en actividades orales, identificarán los sonidos, y leerán el vocabulario. Finalmente, completarán los ejercicios de escritura y lenguaje en su libro de actividades.</li>
            </ol>
          </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
<p className="text-stone-500 italic">No hay vocabulario ni poema registrado.</p>
      </section>

      {/* EVALUACION */}
      <section id="evaluacion" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-purple-500">4.</span> Evaluación
        </h2>
<p className="text-stone-500 italic">No hay evaluación registrada.</p>
      </section>

    </div>
  );
}
