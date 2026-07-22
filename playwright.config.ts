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
    command: "VITE_ALLOW_DEMO_MODE=true pnpm dev --port 5173 --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
