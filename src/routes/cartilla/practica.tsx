import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import type { CatalogEntry } from "@/lib/lesson-catalog";
import { useLessonProgress } from "@/lib/lesson-progress";
import { getSessionEvents, recordEvent } from "@/lib/student-session";
import { SyllableTap, WordMatch } from "@/components/cartilla/Ejercicios";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { AudioControls } from "@/components/cartilla/AudioControls";
import { AccessibilityPanel } from "@/components/cartilla/AccessibilityPanel";
import { StudentProgressBar } from "@/components/cartilla/StudentProgressBar";

export const Route = createFileRoute("/cartilla/practica")({
  component: Practica,
  head: () => ({
    meta: [
      { title: "Practica - La Cartilla de Gretel" },
      {
        name: "description",
        content: "Practica adaptativa con ejercicios del cuaderno.",
      },
    ],
  }),
});

type DrillKind = "syllable" | "word" | "drag";
type Word = { word: string; emoji?: string };
type DrillItem = {
  key: string;
  kind: DrillKind;
  entry: CatalogEntry;
  syllables: string[];
  words: Word[];
};

const INTRO_VOWELS = ["a", "e", "i", "o", "u"];
const TOTAL_ITEMS = 10;
const ADVANCE_DELAY_MS = 600;
const SURFACE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 10% 8%, #fff3b0, transparent 28%), radial-gradient(circle at 88% 12%, #b9f3ff, transparent 30%), linear-gradient(135deg, #fff8de, #ffd6e3 48%, #d9efff)",
};

function accentStyle(color: string): CSSProperties {
  return { color };
}

function accentBackgroundStyle(color: string): CSSProperties {
  return { backgroundColor: color };
}

function accentBorderStyle(color: string): CSSProperties {
  return { borderColor: color };
}

function getRecentLessonN() {
  const latest = [...getSessionEvents()]
    .filter((event) => event.type === "practica:start")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  return latest?.lessonN ?? 1;
}

function wordListForEntry(entry: CatalogEntry): Word[] {
  if (entry.kind === "vowel") return entry.lesson.vocab;
  if (entry.kind === "consonant") {
    return Object.values(entry.data.examples)
      .flat()
      .filter(Boolean)
      .map((word) => ({ word }));
  }
  return INTRO_VOWELS.map((word) => ({ word }));
}

function syllablesForEntry(entry: CatalogEntry): string[] {
  if (entry.kind === "intro") return INTRO_VOWELS;
  if (entry.kind === "vowel") {
    return Array.from(new Set([entry.vowel, ...entry.lesson.vocab.map((item) => item.word)]));
  }
  return entry.data.syllables;
}

function makeItem(entry: CatalogEntry, kind: DrillKind, index: number): DrillItem {
  return {
    key: `${entry.n}-${kind}-${index}`,
    kind,
    entry,
    syllables: syllablesForEntry(entry),
    words: wordListForEntry(entry),
  };
}

function buildPracticeItems(entry: CatalogEntry): DrillItem[] {
  if (entry.kind === "intro") {
    return Array.from({ length: TOTAL_ITEMS }, (_, index) => makeItem(entry, "syllable", index));
  }
  if (entry.kind === "vowel") {
    return [
      ...Array.from({ length: 6 }, (_, index) => makeItem(entry, "syllable", index)),
      ...Array.from({ length: 4 }, (_, index) => makeItem(entry, "word", index + 6)),
    ];
  }
  return [
    ...Array.from({ length: 4 }, (_, index) => makeItem(entry, "syllable", index)),
    ...Array.from({ length: 4 }, (_, index) => makeItem(entry, "word", index + 4)),
    ...Array.from({ length: 2 }, (_, index) => makeItem(entry, "drag", index + 8)),
  ];
}

function isCompletionText(text: string, kind: DrillKind) {
  if (kind === "syllable") return text.includes("Correcto");
  if (kind === "word") return text.includes("Ronda completa");
  return text.includes("Gran trabajo") || text.includes("Muy bien");
}

function DrillWatcher({
  item,
  lessonId,
  onComplete,
  children,
}: {
  item: DrillItem;
  lessonId: number;
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
      recordEvent({ type: "practica:item-complete", lessonN: lessonId, item: Number(item.key.split("-").at(-1) ?? 0) + 1 });
      window.setTimeout(onComplete, ADVANCE_DELAY_MS);
    };
    const observer = new MutationObserver(check);
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    check();
    return () => observer.disconnect();
  }, [item.key, item.kind, lessonId, onComplete]);

  return <div ref={ref}>{children}</div>;
}

function renderItem(item: DrillItem) {
  if (item.kind === "syllable") {
    return <SyllableTap syllables={item.syllables} color={item.entry.color} lessonId={String(item.entry.n)} />;
  }
  if (item.kind === "word") {
    return <WordMatch words={item.words} color={item.entry.color} lessonId={String(item.entry.n)} />;
  }
  return <DragBuildWord entry={item.entry} accent={item.entry.color} />;
}

function Practica() {
  const { isUnlocked } = useLessonProgress();
  const [selectedN, setSelectedN] = useState(getRecentLessonN);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const entry = CATALOG.find((item) => item.n === selectedN) ?? CATALOG[0];
  const items = useMemo(() => buildPracticeItems(entry), [entry]);
  const current = items[index];
  const complete = index >= items.length;
  const unlocked = CATALOG.filter((item) => isUnlocked(item.n));

  useEffect(() => {
    if (!started) return;
    recordEvent({ type: "practica:start", lessonN: entry.n });
  }, [entry.n, started]);

  useEffect(() => {
    if (!started || !complete) return;
    recordEvent({ type: "practica:complete", lessonN: entry.n });
  }, [complete, entry.n, started]);

  const reset = () => {
    setIndex(0);
    setStarted(true);
  };

  const next = () => {
    setIndex((currentIndex) => Math.min(currentIndex + 1, items.length));
  };

  return (
    <main className="cartilla-student-surface min-h-screen px-4 py-6 text-[#3A281E]" style={SURFACE_STYLE}>
      <div className="mx-auto max-w-[720px] pb-32">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/cartilla/lecciones"
            aria-label="Salir a lecciones"
            className="cartilla-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-black shadow-sm backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4" />
            Salir
          </Link>
          <select
            aria-label="Elegir leccion desbloqueada"
            value={entry.n}
            onChange={(event) => {
              setSelectedN(Number(event.currentTarget.value));
              setStarted(false);
              setIndex(0);
            }}
            className="cartilla-focus-ring min-h-11 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-black shadow-sm"
          >
            {unlocked.map((lesson) => (
              <option key={lesson.n} value={lesson.n}>
                Leccion {lesson.n}: {lesson.title}
              </option>
            ))}
          </select>
        </div>

        <section className="cartilla-student-card rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-wide" style={accentStyle(entry.color)}>
            Practica adaptativa
          </p>
          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">{entry.title}</h1>
          <div className="mt-4">
            <StudentProgressBar current={Math.min(index, TOTAL_ITEMS)} total={TOTAL_ITEMS} accent={entry.color} />
          </div>
        </section>

        {!started && (
          <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/82 p-5 text-center shadow-xl backdrop-blur">
            <p className="text-sm font-bold text-[#3A281E]/70">
              Va a practicar 10 ejercicios tomados de esta leccion.
            </p>
            <button
              type="button"
              aria-label="Empezar practica"
              onClick={reset}
              className="cartilla-focus-ring mt-5 min-h-12 rounded-2xl px-6 py-3 text-base font-black text-white shadow-lg"
              style={accentBackgroundStyle(entry.color)}
            >
              Empezar
            </button>
          </section>
        )}

        {started && current && !complete && (
          <section className="mt-5 rounded-[2rem] border-4 bg-white/78 p-3 shadow-2xl backdrop-blur" style={accentBorderStyle(entry.color)}>
            <DrillWatcher key={current.key} item={current} lessonId={entry.n} onComplete={next}>
              {renderItem(current)}
            </DrillWatcher>
          </section>
        )}

        {started && complete && (
          <section className="cartilla-student-card mt-5 rounded-[2rem] border border-white/70 bg-white/86 p-6 text-center shadow-2xl backdrop-blur">
            <Trophy className="mx-auto h-12 w-12" style={accentStyle(entry.color)} />
            <h2 className="mt-3 text-2xl font-black">Excelente practica</h2>
            {entry.kind === "vowel" && (
              <p className="mt-2 text-sm font-bold text-[#3A281E]/70">{entry.lesson.characterName}</p>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                aria-label="Repetir practica"
                onClick={reset}
                className="cartilla-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-amber-900/15 bg-white px-5 py-3 text-sm font-black"
              >
                <RotateCcw className="h-4 w-4" />
                Repetir
              </button>
              <Link
                to="/cartilla/lecciones"
                aria-label="Volver a lecciones"
                className="cartilla-focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-white"
                style={accentBackgroundStyle(entry.color)}
              >
                Volver a lecciones
              </Link>
            </div>
          </section>
        )}
      </div>
      <AccessibilityPanel />
      <AudioControls />
    </main>
  );
}
