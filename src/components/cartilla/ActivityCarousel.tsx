import React, { useState, useEffect, useMemo, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Grid,
  Puzzle,
  PenTool,
  Music,
  Sparkles,
  Check,
} from "lucide-react";
import { SyllableTap } from "@/components/cartilla/Ejercicios";
import { DragMatchPairs } from "@/components/cartilla/DragMatchPairs";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { DragLetterTrace } from "@/components/cartilla/DragLetterTrace";
import { PianoPronunciation } from "@/components/cartilla/PianoPronunciation";
import { DEFAULT_ACTIVITIES, type ActivityId } from "@/lib/lesson-catalog";
import "@/styles/cartilla-student.css";
import { playUiTick } from "@/lib/piano-audio";

interface ActivityCarouselProps {
  lessonNumber: number;
  syllables: string[];
  words: Array<{ word: string; emoji?: string; illustrationSrc?: string }>;
  letter: string;
  color: string;
  lessonId?: string;
  onCompleteAll?: () => void;
  /** Which activities this lesson offers, and in what order. Defaults to all 5. */
  activities?: ActivityId[];
}

type TabType = ActivityId;

export function ActivityCarousel({
  lessonNumber,
  syllables,
  words,
  letter,
  color,
  lessonId,
  onCompleteAll,
  activities = DEFAULT_ACTIVITIES,
}: ActivityCarouselProps) {
  const [activeTab, setActiveTab] = useState<TabType>(
    activities[0] ?? "silabas",
  );
  const [completedTabs, setCompletedTabs] = useState<Set<TabType>>(new Set());

  // Derive matching pairs from words
  const pairs = useMemo(
    () =>
      words
        .filter((w) => Boolean(w.illustrationSrc))
        .slice(0, 4)
        .map((w) => ({
          word: w.word,
          emoji: w.word,
          illustrationSrc: w.illustrationSrc,
        })),
    [words],
  );

  const firstActivity = activities[0] ?? "silabas";
  useEffect(() => {
    setCompletedTabs(new Set());
    setActiveTab(firstActivity);
  }, [lessonNumber, firstActivity]);

  // Map tabs to metadata, in the order this lesson's `activities` specifies
  const tabMeta: Record<
    TabType,
    { label: string; icon: ReactElement; disabled?: boolean }
  > = {
    silabas: { label: "Sílabas", icon: <Volume2 className="w-4 h-4" /> },
    palabras: {
      label: "Emparejar",
      icon: <Grid className="w-4 h-4" />,
      disabled: pairs.length === 0,
    },
    armar: { label: "Armar", icon: <Puzzle className="w-4 h-4" /> },
    trazar: { label: "Trazar", icon: <PenTool className="w-4 h-4" /> },
    piano: { label: "Piano", icon: <Music className="w-4 h-4" /> },
  };
  const tabs = activities
    .map((id) => ({ id, ...tabMeta[id] }))
    .filter((t) => !t.disabled);

  // Mark tab complete
  const handleCompleteTab = (tabId: TabType) => {
    if (completedTabs.has(tabId)) return;
    const next = new Set(completedTabs).add(tabId);
    setCompletedTabs(next);
    if (tabs.length > 0 && tabs.every((t) => next.has(t.id))) onCompleteAll?.();
  };

  // Render current tab view
  const renderContent = () => {
    switch (activeTab) {
      case "silabas":
        return (
          <div className="py-2">
            <SyllableTap
              key={lessonNumber}
              syllables={syllables}
              color={color}
              lessonId={lessonId}
              onComplete={() => handleCompleteTab("silabas")}
            />
          </div>
        );
      case "palabras":
        return (
          <div className="py-2">
            <DragMatchPairs
              pairs={pairs}
              lessonId={lessonId}
              color={color}
              onComplete={() => handleCompleteTab("palabras")}
            />
          </div>
        );
      case "armar":
        return (
          <div className="py-2">
            <DragBuildWord
              words={words.slice(0, 4).map((w) => w.word)}
              accent={color}
              lessonId={lessonId}
              onComplete={() => handleCompleteTab("armar")}
            />
          </div>
        );
      case "trazar":
        return (
          <div className="py-2">
            <DragLetterTrace
              letter={letter}
              color={color}
              lessonId={lessonId}
              onComplete={() => handleCompleteTab("trazar")}
            />
          </div>
        );
      case "piano":
        return (
          <div className="py-2">
            <PianoPronunciation
              syllables={syllables}
              lessonId={lessonId}
              color={color}
              onComplete={() => handleCompleteTab("piano")}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const doneCount = tabs.filter((t) => completedTabs.has(t.id)).length;

  return (
    <div
      className="channel-shell w-full space-y-5 rounded-[2rem] p-4 sm:p-6"
      style={{ "--channel-accent": color } as React.CSSProperties}
    >
      {/* Channel header — gives this section its own identity, distinct from the workbook page above it */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{ background: color }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="font-display text-lg font-black leading-tight text-stone-900">
              ¡A jugar!
            </h3>
            <p className="text-xs font-bold text-stone-500">
              {doneCount} de {tabs.length} completados
            </p>
          </div>
        </div>
      </div>

      {/* Tactile tab chips */}
      <div className="flex flex-wrap gap-2.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDone = completedTabs.has(tab.id);

          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                playUiTick();
                setActiveTab(tab.id);
              }}
              whileTap={{ scale: 0.94 }}
              className="channel-tab relative flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black transition-colors select-none"
              style={
                isActive
                  ? {
                      background: color,
                      color: "#fff",
                      boxShadow: `0 6px 16px -4px color-mix(in srgb, ${color} 40%, transparent)`,
                    }
                  : {
                      background: "#ffffff",
                      color: "#78716c",
                      border: "1px solid #e7e5e4",
                    }
              }
            >
              <span className="flex shrink-0 items-center justify-center">
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {isDone && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm"
                  aria-label="Completado"
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Game card — soft tint of the lesson's own accent color */}
      <div
        className="channel-card relative min-h-[350px] overflow-hidden rounded-[1.75rem] border p-3 sm:p-5"
        style={{
          background: `color-mix(in srgb, ${color} 5%, white)`,
          borderColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step track */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {tabs.map((tab) => {
          const isDone = completedTabs.has(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <div
              key={`dot-${tab.id}`}
              title={`${tab.label}: ${isDone ? "Completado" : "Pendiente"}`}
              className="h-2 flex-1 max-w-10 rounded-full transition-all duration-300"
              style={{
                background: isDone
                  ? color
                  : isActive
                    ? `color-mix(in srgb, ${color} 50%, transparent)`
                    : "#e7e5e4",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
