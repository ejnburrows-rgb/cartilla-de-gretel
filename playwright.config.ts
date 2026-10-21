import { defineConfig } from "@playwright/test";

const envCommand = (env: Record<string, string>, command: string) => {
  if (process.platform === "win32") {
    const assignments = Object.entries(env)
      .map(([key, value]) => `$env:${key}='${value.replaceAll("'", "''")}'`)
      .join("; ");
    return `powershell -NoProfile -Command \"${assignments}; ${command}\"`;
  }
  const assignments = Object.entries(env)
    .map(([key, value]) => `${key}='${value.replaceAll("'", "'\\''")}'`)
    .join(" ");
  return `${assignments} ${command}`;
};

// Managed execution environments can provide a system Chromium path. Standard
// CI runners instead use Playwright's installed browser, so executablePath is
// optional rather than hard-coded to one machine image.
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH;

// Specs that need open access switched OFF (real login-gated screens).
const GATED_SPECS = ["**/student-assignment-flow.spec.ts", "**/classroom-readiness-gated.spec.ts"];

// Tutor specs run in their own lane: the server there boots with
// VITE_TUTOR_EARS=stub so createTutorEars() returns the scriptable StubEars
// and no e2e run ever touches a real microphone or the Vosk WASM engine.
// Everything in these files is driven by the localStorage script key
// cartilla.tutor.test-ears.v1 (see tests/e2e/support/tutor-helpers.ts).
const TUTOR_SPECS = ["**/tutor.spec.ts", "**/tutor-offline-pack.spec.ts"];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    trace: "off",
  },
  projects: [
    {
      // Open-access lane: VITE_CRM_REVIEW is on (the shipped default), so the
      // whole cartilla is reachable without a login. Everything except the
      // login-gated student join flow runs here.
      name: "chromium",
      testIgnore: [...GATED_SPECS, ...TUTOR_SPECS],
      use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:5173",
        viewport: { width: 1280, height: 900 },
        launchOptions: {
          ...(CHROMIUM ? { executablePath: CHROMIUM } : {}),
          args: ["--no-sandbox"],
        },
      },
    },
    {
      // Login-gated lane: VITE_CRM_REVIEW off. /cartilla/unirse redirects to
      // /cartilla/lecciones whenever open access is on, so the join-by-code
      // screens can only be exercised against a build with the flag cleared.
      // vite.config.ts keeps "true" as the default for every other build,
      // including production.
      name: "chromium-login-gated",
      testMatch: GATED_SPECS,
      use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:5174",
        viewport: { width: 1280, height: 900 },
        launchOptions: {
          ...(CHROMIUM ? { executablePath: CHROMIUM } : {}),
          args: ["--no-sandbox"],
        },
      },
    },
    {
      // Tutor lane: same app, but booted with VITE_TUTOR_EARS=stub so the
      // session runtime uses the scriptable StubEars. The specs inject
      // transcripts through the localStorage script key and never touch a
      // microphone, the Vosk WASM engine, or any cloud speech service.
      name: "chromium-tutor",
      testMatch: TUTOR_SPECS,
      use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:5175",
        viewport: { width: 1280, height: 900 },
        launchOptions: {
          ...(CHROMIUM ? { executablePath: CHROMIUM } : {}),
          args: ["--no-sandbox"],
        },
      },
    },
  ],
  webServer: [
    {
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
      // machine. It also makes CI behave identically to a safe local run.
      command: envCommand(
        {
          VITE_ALLOW_DEMO_MODE: "true",
          VITE_SUPABASE_URL: "http://127.0.0.1:54321",
          VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
        },
        "pnpm dev:worker --port 5173 --host 127.0.0.1",
      ),
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      // Worker/browser verification must not invoke prepare:art. Full release
      // verification prepares production assets separately before Playwright.
      timeout: 300_000,
    },
    {
      // Second, login-gated server for the chromium-login-gated project. It
      // uses the same non-generating worker mode as the open-access server so
      // targeted browser verification cannot rewrite tracked route output.
      command: envCommand(
        {
          VITE_CRM_REVIEW: "false",
          VITE_SUPABASE_URL: "http://127.0.0.1:54321",
          VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
        },
        "pnpm dev:worker --port 5174 --host 127.0.0.1",
      ),
      url: "http://127.0.0.1:5174",
      reuseExistingServer: false,
      timeout: 300_000,
    },
    {
      // Third server for the tutor lane: identical safe pins (dead local
      // Supabase, non-generating worker mode) plus VITE_TUTOR_EARS=stub, so
      // createTutorEars() returns StubEars and the scripted specs never
      // touch a microphone or fetch the Vosk model at runtime.
      command: envCommand(
        {
          VITE_TUTOR_EARS: "stub",
          VITE_SUPABASE_URL: "http://127.0.0.1:54321",
          VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
        },
        "pnpm dev:worker --port 5175 --host 127.0.0.1",
      ),
      url: "http://127.0.0.1:5175",
      reuseExistingServer: false,
      timeout: 300_000,
    },
  ],
});
