/**
 * TutorPracticeHost — Milestone 7 Supervised Practice Host (Mode D).
 *
 * Embeds the real interactive Workbook activity (`FaithfulPageRenderer` with
 * `ReconstructedWorkbookPage` fallback) and existing live Cartilla games
 * cleanly inside Mode D without ever covering or obstructing the student's
 * work area.
 *
 * Invariants:
 * - Never touches locked pencil/eraser (`OwnerPhotoPencilSvg.tsx`,
 *   `PENCIL-CURSOR-SPEC.md`) or `curl=a`.
 * - Respects `absent-in-source` printed workbook pages 86–87 honestly.
 * - Header controls sit in a dedicated non-overlapping flex header above the
 *   scrollable work canvas so Mode D side-panel / PiP Gretel never obscures
 *   interactive elements.
 */
import { useMemo } from "react";
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Gamepad2, HelpCircle } from "lucide-react";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { ReconstructedWorkbookPage } from "@/components/cartilla/ReconstructedWorkbookPage";
import { ButterflyGarden } from "@/components/cartilla/games/ButterflyGarden";
import { CompletarPalabras } from "@/components/cartilla/games/CompletarPalabras";
import { CoreGame } from "@/components/cartilla/games/CoreGames";
import { CowGame } from "@/components/cartilla/games/CowGame";
import { GameShell } from "@/components/cartilla/games/GameShell";
import { PayasoChano } from "@/components/cartilla/games/PayasoChano";
import { SyllableBuilder } from "@/components/cartilla/games/SyllableBuilder";
import type { CompletarPalabrasContent } from "@/content/games/completar-palabras";
import type { GameContent } from "@/lib/games/gameContent";
import { lessonGraphFor } from "@/lib/tutor-content";
import { getTutorGameById, getTutorGamesForLesson } from "@/lib/tutor-tools";
import {
  isWorkbookPageSourceBlocked,
  lessonForWorkbookPage,
  WORKBOOK_PAGE_COUNT,
} from "@/lib/workbook-pages";

export type TutorPracticeTarget =
  | { kind: "workbook"; printedPage: number; lesson?: number }
  | { kind: "game"; gameId: string; lesson?: number };

export interface TutorPracticeHostProps {
  /** Which real activity to embed in Mode D: workbook page or live game. */
  target: TutorPracticeTarget;
  /** Optional callback when the student switches to another workbook page in this lesson. */
  onWorkbookPageChange?: (printedPage: number) => void;
  /** Optional callback when the student switches to a supported game. */
  onGameChange?: (gameId: string) => void;
  /** Optional callback when the student asks Gretel for a hint from the header bar. */
  onRequestHint?: () => void;
  /** Optional callback to return to Call/Flipchart mode. */
  onExitPractice?: () => void;
  className?: string;
}

function renderEmbeddedGame(content: GameContent, onExitPractice?: () => void) {
  if (content.type === "cow-game") {
    return <CowGame content={content} />;
  }

  if (content.id === "mariposas-p") {
    return (
      <ButterflyGarden
        backSlot={
          onExitPractice ? (
            <button
              type="button"
              onClick={onExitPractice}
              aria-label="Volver al tutor"
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-stone-800 shadow-md border border-stone-200"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : undefined
        }
      />
    );
  }

  const inner = (() => {
    switch (content.type) {
      case "payaso-chano":
        return <PayasoChano content={content} />;
      case "completar-palabras":
        return <CompletarPalabras content={content as CompletarPalabrasContent} />;
      case "lectura-silabas":
        return <SyllableBuilder content={content} />;
      case "mariposas":
      case "juego-vocal":
      case "fonetica-completar":
      case "lectura-rima":
      case "palabras-por-minuto":
      case "dibujos":
        return <CoreGame content={content} />;
    }
  })();

  return <GameShell content={content}>{inner}</GameShell>;
}

export function TutorPracticeHost({
  target,
  onWorkbookPageChange,
  onGameChange,
  onRequestHint,
  onExitPractice,
  className = "",
}: TutorPracticeHostProps) {
  const activeLesson = useMemo(() => {
    if (target.lesson && target.lesson >= 1 && target.lesson <= 24) return target.lesson;
    if (
      target.kind === "workbook" &&
      Number.isInteger(target.printedPage) &&
      target.printedPage >= 1 &&
      target.printedPage <= WORKBOOK_PAGE_COUNT
    ) {
      return lessonForWorkbookPage(target.printedPage);
    }
    return 1;
  }, [target]);

  const lessonGraph = useMemo(() => lessonGraphFor(activeLesson), [activeLesson]);
  const lessonGames = useMemo(() => getTutorGamesForLesson(activeLesson), [activeLesson]);

  // Workbook Mode D
  if (target.kind === "workbook") {
    const pageNumber = target.printedPage;
    const validRange =
      Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= WORKBOOK_PAGE_COUNT;
    const isAbsent = validRange && isWorkbookPageSourceBlocked(pageNumber);
    const lessonPages = lessonGraph?.printedWorkbookPages.pages ?? [];
    const currentIdx = lessonPages.indexOf(pageNumber);
    const prevPage = currentIdx > 0 ? lessonPages[currentIdx - 1] : null;
    const nextPage =
      currentIdx >= 0 && currentIdx < lessonPages.length - 1 ? lessonPages[currentIdx + 1] : null;

    return (
      <section
        className={`flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-[#e5d8c5] bg-[#faf6ee] shadow-sm ${className}`}
        data-testid="tutor-practice-host"
        data-practice-kind="workbook"
        data-printed-page={pageNumber}
        aria-label={`Práctica en cuaderno — Página ${pageNumber}`}
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e8dcc8] bg-white/90 px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 shrink-0 text-[#bb0733]" aria-hidden="true" />
            <span className="text-xs font-extrabold text-stone-800">
              Cuaderno · Página {pageNumber}
            </span>
            {lessonGraph && (
              <span className="hidden sm:inline text-xs font-semibold text-stone-500">
                Lección {lessonGraph.lesson}: {lessonGraph.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onWorkbookPageChange && lessonPages.length > 1 && (
              <div className="flex items-center gap-1" role="group" aria-label="Páginas de la lección">
                <button
                  type="button"
                  disabled={prevPage === null}
                  onClick={() => prevPage !== null && onWorkbookPageChange(prevPage)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={nextPage === null}
                  onClick={() => nextPage !== null && onWorkbookPageChange(nextPage)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {onRequestHint && !isAbsent && validRange && (
              <button
                type="button"
                onClick={onRequestHint}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Pista
              </button>
            )}

            {onExitPractice && (
              <button
                type="button"
                onClick={onExitPractice}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Volver
              </button>
            )}
          </div>
        </header>

        {/* Dedicated unobstructed scrollable work area */}
        <div
          className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4"
          data-testid="tutor-practice-work-area"
        >
          {!validRange ? (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-6 text-center">
              <AlertCircle className="h-7 w-7 text-amber-600" aria-hidden="true" />
              <p className="text-sm font-bold text-stone-800">
                Página {pageNumber} fuera de rango del cuaderno (1–{WORKBOOK_PAGE_COUNT}).
              </p>
            </div>
          ) : isAbsent ? (
            <div
              className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center"
              data-testid="tutor-workbook-absent-in-source"
            >
              <AlertCircle className="h-7 w-7 text-amber-700" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-amber-950">
                Página {pageNumber} no disponible en las fuentes originales
              </h3>
              <p className="text-xs font-medium text-amber-900/85">
                Las páginas impresas 86 y 87 están marcadas como ausentes en el archivo fuente y no
                se inventan.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <FaithfulPageRenderer
                pageNumber={pageNumber}
                lessonNumber={activeLesson}
                interactive
                fallback={<ReconstructedWorkbookPage pageNumber={pageNumber} />}
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Game Mode D
  const game = getTutorGameById(target.gameId);

  return (
    <section
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-[#e5d8c5] bg-[#faf6ee] shadow-sm ${className}`}
      data-testid="tutor-practice-host"
      data-practice-kind="game"
      data-game-id={target.gameId}
      aria-label={game ? `Juego supervisado — ${game.id}` : "Juego no disponible"}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e8dcc8] bg-white/90 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 className="h-4 w-4 shrink-0 text-[#bb0733]" aria-hidden="true" />
          <span className="text-xs font-extrabold text-stone-800">
            Práctica interactiva{game ? ` · ${game.letter.toUpperCase()}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onGameChange && lessonGames.length > 1 && (
            <div className="flex items-center gap-1" role="group" aria-label="Juegos de la lección">
              {lessonGames.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => onGameChange(candidate.id)}
                  aria-pressed={candidate.id === target.gameId}
                  className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                    candidate.id === target.gameId
                      ? "bg-[#bb0733] text-white"
                      : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {candidate.type}
                </button>
              ))}
            </div>
          )}

          {onRequestHint && game && (
            <button
              type="button"
              onClick={onRequestHint}
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Pista
            </button>
          )}

          {onExitPractice && (
            <button
              type="button"
              onClick={onExitPractice}
              className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Volver
            </button>
          )}
        </div>
      </header>

      <div
        className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-4"
        data-testid="tutor-practice-work-area"
      >
        {game ? (
          <div className="mx-auto max-w-4xl">{renderEmbeddedGame(game, onExitPractice)}</div>
        ) : (
          <div
            className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-6 text-center"
            data-testid="tutor-game-unavailable"
          >
            <AlertCircle className="h-7 w-7 text-amber-600" aria-hidden="true" />
            <p className="text-sm font-bold text-stone-800">
              El juego "{target.gameId}" no está disponible en el registro canónico.
            </p>
            {onGameChange && lessonGames.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {lessonGames.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => onGameChange(candidate.id)}
                    className="rounded-full bg-[#bb0733] px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Abrir {candidate.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
