import { useState, useEffect } from "react";
import { BookArtFigure } from "@/components/cartilla/BookArtFigure";
import { ActivityCarousel } from "@/components/cartilla/ActivityCarousel";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import { GretelMascot } from "@/components/gretel/GretelMascot";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { playCorrectChord } from "@/lib/piano-audio";
import { Check } from "lucide-react";
import "@/styles/cartilla-student.css";

interface StudentExercisePaneProps {
  entry: CatalogEntry;
  lessonId: string;
  timeLimitSeconds?: number | null;
  onAllCompleted?: () => void;
}

export function StudentExercisePane({
  entry,
  lessonId,
  timeLimitSeconds,
  onAllCompleted,
}: StudentExercisePaneProps) {
  const STORAGE_KEY_CAROUSEL = `cartilla.exercise-done.carousel.v1.${lessonId}`;
  const STORAGE_KEY_READING = `cartilla.exercise-done.reading.v1.${lessonId}`;

  const [carouselCompleted, setCarouselCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_CAROUSEL) === "true";
  });

  const [readingCompleted, setReadingCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_READING) === "true";
  });

  const accent = entry.color;

  // Deriving syllables
  const syllables: string[] = (() => {
    if (entry.kind === "consonant") return entry.data.syllables;
    if (entry.kind === "vowel") return [entry.vowel, ...["a", "e", "i", "o", "u"].filter((v) => v !== entry.vowel)];
    return ["a", "e", "i", "o", "u"];
  })();

  // Deriving words and attaching emojis for matching game
  const words: Array<{ word: string; emoji?: string }> = (() => {
    const emojiMap: Record<string, string> = {
      mamá: "👩", papá: "👨", nene: "👶", sapo: "🐸", pelota: "⚽",
      mesa: "🪑", gato: "🐱", perro: "🐶", casa: "🏠", rosa: "🌹",
      oso: "🐻", uva: "🍇", ala: "🪶", isla: "🏝️", mano: "✋",
      lupa: "🔍", sopa: "🥣", puma: "🐆", taza: "☕", bota: "🥾",
      pelo: "💇", mapa: "🗺️", pipa: "🚬", pomo: "🧴", mula: "🐴",
      sala: "🛋️", loma: "⛰️", pila: "🔋", lima: "🍋", pala: "🧹",
      paloma: "🕊️", solo: "🙋", sola: "🙋‍♀️", lila: "🌸", malo: "👿",
      misa: "⛪", peso: "⚖️", piso: "🏢", paso: "🚶", suma: "➕",
      nena: "👧", pie: "🦶", pato: "🦆", pino: "🌲", tina: "🛁",
      nido: "🪺", foco: "💡"
    };

    if (entry.kind === "consonant") {
      const out: Array<{ word: string; emoji?: string }> = [];
      for (const list of Object.values(entry.data.examples)) {
        if (Array.isArray(list) && list.length > 0) {
          const w = list[0];
          if (typeof w === "string" && w.length > 0) {
            const lowercaseW = w.toLowerCase().trim();
            out.push({ word: w, emoji: emojiMap[lowercaseW] || "⭐" });
          }
        }
      }
      return out;
    }
    if (entry.kind === "vowel") {
      return (entry.lesson.vocab || []).map((v) => ({
        word: v.word,
        emoji: v.emoji || emojiMap[v.word.toLowerCase().trim()] || "⭐"
      }));
    }
    return [
      { word: "ala", emoji: "🪶" },
      { word: "oso", emoji: "🐻" },
      { word: "uva", emoji: "🍇" },
      { word: "isla", emoji: "🏝️" },
    ];
  })();

  // Deriving book sentences
  const sentences: string[] = (() => {
    if (entry.kind === "consonant") return entry.data.sentences ?? [];
    if (entry.kind === "vowel") {
      return (entry.lesson.vocab ?? [])
        .map((v) => v.word)
        .filter((w): w is string => typeof w === "string" && w.length > 0)
        .slice(0, 3);
    }
    return [];
  })();

  const letter = (() => {
    if (entry.kind === "consonant") return entry.letter;
    if (entry.kind === "vowel") return entry.vowel;
    return "A";
  })();

  const isAllDone = carouselCompleted && (sentences.length === 0 || readingCompleted);

  // Trigger completion callbacks
  useEffect(() => {
    if (isAllDone && onAllCompleted) {
      onAllCompleted();
    }
  }, [isAllDone, onAllCompleted]);

  const handleCarouselComplete = () => {
    setCarouselCompleted(true);
    try {
      localStorage.setItem(STORAGE_KEY_CAROUSEL, "true");
    } catch {}
  };

  const handleReadingComplete = () => {
    setReadingCompleted(true);
    playCorrectChord();
    try {
      localStorage.setItem(STORAGE_KEY_READING, "true");
    } catch {}
  };

  return (
    <div className="student-exercise-pane relative space-y-6 pb-20">
      {/* Dynamic Mascot Guide */}
      <div className="absolute -top-12 -right-4 z-10 hidden sm:block">
        <GretelMascot pose="point" className="scale-75 origin-bottom-right" />
      </div>

      {/* Book artwork illustration */}
      <BookArtFigure
        lesson={entry.n}
        role="character"
        className="w-full mb-2"
        style={{ aspectRatio: "4/3", maxHeight: "18rem" } as React.CSSProperties}
      />

      {/* Main Interactive Carousel container */}
      <div className="w-full">
        <ActivityCarousel
          lessonNumber={entry.n}
          syllables={syllables}
          words={words}
          letter={letter}
          color={accent}
          lessonId={lessonId}
          onCompleteAll={handleCarouselComplete}
        />
      </div>

      {/* Reading Sentences section (renders if lesson has sentences) */}
      {sentences.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-stone-200/40">
          <div className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
            Lee con el maestro
          </div>
          <ol className="space-y-3.5 rounded-3xl border border-stone-200 bg-white/85 p-5 text-base font-bold text-amber-950 shadow-[0_18px_42px_rgba(50,30,10,0.07)]">
            {sentences.map((s, i) => (
              <li key={`${lessonId}-s${i}`} className="flex items-start gap-3">
                <span
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
                  style={{ backgroundColor: accent }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>

          {readingCompleted ? (
            <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-5 h-5 text-emerald-600" />
              ¡Ya leíste las oraciones!
            </div>
          ) : (
            <button
              type="button"
              className="w-full rounded-2xl py-3 text-sm font-black text-white shadow-md transition hover:brightness-105 active:scale-95"
              style={{ backgroundColor: accent }}
              onClick={handleReadingComplete}
            >
              Ya leí ✓
            </button>
          )}
        </section>
      )}

      {/* Sticky footer timer and status */}
      <div className="lesson-sticky-bar flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-md border-t border-stone-200/50 fixed bottom-0 left-0 right-0 z-30 shadow-md">
        <LessonTimer limitSeconds={timeLimitSeconds ?? null} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500">Juegos:</span>
          <div
            className={`w-3.5 h-3.5 rounded-full border ${
              carouselCompleted ? "bg-emerald-500 border-emerald-600" : "bg-stone-200 border-stone-300"
            }`}
          />
          {sentences.length > 0 && (
            <>
              <span className="text-xs font-bold text-stone-500 ml-2">Lectura:</span>
              <div
                className={`w-3.5 h-3.5 rounded-full border ${
                  readingCompleted ? "bg-emerald-500 border-emerald-600" : "bg-stone-200 border-stone-300"
                }`}
              />
            </>
          )}
        </div>
      </div>

      {/* Final celebration trigger when everything is complete */}
      {isAllDone && (
        <div className="fixed bottom-24 right-4 z-40 animate-bounce">
          <GretelMascot
            pose="celebrate"
            text="¡Excelente!\n¡Completaste toda la lección!"
            bubblePosition="left"
            showCloseButton={true}
          />
        </div>
      )}
    </div>
  );
}
