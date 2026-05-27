import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { PageTurnSound } from "./components/audio/PageTurnSound";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { GretelStage } from "./components/gretel/GretelStage";
import { TutorialOverlay } from "./components/tutorial/TutorialOverlay";
import { LiveRegion } from "./components/a11y/LiveRegion";
import { ReadingRuler } from "./components/a11y/ReadingRuler";
import { SkipLink } from "./components/a11y/SkipLink";

import { getRouter } from "./router";
import { ErrorBoundary } from "./components/perf/ErrorBoundary";
import { PerfPanel } from "./components/perf/PerfPanel";
import "./styles.css";
import "./styles/a11y.css";
import "./styles/print.css";
import "./styles/cartilla-polish.css";
import "./styles/themes.css";
import "./styles/gretel.css";
import "./styles/perf.css";

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SkipLink />
        <RouterProvider router={router} />
        <PageTurnSound />
        <GretelStage />
        <TutorialOverlay />
        <LiveRegion />
        <ReadingRuler />
        <PerfPanel />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});
  });
}

