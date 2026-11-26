import { createLazyFileRoute } from "@tanstack/react-router";
import { Practica } from "./-practica-view";

export const Route = createLazyFileRoute("/cartilla/practica")({
  component: Practica,
});
