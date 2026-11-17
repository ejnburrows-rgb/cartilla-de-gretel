// SyllableBuilder.tsx — the syllable word-builder (issue #344).
//
// The child drags syllable tiles into the word's slots (ma + má → mamá). This
// is the book's own syllabic method, and the app's first PRODUCTION exercise:
// the word is assembled, not chosen from a list.
//
// INPUT: one placement core, reached two ways, so the same screen works on the
// pilot's tablets AND its mice — and on a keyboard:
//   - drag  — Pointer Events (not HTML5 drag-and-drop, which does not fire on
//             touch), so a finger and a mouse run the exact same code path.
//   - tap   — tap/click (or Enter/Space) a tile to drop it in the next gap;
//             tap a filled slot to send that tile back to the tray.
// This mirrors the input-adaptive rule already used for letter tracing
// (see useLetterTraceInput.ts) — detect capability, never sniff the user agent.
//
// Grading goes through the same paths as every other exercise: recordEvent()
// for progress and the Gretel event bus for her reaction. The Gretel animation
// state machine itself is never touched.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { KidButton } from "@/components/ui/KidButton";
import { recordEvent } from "@/lib/student-session";
import { gretelEvent } from "@/lib/gretel-bus";
import type { GameContent } from "@/lib/games/gameContent";
import {
  buildTileBank,
  gradeAttempt,
  nextEmptySlot,
  normalizeSyllable,
  type PlacedSyllable,
} from "@/lib/games/syllable-builder";

/** A tile in the tray. `id` keeps duplicates ("pa"/"pá") independently placeable. */
type Tile = { id: string; syllable: string };

function makeTiles(bank: string[]): Tile[] {
  return bank.map((syllable, i) => ({ id: `${syllable}-${i}`, syllable }));
}

/** True when the user has asked the system for reduced motion. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export function SyllableBuilder({ content }: { content: GameContent }) {
  const reducedMotion = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [checked, setChecked] = useState(false);

  const word = content.words[wordIndex];
  const target = word?.syllables ?? [];

  // The tray is rebuilt per word so a syllable used on the last word comes back.
  const [tiles, setTiles] = useState<Tile[]>(() =>
    makeTiles(buildTileBank(content.words[0]?.syllables ?? [], extraTiles(content, 0))),
  );
  const [placed, setPlaced] = useState<PlacedSyllable[]>(() =>
    new Array(content.words[0]?.syllables.length ?? 0).fill(null),
  );
  /** Which tile id sits in each slot, so returning a tile restores the tray. */
  const [slotTileIds, setSlotTileIds] = useState<(string | null)[]>(() =>
    new Array(content.words[0]?.syllables.length ?? 0).fill(null),
  );

  const resetForWord = useCallback(
    (index: number) => {
      const w = content.words[index];
      if (!w) return;
      setTiles(makeTiles(buildTileBank(w.syllables, extraTiles(content, index))));
      setPlaced(new Array(w.syllables.length).fill(null));
      setSlotTileIds(new Array(w.syllables.length).fill(null));
      setChecked(false);
    },
    [content],
  );

  const grade = useMemo(() => gradeAttempt(placed, target), [placed, target]);

  /** The one placement core both drag and tap go through. */
  const placeTile = useCallback(
    (tile: Tile, slot: number) => {
      if (slot < 0 || slot >= target.length) return;
      setChecked(false);
      setPlaced((prev) => {
        const next = [...prev];
        next[slot] = tile.syllable;
        return next;
      });
      setSlotTileIds((prev) => {
        const next = [...prev];
        // If something already sat here, put it back in the tray first.
        const displaced = prev[slot];
        if (displaced) {
          const back = tilesRef.current.find((t) => t.id === displaced);
          if (back) setTiles((ts) => (ts.some((t) => t.id === back.id) ? ts : [...ts, back]));
        }
        next[slot] = tile.id;
        return next;
      });
      setTiles((prev) => prev.filter((t) => t.id !== tile.id));
    },
    [target.length],
  );

  /** Sends the tile in `slot` back to the tray. */
  const clearSlot = useCallback((slot: number) => {
    setChecked(false);
    setSlotTileIds((prev) => {
      const id = prev[slot];
      if (id) {
        const back = tilesRef.current.find((t) => t.id === id);
        if (back) setTiles((ts) => (ts.some((t) => t.id === back.id) ? ts : [...ts, back]));
      }
      const next = [...prev];
      next[slot] = null;
      return next;
    });
    setPlaced((prev) => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
  }, []);

  // Every tile ever created for this word, so a placed tile can be restored.
  const tilesRef = useRef<Tile[]>([]);
  useEffect(() => {
    const known = new Map(tilesRef.current.map((t) => [t.id, t]));
    for (const t of tiles) known.set(t.id, t);
    tilesRef.current = [...known.values()];
  }, [tiles]);

  // ── Pointer drag (touch + mouse, one code path) ──────────────────
  const [dragging, setDragging] = useState<{ tile: Tile; x: number; y: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const onTilePointerDown = (tile: Tile) => (e: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging({ tile, x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onTilePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
  };

  const onTilePointerUp = (tile: Tile) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    setDragging(null);

    const moved = start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8 ? true : false;

    if (!moved) {
      // A tap: drop it in the next gap. Same result a child expects, and the
      // path keyboard users take.
      placeTile(tile, nextEmptySlot(placed));
      return;
    }
    // A drag: place it in whatever slot the finger/cursor was released over.
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slotEl = el?.closest<HTMLElement>("[data-slot-index]");
    if (slotEl) placeTile(tile, Number(slotEl.dataset.slotIndex));
  };

  // ── Checking ─────────────────────────────────────────────────────
  const onCheck = () => {
    if (!grade.isComplete || !word || checked) return;
    setChecked(true);
    gretelEvent(grade.isCorrect ? "answer:correct" : "answer:wrong");
    recordEvent({
      lessonId: content.id,
      kind: "exercise",
      score: grade.isCorrect ? 1 : 0,
      total: 1,
      meta: {
        exercise: "syllable-builder",
        word: word.word,
        completed: grade.isCorrect,
      },
    });
  };

  const isLastWord = wordIndex >= content.words.length - 1;

  const onNext = () => {
    if (isLastWord) {
      gretelEvent("activity:complete");
      recordEvent({
        lessonId: content.id,
        kind: "exercise",
        meta: { exercise: "syllable-builder", completed: true },
      });
      setWordIndex(0);
      resetForWord(0);
      return;
    }
    const next = wordIndex + 1;
    setWordIndex(next);
    resetForWord(next);
  };

  if (!word) return null;

  const transition = reducedMotion ? "none" : "transform 140ms ease, box-shadow 140ms ease";

  return (
    <div className="game-wood-frame">
      <section
        className="game-paper-board p-5 sm:p-8 space-y-6"
        aria-label="Formar la palabra con sílabas"
      >
        <div className="flex items-center justify-between border-b border-[#E6DCC8] pb-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F1E8] border border-[#D4C4A8] px-3.5 py-1.5 text-sm font-black text-[#25313A]">
            Palabra {wordIndex + 1} de {content.words.length}
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#25313A]/70">
            Arrastra o toca una sílaba
          </span>
        </div>

        {/* The picture: real book art, or an honest "pendiente" card. */}
        <div className="flex justify-center">
          {word.imageUrl ? (
            <div className="game-tactile-card rounded-2xl bg-white p-3 sm:p-4">
              <img
                src={word.imageUrl}
                alt={word.word}
                className="h-36 w-auto object-contain sm:h-48"
                draggable={false}
              />
            </div>
          ) : (
            <div
              className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-[#C9B798] bg-[#F5F1E8] text-sm font-bold text-[#25313A]/70 sm:h-48 sm:w-48"
              role="img"
              aria-label="Ilustración pendiente"
            >
              pendiente
            </div>
          )}
        </div>

        {/* The word being built. */}
        <div
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          role="group"
          aria-label="Casillas de la palabra"
        >
          {target.map((_, i) => {
            const value = placed[i];
            const state = checked ? (grade.isCorrect ? "ok" : "bad") : "idle";
            return (
              <button
                key={i}
                type="button"
                data-slot-index={i}
                onClick={() => value && clearSlot(i)}
                aria-label={
                  value ? `Casilla ${i + 1}: ${value}. Tocar para quitar.` : `Casilla ${i + 1}: vacía`
                }
                style={{ transition }}
                className={[
                  "min-h-16 min-w-[4.5rem] rounded-2xl px-4 text-2xl font-black sm:min-h-20 sm:min-w-[5.5rem] sm:text-3xl",
                  value ? "bg-white border-2 border-[#D4C4A8] shadow-sm" : "game-slot-well",
                  state === "ok"
                    ? "game-correct-glow text-[#1D5631]"
                    : state === "bad"
                      ? "game-wrong-nudge text-[#8E2620]"
                      : "text-[#25313A]",
                ].join(" ")}
              >
                {value ?? ""}
              </button>
            );
          })}
        </div>

        {/* The tray of syllables. */}
        <div
          className="rounded-2xl bg-[#F5F1E8] border border-[#E6DCC8] p-4 flex flex-wrap items-center justify-center gap-3"
          role="group"
          aria-label="Sílabas disponibles"
        >
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onPointerDown={onTilePointerDown(tile)}
              onPointerMove={onTilePointerMove}
              onPointerUp={onTilePointerUp(tile)}
              onClick={(e) => {
                if (e.detail === 0) {
                  placeTile(tile, nextEmptySlot(placed));
                }
              }}
              aria-label={`Sílaba ${tile.syllable}`}
              style={{ transition, touchAction: "none" }}
              className="game-tactile-tile min-h-14 min-w-[4rem] touch-none select-none rounded-2xl px-4 text-xl font-black sm:min-h-16 sm:min-w-[4.5rem] sm:text-2xl"
            >
              {tile.syllable}
            </button>
          ))}
          {tiles.length === 0 && (
            <p className="text-sm font-bold text-[#25313A]/75">
              Toca una casilla para devolver una sílaba.
            </p>
          )}
        </div>

        {/* Feedback + actions. */}
        <div className="flex flex-col items-center gap-3">
          {checked && (
            <div
              role="status"
              className={`inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-lg font-black ${
                grade.isCorrect
                  ? "game-correct-glow border-[#2F7D4A] bg-[#ECF9F0] text-[#1D5631]"
                  : "game-wrong-nudge border-[#C2413A] bg-[#FDF0EF] text-[#8E2620]"
              }`}
            >
              {grade.isCorrect && (
                <span className="game-star-pop">
                  <Star className="h-5 w-5 fill-[#F2B632] text-[#D99B1E]" aria-hidden />
                </span>
              )}
              {grade.isCorrect ? "¡Muy bien!" : "Casi. Inténtalo otra vez."}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <KidButton
              onClick={onCheck}
              disabled={!grade.isComplete || checked}
              className="!min-h-14 !px-7 !text-base"
            >
              Comprobar
            </KidButton>
            {checked && grade.isCorrect && (
              <KidButton
                variant="outline"
                onClick={onNext}
                className="!min-h-14 !px-7 !text-base"
              >
                {isLastWord ? "Terminar" : "Siguiente"}
              </KidButton>
            )}
          </div>
        </div>

        {/* The tile that follows the finger/cursor while dragging. */}
        {dragging && !reducedMotion && (
          <div
            aria-hidden
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-3 border-[#D99B1E] bg-[#FDE79C] px-4 py-2.5 text-xl font-black text-[#25313A] shadow-xl"
            style={{ left: dragging.x, top: dragging.y }}
          >
            {dragging.tile.syllable}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * The decoy syllables for a word: the lesson's own tile bank minus the
 * syllables this word already needs, so the tray always has a few real
 * alternatives from the same lesson to choose between.
 */
function extraTiles(content: GameContent, wordIndex: number): string[] {
  const needed = new Set((content.words[wordIndex]?.syllables ?? []).map(normalizeSyllable));
  const seen = new Set<string>();
  return (content.tiles ?? []).filter((t) => {
    const key = normalizeSyllable(t);
    if (needed.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
