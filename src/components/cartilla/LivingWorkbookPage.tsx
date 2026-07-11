"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getWorkbookManifestPage, type WorkbookManifestPage, type WorkbookManifestInteraction } from "@/lib/workbook-manifest";
import { recordWorkbookAnswer, recordPageCompletion, getAnswersForPage, type WorkbookAnswerEvent } from "@/lib/progress-events";
import { speak } from "@/lib/speak";
import { Check, Volume2, Sparkles } from "lucide-react";

export interface LivingWorkbookPageProps {
  pageNumber: number;
  lessonNumber?: number;
  className?: string;
  onAnswerRecorded?: (event: WorkbookAnswerEvent) => void;
  onPageCompleted?: (pageNumber: number) => void;
}

export function LivingWorkbookPage({
  pageNumber,
  lessonNumber,
  className = "",
  onAnswerRecorded,
  onPageCompleted,
}: LivingWorkbookPageProps) {
  const [pageData, setPageData] = useState<WorkbookManifestPage | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const page = getWorkbookManifestPage(pageNumber);
    if (page) {
      setPageData(page);
      const existingAnswers = getAnswersForPage(pageNumber);
      const answeredSet = new Set(existingAnswers.map((a) => a.interactionId));
      setCompletedIds(answeredSet);
      if (page.interactions.length > 0 && answeredSet.size >= page.interactions.length) {
        setIsCompleted(true);
      } else {
        setIsCompleted(false);
      }
    } else {
      setPageData(null);
    }
  }, [pageNumber]);

  const handleInteractionComplete = useCallback(
    (interaction: WorkbookManifestInteraction, userAnswer: string, isCorrect = true) => {
      if (!pageData) return;
      const lesson = lessonNumber ?? pageData.lessonNumber;
      const ev = recordWorkbookAnswer(
        pageNumber,
        lesson,
        interaction.id,
        interaction.type,
        userAnswer,
        isCorrect,
        interaction.correctAnswer || interaction.label,
      );

      onAnswerRecorded?.(ev);

      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(interaction.id);
        if (next.size >= pageData.interactions.length && !isCompleted) {
          setIsCompleted(true);
          recordPageCompletion(pageNumber, lesson, next.size, pageData.interactions.length);
          onPageCompleted?.(pageNumber);
        }
        return next;
      });
    },
    [pageData, pageNumber, lessonNumber, isCompleted, onAnswerRecorded, onPageCompleted],
  );

  const handleTapSelect = (interaction: WorkbookManifestInteraction) => {
    handleInteractionComplete(interaction, interaction.label, true);
  };

  const handleTapToHear = (interaction: WorkbookManifestInteraction) => {
    const textToSpeak = interaction.audioText || interaction.label;
    void speak(textToSpeak);
    handleInteractionComplete(interaction, textToSpeak, true);
  };

  const handleDragPlaceSlot = (interaction: WorkbookManifestInteraction) => {
    if (dragActiveId === interaction.id || !completedIds.has(interaction.id)) {
      handleInteractionComplete(interaction, interaction.label, true);
      setDragActiveId(null);
    }
  };

  const handlePairMatchClick = (interaction: WorkbookManifestInteraction) => {
    if (!selectedPairId) {
      setSelectedPairId(interaction.id);
    } else {
      if (selectedPairId === interaction.id) {
        setSelectedPairId(null);
      } else {
        handleInteractionComplete(interaction, `${selectedPairId}->${interaction.id}`, true);
        setSelectedPairId(null);
      }
    }
  };

  const handleMarkCircle = (interaction: WorkbookManifestInteraction) => {
    handleInteractionComplete(interaction, "marked", true);
  };

  if (!pageData) {
    return (
      <div
        data-testid="living-workbook-page-empty"
        className={`flex items-center justify-center border-2 border-dashed border-amber-900/20 rounded-2xl bg-amber-50/50 p-8 text-amber-900/60 ${className}`}
      >
        Página {pageNumber} no disponible en el manifiesto.
      </div>
    );
  }

  return (
    <div
      data-testid="living-workbook-page"
      className={`relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-xl bg-[#fff8e7] border-4 border-[#12323b]/20 ${className}`}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#12323b] text-white">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
            Página {pageData.pageNumber} · Lección {pageData.lessonNumber}
          </span>
          <h2 className="text-lg font-bold">{pageData.title}</h2>
        </div>
        {isCompleted && (
          <div
            data-testid="page-completed-badge"
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow motion-safe:animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ¡Completado!
          </div>
        )}
      </div>

      {/* Instruction bar */}
      <div className="px-6 py-2.5 bg-amber-100/80 border-b border-amber-900/10 text-sm font-medium text-[#17313b]">
        {pageData.instruction}
      </div>

      {/* Responsive Canvas Container */}
      <div className="relative w-full aspect-[3/4] bg-[#fff8e7]">
        {/* Background Asset */}
        <img
          src={pageData.backgroundAsset}
          alt={pageData.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none motion-safe:transition-opacity motion-safe:duration-500"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Positioned Illustration Assets */}
        {pageData.illustrations.map((ill) => (
          <div
            key={ill.id}
            data-testid={`illustration-${ill.id}`}
            style={{
              left: `${ill.xPercent ?? 10}%`,
              top: `${ill.yPercent ?? 10}%`,
              width: `${ill.widthPercent ?? 20}%`,
              height: `${ill.heightPercent ?? 20}%`,
            }}
            className="absolute pointer-events-none flex items-center justify-center"
          >
            <img
              src={ill.src}
              alt={ill.alt || ill.label}
              loading="lazy"
              className="max-w-full max-h-full object-contain drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ))}

        {/* Interactive Overlays / Hotspots */}
        {pageData.interactions.map((interaction) => {
          const isDone = completedIds.has(interaction.id);
          const left = `${interaction.xPercent ?? 50}%`;
          const top = `${interaction.yPercent ?? 50}%`;
          const width = `${interaction.widthPercent ?? 18}%`;
          const height = `${interaction.heightPercent ?? 10}%`;

          return (
            <div
              key={interaction.id}
              data-testid={`interaction-${interaction.id}`}
              data-type={interaction.type}
              style={{ left, top, width, height }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
            >
              {interaction.type === "TapSelect" && (
                <button
                  type="button"
                  data-testid={`btn-tapselect-${interaction.id}`}
                  onClick={() => handleTapSelect(interaction)}
                  className={`w-full h-full rounded-xl border-2 font-bold text-xs md:text-sm px-2 py-1 shadow-md motion-safe:transition-all ${
                    isDone
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "bg-white/95 border-amber-500/80 hover:bg-amber-100 text-[#12323b]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {interaction.label}
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              )}

              {interaction.type === "TapToHear" && (
                <button
                  type="button"
                  data-testid={`btn-taptohear-${interaction.id}`}
                  onClick={() => handleTapToHear(interaction)}
                  className={`w-full h-full rounded-xl border-2 font-bold text-xs md:text-sm px-2 py-1 shadow-md motion-safe:transition-all ${
                    isDone
                      ? "bg-sky-500 border-sky-600 text-white"
                      : "bg-white/95 border-sky-500/80 hover:bg-sky-100 text-[#12323b]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                    {interaction.label}
                    {isDone && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </span>
                </button>
              )}

              {interaction.type === "DragPlace" && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    data-testid={`btn-dragplace-${interaction.id}`}
                    onClick={() => handleDragPlaceSlot(interaction)}
                    className={`w-full h-full rounded-xl border-2 border-dashed font-bold text-xs md:text-sm px-2 py-1 shadow-sm flex items-center justify-center motion-safe:transition-all ${
                      isDone
                        ? "bg-emerald-500 border-emerald-600 text-white border-solid"
                        : "bg-amber-50/90 border-amber-600/70 hover:bg-amber-100 text-[#12323b]"
                    }`}
                  >
                    {isDone ? (
                      <span className="flex items-center gap-1">
                        {interaction.label} <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span>Colocar: {interaction.label}</span>
                    )}
                  </button>
                </div>
              )}

              {interaction.type === "PairMatch" && (
                <button
                  type="button"
                  data-testid={`btn-pairmatch-${interaction.id}`}
                  onClick={() => handlePairMatchClick(interaction)}
                  className={`w-full h-full rounded-xl border-2 font-bold text-xs md:text-sm px-2 py-1 shadow-md motion-safe:transition-all ${
                    isDone
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : selectedPairId === interaction.id
                        ? "bg-purple-500 border-purple-600 text-white ring-2 ring-purple-300"
                        : "bg-white/95 border-purple-500/80 hover:bg-purple-100 text-[#12323b]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {interaction.label}
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              )}

              {interaction.type === "MarkCircle" && (
                <button
                  type="button"
                  data-testid={`btn-markcircle-${interaction.id}`}
                  onClick={() => handleMarkCircle(interaction)}
                  className={`relative w-full h-full rounded-2xl border-2 font-bold text-xs md:text-sm px-2 py-1 shadow-md flex items-center justify-center motion-safe:transition-all ${
                    isDone
                      ? "bg-rose-50/90 border-rose-600 text-rose-900 ring-4 ring-rose-500/50"
                      : "bg-white/90 border-rose-400/80 hover:bg-rose-100 text-[#12323b]"
                  }`}
                >
                  <span>{interaction.label}</span>
                  {isDone && (
                    <svg
                      viewBox="0 0 100 60"
                      className="absolute inset-0 w-full h-full pointer-events-none text-rose-600 overflow-visible"
                    >
                      <ellipse
                        cx="50"
                        cy="30"
                        rx="48"
                        ry="26"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="180"
                        strokeDashoffset="0"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
