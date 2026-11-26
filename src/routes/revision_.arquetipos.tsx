import { createFileRoute } from "@tanstack/react-router";
import { ArchetypeGallery } from "@/components/review/ArchetypeGallery";

export const Route = createFileRoute("/revision_/arquetipos")({
  component: ArchetypeGallery,
  head: () => ({
    meta: [
      { title: "Archetypes Gallery — La Cartilla de Gretel" },
      { name: "robots", content: "noindex" },
    ],
  }),
});
