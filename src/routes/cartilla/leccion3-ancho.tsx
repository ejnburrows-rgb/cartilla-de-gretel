import { createFileRoute } from "@tanstack/react-router";
import { Lesson3WidePage7 } from "@/components/cartilla/lesson3-wide/Lesson3WidePage7";
import { Lesson3WidePage8 } from "@/components/cartilla/lesson3-wide/Lesson3WidePage8";
import { NativeLessonViewer } from "@/components/StudentBook/NativeLessonViewer";
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
  const pages = [
    {
      id: "l3w-p7",
      content: <Lesson3WidePage7 />,
      pageNumber: 7,
    },
    {
      id: "l3w-p8",
      content: <Lesson3WidePage8 />,
      pageNumber: 8,
    },
  ];

  return (
    <div className="l3w-preview h-screen w-screen overflow-hidden bg-[#fffaf0]">
      <p className="l3w-preview__note absolute top-2 left-2 z-50 rounded bg-white/80 p-2 text-xs shadow">
        Borrador — diseño para pantalla ancha (computadora y tableta horizontal).
      </p>
      <NativeLessonViewer
        pages={pages}
        chapterLabel="Lección 3 · Vocal Aa"
        lessonNumber={3}
        autoTurn={false}
        swipe={true}
        gated={false}
      />
    </div>
  );
}
