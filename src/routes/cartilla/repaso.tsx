import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { recordEvent, useSessionEvents } from "@/lib/student-session";
import { SyllableTap, WordMatch } from "@/components/cartilla/Ejercicios";
import { AudioControls } from "@/components/cartilla/AudioControls";
import { AccessibilityPanel } from "@/components/cartilla/AccessibilityPanel";
import { StudentProgressBar } from "@/components/cartilla/StudentProgressBar";

export const Route = createFileRoute("/cartilla/repaso")({
  component: Repaso,
  head: () => ({ meta: [{ title: "Repaso - La Cartilla de Gretel" }] }),
});

type ReviewKind = "syllable" | "word";
type Word = { word: string; emoji?: string };
type ReviewItem = {
  key: string;
  kind: ReviewKind;
  entry: CatalogEntry;
  syllables: string[];
  words: Word[];
};

const REVIEW_TARGET_COUNT = 12;
const ADVANCE_DELAY_MS = 600;
const REVIEW_SURFACE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 12% 10%, #fff3b0, transparent 30%), radial-gradient(circle at 88% 12%, #b9f3ff, transparent 30%), linear-gradient(135deg, #fff8de, #ffd6e3 48%, #d9efff)",
};

function accentTextStyle(color: string): CSSProperties {
  return { color };
}

function accentBackgroundStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function accentBorderStyle(color: string): CSSProperties {
  return { borderColor: color };
}

function wordListForEntry(entry: CatalogEntry): Word[] {
  if (entry.kind === "vowel") return entry.lesson.vocab;
  if (entry.kind === "consonant") {
    return Object.values(entry.data.examples)
      .flat()
      .filter(Boolean)
      .map((word) => ({ word }));
  }
  return ["a", "e", "i", "o", "u"].map((word) => ({ word }));
}

function syllablesForEntry(entry: CatalogEntry): string[] {
  if (entry.kind === "intro") return ["a", "e", "i", "o", "u"];
  if (entry.kind === "vowel") return Array.from(new Set([entry.vowel, ...entry.lesson.vocab.map((item) => item.word)]));
  return entry.data.syllables;
}

function getWeight(ageDays: number) {
  if (ageDays <= 7) return 3;
  if (ageDays <= 30) return 2;
  return 1;
}

function buildWeightedLessonPool(events: ReturnType<typeof useSessionEvents>) {
  const now = Date.now();
  const byLesson = new Map<number, number>();
  events.forEach((event) => {
    const time = Date.parse(event.createdAt);
    const current = byLesson.get(event.lessonN) ?? 0;
    byLesson.set(event.lessonN, Math.max(current, time));
  });
  return Array.from(byLesson.entries())
    .map(([lessonN, lastVisited]) => {
      const entry = CATALOG.find((item) => item.n === lessonN);
      const ageDays = Math.floor((now - lastVisited) / 86_400_000);
      return entry ? { entry, weight: getWeight(ageDays), lastVisited } : null;
    })
    .filter((item): item is { entry: CatalogEntry; weight: number; lastVisited: number } => item !== null)
    .sort((a, b) => b.weight - a.weight || b.lastVisited - a.lastVisited);
}

function makeReviewItem(entry: CatalogEntry, index: number, countForLesson: number): ReviewItem {
  const words = wordListForEntry(entry);
  const kind: ReviewKind = words.length >= 2 && countForLesson % 2 === 1 ? "word" : "syllable";
  return {
    key: `${entry.n}-${kind}-${index}`,
    kind,
    entry,
    syllables: syllablesForEntry(entry),
    words,
  };
}

function buildReviewItems(events: ReturnType<typeof useSessionEvents>): ReviewItem[] {
  const weighted = buildWeightedLessonPool(events);
  if (weighted.length < 3) return [];
  const expanded = weighted.flatMap((item) => Array.from({ length: item.weight }, () => item.entry));
  const counts = new Map<number, number>();
  const items: ReviewItem[] = [];
  let cursor = 0;
  let guard = 0;
  while (items.length < REVIEW_TARGET_COUNT && guard < 160) {
    const entry = expanded[cursor % expanded.length];
    const currentCount = counts.get(entry.n) ?? 0;
    const previous = items[items.length - 1]?.entry.n;
    if (currentCount < 3 && previous !== entry.n) {
      counts.set(entry.n, currentCount + 1);
      items.push(makeReviewItem(entry, items.length, currentCount));
    }
    cursor += 1;
    guard += 1;
    if (Array.from(counts.values()).reduce((sum, count) => sum + count, 0) >= weighted.length * 3) break;
  }
  return items;
}

function isCompletionText(text: string, kind: ReviewKind) {
  if (kind === "syllable") return text.includes("Correcto");
  return text.includes("Ronda completa");
}

function ReviewWatcher({
  item,
  onComplete,
  children,
}: {
  item: ReviewItem;
  onComplete: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const completed = useRef(false);

  useEffect(() => {
    completed.current = false;
    const node = ref.current;
    if (!node) return;
    const check = () => {
      if (completed.current) return;
      if (!isCompletionText(node.textContent ?? "", item.kind)) return;
      completed.current = true;
      recordEvent({ type: "practica:item-complete", lessonN: item.entry.n, item: Number(item.key.split("-").at(-1) ?? 0) + 1 });
      window.setTimeout(onComplete, ADVANCE_DELAY_MS);
    };
    const observer = new MutationObserver(check);
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    check();
    return () => observer.disconnect();
  }, [item, onComplete]);

  return <div ref={ref}>{children}</div>;
}

function renderReviewItem(item: ReviewItem) {
  if (item.kind === "syllable") {
    return <SyllableTap syllables={item.syllables} color={item.entry.color} lessonId={String(item.entry.n)} />;
  }
  return <WordMatch words={item.words} color={item.entry.color} lessonId={String(item.entry.n)} />;
}

function Repaso() {
  const events = useSessionEvents();
  const items = useMemo(() => buildReviewItems(events), [events]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const current = items[index];
  const complete = started && index >= items.length && items.length > 0;
  const accent = current?.entry.color ?? "#c98c4f";

  useEffect(() => {
    if (!started || !current) return;
    recordEvent({ type: "practica:start", lessonN: current.entry.n });
  }, [current, started]);

  useEffect(() => {
    if (!complete) return;
    const lessonN = items[items.length - 1]?.entry.n ?? 1;
    recordEvent({ type: "practica:complete", lessonN });
  }, [complete, items]);

  const reset = () => {
    setIndex(0);
    setStarted(true);
  };

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, items.length));
  };

  return (
    <main className="cartilla-student-surface min-h-screen px-4 py-6 text-[#3A281E]" style={REVIEW_SURFACE_STYLE}>
      <div className="mx-auto max-w-[720px] pb-32">
        <Link
          to="/cartilla/lecciones"
          aria-label="Ir a lecciones"
          className="cartilla-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-black shadow-sm backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
          Ir a lecciones
        </Link>

        <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl backdrop-blur">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide" style={accentTextStyle(accent)}>
            <Sparkles className="h-4 w-4" />
            Repaso acumulado
          </p>
          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Repase lo que ya visito</h1>
          <div className="mt-4">
            <StudentProgressBar current={Math.min(index, items.length)} total={items.length || REVIEW_TARGET_COUNT} accent={accent} />
          </div>
        </section>

        {items.length === 0 && (
          <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/86 p-6 text-center shadow-xl backdrop-blur">
            <p className="text-base font-bold text-[#3A281E]/75">
              Aun no hay suficiente practica para repasar. Visita 3 lecciones distintas para activar el repaso.
            </p>
            <Link
              to="/cartilla/lecciones"
              aria-label="Ir a lecciones"
              className="cartilla-focus-ring mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-800 px-5 py-3 text-sm font-black text-white"
            >
              Ir a lecciones
            </Link>
          </section>
        )}

        {items.length > 0 && !started && (
          <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/86 p-6 text-center shadow-xl backdrop-blur">
            <p className="text-sm font-bold text-[#3A281E]/70">El repaso usara las lecciones visitadas recientemente.</p>
            <button
              type="button"
              aria-label="Empezar repaso"
              onClick={reset}
              className="cartilla-focus-ring mt-5 min-h-12 rounded-2xl px-6 py-3 text-base font-black text-white shadow-lg"
              style={accentBackgroundStyle(accent)}
            >
              Empezar repaso
            </button>
          </section>
        )}

        {started && current && !complete && (
          <section className="mt-5 rounded-[2rem] border-4 bg-white/78 p-3 shadow-2xl backdrop-blur" style={accentBorderStyle(current.entry.color)}>
            <div className="mb-3 px-2 text-xs font-black uppercase tracking-wide" style={accentTextStyle(current.entry.color)}>
              Leccion {current.entry.n}: {current.entry.title}
            </div>
            <ReviewWatcher key={current.key} item={current} onComplete={next}>
              {renderReviewItem(current)}
            </ReviewWatcher>
          </section>
        )}

        {complete && (
          <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/86 p-6 text-center shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-black">Repaso terminado</h2>
            <p className="mt-2 text-sm font-bold text-[#3A281E]/70">Buen trabajo. Ya puede volver a repasar cuando quiera.</p>
            <button
              type="button"
              aria-label="Repetir repaso"
              onClick={reset}
              className="cartilla-focus-ring mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-amber-900/15 bg-white px-5 py-3 text-sm font-black"
            >
              <RotateCcw className="h-4 w-4" />
              Repetir
            </button>
          </section>
        )}
      </div>
      <AccessibilityPanel />
      <AudioControls />
    </main>
  );
}
