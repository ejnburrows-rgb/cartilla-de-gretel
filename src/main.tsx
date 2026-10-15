import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import { initArtScanBlend } from "./lib/art-blend";
import { initLivingArtRuntime } from "./lib/living-art-runtime";
// Gretel page speech is sourced from approved existing recordings, not dynamic TTS.
import { installExistingGretelRecordedFeedback } from "./lib/gretel-existing-recordings";
import "./styles.css";
import "./styles/living-art.css";
import "./styles/gretel-presence.css";
import "./styles/art-blend.css";


const router = getRouter();

// STEP 1 safety net: flag any still-opaque white-box scans for multiply blend.
initArtScanBlend();
// Global living-art layer: faithful illustrations never silently remain static.
initLivingArtRuntime();
// Owner-recorded MP3s only; no TTS, no fake fallback.
installExistingGretelRecordedFeedback();

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
    <RouterProvider router={router} />
  </React.StrictMode>,
);
