import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Volume2 } from "lucide-react";
import {
  buildSoundSearchChoices,
  matchesInitialSound,
  type AuthenticActivityWord,
} from "@/lib/activity-mechanics";
import { gretelEvent } from "@/lib/gretel-bus";
import { speakAsGretel } from "@/lib/gretel-voice";
import { recordEvent } from "@/lib/student-session";
import { LivingIllustration } from "@/components/living/LivingIllustration";

interface SoundSearchProps {
  targetSound: string;
  words: AuthenticActivityWord[];
  canonicalPool?: AuthenticActivityWord[];
  color: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function SoundSearch({
  targetSound,
  words,
  canonicalPool = [],
  color,
  lessonId,
  onComplete,
}: SoundSearchProps) {
  const choices = useMemo(
    () => buildSoundSearchChoices(targetSound, words, canonicalPool),
    [canonicalPool, targetSound, words],
  );
  const targetKeys = useMemo(
    () =>
      new Set(
        choices
          .filter((item) => matchesInitialSound(item.word, targetSound))
          .map((item) => item.word.toLocaleLowerCase("es")),
      ),
    [choices, targetSound],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [missKey, setMissKey] = useState<string | null>(null);
  const completedRef = useRef(false);

  const hearTarget = () => {
    void speakAsGretel(targetSound);
  };

  const choose = (item: AuthenticActivityWord) => {
    if (completedRef.current) return;
    const key = item.word.toLocaleLowerCase("es");
    const correct = targetKeys.has(key);

    if (!correct) {
      setMissKey(key);
      window.setTimeout(() => setMissKey((current) => (current === key ? null : current)), 700);
      gretelEvent("answer:wrong");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: 0,
          total: 1,
          meta: { exercise: "sound_search", target: targetSound, word: item.word },
        });
      }
      return;
    }

    if (selected.has(key)) return;
    const next = new Set(selected).add(key);
    setSelected(next);
    gretelEvent("answer:correct");
    if (lessonId) {
      recordEvent({
        lessonId,
        kind: "exercise",
        score: 1,
        total: 1,
        meta: { exercise: "sound_search", target: targetSound, word: item.word },
      });
    }

    if (targetKeys.size > 0 && [...targetKeys].every((target) => next.has(target))) {
      completedRef.current = true;
      gretelEvent("activity:complete");
      if (lessonId) {
        recordEvent({
          lessonId,
          kind: "exercise",
          score: targetKeys.size,
          total: targetKeys.size,
          meta: { exercise: "sound_search", target: targetSound, completed: true },
        });
      }
      onComplete?.();
    }
  };

  if (choices.length === 0 || targetKeys.size === 0) {
    return (
      <p className="rounded-2xl bg-white p-5 text-center text-sm font-bold text-stone-600">
        Esta lección todavía no tiene suficientes ilustraciones auténticas para esta actividad.
      </p>
    );
  }

  return (
    <section className="space-y-4" aria-label="La búsqueda del sonido">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
            La búsqueda del sonido
          </p>
          <h4 className="mt-1 text-lg font-black text-stone-900">
            Busca las imágenes que empiezan con <span style={{ color }}>{targetSound.toUpperCase()}</span>
          </h4>
        </div>
        <button
          type="button"
          onClick={hearTarget}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm font-black text-stone-700 shadow-sm"
          aria-label={`Escuchar ${targetSound}`}
        >
          <Volume2 className="h-5 w-5" /> Escuchar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {choices.map((item) => {
          const key = item.word.toLocaleLowerCase("es");
          const isSelected = selected.has(key);
          const isMiss = missKey === key;
          return (
            <motion.button
              key={`${item.word}-${item.illustrationSrc}`}
              type="button"
              onClick={() => choose(item)}
              whileTap={{ scale: 0.96 }}
              className="relative flex min-h-40 flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 bg-white p-3 shadow-sm"
              style={{
                borderColor: isSelected
                  ? color
                  : isMiss
                    ? "#d6a13a"
                    : "rgba(120,113,108,0.16)",
                background: isMiss ? "#fff8e8" : "#fff",
              }}
              aria-pressed={isSelected}
            >
              <LivingIllustration
                src={item.illustrationSrc}
                alt={item.word}
                loading="lazy"
                className="h-24 w-full"
              />
              <span className="text-sm font-black text-stone-800">{item.word}</span>
              {isSelected && (
                <span
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white shadow"
                  style={{ background: color }}
                  aria-label="Correcto"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
