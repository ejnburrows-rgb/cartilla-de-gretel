import { createFileRoute } from "@tanstack/react-router";
import { LessonThreePrototype } from "@/components/prototype/LessonThreePrototype";
export const Route = createFileRoute("/prototype/lesson-3-a")({
  component: LessonThreePrototype,
  head: () => ({
    meta: [{ title: "Lección 3 · Aa · Vista previa" }, { name: "robots", content: "noindex" }],
  }),
});
