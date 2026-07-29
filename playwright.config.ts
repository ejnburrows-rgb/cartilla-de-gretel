import { defineConfig } from "@playwright/test";

// The execution environment provides Chromium at this path and sets
// PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD — we never run `playwright install`.
const CHROMIUM =
  process.env.PLAYWRIGHT_CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 900 },
        launchOptions: { executablePath: CHROMIUM, args: ["--no-sandbox"] },
      },
    },
  ],
  webServer: {
    // Demo/seed lane on: lets the teacher smoke test drive the seed CRM without
    // a live Supabase. It's dev-only and never affects a production build
    // (seed-data.ts hard-disables demo mode under import.meta.env.PROD), and it
    // leaves the student smoke test unaffected (that lane isn't demo-gated).
    //
    // The two Supabase vars are pinned to a dead local address on purpose. A
    // developer's .env points at the LIVE project, which holds real children's
    // records — pointing the E2E app at it would mean tests writing to it. The
    // student specs fake those calls at the network layer instead (see
    // tests/e2e/support/fake-supabase.ts); this makes the app still count as
    // "configured", so the real code paths run, while nothing can leave the
    // machine. It also makes CI (where there is no .env at all) behave
    // identically to a local run.
    command:
      "VITE_ALLOW_DEMO_MODE=true " +
      "VITE_SUPABASE_URL=http://127.0.0.1:54321 " +
      "VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_e2e_not_a_real_key " +
      "pnpm dev --port 5173 --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
