import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const FOLDER_KEYS = ["guia", "tablas", "tareas", "evaluaciones", "poemas"] as const;

export const Route = createFileRoute("/cartilla/teacher/guia/")({
  validateSearch: z.object({ folder: z.enum(FOLDER_KEYS).optional() }),
  head: () => ({ meta: [{ title: "Guía del profesor — La Cartilla de Gretel" }] }),
});
