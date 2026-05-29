import { useState } from "react";
import { type CatalogEntry } from "@/lib/lesson-catalog";
import { BookOpen, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface CinemaNarrativeDrawerProps {
  entry: CatalogEntry;
  isOpen: boolean;
  onToggle: () => void;
}

export function CinemaNarrativeDrawer({ entry, isOpen, onToggle }: CinemaNarrativeDrawerProps) {
  // Styles (No inline double-brace JSX objects allowed)
  const drawerStyle = {
    width: isOpen ? "360px" : "16px",
    borderColor: entry.color,
  };
  const toggleBtnBg = { backgroundColor: entry.color };
  const textStyle = { color: entry.color };
  const hrStyle = { borderColor: `${entry.color}30` };
  const cardBgStyle = { backgroundColor: `${entry.color}08`, borderColor: `${entry.color}15` };

  return (
    <aside
      className={`fixed top-0 right-0 h-full bg-[#faf8f5] dark:bg-[#120f0d] shadow-2xl border-l-4 transition-all duration-300 z-50 flex flex-col`}
      style={drawerStyle}
      aria-label="Panel narrativo de apoyo al docente"
      aria-expanded={isOpen}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -left-5 -translate-y-1/2 w-6 h-12 rounded-l-xl text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition"
        style={toggleBtnBg}
        aria-label={isOpen ? "Cerrar panel de apoyo" : "Abrir panel de apoyo"}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Drawer Content */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-200`}>
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
            Guía para el Maestro · Lección {entry.n}
          </span>
          <h2 className="text-2xl font-bold mt-1" style={textStyle}>
            {entry.title}
          </h2>
          <p className="text-sm text-foreground/75 mt-1">{entry.subtitle}</p>
        </div>

        <hr className="border-t-2" style={hrStyle} />

        {/* Dynamic content depending on lesson kind */}
        {entry.kind === "vowel" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/45 mb-2">
                Personaje Asociado
              </h3>
              <div className="p-3 rounded-2xl border" style={cardBgStyle}>
                <div className="font-bold text-sm" style={textStyle}>
                  {entry.lesson.characterName}
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  {entry.lesson.characterDesc}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/45 mb-2">
                Vocabulario de la Lección
              </h3>
              <ul className="grid grid-cols-2 gap-2" role="list">
                {entry.lesson.vocab.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 bg-foreground/5 rounded-xl text-xs font-medium">
                    <span className="capitalize">{item.word}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {entry.kind === "consonant" && (
          <div className="space-y-5">
            {/* Sílabas */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/45 mb-2">
                Sílabas Clave
              </h3>
              <div className="flex flex-wrap gap-1.5" role="region" aria-label="Sílabas">
                {entry.data.syllables.map((syl, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider" style={toggleBtnBg}>
                    {syl}
                  </span>
                ))}
              </div>
            </div>

            {/* Ejemplos de palabras */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/45 mb-2">
                Palabras de Ejemplo
              </h3>
              <div className="space-y-3" role="region" aria-label="Palabras de ejemplo por sílaba">
                {Object.entries(entry.data.examples).map(([syl, words]) => (
                  <div key={syl} className="p-3 rounded-2xl border" style={cardBgStyle}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                      Con sílaba <span className="underline" style={textStyle}>{syl.toUpperCase()}</span>:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {words.map((w, wIdx) => (
                        <span key={wIdx} className="text-xs font-semibold px-2 py-0.5 bg-foreground/5 rounded-lg capitalize">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oraciones */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/45 mb-2">
                Oraciones para Lectura
              </h3>
              <ol className="space-y-2" role="list">
                {entry.data.sentences.map((sent, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed p-2.5 bg-foreground/5 rounded-xl">
                    <span className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={toggleBtnBg}>
                      {idx + 1}
                    </span>
                    <span>{sent}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {entry.kind === "intro" && (
          <div className="text-xs text-foreground/75 leading-relaxed space-y-2">
            <p>Esta es la lección introductoria de la cartilla. Prepárese para guiar a los estudiantes en su emocionante viaje por la lectura interactiva.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
