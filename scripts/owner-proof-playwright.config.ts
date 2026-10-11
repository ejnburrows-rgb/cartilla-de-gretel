/**
 * Exact-source owner-proof configuration.
 * Deliberately replaces the general test webServer command: never resolve
 * PowerShell, pnpm, or Vite through ambient PATH during capture.
 * Only the actual Workbook/teacher Chromium lane is needed for this proof.
 */
import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";
import base from "../playwright.config";

const viteCli = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const quote = (value: string) => process.platform === "win32"
  ? `"${value.replaceAll('"', '""')}"`
  : `'${value.replaceAll("'", "'\\''")}'`;

export default defineConfig({
  ...base,
  webServer: [{
    command: `${quote(process.execPath)} ${quote(viteCli)} dev --mode worker --port 5173 --host 127.0.0.1`,
    env: {
      VITE_ALLOW_DEMO_MODE: "true",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e_not_a_real_key",
    },
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 300_000,
  }],
});
