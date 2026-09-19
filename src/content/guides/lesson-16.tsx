import React from "react";
import { VocabularyList } from "./VocabularyList";

export function Lesson16Guide() {
  return (
    <div className="space-y-12">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        ⚠️ La transcripción disponible de la Guía del profesor termina a mitad de la rima de la
        letra V-v (Flip Chart página 36). El resto de esta lección y las Lecciones 17–24 completas
        (R inicial, rr, G, F, J, C, Y, Z) todavía no han sido escaneadas/transcritas — están
        pendientes, no perdidas.
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
                Describe ilustraciones usando vocabulario apropiado para su nivel. Pregunta y
                responde para demostrar comprensión de materiales de lectura presentados oralmente.
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
                Identifica y decodifica palabras con el patrón silábico "cv" (va, ve, vi, vo, vu) a
                través de ilustraciones.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
              <span className="text-stone-700 leading-relaxed font-medium">
                Forma palabras nuevas usando combinaciones silábicas (va, ve, vi, vo, vu); escribe
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
            El maestro asociará el sonido <strong>Vvv…</strong> con el sonido del viento cuando
            sopla (Flip Chart página 34).
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <ol className="list-decimal list-inside space-y-4">
              <li>
                Preguntas: ¿Cómo sopla el viento? ¿Qué mueve el viento? ¿Has volado alguna vez un
                papalote?
              </li>
              <li>
                Lectura (Flip Chart página 35, Libro de actividades página 57): combinaciones va,
                ve, vi, vo, vu. Palabras de uso frecuente: "rojos, mi, gusta". Preguntas de
                comprensión sobre Vivi y Valentín.
              </li>
              <li>
                La sección de rima (Flip Chart página 36) comienza en la ilustración de la V-v, pero
                la transcripción disponible se corta a mitad de las preguntas.
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
        <VocabularyList lessonNumber={16} />
        <div>
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-wide text-stone-400 mb-2">
              Palabras de uso frecuente
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                rojos
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                mi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 text-sm font-bold border border-blue-100">
                gusta
              </span>
            </div>
          </div>
          <p className="text-stone-500 italic mt-4">
            El título y el texto de la rima de esta lección, así como
            Reforzamiento/Evaluación/Enriquecimiento, no aparecen en la transcripción disponible —
            pendiente de recuperar. La ficha técnica de la lección confirma que esta es una de las 7
            lecciones (junto con rr, G, J, C, Y, Z) con la sección de palabras de uso frecuente
            intencionalmente vacía en el libro del estudiante — no es un error, es así en el libro
            impreso.
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
            <strong>Evaluación, página 16.</strong> El contenido narrativo de Reforzamiento,
            Evaluación y Enriquecimiento de esta lección no aparece en la transcripción disponible
            de la Guía del profesor — solo se documenta la referencia de página. Pendiente de
            recuperar.
          </p>
        </div>
      </section>
    </div>
  );
}
