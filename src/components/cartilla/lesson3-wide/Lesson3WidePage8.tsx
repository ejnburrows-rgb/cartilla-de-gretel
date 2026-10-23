import { useMemo } from "react";
import { DirectPencilConnector, type PencilTarget } from "@/cartilla/interactions/PencilConnector";
import {
  LESSON3_PAGE8_PICTURES,
  P8_INSTRUCTION,
  GARDEN_PALETTE,
} from "./lesson3-wide-data";
import "./lesson3-wide.css";

/**
 * Lesson 3 wide-screen page 8 (owner order 2026-10-17 20:46 EDT).
 *
 * Aa in a compact card pinned at the LEFT edge; the 8 boxed pictures in
 * 2 columns x 4 rows on the right; the middle column stays a wide open gap
 * the pencil line travels across. Same book instruction, same approved
 * pencil (tap the Aa card, tap a picture — the pencil draws the connecting
 * line and marks the X; ash-pencil marking rule via the shared kernel).
 *
 * The kernel's own 3-row DOM is re-flowed with CSS only (display: contents)
 * — the shared pencil/eraser kernel is untouched.
 */
export function Lesson3WidePage8() {
  const targets: PencilTarget[] = useMemo(
    () =>
      LESSON3_PAGE8_PICTURES.map((pic) => ({
        id: `l3w-p8-${pic.slug}`,
        label: pic.caption,
        src: pic.src,
        correct: true,
        role: "solo",
      })),
    [],
  );

  const words = useMemo(() => P8_INSTRUCTION.split(" "), []);

  return (
    <section className="l3w-page l3w-p8" aria-label="Lección 3, página 8">
      <span className="l3w-page__number" aria-hidden="true">
        8
      </span>
      <div className="l3w-instruction">
        <span className="l3w-instruction__label">Instrucciones:</span>
        <p className="l3w-instruction__text">
          {words.map((word, i) => (
            <span
              key={i}
              className="l3w-word"
              style={{ color: GARDEN_PALETTE[(i + 3) % GARDEN_PALETTE.length] }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
      <div className="l3w-p8-stage">
        <DirectPencilConnector
          pageKey="3:l3w-p8-match"
          targets={targets}
          mode="mark"
          instruction={P8_INSTRUCTION}
          lessonId="3"
          centerLabel="Aa"
          className="l3w-p8-pencil"
        />
      </div>
    </section>
  );
}
