import { useMemo, useRef, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord, playWrongBuzz } from "@/lib/piano-audio";

export function SyllableTapGame({
  syllables,
  color,
  lessonId,
  onComplete,
}: {
  syllables: string[];
  color: string;
  lessonId?: string;
  onComplete?: () => void;
}) {
  const sounds = useMemo(
    () => [...new Set(syllables.filter((s) => s.trim()))],
    [syllables],
  );
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [heard, setHeard] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const locked = useRef(false);
  const attempts = useRef(0);
  const { play } = useAudio();
  const target = sounds[round];
  const finished = answered && round === sounds.length - 1;
  const choices = useMemo(() => {
    const result = [...sounds];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }, [sounds]);

  if (!target) return null;

  function answer(value: string) {
    if (!heard || locked.current) return;
    const correct = value === target;
    attempts.current += 1;
    if (lessonId)
      recordEvent({
        lessonId,
        kind: "exercise",
        score: correct ? 1 : 0,
        total: 1,
        meta: {
          exercise: "syllable_tap",
          round: round + 1,
          attempt: attempts.current,
          completed: correct && round === sounds.length - 1,
        },
      });
    gretelEvent(correct ? "answer:correct" : "answer:wrong");
    if (!correct) {
      setWrong(value);
      playWrongBuzz();
      play(target);
      return;
    }
    locked.current = true;
    setAnswered(true);
    setWrong(null);
    playCorrectChord();
    if (round === sounds.length - 1) {
      gretelEvent("activity:complete");
      onComplete?.();
    }
  }

  return (
    <section
      className="rounded-2xl border-2 border-foreground/10 bg-card p-4 sm:p-6"
      aria-label="Escucha y elige"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold">Escucha y elige</h3>
        <span role="status" className="text-sm font-bold">
          {round + (answered ? 1 : 0)} de {sounds.length}
        </span>
      </div>
      <div className="mb-5 flex gap-2" aria-hidden="true">
        {sounds.map((sound, i) => (
          <span
            key={sound}
            className="h-2 flex-1 rounded-full"
            style={{
              background:
                i < round || (i === round && answered) ? color : "#e7e5e4",
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setHeard(true);
          play(target);
        }}
        className="mb-5 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
        style={{ backgroundColor: color }}
      >
        <Volume2 aria-hidden="true" className="h-5 w-5" /> Escuchar
      </button>
      <div className="flex flex-wrap gap-3">
        {choices.map((sound) => (
          <button
            type="button"
            key={sound}
            disabled={!heard || answered}
            onClick={() => answer(sound)}
            aria-label={sound}
            className="min-h-14 min-w-16 rounded-2xl border-2 px-5 py-3 text-xl font-bold transition active:scale-95 disabled:cursor-default"
            style={{
              borderColor: wrong === sound ? "#be123c" : color,
              background: answered && sound === target ? color : "white",
              color: answered && sound === target ? "white" : "#292524",
            }}
          >
            {sound}
          </button>
        ))}
      </div>
      {answered && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-2 font-bold"
            role="status"
          >
            <Check aria-hidden="true" className="h-5 w-5" />
            {finished ? "Completado" : "Correcto"}
          </span>
          {!finished && (
            <button
              type="button"
              className="min-h-12 rounded-xl px-5 py-3 font-bold text-white"
              style={{ background: color }}
              onClick={() => {
                setRound((r) => r + 1);
                setAnswered(false);
                setHeard(false);
                locked.current = false;
              }}
            >
              Siguiente sonido
            </button>
          )}
        </div>
      )}
    </section>
  );
}
