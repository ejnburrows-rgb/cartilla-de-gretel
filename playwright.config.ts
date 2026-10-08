import { defineConfig } from "@playwright/test";

const envCommand = (env: Record<string, string>, command: string) => {
  const assignments = Object.entries(env)
    .map(([key, value]) => `${key}='${value.replaceAll("'", "''")}'`)
    .join(" ");
  return `env ${assignments} ${command}`;
};

const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const GATED_SPECS = ["**/student-assignment-flow.spec.ts", "**/classroom-readiness-gated.spec.ts"];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { trace: "off" },
  projects: [
    {
      name: "chromium",
      testIgnore: GATED_SPECS,
      use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:5173",
        viewport: { width: 1280, height: 900 },
        launchOptions: { ...(CHROMIUM ? { executablePath: CHROMIUM } : {}), args: ["--no-sandbox"] },
      },
    },
    {
      name: "chromium-login-gated",
      testMatch: GATED_SPECS,
      use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:5174",
        viewport: { width: 1280, height: 900 },
        launchOptions: { ...(CHROMIUM ? { executablePath: CHROMIUM } : {}), args: ["--no-sandbox"] },
      },
    },
  ],
  webServer: [
    {
      command: envCommand({
        VITE_ALLOW_DEMO_MODE: "true",
        VITE_SUPABASE_URL: "http://127.0.0.1:54321",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
      }, "pnpm dev:worker --port 5173 --host 127.0.0.1"),
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 300_000,
    },
    {
      command: envCommand({
        VITE_CRM_REVIEW: "false",
        VITE_SUPABASE_URL: "http://127.0.0.1:54321",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
      }, "pnpm dev:worker --port 5174 --host 127.0.0.1"),
      url: "http://127.0.0.1:5174",
      reuseExistingServer: false,
      timeout: 300_000,
    },
  ],
});
