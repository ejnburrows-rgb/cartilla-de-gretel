import { defineConfig } from "@playwright/test";

/** Run against a completed production build, never Vite's dev module graph. */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "tutor-offline-pack.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: "list",
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:4185",
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
        : {}),
      args: [
        "--no-sandbox",
        ...(process.env.PLAYWRIGHT_SINGLE_PROCESS === "1"
          ? ["--single-process", "--no-zygote"]
          : []),
      ],
    },
  },
  webServer: {
    command: "pnpm exec vite preview --host 127.0.0.1 --port 4185 --strictPort",
    url: "http://127.0.0.1:4185/tutor",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
