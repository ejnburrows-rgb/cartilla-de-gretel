import React from "react";
import { VocabularyList } from "./VocabularyList";

export function Lesson9Guide() {
  return (
    <div className="space-y-12">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        ⚠️ La transcripción disponible omite la rima de la letra S-s (Flip Chart página 15) y las
        secciones de Reforzamiento, Evaluación y Enriquecimiento de esta lección — pendiente de
        recuperar.
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
                Identifica y decodifica palabras con el patrón silábico "cv" (sa, se, si, so, su) a
                través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando combinaciones silábicas (sa, se, si, so, su); escribe
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
            El maestro asociará el sonido <strong>Sss…</strong> con el silbido de la serpiente al
            moverse formando una S con su cuerpo (Flip Chart página 13).
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas: ¿Qué ves en la ilustración? ¿De qué color es el Sol? ¿Dónde está el
                caracol? ¿Cómo se mueve la serpiente? ¿Cuántas montañas hay?
              </li>
              <li>
                Nota cultural: la piel de la serpiente se usa para cintos, carteras y zapatos.
              </li>
              <li>
                Lectura (Flip Chart página 14, Libro de actividades página 29): combinaciones sa,
                se, si, so, su. Palabras de uso frecuente: "es, de, un, una, está, en, la, el".
                Preguntas de comprensión sobre la sopa, Susi, Sisi y Pepe.
              </li>
              <li>
                Completan los ejercicios de escritura y lenguaje en la página 30 del libro de
                actividades.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* VOCABULARIO Y POEMA */}
      <section id="vocabulario" className="scroll-mt-24">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3">
          <span className="text-blue-500">3.</span> Vocabulario y Poema
        </h2>
        <VocabularyList lessonNumber={9} />
        <div>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-wide text-stone-400 mb-2">
              Palabras de uso frecuente
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                es
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                de
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                un
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                una
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                está
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                en
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                la
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                el
              </span>
            </div>
          </div>
          <p className="text-stone-500 italic mt-4">
            La rima de la letra S-s (Flip Chart página 15) y su título no aparecen en la
            transcripción disponible — pendiente de recuperar.
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
            <strong>Evaluación, página 9.</strong> El contenido narrativo de Reforzamiento,
            Evaluación y Enriquecimiento de esta lección no aparece en la transcripción disponible
            de la Guía del profesor — solo se documenta la referencia de página. Pendiente de
            recuperar.
          </p>
        </div>
      </section>
    </div>
  );
}
