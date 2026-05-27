/**
 * practica.tsx  — Lane A
 *
 * Randomized 10-exercise mix across all consonants + vowels the student
 * has touched (unlocked). Scoring tracked in useStudentSession / recordEvent.
 * Audio via speak() on every interaction.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, Zap, RotateCcw, Trophy } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { speak } from "@/lib/speak";
import { useLessonProgress } from "@/lib/lesson-progress";
import { recordEvent } from "@/lib/student-session";

export const Route = createFileRoute("/cartilla/practica")({
  component: Practica,
  head: () => ({
    meta: [
      { title: "Práctica rápida — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Drill de 60 segundos: identifica sílabas a toda velocidad.",
      },
    ],
  }),
});

type Card = { syllable: string; options: string[]; lessonN: number; color: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DURATIONS = [60, 90, 120] as const;
const TARGET_EXERCISES = 10;

function buildPool(useUnlockedOnly: boolean, isUnlocked: (n: number) => boolean): string[] {
  const pool: string[] = [];
  CATALOG.forEach((e) => {
    if (e.kind !== "consonant") return;
    if (useUnlockedOnly && !isUnlocked(e.n)) return;
    e.data.syllables.forEach((s) => pool.push(s));
  });
  ["a", "e", "i", "o", "u"].forEach((v) => pool.push(v));
  return Array.from(new Set(pool));
}

function buildCards(pool: string[], n: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    const syllable = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuffle(pool.filter((s) => s !== syllable)).slice(0, 3);
    const options = shuffle([syllable, ...distractors]);
    const fromCatalog = CATALOG.find((e) =>
      e.kind === "consonant" ? e.data.syllables.includes(syllable) : false,
    );
    cards.push({
      syllable,
      options,
      lessonN: fromCatalog?.n ?? 1,
      color: fromCatalog?.color ?? "hsl(var(--primary))",
    });
  }
  return cards;
}

function Practica() {
  const navigate = useNavigate();
  const { isUnlocked } = useLessonProgress();
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(60);
  const [scope, setScope] = useState<"unlocked" | "all">("unlocked");
  const [phase, setPhase] = useState<"setup" | "playing" | "done">("setup");
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const startedAt = useRef<number>(0);

  const current = cards[idx];
  const pool = useMemo(() => buildPool(scope === "unlocked", isUnlocked), [scope, isUnlocked]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsLeft <= 0) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "done") return;
    const total = hits + misses;
    if (total === 0) return;
    recordEvent({
      lessonId: "practica",
      kind: "exercise",
      score: hits,
      total,
      timeSeconds: duration,
      meta: { exercise: "practica_rapida", duration, completed: true },
    });
  }, [phase, hits, misses, duration]);

  const start = () => {
    if (pool.length < 4) return;
    const built = buildCards(pool, TARGET_EXERCISES * 20); // build large pool, iterate first 10
    setCards(built);
    setIdx(0);
    setHits(0);
    setMisses(0);
    setSecondsLeft(duration);
    setFeedback(null);
    startedAt.current = Date.now();
    setPhase("playing");
    setTimeout(() => speak(built[0]?.syllable ?? ""), 100);
  };

  const choose = (option: string) => {
    if (!current || feedback) return;
    speak(option);
    if (option === current.syllable) {
      setHits((h) => h + 1);
      setFeedback("ok");
      setTimeout(() => {
        setFeedback(null);
        const next = idx + 1;
        if (next >= TARGET_EXERCISES) {
          setPhase("done");
          return;
        }
        setIdx(next);
        if (cards[next]) speak(cards[next].syllable);
      }, 350);
    } else {
      setMisses((m) => m + 1);
      setFeedback("no");
      setTimeout(() => {
        setFeedback(null);
        const next = idx + 1;
        if (next >= TARGET_EXERCISES) {
          setPhase("done");
          return;
        }
        setIdx(next);
        if (cards[next]) speak(cards[next].syllable);
      }, 700);
    }
  };

  const exerciseNum = Math.min(idx + 1, TARGET_EXERCISES);
  const total = hits + misses;
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <Link
        to="/cartilla"
        className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
        aria-label="Volver a la Cartilla"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden /> Cartilla
      </Link>

      <header className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-vowel-o bg-vowel-o/10 px-3 py-1 rounded-full">
          <Zap className="w-4 h-4" aria-hidden /> Práctica Rápida
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mt-3">
          {phase === "playing"
            ? `Ejercicio ${exerciseNum} de ${TARGET_EXERCISES}`
            : "Drill de sílabas"}
        </h1>
        <p className="text-foreground/70 mt-1">
          {phase === "setup"
            ? "Escucha la sílaba y toca la respuesta correcta."
            : phase === "playing"
              ? "¿Cuál sílaba escuchas?"
              : "¡Terminaste los 10 ejercicios!"}
        </p>
      </header>

      {/* ── Setup ── */}
      {phase === "setup" && (
        <section className="mt-8 kid-card p-5 space-y-4" aria-label="Configuración de práctica">
          <div>
            <div className="text-sm font-bold mb-2" id="duration-label">Duración máxima</div>
            <div className="flex gap-2" role="group" aria-labelledby="duration-label">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition ${
                    duration === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-foreground/10 hover:bg-secondary"
                  }`}
                  aria-pressed={duration === d}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold mb-2" id="scope-label">Alcance</div>
            <div className="flex gap-2" role="group" aria-labelledby="scope-label">
              <button
                onClick={() => setScope("unlocked")}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                  scope === "unlocked"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/10 hover:bg-secondary"
                }`}
                aria-pressed={scope === "unlocked"}
              >
                Solo desbloqueadas
              </button>
              <button
                onClick={() => setScope("all")}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                  scope === "all"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/10 hover:bg-secondary"
                }`}
                aria-pressed={scope === "all"}
              >
                Todas las lecciones
              </button>
            </div>
            <p className="text-[11px] text-foreground/50 mt-2">{pool.length} sílabas en el pool.</p>
          </div>
          <button
            onClick={start}
            disabled={pool.length < 4}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition"
            aria-label="Empezar práctica rápida"
          >
            <Zap className="w-5 h-5" aria-hidden /> Empezar ({TARGET_EXERCISES} ejercicios)
          </button>
        </section>
      )}

      {/* ── Playing ── */}
      {phase === "playing" && current && (
        <section className="mt-6" aria-label="Ejercicio activo">
          <div className="flex items-center justify-between mb-3 text-sm font-bold">
            <span className="text-foreground/60">Tiempo</span>
            <span
              className={`text-2xl font-bold ${secondsLeft <= 10 ? "text-destructive animate-pulse" : ""}`}
              aria-live="polite"
              aria-label={`${secondsLeft} segundos restantes`}
            >
              {secondsLeft}s
            </span>
            <span className="text-success" aria-live="polite">
              ✓ {hits}{" "}
              <span className="text-destructive ml-2">✗ {misses}</span>
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden border border-foreground/10 mb-2">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(secondsLeft / duration) * 100}%` }}
            />
          </div>
          {/* Exercise progress */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: TARGET_EXERCISES }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    i < idx
                      ? "hsl(var(--success))"
                      : i === idx
                        ? current.color
                        : "hsl(var(--foreground)/0.12)",
                }}
                aria-hidden
              />
            ))}
          </div>

          <div
            className={`kid-card p-8 text-center transition ${
              feedback === "ok"
                ? "ring-4 ring-success/40"
                : feedback === "no"
                  ? "ring-4 ring-destructive/40"
                  : ""
            }`}
            role="group"
            aria-label={`Toca la sílaba que escuchas: ${current.syllable}`}
          >
            <button
              onClick={() => speak(current.syllable)}
              aria-label="Volver a escuchar"
              className="mb-4 inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary font-bold"
            >
              <Volume2 className="w-4 h-4" aria-hidden /> Reescuchar
            </button>
            <div className="text-xs text-foreground/50 font-bold uppercase tracking-wide">
              Toca la sílaba que escuchas
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => choose(opt)}
                  className="py-6 rounded-2xl text-3xl font-bold text-white shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-50"
                  style={{ backgroundColor: current.color }}
                  disabled={!!feedback}
                  aria-label={`Respuesta: ${opt}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Done ── */}
      {phase === "done" && (
        <section
          className="mt-8 kid-card p-6 text-center space-y-4"
          aria-label="Resultados de la práctica"
        >
          <Trophy className="w-12 h-12 mx-auto text-vowel-o" aria-hidden />
          <h2 className="text-2xl font-bold">
            {hits === TARGET_EXERCISES ? "¡Perfecto!" : "¡Tiempo!"}
          </h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-2xl font-bold text-success" aria-label={`${hits} aciertos`}>{hits}</div>
              <div className="text-xs text-foreground/60">Aciertos</div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-2xl font-bold text-destructive" aria-label={`${misses} errores`}>{misses}</div>
              <div className="text-xs text-foreground/60">Errores</div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-2xl font-bold text-primary" aria-label={`${accuracy}% precisión`}>{accuracy}%</div>
              <div className="text-xs text-foreground/60">Precisión</div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setPhase("setup")}
              className="flex-1 py-3 rounded-xl border-2 border-foreground/10 font-bold inline-flex items-center justify-center gap-2 hover:bg-secondary"
              aria-label="Volver a configurar la práctica"
            >
              <RotateCcw className="w-4 h-4" aria-hidden /> Otra vez
            </button>
            <button
              onClick={() => navigate({ to: "/cartilla" })}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
              aria-label="Volver a la Cartilla"
            >
              Volver
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
