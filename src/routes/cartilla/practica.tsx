import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, Zap, RotateCcw, Trophy } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { speak } from "@/lib/speak";
import { useLessonProgress } from "@/lib/lesson-progress";
import { recordEvent } from "@/lib/student-session";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";
import { GardenBackdrop } from "@/components/cartilla/GardenBackdrop";
import { KidButton } from "@/components/ui/KidButton";

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

function buildPool(useUnlockedOnly: boolean, isUnlocked: (n: number) => boolean): string[] {
  const pool: string[] = [];
  CATALOG.forEach((e) => {
    if (e.kind !== "consonant") return;
    if (useUnlockedOnly && !isUnlocked(e.n)) return;
    e.data.syllables.forEach((s) => pool.push(s));
  });
  // also include vowels
  ["a", "e", "i", "o", "u"].forEach((v) => pool.push(v));
  return Array.from(new Set(pool));
}

function buildCards(pool: string[], n: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    const syllable = pool[Math.floor(Math.random() * pool.length)];
    // 3 distractors
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
  const { lang } = useLanguage();
  const t = sCopy;
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
    setCards(buildCards(pool, 200));
    setIdx(0);
    setHits(0);
    setMisses(0);
    setSecondsLeft(duration);
    setFeedback(null);
    startedAt.current = Date.now();
    setPhase("playing");
    // pre-speak first
    setTimeout(() => speak(pool[0]), 100);
  };

  const choose = (option: string) => {
    if (!current || feedback) return;
    if (option === current.syllable) {
      setHits((h) => h + 1);
      setFeedback("ok");
      setTimeout(() => {
        setFeedback(null);
        const next = idx + 1;
        setIdx(next);
        if (cards[next]) speak(cards[next].syllable);
      }, 350);
    } else {
      setMisses((m) => m + 1);
      setFeedback("no");
      setTimeout(() => {
        setFeedback(null);
        const next = idx + 1;
        setIdx(next);
        if (cards[next]) speak(cards[next].syllable);
      }, 700);
    }
  };

  const total = hits + misses;
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto relative">
      <GardenBackdrop variant="soft" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to="/cartilla"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t.cartilla[lang]}
          </Link>
          <LanguageToggle />
        </div>

        <header className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-vowel-o bg-vowel-o/10 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4" /> {t.practicaRapida[lang]}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">{t.drillSilabas[lang]}</h1>
          <p className="text-foreground/70 mt-1">{t.escuchaToca[lang]}</p>
        </header>

        {phase === "setup" && (
          <section className="mt-8 kid-card p-5 space-y-4">
            <div>
              <div className="text-sm font-bold mb-2">{t.duracion[lang]}</div>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <KidButton
                    key={d}
                    onClick={() => setDuration(d)}
                    variant={duration === d ? "solid" : "outline"}
                    accent="var(--book-teal)"
                    className="flex-1"
                  >
                    {d} {t.s[lang]}
                  </KidButton>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold mb-2">{t.alcance[lang]}</div>
              <div className="flex gap-2">
                <KidButton
                  onClick={() => setScope("unlocked")}
                  variant={scope === "unlocked" ? "solid" : "outline"}
                  accent="var(--book-teal)"
                  className="flex-1"
                >
                  {t.soloDesbloqueadas[lang]}
                </KidButton>
                <KidButton
                  onClick={() => setScope("all")}
                  variant={scope === "all" ? "solid" : "outline"}
                  accent="var(--book-teal)"
                  className="flex-1"
                >
                  {t.todasLecciones[lang]}
                </KidButton>
              </div>
              <p className="text-[11px] text-foreground/50 mt-2">
                {pool.length} {t.silabasPool[lang]}
              </p>
            </div>
            <button
              onClick={start}
              disabled={pool.length < 4}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" /> {t.empezar[lang]}
            </button>
          </section>
        )}

        {phase === "playing" && current && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3 text-sm font-bold">
              <span className="text-foreground/60">{t.tiempo[lang]}</span>
              <span
                className={`text-2xl font-bold ${secondsLeft <= 10 ? "text-destructive animate-pulse" : ""}`}
              >
                {secondsLeft}
                {t.s[lang]}
              </span>
              <span className="text-success">
                ✓ {hits} <span className="text-destructive ml-2">✗ {misses}</span>
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden border border-foreground/10 mb-6">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(secondsLeft / duration) * 100}%` }}
              />
            </div>

            <div
              className={`kid-card p-8 text-center transition ${
                feedback === "ok"
                  ? "ring-4 ring-success/40"
                  : feedback === "no"
                    ? "ring-4 ring-destructive/40"
                    : ""
              }`}
            >
              <button
                onClick={() => speak(current.syllable)}
                aria-label="Reescuchar"
                className="mb-4 inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary font-bold"
              >
                <Volume2 className="w-4 h-4" /> {t.reescuchar[lang]}
              </button>
              <div className="text-xs text-foreground/50 font-bold uppercase tracking-wide">
                {t.tocaSilaba[lang]}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    className="py-6 rounded-2xl text-3xl font-bold text-white shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-50"
                    style={{ backgroundColor: current.color }}
                    disabled={!!feedback}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {phase === "done" && (
          <section className="mt-8 kid-card p-6 text-center space-y-4">
            <Trophy className="w-12 h-12 mx-auto text-vowel-o" />
            <h2 className="text-2xl font-bold">{t.tiempoHecho[lang]}</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-secondary p-3">
                <div className="text-2xl font-bold text-success">{hits}</div>
                <div className="text-xs text-foreground/60">{t.aciertos[lang]}</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="text-2xl font-bold text-destructive">{misses}</div>
                <div className="text-xs text-foreground/60">{t.errores[lang]}</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="text-2xl font-bold text-primary">{accuracy}%</div>
                <div className="text-xs text-foreground/60">{t.precision[lang]}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPhase("setup")}
                className="flex-1 py-3 rounded-xl border-2 border-foreground/10 font-bold inline-flex items-center justify-center gap-2 hover:bg-secondary"
              >
                <RotateCcw className="w-4 h-4" /> {t.otraVez[lang]}
              </button>
              <button
                onClick={() => navigate({ to: "/cartilla" })}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
              >
                {t.volver[lang]}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
