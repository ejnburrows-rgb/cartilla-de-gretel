import { useState, useEffect, useMemo } from "react";
import { Volume2, RotateCcw, Check, Sparkles } from "lucide-react";
import { speak } from "@/lib/speak";
import { feelBus } from "@/lib/feel-bus";
import { recordEvent } from "@/lib/student-session";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { cn } from "@/lib/utils";

interface TapObjectActivityProps {
  entry: CatalogEntry;
  accent: string;
  lessonId?: string;
  onComplete?: () => void;
}

type Bubble = {
  id: number;
  text: string;
  isTarget: boolean;
  x: number; // percentage
  y: number; // percentage
  speedX: number;
  speedY: number;
  color: string;
};

export function TapObjectActivity({ entry, accent, lessonId, onComplete }: TapObjectActivityProps) {
  // Derive syllables based on current lesson
  const syllables: string[] = useMemo(() => {
    if (entry.kind === "consonant") return entry.data.syllables;
    if (entry.kind === "vowel") return [entry.vowel, "a", "e", "i", "o", "u"].filter((v, i, self) => self.indexOf(v) === i);
    return ["a", "e", "i", "o", "u"];
  }, [entry]);

  const targetSyllable = syllables[0] ?? "ma";

  // Generate targets and distractors
  const bubbleData = useMemo(() => {
    const targets = [
      targetSyllable,
      targetSyllable.toUpperCase(),
      `${targetSyllable}no`, // e.g. mano
      `${targetSyllable}pa`, // e.g. mapa
    ].slice(0, 3);

    const distractors = [
      "pe",
      "sapo",
      "lo",
      "tu",
    ].slice(0, 3);

    const merged = [
      ...targets.map((t) => ({ text: t, isTarget: true })),
      ...distractors.map((d) => ({ text: d, isTarget: false })),
    ];

    // Shuffle and assign float positions
    return merged.map((b, idx) => ({
      id: idx,
      text: b.text,
      isTarget: b.isTarget,
      x: 10 + Math.random() * 70, // 10% to 80%
      y: 15 + Math.random() * 60, // 15% to 75%
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      color: b.isTarget
        ? `hsl(${200 + idx * 25}, 80%, 75%)` // beautiful pastel blues/purples
        : `hsl(${10 + idx * 25}, 85%, 80%)`, // beautiful pastel warm tones
    }));
  }, [targetSyllable]);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize bubbles
  useEffect(() => {
    setBubbles(bubbleData);
    setPoppedCount(0);
    setAttempts(0);
    setWrongId(null);
    setSuccess(false);
  }, [bubbleData]);

  // Handle slow drift floating physics animation loop
  useEffect(() => {
    if (success) return;

    let frameId: number;

    const updatePositions = () => {
      setBubbles((prev) =>
        prev.map((b) => {
          let nextX = b.x + b.speedX;
          let nextY = b.y + b.speedY;

          // Bounce off container walls
          let nextSpeedX = b.speedX;
          let nextSpeedY = b.speedY;

          if (nextX <= 5 || nextX >= 90) {
            nextSpeedX = -b.speedX;
            nextX = Math.max(5, Math.min(90, nextX));
          }
          if (nextY <= 5 || nextY >= 85) {
            nextSpeedY = -b.speedY;
            nextY = Math.max(5, Math.min(85, nextY));
          }

          return {
            ...b,
            x: nextX,
            y: nextY,
            speedX: nextSpeedX,
            speedY: nextSpeedY,
          };
        })
      );
      frameId = requestAnimationFrame(updatePositions);
    };

    frameId = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(frameId);
  }, [success]);

  const handleBubbleClick = (b: Bubble) => {
    if (success) return;
    setAttempts((a) => a + 1);

    if (b.isTarget) {
      speak(b.text);
      feelBus.emit("sparkle"); // bubble pop sound

      setBubbles((prev) => prev.filter((x) => x.id !== b.id));
      const nextPopped = poppedCount + 1;
      setPoppedCount(nextPopped);

      // Check if all correct targets are popped
      const remainingTargets = bubbles.filter((x) => x.isTarget && x.id !== b.id);
      if (remainingTargets.length === 0) {
        setSuccess(true);
        feelBus.emit("success");

        if (lessonId) {
          recordEvent({
            lessonId,
            kind: "exercise",
            score: 3,
            total: attempts + 1,
            meta: { exercise: "tap_object_activity", targetSyllable, completed: true },
          });
        }

        if (onComplete) {
          setTimeout(onComplete, 1600);
        }
      }
    } else {
      setWrongId(b.id);
      feelBus.emit("error");
      setTimeout(() => setWrongId(null), 600);
    }
  };

  const handleReset = () => {
    setBubbles(bubbleData);
    setPoppedCount(0);
    setAttempts(0);
    setWrongId(null);
    setSuccess(false);
    feelBus.emit("tap");
  };

  return (
    <div
      className="p-5 rounded-3xl border-2 border-foreground/10 bg-card select-none relative overflow-hidden"
      style={{ "--accent-color": accent } as React.CSSProperties}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-foreground font-fredoka flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Burbujas de Sílabas
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => speak(targetSyllable)}
            aria-label="Escuchar sílaba"
            className="p-1.5 rounded-xl border-2 border-foreground/10 hover:bg-secondary transition active:scale-95 animate-bounce"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reiniciar actividad"
            className="p-1.5 rounded-xl border-2 border-foreground/10 hover:bg-secondary transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/50 mb-4">
<p className="text-sm font-bold text-amber-950 dark:text-amber-300 text-center font-fredoka">
           ¡Toca todos los globos que contengan o empiecen con la sílaba:{" "}
           <span className="text-lg text-primary underline font-extrabold">{targetSyllable}</span>!
        </p>
      </div>

      {/* Floating Game Arena */}
      <div className="relative h-64 w-full rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50/50 dark:from-neutral-900 dark:to-neutral-950 border border-blue-100 overflow-hidden shadow-inner">
        {bubbles.map((b) => {
          const isWrong = wrongId === b.id;

          return (
            <button
              key={b.id}
              onClick={() => handleBubbleClick(b)}
              disabled={success}
              className={cn(
                "absolute px-4 py-3 rounded-full font-fredoka font-bold text-base border-2 shadow-md flex items-center justify-center transition-all active:scale-95 duration-100 hover:brightness-105 select-none",
                isWrong && "border-destructive bg-destructive text-white animate-shake"
              )}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                backgroundColor: isWrong ? undefined : b.color,
                borderColor: isWrong ? undefined : "white",
                color: isWrong ? undefined : "hsl(215, 60%, 25%)",
              }}
            >
              {b.text}
            </button>
          );
        })}

        {success && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/75 flex flex-col items-center justify-center p-4 animate-fade-in z-10">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-success font-fredoka text-center">
              ¡Maravilloso! Explotaste todas las burbujas correctas.
            </h4>
            <p className="text-xs text-foreground/60 text-center mt-1">
              Aciertos totales: {poppedCount} de {attempts} intentos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
