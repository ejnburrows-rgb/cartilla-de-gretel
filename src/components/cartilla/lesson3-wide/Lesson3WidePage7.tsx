import { useMemo } from "react";
import type { PageRegion } from "@/lib/book-faithful";
import { InteractivePictureGrid } from "@/components/cartilla/InteractivePageExercises";
import {
  LESSON3_VOCAL_A,
  P7_INSTRUCTION,
  GARDEN_PALETTE,
} from "./lesson3-wide-data";
import "./lesson3-wide.css";

/**
 * Lesson 3 wide-screen page 7 (owner order 2026-10-17 20:46 EDT).
 *
 * 8 boxed vocal-a pictures on one wide screen in a 4x2 grid, big and
 * uncramped. Same book instruction, same tap-and-X pencil interaction and
 * ash-pencil marking rule (via InteractivePictureGrid) — only the layout and
 * the wide-screen styling are new. Pictures move from page load via
 * LivingIllustration inside the grid cells.
 */
export function Lesson3WidePage7() {
  const region: PageRegion = useMemo(
    () => ({
      id: "l3w-p7-grid",
      regionType: "picture-grid",
      order: 1,
      fontRole: "body",
      columns: 4,
      cells: LESSON3_VOCAL_A.map((pic) => ({
        caption: pic.caption,
        illustrationSrc: pic.src,
        correct: true,
      })),
    }),
    [],
  );

  const words = useMemo(() => P7_INSTRUCTION.split(" "), []);

  return (
    <section className="l3w-page l3w-p7" aria-label="Lección 3, página 7">
      <span className="l3w-page__number" aria-hidden="true">
        7
      </span>
      <div className="l3w-instruction">
        <span className="l3w-instruction__label">Instrucciones:</span>
        <p className="l3w-instruction__text">
          {words.map((word, i) => (
            <span
              key={i}
              className="l3w-word"
              style={{ color: GARDEN_PALETTE[i % GARDEN_PALETTE.length] }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
      <div className="l3w-p7-grid">
        <InteractivePictureGrid region={region} accent="#1f9e94" lessonId="3" mark="x" />
      </div>
    </section>
  );
}
