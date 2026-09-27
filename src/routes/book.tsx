import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Canonical book entry.
 *
 * Canonical entry for the locked reconstructed workbook master.
 */
export const Route = createFileRoute("/book")({
  beforeLoad: () => {
    throw redirect({ to: "/cartilla/cuaderno" });
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
