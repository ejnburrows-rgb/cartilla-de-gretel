import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LIVING_ACTORS } from "../living-actor-registry";

// Moving ("alive") pictures are built from their still pictures by
// scripts/living-motion/build.py. When a still picture is replaced, its moving copy
// is out of date. This test catches that so old motion never sits on new art.
const ROOT = resolve(__dirname, "../../..");
const manifest: Record<string, { still: string; alive: string; stillSha256: string }> = JSON.parse(
  readFileSync(resolve(ROOT, "scripts/living-motion/manifest.json"), "utf8"),
);
const sha = (p: string) => createHash("sha256").update(readFileSync(resolve(ROOT, p))).digest("hex");
const HOW_TO_FIX =
  "Re-run `python3 scripts/living-motion/build.py <name>` (and re-check the motion coordinates in " +
  "scripts/living-motion/all.py for the new art), or remove that picture's aliveSrc line in " +
  "src/lib/living-actor-registry.ts so it shows the still picture.";

describe("moving pictures stay in step with their still pictures", () => {
  const actors = Object.values(LIVING_ACTORS).filter((a) => a.aliveSrc);

  it("every moving picture in the registry was built by the builder", () => {
    for (const a of actors) {
      const entry = Object.values(manifest).find((m) => `/${m.alive.replace(/^public\//, "")}` === a.aliveSrc);
      expect(entry, `${a.aliveSrc} is not in scripts/living-motion/manifest.json. ${HOW_TO_FIX}`).toBeTruthy();
      expect(`/${entry!.still.replace(/^public\//, "")}`, `${a.aliveSrc} was built from a different still`).toBe(a.src);
    }
  });

  it("each moving picture file exists", () => {
    for (const a of actors) {
      expect(existsSync(resolve(ROOT, "public" + a.aliveSrc!)), `${a.aliveSrc} is missing. ${HOW_TO_FIX}`).toBe(true);
    }
  });

  it("no still picture changed since its moving copy was built", () => {
    for (const [name, m] of Object.entries(manifest)) {
      if (!existsSync(resolve(ROOT, m.still))) continue; // still removed/renamed: registry test above covers live use
      expect(sha(m.still), `The still picture for "${name}" (${m.still}) changed. ${HOW_TO_FIX}`).toBe(m.stillSha256);
    }
  });
});
