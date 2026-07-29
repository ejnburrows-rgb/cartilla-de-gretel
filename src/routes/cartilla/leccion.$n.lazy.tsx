import { createLazyFileRoute } from "@tanstack/react-router";
import { Leccion } from "./-leccion-view";

// The lesson screen itself, behind a lazy boundary so its workbook renderer,
// interaction widgets and stylesheets are fetched when a lesson is opened
// rather than on first paint. `-leccion-view` is dash-prefixed so the route
// generator ignores it — it is a plain module, not a route.
export const Route = createLazyFileRoute("/cartilla/leccion/$n")({
  component: Leccion,
});
