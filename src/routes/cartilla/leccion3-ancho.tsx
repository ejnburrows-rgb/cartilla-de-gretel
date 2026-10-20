import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lesson3WidePage7 } from "@/components/cartilla/lesson3-wide/Lesson3WidePage7";
import { Lesson3WidePage8 } from "@/components/cartilla/lesson3-wide/Lesson3WidePage8";
import "@/components/cartilla/lesson3-wide/lesson3-wide.css";

/**
 * DRAFT preview route for the Lesson 3 wide-screen redesign
 * (owner order 2026-10-17 20:46 EDT, branch art/lesson-3-final-files-20261017).
 *
 * Wide computer screens and horizontal tablets only (1440px+). Not merged,
 * not linked from the lesson list — screenshot proof route for the owner.
 */
export const Route = createFileRoute("/cartilla/leccion3-ancho")({
  component: Leccion3Ancho,
  head: () => ({
    meta: [
      { title: "Lección 3 — diseño ancho (borrador)" },
      {
        name: "description",
        content: "Borrador del rediseño de pantalla ancha de la Lección 3.",
      },
    ],
  }),
});

function Leccion3Ancho() {
  const [page, setPage] = useState<7 | 8>(7);
  return (
    <div className="l3w-preview">
      <div className="l3w-preview__tabs" role="tablist" aria-label="Páginas del borrador">
        <button
          type="button"
          role="tab"
          aria-selected={page === 7}
          className={`l3w-preview__tab${page === 7 ? " is-active" : ""}`}
          onClick={() => setPage(7)}
        >
          Página 7
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={page === 8}
          className={`l3w-preview__tab${page === 8 ? " is-active" : ""}`}
          onClick={() => setPage(8)}
        >
          Página 8
        </button>
      </div>
      <p className="l3w-preview__note">
        Borrador — diseño para pantalla ancha (computadora y tableta horizontal).
      </p>
      {page === 7 ? <Lesson3WidePage7 /> : <Lesson3WidePage8 />}
    </div>
  );
}
