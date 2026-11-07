// @vitest-environment node
import { expect, it } from "vitest";
import path from "node:path";
import { loadConfigFromFile } from "vite";

it("excludes generated proof writes from worker watching while retaining app sources and other modes", async () => {
  const file = path.resolve("vite.config.ts");
  const loaded = await loadConfigFromFile({ command: "serve", mode: "worker" }, file);
  const ignored = loaded.config.server.watch.ignored;
  for (const directory of ["docs/proofs", "test-results", "playwright-report", "verification-screenshots", "output", "work", "tests/e2e/proofs"]) {
    expect(ignored(path.resolve(directory)), directory).toBe(true);
    expect(ignored(path.resolve(directory, "new-proof.json")), directory).toBe(true);
  }
  for (const source of ["src/routes/__root.tsx", "src/components/living/LivingIllustration.tsx", "src/styles.css", "tests/e2e/accessibility-preflight.spec.ts", "docs/proofs-not-an-output/readme.md", "../unrelated/work/file.ts"]) {
    expect(ignored(path.resolve(source)), source).toBe(false);
  }
  for (const mode of ["production", "test"]) {
    const normal = await loadConfigFromFile({ command: mode === "production" ? "build" : "serve", mode }, file);
    expect(normal.config.server).not.toHaveProperty("watch");
  }
});
