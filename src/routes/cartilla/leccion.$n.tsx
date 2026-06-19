import { useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/lib/useServerFn";
import { ArrowLeft, ArrowRight, Check, Volume2, ClipboardList } from "lucide-react";
import { CATALOG, TOTAL_LESSONS, type CatalogEntry } from "@/lib/lesson-catalog";
import {
  useLessonProgress,
  isLessonUnlocked,
  markLessonCompleted,
  useCloudLessonHydration,
} from "@/lib/lesson-progress";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { SyllableTap, WordMatch, TeacherAnswerKey } from "@/components/cartilla/Ejercicios";
import { OrderedExercises } from "@/components/cartilla/OrderedExercises";
import { recordEvent, useStudentSession } from "@/lib/student-session";
import { LessonTimer } from "@/components/cartilla/LessonTimer";
import { listMyAssignments } from "@/lib/assignments.functions";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { sCopy } from "@/content/student-copy";
import { gretelEvent } from "@/lib/gretel-bus";

import { StudentWorkbookFlip } from "@/components/StudentBook/StudentWorkbookFlip";
import { buildPageArray } from "@/utils/buildPageArray";

export const Route = createFileRoute("/cartilla/leccion/$n")({
  component: Leccion,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !CATALOG.find((e) => e.n === n)) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
});

function Leccion() {
  const { lang } = useLanguage();
  const t = sCopy;
  const { n: nParam } = Route.useParams();
  const navigate = useNavigate();
  const n = Number(nParam);
  const { isCompleted } = useLessonProgress();
  const session = useStudentSession();
  useCloudLessonHydration(session);
  const entry = useMemo<CatalogEntry | undefined>(() => CATALOG.find((e) => e.n === n), [n]);
  const pages = useMemo(() => buildPageArray(), []);

  const fetchAssignments = useServerFn(listMyAssignments);
  const { data: assignments } = useQuery({
    queryKey: ["my-assignments", session?.classId],
    queryFn: () =>
      session
        ? fetchAssignments({
            data: {
              classId: session.classId,
              studentId: session.studentId,
              studentCode: session.studentCode,
            },
          })
        : Promise.resolve([]),
    enabled: !!session,
  });
  const assignment = useMemo(
    () => (assignments ?? []).find((a: { lesson_id: string }) => a.lesson_id === String(n)),
    [assignments, n],
  );

  const unlocked = typeof window === "undefined" || isLessonUnlocked(n);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (entry && !unlocked) navigate({ to: "/cartilla/lecciones" });
  }, [entry, navigate, unlocked]);

  useEffect(() => {
    gretelEvent("lesson:start");
    startedAt.current = Date.now();
    return () => {
      const secs = Math.round((Date.now() - startedAt.current) / 1000);
      if (secs >= 5) recordEvent({ lessonId: String(n), kind: "time", timeSeconds: secs });
    };
  }, [n]);

  if (!entry || !unlocked) return null;

  const done = isCompleted(n);
  const isLast = n >= TOTAL_LESSONS;
  const pct = Math.round((n / TOTAL_LESSONS) * 100);

  const goNext = () => {
    markLessonCompleted(n);
    recordEvent({ lessonId: String(n), kind: "lesson_completed" });
    gretelEvent("lesson:complete");
    if (isLast) navigate({ to: "/cartilla/lecciones" });
    else navigate({ to: "/cartilla/leccion/$n", params: { n: String(n + 1) } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 pt-4 max-w-3xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <Link
            to="/cartilla/lecciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {t.indice[lang]}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="flex items-center gap-2">
              <LessonTimer limitSeconds={assignment?.time_limit_seconds ?? null} />
              <span className="text-xs font-bold text-foreground/60">
                L{n}/{TOTAL_LESSONS}
              </span>
            </div>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden border border-foreground/10">
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: entry.color }}
          />
        </div>
        {assignment && (
          <div className="mt-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary inline-flex items-start gap-2">
            <ClipboardList className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {t.tareaAsignada[lang]}{assignment.title ? `: ${assignment.title}` : ""}.
              {assignment.due_at &&
                ` ${t.entrega[lang]} ${new Date(assignment.due_at).toLocaleDateString()}.`}
              {assignment.time_limit_seconds &&
                ` ${t.limite[lang]} ${Math.round(assignment.time_limit_seconds / 60)} ${t.min[lang]}.`}
            </span>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 pt-6 pb-28 max-w-5xl w-full mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl text-left">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground/50">
            {t.leccion[lang]} {n} · {t.paginas[lang].toLowerCase()} {entry.pages}
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight mt-1 mb-8"
            style={{ color: entry.color }}
          >
            {entry.title}
          </h1>
        </div>

        {/* Digital Workbook Section */}
        <div className="w-full relative bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#d4a373] rounded-[2rem] p-4 sm:p-8 shadow-inner border-[8px] border-[#bc6c25] mb-12">
          <StudentWorkbookFlip 
            pages={pages} 
            initialPage={parseInt(entry.pages.split("-")[0], 10) - 1} 
          />
        </div>

        {/* Interactive Zone */}
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-black mb-6 text-center text-foreground/80">¡Zona Interactiva!</h2>
          {entry.kind === "intro" && <IntroBody lessonId={String(n)} lang={lang} t={t} />}
          {entry.kind === "vowel" && <VowelBody entry={entry} lessonId={String(n)} lang={lang} t={t} />}
          {entry.kind === "consonant" && <ConsonantBody entry={entry} lessonId={String(n)} lang={lang} t={t} />}
          {done && (
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-success bg-success/10 px-4 py-2 rounded-full mx-auto w-fit">
              <Check className="w-4 h-4" /> {t.yaCompletaste[lang]}
            </div>
          )}
        </div>
      </main>
      <nav className="fixed bottom-0 inset-x-0 p-3 bg-background/95 backdrop-blur border-t-2 border-foreground/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() =>
              n > 1
                ? navigate({ to: "/cartilla/leccion/$n", params: { n: String(n - 1) } })
                : navigate({ to: "/cartilla/lecciones" })
            }
            className="px-5 py-3 rounded-2xl border-2 border-foreground/15 font-bold hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5 inline mr-1" /> {n > 1 ? t.anterior[lang] : t.indice[lang]}
          </button>
          <button
            onClick={goNext}
            disabled={isLast && done}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg disabled:opacity-40 hover:translate-y-px"
          >
            {isLast
              ? done
                ? t.terminado[lang]
                : t.marcarTerminar[lang]
              : done
                ? t.siguiente[lang]
                : t.marcarSiguiente[lang]}{" "}
            <ArrowRight className="w-5 h-5 inline ml-1" />
          </button>
        </div>
      </nav>
    </div>
  );
}

function IntroBody({ lessonId, lang, t }: { lessonId: string; lang: "es" | "en"; t: typeof sCopy }) {
  const { play, playingText } = useAudio();
  const vowels = ["a", "e", "i", "o", "u"];
  const vowelWords = [
    { word: "ala", emoji: "🦅" },
    { word: "elefante", emoji: "🐘" },
    { word: "iglú", emoji: "⛺" },
    { word: "oso", emoji: "🐻" },
    { word: "uva", emoji: "🍇" },
  ];
  return (
    <section className="mt-5 space-y-5">
      <p className="text-lg text-foreground/80 leading-relaxed">
        {t.conocerasVocales[lang]}
      </p>
      <div className="flex flex-wrap gap-3">
        {vowels.map((v) => (
          <button
            key={v}
            onClick={() => play(v, true)}
            aria-label={`Escuchar la vocal ${v}`}
            className={`w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-3xl font-bold shadow-md hover:scale-105 active:scale-95 transition relative ${playingText === v ? "animate-pulse ring-4 ring-primary ring-offset-2" : ""}`}
          >
            {v}
            <Volume2
              aria-hidden
              className="absolute -bottom-1 -right-1 w-5 h-5 p-0.5 rounded-full bg-background text-foreground/70 border border-foreground/10"
            />
          </button>
        ))}
      </div>
      <OrderedExercises
        lessonId={lessonId}
        blocks={[
          {
            id: "syllable_tap",
            label: t.silabas[lang],
            node: (
              <SyllableTap syllables={vowels} color="hsl(var(--primary))" lessonId={lessonId} />
            ),
          },
          {
            id: "word_match",
            label: t.palabras[lang],
            node: <WordMatch words={vowelWords} color="hsl(var(--primary))" lessonId={lessonId} />,
          },
          {
            id: "answer_key",
            label: t.respuestas[lang],
            node: (
              <TeacherAnswerKey
                items={vowelWords.map((v) => ({ q: `Vocal inicial de "${v.word}"`, a: v.word[0] }))}
              />
            ),
          },
        ]}
      />
    </section>
  );
}

function VowelBody({
  entry,
  lessonId,
  lang,
  t,
}: {
  entry: Extract<CatalogEntry, { kind: "vowel" }>;
  lessonId: string;
  lang: "es" | "en";
  t: typeof sCopy;
  }) {
  const { play, playingText } = useAudio();
  const l = entry.lesson;
  return (
    <section className="mt-5 space-y-5">
      <div
        className="rounded-2xl border-2 p-4 bg-card animate-in fade-in slide-in-from-bottom-2"
        style={{ borderColor: entry.color }}
      >
        <div className="text-sm font-bold" style={{ color: entry.color }}>
          {l.characterName}
        </div>
        <p className="text-foreground/80 mt-1">{l.characterDesc}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">{t.palabrasConVocal[lang]} {l.vowel}</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {l.vocab.map((v) => (
            <li
              key={v.word}
              className="rounded-2xl border-2 border-foreground/10 bg-card p-3 text-center hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl">{v.emoji}</div>
              <div className="font-bold mt-1">{v.word}</div>
              <button
                onClick={() => play(v.word)}
                aria-label={`Escuchar ${v.word}`}
                className={`mt-1 inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-primary ${playingText === v.word ? "animate-pulse text-primary" : ""}`}
              >
                <Volume2 className="w-3.5 h-3.5" /> {t.oir[lang]}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <OrderedExercises
        lessonId={lessonId}
        blocks={[
          {
            id: "word_match",
            label: t.palabras[lang],
            node: <WordMatch words={l.vocab} color={entry.color} lessonId={lessonId} />,
          },
          {
            id: "answer_key",
            label: t.respuestas[lang],
            node: (
              <TeacherAnswerKey
                items={l.vocab.map((v) => ({
                  q: `Palabra que empieza con "${v.word[0]}"`,
                  a: v.word,
                }))}
              />
            ),
          },
        ]}
      />
    </section>
  );
}

function ConsonantBody({
  entry,
  lessonId,
  lang,
  t,
}: {
  entry: Extract<CatalogEntry, { kind: "consonant" }>;
  lessonId: string;
  lang: "es" | "en";
  t: typeof sCopy;
}) {
  const { play, playingText } = useAudio();
  const c = entry.data;
  return (
    <section className="mt-5 space-y-5">
      <div
        className="rounded-2xl border-2 p-4 bg-card flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
        style={{ borderColor: entry.color }}
      >
        <span className="text-xs font-bold uppercase tracking-wide text-foreground/60">
          {t.silabas[lang]}
        </span>
        {c.syllables.map((s) => (
          <button
            key={s}
            onClick={() => play(s)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-lg font-bold text-white shadow-sm hover:scale-105 active:scale-95 transition",
              playingText === s && "animate-pulse ring-2 ring-offset-2 ring-offset-background ring-primary"
            )}
            style={{ backgroundColor: entry.color }}
            aria-label={`Escuchar la sílaba ${s}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">{t.palabrasEjemplo[lang]}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.syllables.map((s) => (
            <div key={s} className="rounded-2xl border-2 border-foreground/10 bg-card p-3">
              <div className="font-bold text-lg mb-1" style={{ color: entry.color }}>
                {s}
              </div>
              <ul className="space-y-1">
                {(c.examples[s] ?? []).map((w) => (
                  <li key={w} className="flex items-center justify-between text-sm">
                    <span>{w}</span>
                    <button
                      onClick={() => play(w)}
                      aria-label={`Escuchar ${w}`}
                      className={`text-foreground/50 hover:text-primary ${playingText === w ? "animate-pulse text-primary" : ""}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {c.sentences.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">{t.oraciones[lang]}</h2>
          <ul className="space-y-2">
            {c.sentences.map((t_sentence) => (
              <li
                key={t_sentence}
                className="rounded-2xl border-2 border-foreground/10 bg-card p-3 italic flex items-start justify-between gap-3"
              >
                <span>{t_sentence}</span>
                <button
                  onClick={() => play(t_sentence)}
                  aria-label={`Escuchar ${t_sentence}`}
                  className={`mt-0.5 text-foreground/50 hover:text-primary shrink-0 ${playingText === t_sentence ? "animate-pulse text-primary" : ""}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <OrderedExercises
        lessonId={lessonId}
        blocks={[
          {
            id: "syllable_tap",
            label: t.silabas[lang],
            node: <SyllableTap syllables={c.syllables} color={entry.color} lessonId={lessonId} />,
          },
          {
            id: "answer_key",
            label: t.respuestas[lang],
            node: (
              <TeacherAnswerKey
                items={c.syllables.flatMap((s) =>
                  (c.examples[s] ?? [])
                    .slice(0, 1)
                    .map((w) => ({ q: `Sílaba inicial de "${w}"`, a: s })),
                )}
              />
            ),
          },
        ]}
      />
    </section>
  );
}
