import { useState, useEffect, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Grid, Puzzle, PenTool, Music, CheckCircle } from "lucide-react";
import { SyllableTap } from "@/components/cartilla/Ejercicios";
import { DragMatchPairs } from "@/components/cartilla/DragMatchPairs";
import { DragBuildWord } from "@/components/cartilla/DragBuildWord";
import { DragLetterTrace } from "@/components/cartilla/DragLetterTrace";
import { PianoPronunciation } from "@/components/cartilla/PianoPronunciation";
import { DEFAULT_ACTIVITIES, type ActivityId } from "@/lib/lesson-catalog";
import "@/styles/cartilla-student.css";

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
  const [activeTab, setActiveTab] = useState<TabType>(activities[0] ?? "silabas");
  const [completedTabs, setCompletedTabs] = useState<Set<TabType>>(new Set());

  // Derive matching pairs from words
  const pairs = words
    .filter((w) => typeof w.emoji === "string" && w.emoji.trim() !== "")
    .map((w) => ({ word: w.word, emoji: w.emoji as string, illustrationSrc: w.illustrationSrc }))
    .slice(0, 4); // Keep to a max of 4 pairs for a balanced layout

  // Map tabs to metadata, in the order this lesson's `activities` specifies
  const tabMeta: Record<TabType, { label: string; icon: ReactElement; disabled?: boolean }> = {
    silabas: { label: "Sílabas", icon: <Volume2 className="w-4 h-4" /> },
    palabras: { label: "Emparejar", icon: <Grid className="w-4 h-4" />, disabled: pairs.length === 0 },
    armar: { label: "Armar", icon: <Puzzle className="w-4 h-4" /> },
    trazar: { label: "Trazar", icon: <PenTool className="w-4 h-4" /> },
    piano: { label: "Piano", icon: <Music className="w-4 h-4" /> },
  };
  const tabs = activities
    .map((id) => ({ id, ...tabMeta[id] }))
    .filter((t) => !t.disabled);

  // Mark tab complete
  const handleCompleteTab = (tabId: TabType) => {
    setCompletedTabs((prev) => {
      const next = new Set(prev).add(tabId);
      // Check if all active tabs are completed
      const allActiveCompleted = tabs.every((t) => next.has(t.id));
      if (allActiveCompleted && onCompleteAll) {
        onCompleteAll();
      }
      return next;
    });
  };

  // Render current tab view
  const renderContent = () => {
    switch (activeTab) {
      case "silabas":
        return (
          <div className="py-2">
            <SyllableTap
              syllables={syllables}
              color={color}
              lessonId={lessonId}
            />
            {/* Simple complete button for SyllableTap since it's a practice game */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleCompleteTab("silabas")}
                className="flex items-center gap-1.5 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow transition-all active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como completado
              </button>
            </div>
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

  return (
    <div className="w-full space-y-6">
      {/* Dynamic Tab Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDone = completedTabs.has(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black transition-all select-none relative ${
                isActive
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200/30"
                  : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
              }`}
            >
              <span className="flex items-center justify-center shrink-0">
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>

              {/* Little completion checkmark or dot */}
              {isDone && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Slide transition container */}
      <div className="relative overflow-hidden min-h-[350px]">
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

      {/* Progress indicators dots */}
      <div className="flex justify-center items-center gap-2 pt-2 border-t border-stone-200/20">
        {tabs.map((tab) => {
          const isDone = completedTabs.has(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <div
              key={`dot-${tab.id}`}
              className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                isDone
                  ? "bg-emerald-500 border-emerald-600 scale-110"
                  : isActive
                  ? "border-stone-400 bg-stone-300 animate-pulse"
                  : "bg-stone-200 border-stone-300"
              }`}
              title={`${tab.label}: ${isDone ? "Completado" : "Pendiente"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
