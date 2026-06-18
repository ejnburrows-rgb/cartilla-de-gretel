import React from "react";
import { BookOpen, FileText, CheckSquare, Sparkles, MessageCircle, AlertTriangle, HelpCircle } from "lucide-react";

export interface TeacherGuideLesson {
  lesson: number;
  title: string;
  objectives: string[];
  vocabulary: string[];
  procedures: string[];
  assessment: string;
  poem: string[];
  pages: number[];
}

interface TeacherGuidePanelProps {
  lesson: TeacherGuideLesson;
  accentColor?: string;
}

export function TeacherGuidePanel({ lesson, accentColor = "#f97316" }: TeacherGuidePanelProps) {
  // Generate some helper tips/FYIs based on lesson kind
  const isVowel = lesson.lesson <= 5;
  const lessonTip = isVowel
    ? "Consejo: Enfatiza la vibración de las cuerdas vocales al pronunciar cada vocal. Utiliza gestos con las manos para ilustrar la forma de las vocales."
    : "Consejo: Practica el silabeo dando palmadas para cada sílaba de las palabras nuevas (ej. ma-má, pa-pá).";

  const lessonFyi = isVowel
    ? "FYI: Las vocales son las bases silábicas en español. Asegurar su correcta articulación acelerará el proceso de lectura de consonantes."
    : "FYI: En esta etapa, la asociación grafema-fonema se refuerza a través de la repetición constante y el juego con el piano interactivas.";

  const lessonWarning = "Atención: Verifica que los estudiantes mantengan la dirección de trazo correcta (arriba hacia abajo, izquierda a derecha).";

  return (
    <div className="space-y-6">
      {/* 4-Squares Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Square 1: Objetivos */}
        <div className="premium-glass rounded-2xl overflow-hidden flex flex-col h-[350px] border border-stone-200 bg-white/70 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]">
          <div 
            className="px-5 py-4 flex items-center gap-3 text-white font-black text-base"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span>📋 OBJETIVOS DE APRENDIZAJE</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-stone-200">
            {lesson.objectives.length > 0 ? (
              <ul className="space-y-2.5">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="text-sm text-stone-700 leading-relaxed font-bold flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500 italic">No hay objetivos registrados para esta lección.</p>
            )}
            
            {/* FYI Box */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{lessonFyi}</span>
            </div>
          </div>
        </div>

        {/* Square 2: Procedimiento */}
        <div className="premium-glass rounded-2xl overflow-hidden flex flex-col h-[350px] border border-stone-200 bg-white/70 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]">
          <div 
            className="px-5 py-4 flex items-center gap-3 text-white font-black text-base"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>📖 PROCEDIMIENTO SUGERIDO</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-stone-200">
            {lesson.procedures.length > 0 ? (
              <ol className="space-y-3">
                {lesson.procedures.map((proc, i) => (
                  <li key={i} className="text-sm text-stone-700 leading-relaxed font-bold flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600 font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1">{proc}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-stone-500 italic">No hay procedimiento registrado para esta lección.</p>
            )}

            {/* Tip Box */}
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{lessonTip}</span>
            </div>
          </div>
        </div>

        {/* Square 3: Vocabulario y Poema */}
        <div className="premium-glass rounded-2xl overflow-hidden flex flex-col h-[350px] border border-stone-200 bg-white/70 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]">
          <div 
            className="px-5 py-4 flex items-center gap-3 text-white font-black text-base"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>📝 VOCABULARIO Y POEMA</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-stone-200">
            
            {/* Vocabulary words */}
            {lesson.vocabulary.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2">Palabras Clave</h4>
                <div className="flex flex-wrap gap-2">
                  {lesson.vocabulary.map((vocab, i) => (
                    <span key={i} className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-black">
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Poem lines */}
            {lesson.poem.length > 0 ? (
              <div>
                <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2">Poema / Mini Cuento</h4>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center italic text-sm text-amber-950 font-medium space-y-1">
                  {lesson.poem.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2">Poema / Mini Cuento</h4>
                <p className="text-xs text-stone-500 italic">No hay poemas registrados para esta lección.</p>
              </div>
            )}

            {/* Warning Box */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{lessonWarning}</span>
            </div>
          </div>
        </div>

        {/* Square 4: Evaluacion */}
        <div className="premium-glass rounded-2xl overflow-hidden flex flex-col h-[350px] border border-stone-200 bg-white/70 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.01]">
          <div 
            className="px-5 py-4 flex items-center gap-3 text-white font-black text-base"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
          >
            <CheckSquare className="w-5 h-5 shrink-0" />
            <span>✅ CRITERIOS DE EVALUACIÓN</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-stone-200">
            {lesson.assessment ? (
              <div className="text-sm text-stone-700 font-bold leading-relaxed space-y-2">
                {lesson.assessment.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-stone-700 font-bold leading-relaxed">Criterios de evaluación sugeridos para la lección:</p>
                <ul className="space-y-2">
                  <li className="text-xs font-bold text-stone-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full shrink-0" />
                    <span>Reconoce el grafema visualmente en letras minúsculas y mayúsculas.</span>
                  </li>
                  <li className="text-xs font-bold text-stone-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full shrink-0" />
                    <span>Asocia el sonido fonético con la letra correspondiente de manera correcta.</span>
                  </li>
                  <li className="text-xs font-bold text-stone-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full shrink-0" />
                    <span>Resuelve correctamente los juegos interactivos de la lección.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
