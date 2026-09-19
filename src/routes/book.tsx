import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Canonical book entry.
 *
 * The product has one student reading experience: the interactive Cartilla
 * lesson reader with its physical horizontal page turn. The former flat PDF
 * viewer is intentionally retired so `/book` can never drop students into a
 * second, less tactile reading lane.
 */
export const Route = createFileRoute("/book")({
  beforeLoad: () => {
    throw redirect({ to: "/cartilla/leccion/$n", params: { n: "1" } });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel — Libro interactivo" },
      {
        name: "description",
        content: "Libro interactivo de La Cartilla de Gretel con vuelta horizontal de páginas.",
      },
    ],
  }),
});
