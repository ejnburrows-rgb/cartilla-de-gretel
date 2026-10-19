import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { LetterPickerHub } from "@/components/cartilla/LetterPickerHub";
import { normalizeActivityId } from "@/lib/activity-routing";

export const Route = createFileRoute("/cartilla/letras")({
  component: Letras,
  head: () => ({
    meta: [
      { title: "Elige una letra — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Pantalla de entrada para elegir la letra que el niño practicará.",
      },
    ],
  }),
});

/**
 * Wire-up route for the shared LetterPickerHub entrance screen.
 * `/cartilla/letras` → pick a letter, then open its lesson.
 * `/cartilla/letras?activity=trazar` → pick a letter, then open that activity
 * for the picked letter (same family-practice links the teacher tools use).
 */
function Letras() {
  const activityParam = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("activity");
  }, []);
  const activity = activityParam ? normalizeActivityId(activityParam) : undefined;

  return (
    <div className="lc-letras-page">
      <Link
        to="/cartilla/lecciones"
        className="lc-lessons__back"
        aria-label="Volver a las lecciones"
      >
        <ArrowLeft size={20} /> Cartilla
      </Link>
      <LetterPickerHub activity={activity} />
    </div>
  );
}
