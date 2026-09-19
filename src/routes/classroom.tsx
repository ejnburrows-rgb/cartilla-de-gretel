import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy classroom entry point.
 *
 * The product now has one authoritative teacher presentation experience:
 * /cartilla/teacher/flipchart -> /cartilla/presentar/$n, backed by the real
 * 62-page HD flipchart catalog. Keeping a separate reconstructed six-page
 * classroom demo would create a second, lower-fidelity product lane, so this
 * URL intentionally resolves into the real flipchart selector.
 */
export const Route = createFileRoute("/classroom")({
  beforeLoad: () => {
    throw redirect({ to: "/cartilla/teacher/flipchart" });
  },
  component: () => null,
  head: () => ({
    meta: [
      { title: "Flipchart del Maestro — La Cartilla de Gretel" },
      {
        name: "description",
        content: "Flipchart HD del maestro con vuelta vertical de láminas.",
      },
    ],
  }),
});
