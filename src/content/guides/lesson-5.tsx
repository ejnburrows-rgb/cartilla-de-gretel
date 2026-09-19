import React from "react";
import { VocabularyList } from "./VocabularyList";

export function Lesson5Guide() {
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
                Compara y contrasta características y atributos de personas y/o cosas.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Encuentra patrones de rima en los poemas, produce palabras con los mismos sonidos
                iniciales, y asocia los sonidos iniciales con los símbolos escritos
                correspondientes.
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
            El maestro asociará el sonido <strong>Iii…</strong> con el sonido que hace la niña que
            llora por todo (Flip Chart página 5). La pelota arriba de la cabecita representa el
            punto de la letra i.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas de motivación: ¿Quién está en esta ilustración? ¿De qué color es el
                pantalón de la niña? ¿Qué tiene la niña en la mano? ¿Qué letra tiene la carterita de
                la niña? ¿Qué tiene la niña arriba de su cabecita? ¿De qué color es la pelota? ¿Por
                qué llora la niña? ¿En qué se parecen las ilustraciones de la letra "e" y la letra
                "i"? ¿En qué se diferencian la letra "o" de la letra "i"?
              </li>
              <li>
                Preguntas de vida personal: ¿Conoces tú alguna persona que llora mucho? ¿Cómo se le
                llama a la persona que llora mucho? ¿Cuál es tu comida preferida?
              </li>
              <li>Los estudiantes leen la rima e identifican las palabras que riman.</li>
              <li>
                Completan los ejercicios de escritura y lenguaje en las páginas 13–15 del libro de
                actividades.
              </li>
              <li>Refuerzo: Blackline Masters página 5.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <VocabularyList lessonNumber={5} />
        <div>
          <p className="text-stone-600 mb-4">
            <strong>Palabras que riman:</strong> infeliz, nariz.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-blue-900 font-bold italic">"La niña llorona"</p>
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
            <strong>Evaluación, página 5, 5a.</strong> Los estudiantes seguirán las instrucciones
            del maestro para completar la evaluación.
          </p>
        </div>
      </section>
    </div>
  );
}
