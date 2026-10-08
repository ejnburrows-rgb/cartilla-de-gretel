import { defineConfig } from "@playwright/test";
import * as path from "path";

export default defineConfig({
  testDir: path.resolve(process.cwd(), "tests/e2e"),
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1280, height: 900 },
    launchOptions: {
      args: ["--no-sandbox"],
    },
  },
});
