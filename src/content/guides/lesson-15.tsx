import React from "react";
import { VocabularyList } from "./VocabularyList";

export function Lesson15Guide() {
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
                Identifica y decodifica palabras con el patrón silábico "cv" (ba, be, bi, bo, bu) a
                través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando combinaciones silábicas (ba, be, bi, bo, bu); escribe
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
            El maestro asociará el sonido <strong>Bbb…</strong> con el sonido que hace el chivito al
            llamar a su mamá o a los otros chivitos (Flip Chart página 31).
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas: ¿Qué animal es? ¿Dónde vive el chivito? ¿Qué sonido hace? ¿Es de noche o
                de día?
              </li>
              <li>
                Nota cultural: a la mamá del chivito se le llama cabra; la leche de cabra es
                saludable para niños con problemas para tomar leche de vaca.
              </li>
              <li>
                Lectura (Flip Chart página 32, Libro de actividades página 53): combinaciones ba,
                be, bi, bo, bu. Palabras de uso frecuente: "alto, con". Preguntas de comprensión
                sobre Bebo, Pepito y Bebita.
              </li>
              <li>
                Rima "Sube la bola" (Flip Chart página 33): preguntas sobre el niño, el bate y la
                pelota.
              </li>
              <li>Refuerzo: Blackline Masters páginas 8, 17.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <VocabularyList lessonNumber={15} />
        <div>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-wide text-stone-400 mb-2">
              Palabras de uso frecuente
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                alto
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                con
              </span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic mb-3">"Sube la bola"</p>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed font-medium not-italic">
              {`Bebo batea la bola,
la bola a la nube dio.
Bebo le dio a la bola,
la bola alto subió.

La bola sube y sube,
la bola a la nube le dio.
Bebo batea y batea
Bebo alto la bateó.`}
            </p>
            <p className="text-xs text-stone-400 mt-4 not-italic">
              Transcrito palabra por palabra de la página real del cuaderno (b-page-33). La Guía del
              profesor integral en el repo termina a mitad de la Lección 15 (solo página 51:
              objetivos y materiales); el guion de motivación de las páginas 52–54 no está en el
              repositorio.
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
            <strong>Evaluación, página 15</strong> (Teaching Materials, Guía del profesor p. 51). El
            texto de instrucción completo de la evaluación no está en la transcripción disponible
            (el integral termina a mitad de Lección 15).
          </p>
        </div>
      </section>
    </div>
  );
}
