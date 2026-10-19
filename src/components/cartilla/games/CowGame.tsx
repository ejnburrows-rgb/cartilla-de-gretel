import { useState, useRef, useEffect } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import type { GameContent } from "@/lib/games/gameContent";
import { playWord } from "@/lib/games/wordAudio";
import { recordEvent } from "@/lib/student-session";

/**
 * Cow game (juego de la vaca) — Mm syllable matching.
 *
 * Sequence per word:
 * 1. The cow walks from the left to the fence slot (CSS walk animation).
 * 2. The fence gate opens (CSS gate animation).
 * 3. The cow stands under its target syllable.
 * 4. The child taps a syllable tile.
 *    - Correct: tile marks green (slow), "ma" placeholder audio plays,
 *      cow celebrates, next word.
 *    - Wrong: tile marks red then erases, "Inténtalo otra vez." shows,
 *      moo placeholder audio plays, cow walks back for a retry.
 *
 * Audio is placeholder-only: playWord() no-ops when no audioUrl is set.
 * No generated voice, no TTS. Real owner recordings wire in later via
 * audioUrl with zero component changes.
 *
 * Answer marking follows PR #903: every mark starts ash/gray; correct
 * turns green slowly; wrong turns red, then erases.
 */

type Phase = "walking" | "gate-open" | "ready" | "correct" | "wrong" | "returning" | "done";

function finishGame(content: GameContent, score: number, total: number) {
  recordEvent({
    lessonId: `game:${content.id}`,
    kind: "exercise",
    score,
    total,
    meta: { exercise: content.type, completed: true, gameId: content.id },
  });
}

export function CowGame({ content }: { content: GameContent }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("walking");
  const [picked, setPicked] = useState<string | null>(null);
  const [markState, setMarkState] = useState<"ash" | "green" | "red">("ash");
  const [score, setScore] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const timers = useRef<number[]>([]);

  const word = content.words[wordIndex];
  const done = wordIndex >= content.words.length;
  const targetSyllable = word?.syllables[0] ?? "";
  const cowArt = content.assets?.props?.cow ?? "/cartilla/art/games/cow.png";

  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  // Entrance choreography: walk -> gate opens -> ready
  useEffect(() => {
    if (done) return;
    setPhase("walking");
    setPicked(null);
    setMarkState("ash");
    setShowRetry(false);
    later(1400, () => setPhase("gate-open"));
    later(2200, () => setPhase("ready"));
  }, [wordIndex, done]);

  const reset = () => {
    setWordIndex(0);
    setScore(0);
    setPhase("walking");
    setPicked(null);
    setMarkState("ash");
    setShowRetry(false);
  };

  if (done) {
    return (
      <section className="kid-card p-5 sm:p-7 space-y-5" aria-label="Juego completado">
        <h2 className="text-2xl font-black text-center">¡La vaca está feliz!</h2>
        <p className="text-center font-bold text-stone-600">
          {score} de {content.words.length} sílabas correctas
        </p>
        <button
          onClick={reset}
          className="mx-auto flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground min-h-[44px]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Jugar otra vez
        </button>
      </section>
    );
  }

  const choose = (tile: string) => {
    if (phase !== "ready") return;
    setPicked(tile);
    const correct = tile.toLocaleLowerCase("es") === targetSyllable.toLocaleLowerCase("es");

    if (correct) {
      // Correct: mark turns green slowly, "ma" placeholder audio, validate.
      setMarkState("green");
      setPhase("correct");
      playWord(word.audioUrl); // placeholder — no-ops until owner recording is wired
      setScore((s) => s + 1);
      later(1400, () => {
        const nextIndex = wordIndex + 1;
        if (nextIndex === content.words.length) {
          finishGame(content, score + 1, content.words.length);
        }
        setWordIndex(nextIndex);
      });
    } else {
      // Wrong: mark turns red, then erases; moo placeholder; cow returns.
      setMarkState("red");
      setPhase("wrong");
      setShowRetry(true);
      playWord(undefined); // moo placeholder — labeled "audio pending" below
      later(900, () => {
        setMarkState("ash"); // red erases back to ash per PR #903
        setPicked(null);
      });
      later(1100, () => setPhase("returning"));
      later(2300, () => {
        setShowRetry(false);
        setPhase("walking");
        later(1400, () => setPhase("gate-open"));
        later(2200, () => setPhase("ready"));
      });
    }
  };

  const cowPosition =
    phase === "walking" || phase === "returning"
      ? "cow-game-cow--walking"
      : "cow-game-cow--at-fence";
  const gateOpen = phase === "gate-open" || phase === "ready" || phase === "correct" || phase === "wrong";

  return (
    <section className="kid-card p-5 sm:p-7 space-y-5" aria-label="Juego de la vaca">
      <style>{`
        .cow-game-scene { position: relative; overflow: hidden; border-radius: 1rem; background: linear-gradient(#bfe3f5 0%, #dff0fb 55%, #b9e0a8 55%, #9ed18a 100%); min-height: 220px; }
        .cow-game-cow { position: absolute; bottom: 18%; left: 4%; width: 96px; transition: left 1.3s ease-in-out; z-index: 2; }
        .cow-game-cow--walking { left: 4%; animation: cow-bob 0.5s ease-in-out infinite alternate; }
        .cow-game-cow--at-fence { left: 42%; }
        @keyframes cow-bob { from { transform: translateY(0); } to { transform: translateY(-6px); } }
        .cow-game-fence { position: absolute; bottom: 12%; left: 38%; width: 120px; height: 90px; z-index: 1; }
        .cow-game-gate { transform-origin: left center; transition: transform 0.7s ease-in-out; }
        .cow-game-gate--open { transform: perspective(300px) rotateY(-70deg); }
        .cow-game-target { position: absolute; bottom: 2%; left: 42%; transform: translateX(-50%); z-index: 3; }
        @media (prefers-reduced-motion: reduce) {
          .cow-game-cow { transition: none; animation: none; }
          .cow-game-gate { transition: none; }
        }
      `}</style>

      {/* Scene: cow walks to fence, gate opens, cow stands under syllable */}
      <div className="cow-game-scene" role="img" aria-label={`La vaca camina a la cerca para la sílaba ${targetSyllable}`}>
        <img src={cowArt} alt="Vaca" className={`cow-game-cow ${cowPosition}`} draggable={false} />
        {/* Fence with gate */}
        <svg className="cow-game-fence" viewBox="0 0 120 90" aria-hidden>
          <rect x="4" y="10" width="10" height="76" fill="#8b5e34" rx="3" />
          <rect x="106" y="10" width="10" height="76" fill="#8b5e34" rx="3" />
          <rect x="4" y="18" width="112" height="10" fill="#a06a3b" rx="3" />
          <rect x="4" y="66" width="112" height="10" fill="#a06a3b" rx="3" />
          <g className={`cow-game-gate ${gateOpen ? "cow-game-gate--open" : ""}`}>
            <rect x="14" y="30" width="92" height="8" fill="#c07f45" rx="3" />
            <rect x="14" y="48" width="92" height="8" fill="#c07f45" rx="3" />
            <rect x="50" y="26" width="8" height="38" fill="#a06a3b" rx="2" />
          </g>
        </svg>
        <div className="cow-game-target">
          <span className="inline-block rounded-xl border-2 border-teal-700 bg-white px-4 py-2 text-2xl font-black text-teal-800">
            {targetSyllable}
          </span>
        </div>
      </div>

      {/* Syllable tiles */}
      <div>
        <p className="text-center font-bold text-stone-600 mb-3">
          Palabra {wordIndex + 1} de {content.words.length}: <span className="text-stone-900">{word.word}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Elige la sílaba">
          {(content.tiles ?? []).map((tile) => {
            const isPicked = picked === tile;
            const tileClass =
              isPicked && markState === "green"
                ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                : isPicked && markState === "red"
                  ? "border-rose-500 bg-rose-100 text-rose-900"
                  : "border-stone-300 bg-stone-100 text-stone-700"; // ash/gray start per PR #903
            
            const transitionDuration = isPicked && markState === "green" ? "duration-1000" : "";

            return (
              <button
                key={tile}
                onClick={() => choose(tile)}
                disabled={phase !== "ready"}
                aria-label={`Sílaba ${tile}`}
                className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-5 py-3 text-2xl font-black transition-colors ${transitionDuration} ${tileClass} ${
                  phase !== "ready" ? "opacity-60" : "hover:border-teal-600"
                }`}
              >
                {tile}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      <div aria-live="polite" className="min-h-[3rem] text-center">
        {phase === "correct" && (
          <p className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-2 font-bold text-emerald-800">
            <Check className="h-5 w-5" aria-hidden /> ¡Correcto! La vaca dice ma.
          </p>
        )}
        {showRetry && (
          <p className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-2 font-bold text-rose-800">
            <X className="h-5 w-5" aria-hidden /> Inténtalo otra vez. La vaca dice muu y regresa.
          </p>
        )}
      </div>

      {/* Audio pending label — placeholder only, no generated voice */}
      <p className="text-center text-xs font-semibold text-stone-400">
        <Volume2 className="mr-1 inline h-3 w-3" aria-hidden />
        Audio pendiente — se usarán las grabaciones del dueño cuando estén listas.
      </p>
    </section>
  );
}
