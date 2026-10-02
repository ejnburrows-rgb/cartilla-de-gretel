import { createFileRoute } from "@tanstack/react-router";
import { WelcomeSplash } from "@/components/intro/WelcomeSplash";

export const Route = createFileRoute("/cartilla/")({
  component: WelcomeSplash,
  head: () => ({ meta: [{ title: "La Cartilla de Gretel" }] }),
});
